import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_COURIERS,
  INITIAL_RESTAURANTS,
  generateInitialOrders,
} from '../data/mockData';
import {
  ChatMessage,
  Courier,
  DeliveryFeedback,
  DistanceFilter,
  Order,
  OrderStatus,
  Restaurant,
  SortCriterion,
  TimeFilter,
} from '../types/delivery';
import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  calculateUrgencyScore,
  detectBatchableOrders,
  estimateTransitMinutes,
  findBestCourierForOrder,
  generateRealisticRoadRoute,
  getPositionAlongRoute,
} from '../utils/geoRouting';

interface DeliveryContextType {
  orders: Order[];
  restaurants: Restaurant[];
  couriers: Courier[];
  activeRole: 'restaurant' | 'customer' | 'driver' | 'dispatcher_map';
  selectedRestaurantId: string;
  selectedOrderId: string;
  currentDriverId: string;
  simulationSpeed: number; // 0 = pause, 1 = 1x, 3 = 3x, 8 = 8x
  distanceFilter: DistanceFilter;
  timeFilter: TimeFilter;
  sortCriterion: SortCriterion;
  trafficCongestion: 'light' | 'moderate' | 'heavy';
  searchQuery: string;
  batchCorridors: Map<string, string[]>;
  setActiveRole: (role: 'restaurant' | 'customer' | 'driver' | 'dispatcher_map') => void;
  setSelectedRestaurantId: (id: string) => void;
  setSelectedOrderId: (id: string) => void;
  setCurrentDriverId: (id: string) => void;
  setSimulationSpeed: (speed: number) => void;
  setDistanceFilter: (filter: DistanceFilter) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  setSortCriterion: (criterion: SortCriterion) => void;
  setTrafficCongestion: (congestion: 'light' | 'moderate' | 'heavy') => void;
  setSearchQuery: (query: string) => void;
  updateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
  rejectOrder: (orderId: string, reason: string) => void;
  assignCourier: (orderId: string, courierId: string) => void;
  autoDispatchNearestCourier: (orderId: string) => boolean;
  createCustomerOrder: (order: Partial<Order> & { restaurantId: string; items: Order['items'] }) => string;
  batchAssignCorridor: (orderIds: string[], courierId?: string) => void;
  simulateRandomNewOrder: (targetRestaurantId?: string) => void;
  cancelOrder: (orderId: string) => void;
  updateRestaurantDetails: (restaurantId: string, updates: Partial<Restaurant>) => void;
  getDriversForRestaurant: (restaurantId: string) => (Courier & { distanceToKitchenKm: number; transitMinsToKitchen: number })[];
  toggleDriverOnlineStatus: (courierId: string) => void;
  pickUpOrderByDriver: (orderId: string) => void;
  markOrderDeliveredByDriver: (orderId: string) => void;
  sendOrderChatMessage: (
    orderId: string,
    message: string,
    sender: 'customer' | 'driver',
    senderName?: string
  ) => void;
  submitOrderFeedback: (
    orderId: string,
    feedback: Omit<DeliveryFeedback, 'orderId' | 'submittedAt'>
  ) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [couriers, setCouriers] = useState<Courier[]>(INITIAL_COURIERS);
  const [orders, setOrders] = useState<Order[]>(() => generateInitialOrders());
  const [activeRole, setActiveRole] = useState<'restaurant' | 'customer' | 'driver' | 'dispatcher_map'>('restaurant');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(INITIAL_RESTAURANTS[0].id);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('ORD-8821');
  const [currentDriverId, setCurrentDriverId] = useState<string>('courier-1');
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [sortCriterion, setSortCriterion] = useState<SortCriterion>('smart_urgency');
  const [trafficCongestion, setTrafficCongestion] = useState<'light' | 'moderate' | 'heavy'>('moderate');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detect corridor batching opportunities
  const batchCorridors = useMemo(() => {
    return detectBatchableOrders(orders);
  }, [orders]);

  // Real-time movement & ETA simulation loop
  useEffect(() => {
    if (simulationSpeed <= 0) return;

    const intervalMs = 1200;
    const timer = setInterval(() => {
      setOrders((prevOrders) => {
        return prevOrders.map((order) => {
          if (order.status === 'out_for_delivery') {
            const dt = order.distanceTiming;
            // Advance progress: speedMultiplier * simulationSpeed
            const incrementPct = (2.2 * simulationSpeed * (dt.speedMultiplier || 1));
            const newProgress = Math.min(100, dt.routeProgressPct + incrementPct);

            const newPos = getPositionAlongRoute(dt.routeWaypoints, newProgress);
            const remainingDist = Math.max(
              0,
              Math.round(dt.roadDistanceKm * (1 - newProgress / 100) * 10) / 10
            );
            const remainingMins = Math.max(
              0,
              Math.round(dt.estimatedTransitMinutes * (1 - newProgress / 100))
            );

            // If arrived (progress = 100%), auto-mark delivered
            if (newProgress >= 100) {
              // Free up courier and increment completed delivery count
              if (order.courierId) {
                setCouriers((prevCouriers) =>
                  prevCouriers.map((c) =>
                    c.id === order.courierId
                      ? {
                          ...c,
                          status: 'idle',
                          currentOrderId: undefined,
                          lat: order.customerLat,
                          lng: order.customerLng,
                          totalDeliveries: c.totalDeliveries + 1,
                          performance30d: c.performance30d
                            ? {
                                ...c.performance30d,
                                completedOrders30d: c.performance30d.completedOrders30d + 1,
                              }
                            : undefined,
                        }
                      : c
                  )
                );
              }

              return {
                ...order,
                status: 'delivered',
                deliveredAt: Date.now(),
                distanceTiming: {
                  ...dt,
                  routeProgressPct: 100,
                  courierPosition: [order.customerLat, order.customerLng],
                  distanceRemainingKm: 0,
                  actualRemainingMinutes: 0,
                  urgencyScore: 0,
                },
              };
            }

            // Sync moving courier position in couriers state
            if (order.courierId) {
              setCouriers((prevCouriers) =>
                prevCouriers.map((c) =>
                  c.id === order.courierId
                    ? {
                        ...c,
                        lat: newPos[0],
                        lng: newPos[1],
                        status: 'delivering',
                      }
                    : c
                )
              );
            }

            return {
              ...order,
              distanceTiming: {
                ...dt,
                routeProgressPct: newProgress,
                courierPosition: newPos,
                distanceRemainingKm: remainingDist,
                actualRemainingMinutes: remainingMins,
                minutesElapsed: dt.minutesElapsed + 0.2 * simulationSpeed,
                urgencyScore: calculateUrgencyScore(
                  'out_for_delivery',
                  dt.minutesElapsed,
                  dt.targetDeliveryMinutes,
                  dt.roadDistanceKm,
                  order.priority
                ),
              },
            };
          }

          // In kitchen prep: advance prep time
          if (order.status === 'preparing') {
            const dt = order.distanceTiming;
            const newElapsed = dt.minutesElapsed + 0.2 * simulationSpeed;
            // Auto transition to ready when prep completes
            if (newElapsed >= dt.estimatedPrepMinutes) {
              return {
                ...order,
                status: 'ready',
                readyAt: Date.now(),
                distanceTiming: {
                  ...dt,
                  minutesElapsed: newElapsed,
                  urgencyScore: calculateUrgencyScore(
                    'ready',
                    newElapsed,
                    dt.targetDeliveryMinutes,
                    dt.roadDistanceKm,
                    order.priority
                  ),
                },
              };
            }

            return {
              ...order,
              distanceTiming: {
                ...dt,
                minutesElapsed: newElapsed,
                actualRemainingMinutes: Math.max(
                  1,
                  Math.round(
                    dt.estimatedPrepMinutes -
                      newElapsed +
                      dt.estimatedTransitMinutes
                  )
                ),
                urgencyScore: calculateUrgencyScore(
                  'preparing',
                  newElapsed,
                  dt.targetDeliveryMinutes,
                  dt.roadDistanceKm,
                  order.priority
                ),
              },
            };
          }

          return order;
        });
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [simulationSpeed]);

  // Update order status manually
  const updateOrderStatus = (orderId: string, nextStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const now = Date.now();
        const updated = { ...order, status: nextStatus };

        if (nextStatus === 'preparing') {
          updated.prepStartedAt = now;
        } else if (nextStatus === 'ready') {
          updated.readyAt = now;
        } else if (nextStatus === 'picked_up' || nextStatus === 'out_for_delivery') {
          updated.pickedUpAt = updated.pickedUpAt || now;
          updated.status = 'out_for_delivery';
          // Ensure courier is marked delivering
          if (order.courierId) {
            setCouriers((prevC) =>
              prevC.map((c) =>
                c.id === order.courierId ? { ...c, status: 'delivering' } : c
              )
            );
          }
        } else if (nextStatus === 'delivered') {
          updated.deliveredAt = now;
          if (order.courierId) {
            setCouriers((prevC) =>
              prevC.map((c) =>
                c.id === order.courierId
                  ? {
                      ...c,
                      status: 'idle',
                      currentOrderId: undefined,
                      totalDeliveries: c.totalDeliveries + 1,
                      performance30d: c.performance30d
                        ? {
                            ...c.performance30d,
                            completedOrders30d: c.performance30d.completedOrders30d + 1,
                          }
                        : undefined,
                    }
                  : c
              )
            );
          }
        }

        updated.distanceTiming = {
          ...order.distanceTiming,
          urgencyScore: calculateUrgencyScore(
            nextStatus,
            order.distanceTiming.minutesElapsed,
            order.distanceTiming.targetDeliveryMinutes,
            order.distanceTiming.roadDistanceKm,
            order.priority
          ),
        };

        return updated;
      })
    );
  };

  // Assign courier to order
  const assignCourier = (orderId: string, courierId: string) => {
    const courier = couriers.find((c) => c.id === courierId);
    if (!courier) return;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          courierId: courier.id,
          courierName: courier.name,
          courierVehicle: courier.vehicleType,
          courierPhone: courier.phone,
          status: o.status === 'received' ? 'preparing' : o.status,
        };
      })
    );

    setCouriers((prev) =>
      prev.map((c) =>
        c.id === courierId
          ? { ...c, status: 'assigned', currentOrderId: orderId }
          : c
      )
    );
  };

  // Intelligent Nearest Courier Dispatch
  const autoDispatchNearestCourier = (orderId: string): boolean => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return false;

    const { courier } = findBestCourierForOrder(
      couriers,
      order.restaurantLat,
      order.restaurantLng
    );

    if (!courier) return false;
    assignCourier(orderId, courier.id);
    return true;
  };

  // Batch assign corridor
  const batchAssignCorridor = (orderIds: string[], targetCourierId?: string) => {
    const firstOrder = orders.find((o) => orderIds.includes(o.id));
    if (!firstOrder) return;

    let assignedCourierId = targetCourierId;
    if (!assignedCourierId) {
      const { courier } = findBestCourierForOrder(
        couriers,
        firstOrder.restaurantLat,
        firstOrder.restaurantLng
      );
      if (courier) assignedCourierId = courier.id;
    }

    if (!assignedCourierId) return;

    orderIds.forEach((id) => {
      assignCourier(id, assignedCourierId!);
    });
  };

  // Create new customer order
  const createCustomerOrder = (
    orderData: Partial<Order> & { restaurantId: string; items: Order['items'] }
  ): string => {
    const restaurant = restaurants.find((r) => r.id === orderData.restaurantId);
    if (!restaurant) throw new Error('Restaurant not found');

    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const custLat = orderData.customerLat || (restaurant.lat + (Math.random() - 0.5) * 0.04);
    const custLng = orderData.customerLng || (restaurant.lng + (Math.random() - 0.5) * 0.04);

    const straightDist = calculateHaversineDistanceKm(
      restaurant.lat,
      restaurant.lng,
      custLat,
      custLng
    );
    const roadDist = calculateRoadDistanceKm(straightDist);
    const trafficMult =
      trafficCongestion === 'heavy' ? 1.4 : trafficCongestion === 'moderate' ? 1.15 : 1.0;
    const estTransit = estimateTransitMinutes(roadDist, 'ebike', trafficMult);
    const prepMinutes = restaurant.avgPrepTimeMinutes;
    const totalEst = prepMinutes + estTransit;
    const priority = orderData.priority || 'standard';
    const targetDeliveryMinutes = priority === 'express' ? totalEst - 4 : totalEst + 5;

    const routeWaypoints = generateRealisticRoadRoute(
      restaurant.lat,
      restaurant.lng,
      custLat,
      custLng
    );

    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const deliveryFee = priority === 'express' ? 5.99 : 3.49;
    const tax = Math.round(subtotal * 0.0925 * 100) / 100;
    const tip = orderData.tip ?? 5.0;
    const total = Math.round((subtotal + deliveryFee + tax + tip) * 100) / 100;

    const newOrder: Order = {
      id: newOrderId,
      customerName: orderData.customerName || 'Alex Chen',
      customerPhone: orderData.customerPhone || '+1 (415) 802-9931',
      deliveryAddress: orderData.deliveryAddress || '725 Market Street, San Francisco',
      customerLat: custLat,
      customerLng: custLng,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      restaurantLat: restaurant.lat,
      restaurantLng: restaurant.lng,
      items: orderData.items,
      subtotal,
      deliveryFee,
      tax,
      tip,
      total,
      status: 'received',
      createdAt: Date.now(),
      priority,
      deliveryNotes: orderData.deliveryNotes || 'Leave at door if no answer',
      distanceTiming: {
        straightDistanceKm: straightDist,
        roadDistanceKm: roadDist,
        estimatedPrepMinutes: prepMinutes,
        estimatedTransitMinutes: estTransit,
        totalEstimatedMinutes: totalEst,
        targetDeliveryMinutes,
        minutesElapsed: 0,
        actualRemainingMinutes: totalEst,
        urgencyScore: calculateUrgencyScore(
          'received',
          0,
          targetDeliveryMinutes,
          roadDist,
          priority
        ),
        routeWaypoints,
        courierPosition: [restaurant.lat, restaurant.lng],
        routeProgressPct: 0,
        distanceRemainingKm: roadDist,
        speedMultiplier: 1,
      },
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrderId);
    return newOrderId;
  };

  // Simulate random incoming delivery order (defaults to current active restaurant)
  const simulateRandomNewOrder = (targetRestaurantId?: string) => {
    const targetId = targetRestaurantId || selectedRestaurantId;
    const chosenRestaurant =
      restaurants.find((r) => r.id === targetId) ||
      restaurants[Math.floor(Math.random() * restaurants.length)];
    const randomMenuItem =
      chosenRestaurant.menu[
        Math.floor(Math.random() * chosenRestaurant.menu.length)
      ];

    const customerAddresses = [
      { addr: '1100 California Street, Nob Hill', lat: 37.7925, lng: -122.4142 },
      { addr: '428 Embarcadero Plaza, Waterfront', lat: 37.7952, lng: -122.3951 },
      { addr: '650 Townsend Street, Mission Bay', lat: 37.7712, lng: -122.4041 },
      { addr: '820 Post Street, Tenderloin Border', lat: 37.7874, lng: -122.4182 },
      { addr: '2101 Fillmore Street, Pacific Heights', lat: 37.7895, lng: -122.4338 },
      { addr: '350 Hayes Street, Hayes Valley', lat: 37.7768, lng: -122.4245 },
      { addr: '500 Howard Street, SoMa Core', lat: 37.7885, lng: -122.3978 },
    ];
    const pickedAddr =
      customerAddresses[Math.floor(Math.random() * customerAddresses.length)];

    createCustomerOrder({
      restaurantId: chosenRestaurant.id,
      customerName: ['Marcus Cole', 'Chloe Davenport', 'Liam Murphy', 'Aria Patel', 'Elena Rostova'][
        Math.floor(Math.random() * 5)
      ],
      deliveryAddress: pickedAddr.addr,
      customerLat: pickedAddr.lat,
      customerLng: pickedAddr.lng,
      priority: Math.random() > 0.6 ? 'express' : 'standard',
      items: [
        {
          id: `item-${Date.now()}-1`,
          menuItemId: randomMenuItem.id,
          name: randomMenuItem.name,
          price: randomMenuItem.price,
          quantity: Math.floor(Math.random() * 2) + 1,
        },
      ],
    });
  };

  const rejectOrder = (orderId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: 'rejected',
          rejectedAt: Date.now(),
          rejectionReason: reason,
          courierId: undefined,
          courierName: undefined,
        };
      })
    );
  };

  const updateRestaurantDetails = (restaurantId: string, updates: Partial<Restaurant>) => {
    setRestaurants((prev) =>
      prev.map((r) => (r.id === restaurantId ? { ...r, ...updates } : r))
    );
  };

  const getDriversForRestaurant = (restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (!restaurant) return [];

    return couriers
      .map((courier) => {
        const straightDist = calculateHaversineDistanceKm(
          courier.lat,
          courier.lng,
          restaurant.lat,
          restaurant.lng
        );
        const roadDist = calculateRoadDistanceKm(straightDist);
        const transitMins = estimateTransitMinutes(roadDist, courier.vehicleType);

        return {
          ...courier,
          distanceToKitchenKm: roadDist,
          transitMinsToKitchen: transitMins,
        };
      })
      .sort((a, b) => {
        // First prioritize idle drivers, then sort by shortest distance to kitchen
        if (a.status === 'idle' && b.status !== 'idle') return -1;
        if (a.status !== 'idle' && b.status === 'idle') return 1;
        return a.distanceToKitchenKm - b.distanceToKitchenKm;
      });
  };

  const toggleDriverOnlineStatus = (courierId: string) => {
    setCouriers((prev) =>
      prev.map((c) => {
        if (c.id !== courierId) return c;
        const newStatus = c.status === 'offline' ? 'idle' : 'offline';
        return { ...c, status: newStatus };
      })
    );
  };

  const pickUpOrderByDriver = (orderId: string) => {
    updateOrderStatus(orderId, 'out_for_delivery');
  };

  const markOrderDeliveredByDriver = (orderId: string) => {
    updateOrderStatus(orderId, 'delivered');
  };

  const cancelOrder = (orderId: string) => {
    updateOrderStatus(orderId, 'cancelled');
  };

  const sendOrderChatMessage = (
    orderId: string,
    message: string,
    sender: 'customer' | 'driver',
    senderName?: string
  ) => {
    if (!message.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sender,
      senderName: senderName || (sender === 'customer' ? 'Customer' : 'Driver'),
      message: message.trim(),
      timestamp: Date.now(),
    };

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        const currentMsgs = ord.chatMessages || [];
        return {
          ...ord,
          chatMessages: [...currentMsgs, newMsg],
        };
      })
    );

    // If customer sent a message and order has an assigned courier, simulate courier acknowledgement reply
    if (sender === 'customer') {
      setTimeout(() => {
        setOrders((prev) => {
          const target = prev.find((o) => o.id === orderId);
          if (!target || !target.courierId) return prev;

          // Contextual smart driver responses based on delivery instruction keywords
          let driverReply = "Received! On my way with your food now.";
          const lower = message.toLowerCase();
          if (lower.includes('gate') || lower.includes('code') || lower.includes('#')) {
            driverReply = "Got the gate code, thank you! Heading up as soon as I pull in.";
          } else if (lower.includes('door') || lower.includes('leave') || lower.includes('porch')) {
            driverReply = "Understood! I'll leave the order safely at your doorstep.";
          } else if (lower.includes('ring') || lower.includes('bell') || lower.includes('knock')) {
            driverReply = "Will do! I'll give a quick ring when it's at your doorstep.";
          } else if (lower.includes('call') || lower.includes('phone')) {
            driverReply = "Sounds good, I'll call you as soon as I arrive outside.";
          } else if (lower.includes('dog') || lower.includes('pet')) {
            driverReply = "Thanks for the heads up about the dog!";
          }

          const replyMsg: ChatMessage = {
            id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            sender: 'driver',
            senderName: target.courierName || 'Assigned Driver',
            message: driverReply,
            timestamp: Date.now(),
          };

          return prev.map((ord) => {
            if (ord.id !== orderId) return ord;
            return {
              ...ord,
              chatMessages: [...(ord.chatMessages || []), replyMsg],
            };
          });
        });
      }, 1200);
    }
  };

  const submitOrderFeedback = (
    orderId: string,
    feedbackData: Omit<DeliveryFeedback, 'orderId' | 'submittedAt'>
  ) => {
    const feedback: DeliveryFeedback = {
      ...feedbackData,
      orderId,
      submittedAt: Date.now(),
    };

    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, feedback } : ord))
    );

    // Update driver rating & positive feedback percentage
    const targetOrder = orders.find((o) => o.id === orderId);
    if (targetOrder?.courierId) {
      setCouriers((prev) =>
        prev.map((c) => {
          if (c.id !== targetOrder.courierId) return c;
          const updatedRating = Number(
            ((c.rating * 19 + feedback.driverRating) / 20).toFixed(2)
          );
          return {
            ...c,
            rating: updatedRating,
            performance30d: c.performance30d
              ? {
                  ...c.performance30d,
                  rating: updatedRating,
                  positiveFeedbackPct:
                    feedback.driverRating >= 4
                      ? Math.min(
                          100,
                          Number(
                            (c.performance30d.positiveFeedbackPct * 0.95 + 5).toFixed(1)
                          )
                        )
                      : Math.max(
                          75,
                          Number((c.performance30d.positiveFeedbackPct * 0.95).toFixed(1))
                        ),
                }
              : undefined,
          };
        })
      );
    }

    // Update restaurant rating & review count
    if (targetOrder?.restaurantId) {
      setRestaurants((prev) =>
        prev.map((r) => {
          if (r.id !== targetOrder.restaurantId) return r;
          const updatedRestRating = Number(
            ((r.rating * 29 + feedback.restaurantRating) / 30).toFixed(2)
          );
          return {
            ...r,
            rating: updatedRestRating,
            reviewsCount: r.reviewsCount + 1,
          };
        })
      );
    }
  };

  return (
    <DeliveryContext.Provider
      value={{
        orders,
        restaurants,
        couriers,
        activeRole,
        selectedRestaurantId,
        selectedOrderId,
        currentDriverId,
        simulationSpeed,
        distanceFilter,
        timeFilter,
        sortCriterion,
        trafficCongestion,
        searchQuery,
        batchCorridors,
        setActiveRole,
        setSelectedRestaurantId,
        setSelectedOrderId,
        setCurrentDriverId,
        setSimulationSpeed,
        setDistanceFilter,
        setTimeFilter,
        setSortCriterion,
        setTrafficCongestion,
        setSearchQuery,
        updateOrderStatus,
        rejectOrder,
        assignCourier,
        autoDispatchNearestCourier,
        createCustomerOrder,
        batchAssignCorridor,
        simulateRandomNewOrder,
        cancelOrder,
        updateRestaurantDetails,
        getDriversForRestaurant,
        toggleDriverOnlineStatus,
        pickUpOrderByDriver,
        markOrderDeliveredByDriver,
        sendOrderChatMessage,
        submitOrderFeedback,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
};

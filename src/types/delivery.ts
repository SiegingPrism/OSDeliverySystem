export type OrderStatus =
  | 'received'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'rejected';

export type VehicleType = 'ebike' | 'scooter' | 'car' | 'van';

export type ActiveRole = 'restaurant' | 'customer' | 'driver' | 'dispatcher_map';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  prepTimeMinutes: number;
  category: string;
  popular?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  reviewsCount: number;
  address: string;
  lat: number;
  lng: number;
  currentPrepQueueMinutes: number;
  avgPrepTimeMinutes: number;
  maxDeliveryRadiusKm: number;
  phone: string;
  themeColor: string;
  isOpen: boolean;
  isKitchenPaused?: boolean;
  menu: MenuItem[];
}

export interface CourierPerformance30d {
  completedOrders30d: number;
  avgSpeedKmh: number;
  avgTransitMinutes: number;
  onTimeRatePct: number;
  rating: number;
  totalDistanceKm: number;
  positiveFeedbackPct: number;
}

export interface Courier {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  vehicleType: VehicleType;
  avgSpeedKmh: number;
  lat: number;
  lng: number;
  status: 'idle' | 'assigned' | 'delivering' | 'offline';
  currentOrderId?: string;
  batteryPct: number;
  distanceToRestaurantKm?: number;
  performance30d?: CourierPerformance30d;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  instructions?: string;
}

export interface DistanceTiming {
  straightDistanceKm: number;
  roadDistanceKm: number;
  estimatedPrepMinutes: number;
  estimatedTransitMinutes: number;
  totalEstimatedMinutes: number;
  targetDeliveryMinutes: number; // e.g., 35 min promise
  minutesElapsed: number;
  actualRemainingMinutes: number;
  urgencyScore: number; // composite priority score (0 - 100)
  routeWaypoints: [number, number][]; // [lat, lng]
  courierPosition: [number, number]; // [lat, lng]
  routeProgressPct: number; // 0 to 100
  distanceRemainingKm: number;
  speedMultiplier: number;
  batchGroupId?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'driver' | 'system';
  senderName: string;
  message: string;
  timestamp: number;
}

export interface DeliveryFeedback {
  orderId: string;
  overallRating: number; // 1 - 5 stars
  driverRating: number; // 1 - 5 stars
  restaurantRating: number; // 1 - 5 stars
  driverComments?: string;
  restaurantComments?: string;
  driverTags?: string[];
  restaurantTags?: string[];
  submittedAt: number;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  customerLat: number;
  customerLng: number;
  restaurantId: string;
  restaurantName: string;
  restaurantAddress?: string;
  restaurantLat: number;
  restaurantLng: number;
  courierId?: string;
  courierName?: string;
  courierVehicle?: VehicleType;
  courierPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  total: number;
  status: OrderStatus;
  createdAt: number; // timestamp
  prepStartedAt?: number;
  readyAt?: number;
  pickedUpAt?: number;
  deliveredAt?: number;
  rejectedAt?: number;
  rejectionReason?: string;
  distanceTiming: DistanceTiming;
  deliveryNotes?: string;
  priority: 'standard' | 'express';
  chatMessages?: ChatMessage[];
  feedback?: DeliveryFeedback;
}

export type SortCriterion =
  | 'smart_urgency'
  | 'shortest_distance'
  | 'longest_distance'
  | 'least_time_remaining'
  | 'most_urgent_sla'
  | 'newest';

export type DistanceFilter = 'all' | 'under_2km' | '2_to_5km' | 'over_5km';
export type TimeFilter = 'all' | 'under_20m' | '20_to_35m' | 'sla_risk';

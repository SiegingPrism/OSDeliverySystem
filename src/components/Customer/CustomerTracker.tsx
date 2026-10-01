import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  Bike,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Layers,
  MapPin,
  MessageSquare,
  Navigation,
  Phone,
  Plus,
  Receipt,
  ShieldCheck,
  Star,
  Utensils,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, Order, OrderStatus } from '../../types/delivery';
import { IntegratedMapService } from '../Map/IntegratedMapService';
import { LiveDeliveryMap } from '../Map/LiveDeliveryMap';
import { LiveTrackingMap } from '../Map/LiveTrackingMap';
import { CourierContactModal } from './CourierContactModal';
import { DeliveryCountdownTimer } from './DeliveryCountdownTimer';
import { OrderDeliveryChat } from './OrderDeliveryChat';
import { PostDeliveryFeedback } from './PostDeliveryFeedback';
import { PromotionsCarousel } from './PromotionsCarousel';

interface CustomerTrackerProps {
  onOpenNewOrder: () => void;
  onOpenProfile?: () => void;
  onOpenHistory?: () => void;
}

export const CustomerTracker: React.FC<CustomerTrackerProps> = ({
  onOpenNewOrder,
  onOpenProfile,
  onOpenHistory,
}) => {
  const { orders, couriers, selectedOrderId, setSelectedOrderId } = useDelivery();
  const { currentUser } = useAuth();

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [mapEngine, setMapEngine] = useState<'leaflet' | 'vector'>('leaflet');

  // Find currently selected order, or default to the most active/recent order
  const activeOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = orders.find((o) => o.id === selectedOrderId);
      if (found) return found;
    }
    // Return first non-delivered order, or first order in list
    return (
      orders.find(
        (o) =>
          o.status !== 'delivered' &&
          o.status !== 'cancelled' &&
          o.status !== 'rejected'
      ) || orders[0]
    );
  }, [orders, selectedOrderId]);

  const assignedCourier = useMemo(() => {
    if (!activeOrder || !activeOrder.courierId) return null;
    return couriers.find((c) => c.id === activeOrder.courierId) || null;
  }, [activeOrder, couriers]);

  if (!activeOrder) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 shadow-sm mb-4">
          <Clock className="h-8 w-8 text-amber-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Active Orders Yet</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          You don't have any food deliveries in transit right now. Choose a partner restaurant and place an order to track live in real time.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={onOpenNewOrder}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Browse Restaurants & Order</span>
          </button>
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Receipt className="h-4 w-4 text-amber-600" />
              <span>Past Order History</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const dt = activeOrder.distanceTiming;

  // Stages for the delivery progress bar
  const stages: { status: OrderStatus; label: string; desc: string }[] = [
    {
      status: 'received',
      label: 'Order Confirmed',
      desc: 'Kitchen received order',
    },
    {
      status: 'preparing',
      label: 'Kitchen Preparing',
      desc: `${dt.estimatedPrepMinutes}m prep window`,
    },
    {
      status: 'ready',
      label: 'Ready for Pickup',
      desc: 'Packaging order safely',
    },
    {
      status: 'out_for_delivery',
      label: 'Driver On The Way',
      desc: `${dt.actualRemainingMinutes}m · ${dt.distanceRemainingKm}km away`,
    },
    {
      status: 'delivered',
      label: 'Delivered',
      desc: 'Enjoy your meal!',
    },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'received':
        return 0;
      case 'preparing':
        return 1;
      case 'ready':
        return 2;
      case 'picked_up':
      case 'out_for_delivery':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentStageIdx = getStageIndex(activeOrder.status);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 space-y-4 sm:space-y-4.5">
      {/* Top Banner: Promotions Carousel for daily specials and promo codes */}
      <PromotionsCarousel onOpenNewOrder={onOpenNewOrder} />

      {/* Order Switcher Bar & Profile / History Shortcuts Box */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto min-w-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mr-1 shrink-0">Your Orders:</span>
          <div className="flex items-center gap-2">
            {orders.slice(0, 6).map((o) => {
              const isCur = o.id === activeOrder.id;
              return (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrderId(o.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                    isCur
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span>{o.id}</span>
                  <span className="text-[10px] opacity-75 capitalize">
                    ({o.status.replace(/_/g, ' ')})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-2xs whitespace-nowrap"
            >
              <Receipt className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Order History</span>
            </button>
          )}

          {currentUser && currentUser.role === 'customer' && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium px-2 py-1 transition-colors"
            >
              My Profile ({currentUser.name})
            </button>
          )}

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Live Map & Status Bar) / Right Column (Order Card & Courier Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-4.5 items-start">
        {/* Left Column: Live Map & Big ETA Banner */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-4.5">
          {/* Rejection Notification if order was rejected */}
          {activeOrder.status === 'rejected' && (
            <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-5 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <Ban className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Order Cannot Be Fulfilled by Restaurant
                </h3>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300">
                Reason given by kitchen:{' '}
                <span className="font-semibold text-rose-950 dark:text-rose-200">
                  "{activeOrder.rejectionReason || 'Operational capacity constraint'}"
                </span>
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Your payment authorization was released. Please browse other partner kitchens or try again shortly.
              </p>
              <button
                onClick={onOpenNewOrder}
                className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-xs"
              >
                <span>Browse Other Kitchens</span>
              </button>
            </div>
          )}

          {/* Big Dynamic ETA Card */}
          {activeOrder.status !== 'rejected' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition-colors space-y-4 sm:space-y-4.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
                    {activeOrder.restaurantName}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
                    {activeOrder.status === 'delivered' ? (
                      'Order Delivered to Doorstep'
                    ) : activeOrder.status === 'out_for_delivery' ? (
                      <>
                        Arriving in ~
                        <span className="font-mono tabular-nums text-amber-600 dark:text-amber-400">
                          {dt.actualRemainingMinutes} mins
                        </span>
                      </>
                    ) : activeOrder.status === 'ready' ? (
                      'Food Ready · Driver Picking Up'
                    ) : (
                      'Kitchen is preparing your food'
                    )}
                  </h2>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {activeOrder.status === 'delivered' ? (
                      'Thank you for ordering with Velocita!'
                    ) : (
                      <>
                        <span>{dt.roadDistanceKm} km road distance</span>
                        <span className="mx-1.5 text-slate-300 dark:text-slate-700">·</span>
                        <span>Target arrival promise: {dt.targetDeliveryMinutes} mins</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Badges & Compact Countdown */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {activeOrder.priority === 'express' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs font-bold uppercase tracking-wider font-mono">
                      <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                      <span>Express Dispatch</span>
                    </div>
                  )}
                  {activeOrder.status !== 'delivered' && (
                    <DeliveryCountdownTimer
                      order={activeOrder}
                      courier={assignedCourier}
                      compact
                    />
                  )}
                </div>
              </div>

              {/* Stepper Progress Bar */}
              <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-5 gap-2 sm:gap-3">
                  {stages.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.status} className="text-center group">
                        <div className="relative mb-2 flex items-center justify-center">
                          <div
                            className={`h-2 w-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
                            } ${
                              isCurrent
                                ? 'ring-2 ring-amber-400/40 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                                : ''
                            }`}
                          />
                        </div>
                        <p
                          className={`text-[11px] font-bold truncate ${
                            isCurrent
                              ? 'text-amber-700 dark:text-amber-400'
                              : isDone
                              ? 'text-slate-800 dark:text-slate-200'
                              : 'text-slate-400 dark:text-slate-600'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 hidden sm:block">
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Post-Delivery Feedback and Rating Experience */}
          {activeOrder.status === 'delivered' && (
            <PostDeliveryFeedback
              order={activeOrder}
              courier={assignedCourier}
              variant="card"
            />
          )}

          {/* Interactive Live Leaflet GPS Tracking Map Service Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
            <div className="p-4 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                  <Navigation className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 font-mono">
                    Live Courier Route & GPS Telemetry
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Real-time distance tracking and corridor delivery monitoring
                  </p>
                </div>
              </div>

              {/* Map Engine Toggle */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 text-xs font-medium self-start sm:self-auto shrink-0">
                <button
                  onClick={() => setMapEngine('leaflet')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapEngine === 'leaflet'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Leaflet GPS Map</span>
                </button>
                <button
                  onClick={() => setMapEngine('vector')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    mapEngine === 'vector'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Vector City Grid
                </button>
              </div>
            </div>

            {/* Dynamic Map Service Renderer Frame */}
            <div className="relative">
              {mapEngine === 'leaflet' ? (
                <LiveTrackingMap
                  order={activeOrder}
                  courier={assignedCourier}
                  onContactDriver={() => setIsContactOpen(true)}
                  heightClass="h-[480px]"
                  className="border-0 rounded-none shadow-none"
                />
              ) : (
                <LiveDeliveryMap
                  focusedOrderId={activeOrder.id}
                  heightClass="h-[480px]"
                  className="border-0 rounded-none shadow-none"
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Driver Profile Card & Order Details */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-4.5">
          {/* Assigned Driver Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Assigned Delivery Driver
              </span>
              {assignedCourier && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live GPS Connected</span>
                </span>
              )}
            </div>

            {assignedCourier ? (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-base border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                      {assignedCourier.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                        <span className="truncate">{assignedCourier.name}</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {assignedCourier.rating}
                        </span>
                        <span>·</span>
                        <span className="capitalize">{assignedCourier.vehicleType}</span>
                        <span>·</span>
                        <span>{assignedCourier.totalDeliveries} trips</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold transition-colors shadow-2xs"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs"
                      title="Call Driver"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distance and Speed Live Indicators */}
                <div className="grid grid-cols-3 gap-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 p-2.5 border border-slate-200/80 dark:border-slate-700 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Distance Left</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {dt.distanceRemainingKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Travel Mode</span>
                    <span className="text-xs font-bold font-mono text-amber-700 dark:text-amber-400 capitalize">
                      {assignedCourier.vehicleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">Avg Speed</span>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                      {assignedCourier.avgSpeedKmh} km/h
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Bike className="mx-auto h-7 w-7 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Matching with closest available driver
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Driver assignment prioritizes driver proximity to kitchen and current availability.
                </p>
              </div>
            )}
          </div>

          {/* Real-Time Driver Communication & Delivery Instructions Chat */}
          <OrderDeliveryChat
            order={activeOrder}
            courier={assignedCourier}
            variant="card"
          />

          {/* Delivery Location & Instructions */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-sm transition-colors">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Delivery Destination
            </span>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {activeOrder.deliveryAddress}
                </p>
                {activeOrder.deliveryNotes && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 italic bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    "{activeOrder.deliveryNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Receipt Breakdown */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3.5 shadow-sm transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>Order Summary ({activeOrder.id})</span>
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {activeOrder.items.length} items
              </span>
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {item.quantity}x {item.name}
                    </span>
                    {item.instructions && (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 italic truncate">
                        Note: {item.instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-slate-800 dark:text-slate-200 tabular-nums shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">${activeOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Delivery Fee ({dt.roadDistanceKm} km road)</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">${activeOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Taxes</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">${activeOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Driver Tip</span>
                <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">${activeOrder.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-white pt-2.5 border-t border-slate-100 dark:border-slate-800">
                <span>Total Paid</span>
                <span className="font-mono tabular-nums text-amber-700 dark:text-amber-400">
                  ${activeOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver Contact Dialog */}
      {isContactOpen && assignedCourier && (
        <CourierContactModal
          courier={assignedCourier}
          order={activeOrder}
          onClose={() => setIsContactOpen(false)}
        />
      )}
    </div>
  );
};

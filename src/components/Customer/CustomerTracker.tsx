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
import { CourierContactModal } from './CourierContactModal';
import { DeliveryCountdownTimer } from './DeliveryCountdownTimer';
import { OrderDeliveryChat } from './OrderDeliveryChat';
import { PostDeliveryFeedback } from './PostDeliveryFeedback';

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
  const [mapEngine, setMapEngine] = useState<'tile' | 'vector'>('tile');

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Order Switcher Bar & Profile / History Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 font-semibold mr-1">Your Orders:</span>
          {orders.slice(0, 6).map((o) => {
            const isCur = o.id === activeOrder.id;
            return (
              <button
                key={o.id}
                onClick={() => setSelectedOrderId(o.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                  isCur
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300'
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
            >
              <Receipt className="h-3.5 w-3.5 text-indigo-600" />
              <span>Order History</span>
            </button>
          )}

          {currentUser && currentUser.role === 'customer' && onOpenProfile && (
            <button
              onClick={onOpenProfile}
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1 transition-colors"
            >
              My Profile ({currentUser.name})
            </button>
          )}

          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column (Live Map & Status Bar) / Right Column (Order Card & Courier Info) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Map & Big ETA Banner */}
        <div className="lg:col-span-7 space-y-4">
          {/* Rejection Notification if order was rejected */}
          {activeOrder.status === 'rejected' && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-rose-700">
                <Ban className="h-5 w-5" />
                <h3 className="text-base font-bold text-slate-900">
                  Order Cannot Be Fulfilled by Restaurant
                </h3>
              </div>
              <p className="text-xs text-rose-800">
                Reason given by kitchen:{' '}
                <span className="font-semibold text-rose-950">
                  "{activeOrder.rejectionReason || 'Operational capacity constraint'}"
                </span>
              </p>
              <p className="text-xs text-slate-600">
                Your payment authorization was released. Please browse other partner kitchens or try again shortly.
              </p>
              <button
                onClick={onOpenNewOrder}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shadow-sm"
              >
                <span>Browse Other Kitchens</span>
              </button>
            </div>
          )}

          {/* Big Dynamic ETA Card */}
          {activeOrder.status !== 'rejected' && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                    {activeOrder.restaurantName}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                    {activeOrder.status === 'delivered' ? (
                      'Order Delivered to Doorstep'
                    ) : activeOrder.status === 'out_for_delivery' ? (
                      <>
                        Arriving in ~
                        <span className="font-mono tabular-nums text-amber-600">
                          {dt.actualRemainingMinutes} mins
                        </span>
                      </>
                    ) : activeOrder.status === 'ready' ? (
                      'Food Ready · Driver Picking Up'
                    ) : (
                      'Kitchen is preparing your food'
                    )}
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    {activeOrder.status === 'delivered' ? (
                      'Thank you for ordering with Velocita!'
                    ) : (
                      <>
                        <span>{dt.roadDistanceKm} km road distance</span>
                        <span className="mx-1.5 text-slate-300">·</span>
                        <span>Target arrival promise: {dt.targetDeliveryMinutes} mins</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Badges & Compact Countdown */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {activeOrder.priority === 'express' && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold uppercase tracking-wider font-mono">
                      <Zap className="h-3.5 w-3.5 text-amber-600" />
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
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="grid grid-cols-5 gap-2">
                  {stages.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;

                    return (
                      <div key={stage.status} className="text-center group">
                        <div className="relative mb-2 flex items-center justify-center">
                          <div
                            className={`h-2.5 w-full rounded-full transition-all duration-300 ${
                              isDone ? 'bg-amber-500' : 'bg-slate-200'
                            } ${
                              isCurrent
                                ? 'ring-2 ring-amber-400/40 ring-offset-2 ring-offset-white'
                                : ''
                            }`}
                          />
                        </div>
                        <p
                          className={`text-[11px] font-bold truncate ${
                            isCurrent
                              ? 'text-amber-700'
                              : isDone
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5 hidden sm:block">
                          {stage.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Route-Calculated Countdown Timer & Real-Time Delivery Telemetry */}
          {activeOrder.status !== 'rejected' && (
            <DeliveryCountdownTimer
              order={activeOrder}
              courier={assignedCourier}
            />
          )}

          {/* Post-Delivery Feedback and Rating Experience */}
          {activeOrder.status === 'delivered' && (
            <PostDeliveryFeedback
              order={activeOrder}
              courier={assignedCourier}
              variant="card"
            />
          )}

          {/* Interactive Live Map Service with Real-time Driver Tracking */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Navigation className="h-3.5 w-3.5 text-amber-600" />
                <span>Live Order Route & Driver GPS Map Service</span>
              </span>

              {/* Map Engine Toggle */}
              <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-[11px]">
                <button
                  onClick={() => setMapEngine('tile')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    mapEngine === 'tile'
                      ? 'bg-white text-slate-900 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Interactive Tile Map
                </button>
                <button
                  onClick={() => setMapEngine('vector')}
                  className={`px-2.5 py-0.5 rounded-md transition-colors ${
                    mapEngine === 'vector'
                      ? 'bg-white text-slate-900 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Vector City Grid
                </button>
              </div>
            </div>

            {/* Dynamic Map Service Renderer */}
            {mapEngine === 'tile' ? (
              <IntegratedMapService order={activeOrder} heightClass="h-[480px]" />
            ) : (
              <LiveDeliveryMap focusedOrderId={activeOrder.id} heightClass="h-[480px]" />
            )}
          </div>
        </div>

        {/* Right Column: Driver Profile Card & Order Details */}
        <div className="lg:col-span-5 space-y-4">
          {/* Assigned Driver Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Assigned Delivery Driver
              </span>
              {assignedCourier && (
                <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Live GPS Connected</span>
                </span>
              )}
            </div>

            {assignedCourier ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-bold text-lg border border-indigo-200 shadow-sm">
                      {assignedCourier.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{assignedCourier.name}</span>
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span className="font-semibold text-slate-800">
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
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                      <span>Message</span>
                    </button>
                    <button
                      onClick={() => setIsContactOpen(true)}
                      className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                      title="Call Driver"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Distance and Speed Live Indicators */}
                <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Distance Left</span>
                    <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {dt.distanceRemainingKm} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Travel Mode</span>
                    <span className="text-xs font-bold font-mono text-amber-700 capitalize">
                      {assignedCourier.vehicleType}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block font-mono">Avg Speed</span>
                    <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                      {assignedCourier.avgSpeedKmh} km/h
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <Bike className="mx-auto h-7 w-7 text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-800">
                  Matching with closest available driver
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Delivery Destination
            </span>

            <div className="flex items-start gap-2.5">
              <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {activeOrder.deliveryAddress}
                </p>
                {activeOrder.deliveryNotes && (
                  <p className="text-[11px] text-slate-600 mt-1 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                    "{activeOrder.deliveryNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Receipt Breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1.5">
                <Receipt className="h-3.5 w-3.5 text-amber-600" />
                <span>Order Summary ({activeOrder.id})</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                {activeOrder.items.length} items
              </span>
            </div>

            {/* Items list */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {activeOrder.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">
                      {item.quantity}x {item.name}
                    </span>
                    {item.instructions && (
                      <p className="text-[10px] text-slate-500 mt-0.5 italic">
                        Note: {item.instructions}
                      </p>
                    )}
                  </div>
                  <span className="font-mono text-slate-800 tabular-nums">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-slate-100 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span className="font-mono tabular-nums text-slate-800">${activeOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Delivery Fee ({dt.roadDistanceKm} km road)</span>
                <span className="font-mono tabular-nums text-slate-800">${activeOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Taxes</span>
                <span className="font-mono tabular-nums text-slate-800">${activeOrder.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Driver Tip</span>
                <span className="font-mono tabular-nums text-slate-800">${activeOrder.tip.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Total Paid</span>
                <span className="font-mono tabular-nums text-amber-700">
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

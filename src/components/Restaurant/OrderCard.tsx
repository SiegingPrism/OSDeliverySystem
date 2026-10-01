import React, { useState } from 'react';
import {
  AlertCircle,
  Ban,
  Bike,
  Check,
  ChevronDown,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Sparkles,
  Star,
  User,
  Zap,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, Order, OrderStatus } from '../../types/delivery';

interface OrderCardProps {
  order: Order;
  onSelectForMap?: (orderId: string) => void;
  onOpenRejectModal?: (order: Order) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onSelectForMap,
  onOpenRejectModal,
}) => {
  const {
    updateOrderStatus,
    assignCourier,
    autoDispatchNearestCourier,
    getDriversForRestaurant,
    selectedOrderId,
    setSelectedOrderId,
    setActiveRole,
  } = useDelivery();

  const [showDriverPicker, setShowDriverPicker] = useState(false);
  const isSelected = selectedOrderId === order.id;
  const dt = order.distanceTiming;

  // Ranked drivers based on distance to kitchen and availability
  const driversWithDistance = getDriversForRestaurant(order.restaurantId);

  // Urgency visual styling
  const getUrgencyIndicator = (score: number) => {
    if (score >= 75) {
      return {
        label: 'Critical Priority',
        textColor: 'text-rose-600',
        barColor: 'bg-rose-500',
        dotColor: 'bg-rose-500',
      };
    }
    if (score >= 45) {
      return {
        label: 'Elevated Urgency',
        textColor: 'text-amber-600',
        barColor: 'bg-amber-500',
        dotColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Standard Pace',
      textColor: 'text-emerald-600',
      barColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
    };
  };

  const urgency = getUrgencyIndicator(dt.urgencyScore);

  // Status transition handlers
  const handleNextStatus = () => {
    switch (order.status) {
      case 'received':
        updateOrderStatus(order.id, 'preparing');
        break;
      case 'preparing':
        updateOrderStatus(order.id, 'ready');
        break;
      case 'ready':
        if (!order.courierId) {
          autoDispatchNearestCourier(order.id);
        }
        updateOrderStatus(order.id, 'out_for_delivery');
        break;
      case 'out_for_delivery':
        updateOrderStatus(order.id, 'delivered');
        break;
    }
  };

  const handleAutoDispatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    autoDispatchNearestCourier(order.id);
  };

  const handleTrackInCustomerView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrderId(order.id);
    setActiveRole('customer');
  };

  return (
    <div
      onClick={() => {
        setSelectedOrderId(order.id);
        if (onSelectForMap) onSelectForMap(order.id);
      }}
      className={`group relative rounded-xl border bg-white p-5 transition-all duration-200 cursor-pointer shadow-sm ${
        order.status === 'rejected'
          ? 'border-rose-200 bg-rose-50/30 opacity-80'
          : isSelected
          ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
      }`}
    >
      {/* Top Header: ID, Customer, Priority, and Status */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">
              {order.id}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-bold text-slate-800">
              {order.customerName}
            </span>
            {order.priority === 'express' && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  Express
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-slate-500 truncate max-w-[280px] mt-0.5">
            {order.deliveryAddress}
          </p>
        </div>

        {/* Status text label */}
        <div className="text-right">
          <span
            className={`text-xs font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
              order.status === 'rejected'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : order.status === 'delivered'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
            }`}
          >
            {order.status.replace(/_/g, ' ')}
          </span>
          <p className="text-xs font-mono font-bold text-slate-900 mt-1">
            ${order.total.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Rejection Notice Banner */}
      {order.status === 'rejected' && (
        <div className="my-2.5 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
          <Ban className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-900">Order Rejected:</span>{' '}
            <span>{order.rejectionReason || 'Operational constraint'}</span>
          </div>
        </div>
      )}

      {/* Distance and Time Telemetry Row */}
      {order.status !== 'rejected' && (
        <div className="my-3 grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Distance</span>
            <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
              {dt.roadDistanceKm} km
            </span>
            <span className="text-[10px] text-slate-400 block">road</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">Kitchen Prep</span>
            <span className="text-xs font-bold font-mono text-slate-900 tabular-nums">
              {dt.estimatedPrepMinutes}m
            </span>
            <span className="text-[10px] text-slate-400 block">
              {order.status === 'preparing'
                ? `${Math.max(0, Math.round(dt.estimatedPrepMinutes - dt.minutesElapsed))}m left`
                : 'est'}
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-500 block uppercase font-mono">ETA Window</span>
            <span
              className={`text-xs font-bold font-mono tabular-nums ${
                dt.actualRemainingMinutes <= 5 ? 'text-rose-600' : 'text-indigo-700'
              }`}
            >
              {order.status === 'delivered' ? 'Completed' : `${dt.actualRemainingMinutes} mins`}
            </span>
            <span className="text-[10px] text-slate-400 block">
              SLA {dt.targetDeliveryMinutes}m
            </span>
          </div>
        </div>
      )}

      {/* Urgency Progress Bar */}
      {order.status !== 'delivered' && order.status !== 'rejected' && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="text-slate-600 flex items-center gap-1.5 font-medium">
              <span className={`h-1.5 w-1.5 rounded-full ${urgency.dotColor}`} />
              <span className={urgency.textColor}>{urgency.label}</span>
            </span>
            <span className="font-mono text-slate-500 tabular-nums">
              Score: {dt.urgencyScore}/100
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full ${urgency.barColor} transition-all duration-500`}
              style={{ width: `${dt.urgencyScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Items Summary */}
      <div className="text-xs text-slate-600 mb-3 border-t border-slate-100 pt-2">
        <div className="truncate font-medium text-slate-700">
          {order.items.map((i) => `${i.quantity}x ${i.name}`).join(' · ')}
        </div>
        {order.deliveryNotes && (
          <p className="text-[11px] text-slate-500 italic truncate mt-0.5">
            Note: "{order.deliveryNotes}"
          </p>
        )}
      </div>

      {/* Customer Feedback if Delivered */}
      {order.status === 'delivered' && order.feedback && (
        <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50/50 p-2.5 text-xs space-y-1">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span className="flex items-center gap-1 text-amber-800 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
              <span>Customer Review ({order.feedback.overallRating}/5 Stars)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Driver: {order.feedback.driverRating}★ · Kitchen: {order.feedback.restaurantRating}★
            </span>
          </div>
          {order.feedback.restaurantComments && (
            <p className="text-slate-600 italic text-[11px]">
              Kitchen note: "{order.feedback.restaurantComments}"
            </p>
          )}
          {order.feedback.driverComments && (
            <p className="text-slate-600 italic text-[11px]">
              Driver note: "{order.feedback.driverComments}"
            </p>
          )}
        </div>
      )}

      {/* Driver Assignment & Order Management Actions */}
      {order.status !== 'rejected' && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          {/* Driver Proximity & Assignment Picker */}
          <div className="relative">
            {order.courierName ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-700">
                  <Bike className="h-3.5 w-3.5 text-indigo-600" />
                  <span className="font-bold">{order.courierName}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 capitalize">{order.courierVehicle}</span>
                </div>
                {order.status !== 'delivered' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDriverPicker(!showDriverPicker);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 underline underline-offset-2 ml-1"
                  >
                    reassign
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAutoDispatch}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors border border-indigo-200"
                  title="Automatically finds closest available driver based on GPS distance"
                >
                  <Zap className="h-3 w-3" />
                  <span>Auto-Assign Nearest</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDriverPicker(!showDriverPicker);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
                >
                  <span>Select Driver</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Driver Distance & Availability Dropdown Menu */}
            {showDriverPicker && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-full left-0 mb-2 w-72 rounded-xl border border-slate-200 bg-white shadow-xl p-2 z-30 space-y-1.5 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between px-2 py-1 text-[11px] font-mono text-slate-500 border-b border-slate-100 font-bold">
                  <span>Available Drivers (By Proximity)</span>
                  <button
                    onClick={() => setShowDriverPicker(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {driversWithDistance.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        assignCourier(order.id, d.id);
                        setShowDriverPicker(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        order.courierId === d.id
                          ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{d.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            ★ {d.rating}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {d.distanceToKitchenKm} km away · ~{d.transitMinsToKitchen}m ETA
                        </span>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold ${
                            d.status === 'idle'
                              ? 'text-emerald-700'
                              : 'text-indigo-700'
                          }`}
                        >
                          {d.status === 'idle' ? 'Available' : 'Busy'}
                        </span>
                        <span className="text-[10px] text-slate-400 block capitalize">
                          {d.vehicleType}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Accept / Reject / Update Status */}
          <div className="flex items-center gap-2">
            {order.status === 'received' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenRejectModal) onOpenRejectModal(order);
                  }}
                  className="px-2.5 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors"
                  title="Reject order if kitchen is over capacity"
                >
                  Reject
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'preparing');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  Accept & Prep
                </button>
              </>
            )}

            {order.status === 'preparing' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateOrderStatus(order.id, 'ready');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Mark Ready for Driver
              </button>
            )}

            {order.status === 'ready' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (!order.courierId) {
                    autoDispatchNearestCourier(order.id);
                  }
                  updateOrderStatus(order.id, 'out_for_delivery');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                Dispatch to Driver
              </button>
            )}

            {order.status === 'out_for_delivery' && (
              <>
                <button
                  onClick={handleTrackInCustomerView}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  <Navigation className="h-3 w-3 text-indigo-400" />
                  <span>Live Map</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateOrderStatus(order.id, 'delivered');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all active:scale-95 shadow-sm"
                >
                  Confirm Delivered
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

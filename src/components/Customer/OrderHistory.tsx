import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Package,
  Receipt,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Order } from '../../types/delivery';
import { PostDeliveryFeedback } from './PostDeliveryFeedback';

interface OrderHistoryProps {
  orders: Order[];
  onSelectOrderToTrack?: (orderId: string) => void;
  onReorder?: (order: Order) => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  onSelectOrderToTrack,
  onReorder,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [feedbackOrder, setFeedbackOrder] = useState<Order | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3" />
            <span>Delivered</span>
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="h-3 w-3" />
            <span>In Transit</span>
          </span>
        );
      case 'preparing':
      case 'ready':
      case 'received':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="h-3 w-3" />
            <span className="capitalize">{status.replace(/_/g, ' ')}</span>
          </span>
        );
      case 'rejected':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="capitalize">{status}</span>
          </span>
        );
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
        <Package className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <h4 className="text-sm font-bold text-slate-800">No Past Orders</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
          You haven't placed any food deliveries yet. Browse our partner menus to make your first order!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isExpanded = expandedOrderId === order.id;
        const totalItemsCount = order.items.reduce(
          (sum, i) => sum + i.quantity,
          0
        );

        return (
          <div
            key={order.id}
            className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-sm overflow-hidden"
          >
            {/* Order Summary Row */}
            <div
              onClick={() => toggleExpand(order.id)}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {order.id}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {order.restaurantName}
                  </span>
                  <span className="text-slate-300">·</span>
                  {getStatusBadge(order.status)}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    {formatDate(order.createdAt)}
                  </span>
                  <span>·</span>
                  <span>
                    {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
                  </span>
                  <span>·</span>
                  <span className="truncate max-w-[200px]">
                    {order.deliveryAddress}
                  </span>
                </div>
              </div>

              {/* Cost & Expand toggle */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="font-mono text-base font-extrabold text-slate-900 tabular-nums">
                    ${order.total.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-mono">
                    Total Cost
                  </span>
                </div>

                <button
                  type="button"
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Expanded Details Breakdown */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/70 space-y-3 text-xs">
                {/* Items Ordered List */}
                <div>
                  <span className="font-bold text-slate-800 block mb-2">
                    Items Ordered:
                  </span>
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-200">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900">
                            {item.quantity}x {item.name}
                          </span>
                          {item.instructions && (
                            <p className="text-[11px] text-slate-500 italic mt-0.5">
                              "{item.instructions}"
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-slate-700 tabular-nums">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Cost Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-center font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Subtotal</span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      ${order.subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Delivery Fee</span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      ${order.deliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Driver Tip</span>
                    <span className="text-xs font-bold text-slate-800 tabular-nums">
                      ${order.tip.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Total Paid</span>
                    <span className="text-xs font-bold text-amber-700 tabular-nums">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery Notes or Courier Details */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-500">
                  <div>
                    {order.courierName ? (
                      <span>
                        Delivered by{' '}
                        <strong className="text-slate-800">{order.courierName}</strong> (
                        {order.courierVehicle})
                      </span>
                    ) : (
                      <span>Pending courier dispatch</span>
                    )}
                    {order.distanceTiming && (
                      <span className="ml-2 font-mono">
                        · {order.distanceTiming.roadDistanceKm} km road distance
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => setFeedbackOrder(order)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                          order.feedback
                            ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                            : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
                        }`}
                      >
                        <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                        <span>
                          {order.feedback
                            ? `Rated ${order.feedback.overallRating}.0★`
                            : 'Rate Delivery'}
                        </span>
                      </button>
                    )}

                    {order.status !== 'delivered' &&
                      order.status !== 'cancelled' &&
                      order.status !== 'rejected' &&
                      onSelectOrderToTrack && (
                        <button
                          onClick={() => onSelectOrderToTrack(order.id)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                          <Navigation className="h-3 w-3" />
                          <span>Track Live GPS</span>
                        </button>
                      )}

                    {onReorder && (
                      <button
                        onClick={() => onReorder(order)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold transition-colors"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Post-Delivery Feedback Modal */}
      {feedbackOrder && (
        <PostDeliveryFeedback
          order={feedbackOrder}
          variant="modal"
          onClose={() => setFeedbackOrder(null)}
        />
      )}
    </div>
  );
};

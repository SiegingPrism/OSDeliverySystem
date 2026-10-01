import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  BatteryCharging,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  ExternalLink,
  MapPin,
  MessageSquare,
  Navigation,
  PackageCheck,
  Phone,
  Power,
  Send,
  ShieldCheck,
  Star,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, Order } from '../../types/delivery';
import { IntegratedMapService } from '../Map/IntegratedMapService';

export const DriverDashboard: React.FC = () => {
  const {
    couriers,
    orders,
    restaurants,
    currentDriverId,
    setCurrentDriverId,
    toggleDriverOnlineStatus,
    pickUpOrderByDriver,
    markOrderDeliveredByDriver,
    sendOrderChatMessage,
    setSelectedOrderId,
  } = useDelivery();

  const { currentUser, drivers } = useAuth();
  const [driverReplyText, setDriverReplyText] = useState<{ [orderId: string]: string }>({});

  const currentCourier =
    couriers.find((c) => c.id === currentDriverId) || couriers[0];

  const isOnline = currentCourier.status !== 'offline';

  // Orders assigned to this driver
  const assignedOrders = useMemo(() => {
    return orders.filter(
      (o) =>
        o.courierId === currentCourier.id &&
        (o.status === 'ready' ||
          o.status === 'preparing' ||
          o.status === 'received' ||
          o.status === 'out_for_delivery')
    );
  }, [orders, currentCourier.id]);

  // Completed orders by this driver
  const completedOrders = useMemo(() => {
    return orders.filter(
      (o) => o.courierId === currentCourier.id && o.status === 'delivered'
    );
  }, [orders, currentCourier.id]);

  const activeTrip = assignedOrders.find((o) => o.status === 'out_for_delivery') || assignedOrders[0];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Driver Header & Online/Offline Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-2xl font-bold shadow-sm">
            {currentCourier.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 font-mono">
                Courier Driver Portal
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 capitalize font-medium">
                {currentCourier.vehicleType} Fleet
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {currentCourier.name}
            </h1>
            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 font-mono">
              <span className="flex items-center gap-1 text-slate-700 font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {currentCourier.rating} Rating
              </span>
              <span>·</span>
              <span>{currentCourier.totalDeliveries} Lifetime Trips</span>
              <span>·</span>
              <span>{currentCourier.batteryPct}% Battery</span>
            </div>
          </div>
        </div>

        {/* Driver Selector & Online Status Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Switch Driver account */}
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-2 text-xs text-slate-600 shadow-sm">
            <span className="text-slate-400 font-medium">Driver:</span>
            <select
              value={currentDriverId}
              onChange={(e) => setCurrentDriverId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {couriers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.vehicleType})
                </option>
              ))}
            </select>
          </div>

          {/* Online / Offline Toggle Button */}
          <button
            onClick={() => toggleDriverOnlineStatus(currentCourier.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              isOnline
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-600/20'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            <Power className="h-4 w-4" />
            <span>{isOnline ? 'Online · Receiving Orders' : 'Offline · Tap to Go Online'}</span>
          </button>
        </div>
      </div>

      {/* Driver Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Shift Status</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
          </div>
          <span
            className={`text-xl font-bold font-mono capitalize ${
              isOnline ? 'text-emerald-700' : 'text-slate-500'
            }`}
          >
            {currentCourier.status}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            {isOnline ? 'Ready for nearby pickups' : 'Dispatch queue paused'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Assignments</span>
            <Bike className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {assignedOrders.length}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">
            {assignedOrders.length === 0 ? 'No orders assigned yet' : 'In delivery pipeline'}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Estimated Earnings</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            $
            {(
              completedOrders.reduce(
                (sum, o) => sum + (o.deliveryFee + o.tip),
                0
              ) + 48.5
            ).toFixed(2)}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">Base delivery fare + 100% tips</p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Deliveries Today</span>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
            {completedOrders.length + 4}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">100% On-time completion rate</p>
        </div>
      </div>

      {/* Main Driver Workspace: Assigned Pickups & Live Trip Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Pickups & Order Actions */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-amber-600" />
              <span>Assigned Pickup Locations & Tasks ({assignedOrders.length})</span>
            </h2>
          </div>

          {!isOnline ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Power className="mx-auto h-8 w-8 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">You Are Currently Offline</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Toggle your status to Online above to receive assigned delivery tasks from partner restaurants.
              </p>
              <button
                onClick={() => toggleDriverOnlineStatus(currentCourier.id)}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Go Online Now
              </button>
            </div>
          ) : assignedOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <Bike className="mx-auto h-8 w-8 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Orders Assigned</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You are online! When restaurants accept orders and assign drivers, your pickup routes will appear here automatically.
              </p>
            </div>
          ) : (
            assignedOrders.map((order) => {
              const dt = order.distanceTiming;
              const isOut = order.status === 'out_for_delivery';
              const isReady = order.status === 'ready';

              return (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition-all space-y-4"
                >
                  {/* Task Header */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          {order.id}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span className="text-xs font-semibold text-amber-700">
                          {order.restaurantName}
                        </span>
                        {order.priority === 'express' && (
                          <span className="text-[10px] font-bold text-amber-600 uppercase font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Express
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Customer: <span className="font-semibold text-slate-800">{order.customerName}</span> · {order.customerPhone}
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold uppercase font-mono px-2 py-0.5 rounded ${
                          isOut
                            ? 'bg-amber-100 text-amber-800'
                            : isReady
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {isOut ? 'In Transit' : isReady ? 'Ready for Pickup' : 'Kitchen Prepping'}
                      </span>
                      <p className="text-[11px] font-mono text-emerald-700 font-bold mt-1">
                        +${(order.deliveryFee + order.tip).toFixed(2)} pay
                      </p>
                    </div>
                  </div>

                  {/* Step 1: Restaurant Pickup Information */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/60 space-y-2 text-xs">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        <Building2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-slate-900 block">
                            Pickup at {order.restaurantName}
                          </span>
                          <span className="text-slate-600">
                            {order.restaurantAddress ||
                              restaurants.find((r) => r.id === order.restaurantId)
                                ?.address ||
                              'Columbus Ave'}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-700">
                        {dt.roadDistanceKm} km trip
                      </span>
                    </div>

                    {/* Order Checklist */}
                    <div className="pt-2 border-t border-amber-200/40 text-[11px] text-slate-700">
                      <span className="font-semibold text-slate-900 block mb-1">
                        Items to Collect ({order.items.length}):
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                        {order.items.map((i) => (
                          <li key={i.id}>
                            {i.quantity}x {i.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Confirm Pickup Action if not yet picked up */}
                    {!isOut && (
                      <button
                        onClick={() => pickUpOrderByDriver(order.id)}
                        className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm"
                      >
                        ✓ Confirm Pickup & Start Delivery
                      </button>
                    )}
                  </div>

                  {/* Step 2: Customer Delivery Dropoff Information & Live Communication */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Deliver to {order.customerName}
                        </span>
                        <span className="text-slate-600">{order.deliveryAddress}</span>
                        {order.deliveryNotes && (
                          <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded border border-slate-200">
                            Notes: "{order.deliveryNotes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Customer Live Delivery Instructions & Chat */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5 font-mono uppercase">
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
                          <span>Customer Chat & Instructions ({order.chatMessages?.length || 0})</span>
                        </span>
                      </div>

                      {/* Chat Messages */}
                      <div className="max-h-36 overflow-y-auto space-y-1.5 p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                        {!order.chatMessages || order.chatMessages.length === 0 ? (
                          <p className="text-slate-400 italic text-center py-1">
                            No customer instructions sent yet.
                          </p>
                        ) : (
                          order.chatMessages.map((msg) => (
                            <div
                              key={msg.id}
                              className={`p-2 rounded-lg ${
                                msg.sender === 'driver'
                                  ? 'bg-indigo-50 text-indigo-900 ml-4 border border-indigo-100'
                                  : 'bg-slate-100 text-slate-800 mr-4 border border-slate-200'
                              }`}
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                <span className="font-semibold text-slate-600">
                                  {msg.sender === 'driver' ? 'You' : msg.senderName}
                                </span>
                                <span>
                                  {new Date(msg.timestamp).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p>{msg.message}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Quick Driver Response Chips */}
                      <div className="flex flex-wrap gap-1">
                        {['Arrived outside', 'Left at doorstep per note', 'On my way (~3m)'].map(
                          (preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() =>
                                sendOrderChatMessage(
                                  order.id,
                                  preset,
                                  'driver',
                                  currentCourier.name
                                )
                              }
                              className="px-2 py-0.5 rounded-md bg-slate-200/80 hover:bg-indigo-50 hover:text-indigo-700 text-[10px] font-semibold text-slate-700 transition-colors"
                            >
                              + {preset}
                            </button>
                          )
                        )}
                      </div>

                      {/* Driver Reply Input */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <input
                          type="text"
                          value={driverReplyText[order.id] || ''}
                          onChange={(e) =>
                            setDriverReplyText((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const text = (driverReplyText[order.id] || '').trim();
                              if (text) {
                                sendOrderChatMessage(
                                  order.id,
                                  text,
                                  'driver',
                                  currentCourier.name
                                );
                                setDriverReplyText((prev) => ({ ...prev, [order.id]: '' }));
                              }
                            }
                          }}
                          placeholder="Reply to customer..."
                          className="flex-1 rounded-lg bg-white border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const text = (driverReplyText[order.id] || '').trim();
                            if (text) {
                              sendOrderChatMessage(
                                order.id,
                                text,
                                'driver',
                                currentCourier.name
                              );
                              setDriverReplyText((prev) => ({ ...prev, [order.id]: '' }));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                          title="Send reply"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Mark as Delivered Action */}
                  {isOut && (
                    <button
                      onClick={() => markOrderDeliveredByDriver(order.id)}
                      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Mark Order as Delivered</span>
                    </button>
                  )}
                </div>
              );
            })
          )}

          {/* Completed Deliveries Summary */}
          {completedOrders.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                Completed Deliveries Today ({completedOrders.length})
              </h3>
              <div className="space-y-2">
                {completedOrders.map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-slate-900">{o.id}</span>
                      <span className="text-slate-400 mx-1">·</span>
                      <span className="text-slate-600 truncate">{o.deliveryAddress}</span>
                    </div>
                    <span className="font-mono text-emerald-700 font-bold">
                      +${(o.deliveryFee + o.tip).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live GPS Route Map for Driver */}
        <div className="lg:col-span-6 sticky top-20 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Navigation className="h-4 w-4 text-amber-600" />
              <span>Live Driver Route & Turn-by-Turn GPS</span>
            </span>
            <span className="font-mono">
              {activeTrip ? `${activeTrip.id}` : 'Standby'}
            </span>
          </div>

          {activeTrip ? (
            <IntegratedMapService order={activeTrip} heightClass="h-[600px]" autoCenterDriver={true} />
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-100 h-[480px] flex flex-col items-center justify-center text-center p-6">
              <Compass className="h-10 w-10 text-slate-400 mb-2 animate-spin-slow" />
              <h4 className="text-base font-bold text-slate-700">Map on Standby</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Turn-by-turn navigation activates automatically as soon as an order is assigned.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

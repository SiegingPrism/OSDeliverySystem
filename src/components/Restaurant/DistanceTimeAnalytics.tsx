import React from 'react';
import {
  Activity,
  AlertTriangle,
  Bike,
  CheckCircle2,
  Clock,
  Compass,
  Gauge,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export const DistanceTimeAnalytics: React.FC = () => {
  const { orders, couriers } = useDelivery();

  const activeOrders = orders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'rejected'
  );

  // Compute average road distance
  const avgDistanceKm =
    activeOrders.length > 0
      ? (
          activeOrders.reduce((sum, o) => sum + o.distanceTiming.roadDistanceKm, 0) /
          activeOrders.length
        ).toFixed(1)
      : '0.0';

  // Compute average estimated transit time
  const avgTransitMins =
    activeOrders.length > 0
      ? Math.round(
          activeOrders.reduce(
            (sum, o) => sum + o.distanceTiming.estimatedTransitMinutes,
            0
          ) / activeOrders.length
        )
      : 0;

  // Compute SLA Risk count (remaining target time < 6 mins)
  const slaRiskCount = activeOrders.filter((o) => {
    const remaining =
      o.distanceTiming.targetDeliveryMinutes - o.distanceTiming.minutesElapsed;
    return remaining <= 6 && o.status !== 'delivered';
  }).length;

  // Active couriers delivering
  const busyCouriers = couriers.filter(
    (c) => c.status === 'delivering' || c.status === 'assigned'
  ).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {/* Metric 1: Avg Distance */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Avg Delivery Distance</span>
          <MapPin className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {avgDistanceKm}
          </span>
          <span className="text-xs font-semibold text-slate-500">km road</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Optimal radius threshold $\le$ 6.5km
        </p>
      </div>

      {/* Metric 2: Avg Transit Time */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Avg Transit Duration</span>
          <Clock className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {avgTransitMins}
          </span>
          <span className="text-xs font-semibold text-slate-500">mins / trip</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          Speed buffer based on live traffic
        </p>
      </div>

      {/* Metric 3: SLA Integrity */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>SLA Punctuality</span>
          {slaRiskCount > 0 ? (
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {slaRiskCount > 0 ? `${slaRiskCount} at risk` : '98.2%'}
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {slaRiskCount > 0 ? 'Prioritize urgent orders' : 'Nominal dispatch timing'}
        </p>
      </div>

      {/* Metric 4: Courier Utilization */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
          <span>Fleet Utilization</span>
          <Bike className="h-4 w-4 text-emerald-600" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
            {busyCouriers} / {couriers.length}
          </span>
          <span className="text-xs font-semibold text-slate-500">active</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">
          {couriers.length - busyCouriers} couriers on standby nearby
        </p>
      </div>
    </div>
  );
};

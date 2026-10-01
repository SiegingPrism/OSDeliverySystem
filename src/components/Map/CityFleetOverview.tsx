import React, { useState } from 'react';
import {
  Activity,
  BatteryCharging,
  Bike,
  Building2,
  Car,
  Compass,
  Filter,
  Layers,
  MapPin,
  Navigation,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, VehicleType } from '../../types/delivery';
import { LiveDeliveryMap } from './LiveDeliveryMap';

export const CityFleetOverview: React.FC = () => {
  const {
    couriers,
    orders,
    selectedOrderId,
    setSelectedOrderId,
    simulationSpeed,
    setSimulationSpeed,
    simulateRandomNewOrder,
    trafficCongestion,
    setTrafficCongestion,
  } = useDelivery();

  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleType>('all');
  const [justSimulated, setJustSimulated] = useState(false);

  const filteredCouriers = couriers.filter((c) => {
    if (vehicleFilter !== 'all' && c.vehicleType !== vehicleFilter) return false;
    return true;
  });

  const activeOrdersInTransit = orders.filter(
    (o) => o.status === 'out_for_delivery'
  );

  const handleSimulate = () => {
    simulateRandomNewOrder();
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header with City Dispatch Title and Simulator Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono">
              Metropolitan Operations Dispatch Console
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            City Fleet & Real-Time Logistics Grid
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time GPS telemetry, corridor batching v2, dynamic transit SLAs, and live road conditions.
          </p>
        </div>

        {/* Dispatch Controls: Simulation Speed & Quick Order Injector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Traffic Congestion Toggle */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1 text-xs">
            <span className="px-2 text-slate-500 dark:text-slate-400 font-medium">Traffic:</span>
            {(['light', 'moderate', 'heavy'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTrafficCongestion(t)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all font-semibold ${
                  trafficCongestion === t
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700/60'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Simulation Rate Controller */}
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-1 text-xs shadow-2xs">
            <button
              onClick={() => setSimulationSpeed(simulationSpeed === 0 ? 1 : 0)}
              title={simulationSpeed === 0 ? 'Resume simulation' : 'Pause simulation'}
              className={`p-1.5 rounded-lg transition-colors ${
                simulationSpeed === 0
                  ? 'bg-rose-600 text-white font-bold'
                  : 'hover:text-slate-900 dark:hover:text-white text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60'
              }`}
            >
              {simulationSpeed === 0 ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
            {[1, 3, 8].map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors font-semibold ${
                  simulationSpeed === spd
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Inject Simulated Order */}
          <button
            onClick={handleSimulate}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              justSimulated
                ? 'bg-emerald-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{justSimulated ? 'Simulated Order Injected!' : 'Simulate Order'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar & KPIs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Vehicle Filter */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 text-xs">
          <span className="px-2 text-slate-500 dark:text-slate-400 font-medium">Fleet Filter:</span>
          {(['all', 'ebike', 'scooter', 'car'] as const).map((vt) => (
            <button
              key={vt}
              onClick={() => setVehicleFilter(vt)}
              className={`px-3 py-1 rounded-lg capitalize transition-all font-medium ${
                vehicleFilter === vt
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {vt}
            </button>
          ))}
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span>{filteredCouriers.length} Couriers Active</span>
          <span>·</span>
          <span>{activeOrdersInTransit.length} In-Transit Road Deliveries</span>
          <span>·</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">Corridors Synced</span>
        </div>
      </div>

      {/* Grid Layout: Main Map + Fleet Telemetry Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Full-Feature Map View */}
        <div className="lg:col-span-8 space-y-3">
          <LiveDeliveryMap
            focusedOrderId={selectedOrderId}
            onSelectOrder={(id) => setSelectedOrderId(id)}
            heightClass="h-[680px]"
          />
        </div>

        {/* Fleet Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live In-Transit Orders */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Active Trips ({activeOrdersInTransit.length})
              </span>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">
                GPS Tracking
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeOrdersInTransit.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">
                  No orders currently in transit.
                </p>
              ) : (
                activeOrdersInTransit.map((o) => {
                  const isSelected = selectedOrderId === o.id;
                  return (
                    <div
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-900 dark:text-white">{o.id}</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                          {o.distanceTiming.actualRemainingMinutes}m left
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate mt-1">
                        {o.customerName} · {o.distanceTiming.distanceRemainingKm} km remaining
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-1">
                        Courier: {o.courierName} ({o.courierVehicle})
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Courier Fleet Status List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
                Fleet Status ({filteredCouriers.length})
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {couriers.filter((c) => c.status === 'idle').length} idle nearby
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCouriers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                        {c.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          ★ {c.rating} · {c.totalDeliveries} trips
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold uppercase ${
                        c.status === 'delivering'
                          ? 'text-amber-600 dark:text-amber-400'
                          : c.status === 'assigned'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <div>
                      <span>Mode: </span>
                      <span className="text-slate-800 dark:text-slate-200 capitalize font-medium">{c.vehicleType}</span>
                    </div>
                    <div>
                      <span>Speed: </span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{c.avgSpeedKmh}km/h</span>
                    </div>
                    <div>
                      <span>Battery: </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">{c.batteryPct}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  BatteryCharging,
  Bike,
  Building2,
  Car,
  Compass,
  Filter,
  Layers,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, VehicleType } from '../../types/delivery';
import { LiveDeliveryMap } from './LiveDeliveryMap';

export const CityFleetOverview: React.FC = () => {
  const { couriers, orders, selectedOrderId, setSelectedOrderId } = useDelivery();

  const [vehicleFilter, setVehicleFilter] = useState<'all' | VehicleType>('all');

  const filteredCouriers = couriers.filter((c) => {
    if (vehicleFilter !== 'all' && c.vehicleType !== vehicleFilter) return false;
    return true;
  });

  const activeOrdersInTransit = orders.filter(
    (o) => o.status === 'out_for_delivery'
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
            Metropolitan Dispatch Telemetry
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            City Fleet & Real-Time Logistics Grid
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time GPS coordinates, vehicle speed, battery levels, and active delivery routes.
          </p>
        </div>

        {/* Vehicle Type Filter */}
        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 p-1 text-xs">
          <span className="px-2 text-slate-500 font-medium">Fleet:</span>
          {(['all', 'ebike', 'scooter', 'car'] as const).map((vt) => (
            <button
              key={vt}
              onClick={() => setVehicleFilter(vt)}
              className={`px-3 py-1 rounded-lg capitalize transition-all font-medium ${
                vehicleFilter === vt
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {vt}
            </button>
          ))}
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Active Trips ({activeOrdersInTransit.length})
              </span>
              <span className="text-xs font-semibold text-amber-700 font-mono">
                GPS Tracking
              </span>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeOrdersInTransit.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
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
                          ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                          : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono">
                        <span className="font-bold text-slate-900">{o.id}</span>
                        <span className="text-amber-700 font-bold tabular-nums">
                          {o.distanceTiming.actualRemainingMinutes}m left
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 truncate mt-1">
                        {o.customerName} · {o.distanceTiming.distanceRemainingKm} km remaining
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Courier: {o.courierName} ({o.courierVehicle})
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Courier Fleet Status List */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Fleet Status ({filteredCouriers.length})
              </span>
              <span className="text-[11px] text-slate-500">
                {couriers.filter((c) => c.status === 'idle').length} idle nearby
              </span>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {filteredCouriers.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 font-bold text-xs border border-amber-500/20">
                        {c.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ★ {c.rating} · {c.totalDeliveries} trips
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[11px] font-mono font-bold uppercase ${
                        c.status === 'delivering'
                          ? 'text-amber-700'
                          : c.status === 'assigned'
                          ? 'text-blue-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-slate-200 text-[10px] text-slate-500 font-mono">
                    <div>
                      <span>Mode: </span>
                      <span className="text-slate-800 capitalize font-medium">{c.vehicleType}</span>
                    </div>
                    <div>
                      <span>Speed: </span>
                      <span className="text-slate-800 font-medium">{c.avgSpeedKmh}km/h</span>
                    </div>
                    <div>
                      <span>Battery: </span>
                      <span className="text-emerald-700 font-bold">{c.batteryPct}%</span>
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

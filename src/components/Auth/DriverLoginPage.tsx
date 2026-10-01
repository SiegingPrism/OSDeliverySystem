import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BatteryCharging,
  Bike,
  Car,
  CheckCircle2,
  DollarSign,
  Flame,
  KeyRound,
  MapPin,
  Navigation,
  Phone,
  Power,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Truck,
  User,
  Zap,
} from 'lucide-react';
import { INITIAL_DRIVERS, useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { VehicleType } from '../../types/delivery';

interface DriverLoginPageProps {
  onSuccess: () => void;
  onNavigatePortal: (portal: 'customer' | 'restaurant' | 'driver' | 'dispatch') => void;
}

export const DriverLoginPage: React.FC<DriverLoginPageProps> = ({
  onSuccess,
  onNavigatePortal,
}) => {
  const { loginAsDriver, switchDemoAccount, drivers } = useAuth();
  const { setActiveRole, setCurrentDriverId } = useDelivery();

  const [selectedDriverId, setSelectedDriverId] = useState(drivers[0].id);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleType>('ebike');
  const [driverIdentifier, setDriverIdentifier] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [checklist, setChecklist] = useState({
    insulatedBag: true,
    chargedBattery: true,
    gpsActive: true,
    helmetEquipped: true,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const currentDriver = drivers.find((d) => d.id === selectedDriverId) || drivers[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const targetId = selectedDriverId || drivers[0].id;
    loginAsDriver(targetId);
    setCurrentDriverId(targetId);
    setActiveRole('driver');
    onSuccess();
  };

  const handleQuickDemoDriver = (driverId: string) => {
    switchDemoAccount('driver', driverId);
    setCurrentDriverId(driverId);
    setActiveRole('driver');
    onSuccess();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Portal Category Switcher Bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 uppercase px-2">
            Select Portal:
          </span>
          <button
            onClick={() => onNavigatePortal('customer')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>Customer Portal</span>
          </button>
          <button
            onClick={() => onNavigatePortal('restaurant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>Kitchen & KDS</span>
          </button>
          <button
            onClick={() => onNavigatePortal('driver')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Bike className="h-3.5 w-3.5" />
            <span>Courier Fleet</span>
          </button>
          <button
            onClick={() => onNavigatePortal('dispatch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>City Operations</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          Courier Fleet Portal & Real-Time Telemetry
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Fleet Vehicle Telemetry & Projected Earnings */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
                <Bike className="h-3.5 w-3.5" />
                <span>Velocita Courier Fleet Network</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
                Courier Driver Portal & Route Telemetry Terminal
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Connect your vehicle, accept nearby kitchen orders, monitor live turn-by-turn road corridors, and earn surge bonuses during peak lunch & dinner rushes.
              </p>
            </div>

            {/* Vehicle Mode Grid */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                Fleet Vehicle Types & Performance:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div
                  onClick={() => setSelectedVehicle('ebike')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedVehicle === 'ebike'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <Bike className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">Electric Bike</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">24 km/h · 15 kg</span>
                </div>

                <div
                  onClick={() => setSelectedVehicle('scooter')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedVehicle === 'scooter'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <Navigation className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">Urban Scooter</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">32 km/h · 10 kg</span>
                </div>

                <div
                  onClick={() => setSelectedVehicle('car')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedVehicle === 'car'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <Car className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">Courier EV</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">45 km/h · 40 kg</span>
                </div>

                <div
                  onClick={() => setSelectedVehicle('van')}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    selectedVehicle === 'van'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
                  }`}
                >
                  <Truck className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                  <span className="text-xs font-bold block text-slate-900 dark:text-white">Delivery Van</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Catering batch</span>
                </div>
              </div>
            </div>

            {/* Projected Surge & Shift Incentives */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold">
                  <Flame className="h-4 w-4 text-amber-600 dark:text-amber-400 fill-amber-500" />
                  <span>Downtown SF High Demand Surge Active</span>
                </span>
                <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-800 dark:text-amber-200">
                  +$3.50 / trip bonus
                </span>
              </div>
              <p className="text-xs opacity-90">
                Average active riders earning $32 – $44/hr during peak lunch hours. Batch corridor opportunities available along Bush & Hyde streets.
              </p>
            </div>

            {/* Quick Demo Drivers */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                Active Courier Roster (1-Click Login):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {drivers.slice(0, 4).map((driver) => (
                  <button
                    key={driver.id}
                    onClick={() => handleQuickDemoDriver(driver.id)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                          {driver.name}
                        </span>
                        <span className="flex items-center text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500 mr-0.5" />
                          {driver.rating}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono capitalize">
                        {driver.vehicleType} · {driver.totalDeliveries} trips · ${driver.todayEarnings} earned
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>GPS Tracking Node Active</span>
            <span>Zero-Emission Fleet Protocol</span>
          </div>
        </div>

        {/* Right Side: Driver Shift Check-in & Login Form */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Courier Shift Check-in
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify your pre-trip readiness and sign in to start receiving delivery dispatches.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Courier Profile Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Assigned Courier Profile *
              </label>
              <div className="space-y-2">
                {drivers.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      setSelectedDriverId(d.id);
                      setSelectedVehicle(d.vehicleType);
                    }}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedDriverId === d.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                        {d.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{d.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono capitalize">
                          {d.vehicleType} · {d.phone} · ⭐ {d.rating}
                        </span>
                      </div>
                    </div>
                    {selectedDriverId === d.id && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pre-Trip Safety Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 font-mono uppercase tracking-wider block">
                Pre-Trip Safety & Equipment Checklist:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.insulatedBag}
                    onChange={(e) => setChecklist({ ...checklist, insulatedBag: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Insulated Thermo Bag</span>
                </label>

                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.chargedBattery}
                    onChange={(e) => setChecklist({ ...checklist, chargedBattery: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Battery &gt; 50%</span>
                </label>

                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.gpsActive}
                    onChange={(e) => setChecklist({ ...checklist, gpsActive: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>GPS Telemetry On</span>
                </label>

                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checklist.helmetEquipped}
                    onChange={(e) => setChecklist({ ...checklist, helmetEquipped: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Helmet &amp; Lights</span>
                </label>
              </div>
            </div>

            {/* Driver Identifier & Passcode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Driver Phone / Driver ID
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={driverIdentifier}
                  onChange={(e) => setDriverIdentifier(e.target.value)}
                  placeholder="e.g. +1 (415) 555-0142 or COURIER-1"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Fleet Passcode
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  Demo: Any passcode accepted
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              <Power className="h-4 w-4" />
              <span>Go Online &amp; Open Driver Portal</span>
            </button>
          </form>

          {/* Quick Switch to Other Portals footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Need another portal?{' '}
            </span>
            <button
              onClick={() => onNavigatePortal('customer')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Customer Login
            </button>
            <span className="text-slate-300 dark:text-slate-700 mx-2">·</span>
            <button
              onClick={() => onNavigatePortal('restaurant')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Kitchen Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

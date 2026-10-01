import React, { useState } from 'react';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Compass,
  Cpu,
  Eye,
  Flame,
  Globe,
  KeyRound,
  Layers,
  Lock,
  MapPin,
  Navigation,
  Radio,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Zap,
} from 'lucide-react';
import { INITIAL_DISPATCHERS, useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';

interface DispatcherLoginPageProps {
  onSuccess: () => void;
  onNavigatePortal: (portal: 'customer' | 'restaurant' | 'driver' | 'dispatch') => void;
}

export const DispatcherLoginPage: React.FC<DispatcherLoginPageProps> = ({
  onSuccess,
  onNavigatePortal,
}) => {
  const { loginAsDispatcher, switchDemoAccount, dispatchers } = useAuth();
  const { setActiveRole, orders, couriers, trafficCongestion, setTrafficCongestion } = useDelivery();

  const [callsign, setCallsign] = useState('METRO-ALPHA-1');
  const [clearancePin, setClearancePin] = useState('');
  const [selectedStation, setSelectedStation] = useState<'sf_east_bay' | 'downtown_grid' | 'mission_corridor'>('sf_east_bay');
  const [errorMessage, setErrorMessage] = useState('');

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected'
  ).length;

  const activeDriversCount = couriers.filter((c) => c.status !== 'offline').length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    loginAsDispatcher(callsign, clearancePin);
    setActiveRole('dispatcher_map');
    onSuccess();
  };

  const handleQuickDemoDispatcher = (dispId: string) => {
    switchDemoAccount('dispatcher', dispId);
    setActiveRole('dispatcher_map');
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>Courier Fleet</span>
          </button>
          <button
            onClick={() => onNavigatePortal('dispatch')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>City Operations</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          Metropolitan City Command & Dispatch Operations
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: System Architecture & Live Telemetry Telemetry */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                <span>Central Operations Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
                Metropolitan City Fleet Overview & Traffic Command
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Supervise San Francisco citywide transit corridors, monitor courier density heatmaps, enforce SLA guarantee thresholds, and batch co-located delivery runs.
              </p>
            </div>

            {/* Live City Telemetry Panel */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                    Live Telemetry Node SF-01
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Haversine + OSM Router v4</span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Active Orders</span>
                  <span className="text-base font-bold font-mono text-white mt-0.5 block tabular-nums">
                    {activeOrdersCount} in flight
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Couriers Online</span>
                  <span className="text-base font-bold font-mono text-amber-400 mt-0.5 block tabular-nums">
                    {activeDriversCount} active
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 font-mono block">Traffic Simulator</span>
                  <span className="text-base font-bold font-mono text-indigo-400 mt-0.5 block capitalize">
                    {trafficCongestion}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Supervisor Clearances */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                Authorized Operations Staff (1-Click Clearance):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {dispatchers.map((disp) => (
                  <button
                    key={disp.id}
                    onClick={() => handleQuickDemoDispatcher(disp.id)}
                    className="flex flex-col items-start p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate">
                        {disp.name}
                      </span>
                      <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold mt-1">
                      {disp.callsign}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate w-full mt-0.5">
                      {disp.clearanceLevel}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Security Level 4 Authorization</span>
            <span>Corridor Engine Live (East Bay Sector)</span>
          </div>
        </div>

        {/* Right Side: Clearance Login & Station Authentication */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <span>Operations Security Clearance</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Verify operator credentials to access the citywide fleet overview and routing maps.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Sector / Station Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Monitoring Sector Hub
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedStation('sf_east_bay')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    selectedStation === 'sf_east_bay'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  SF Bayfront
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStation('downtown_grid')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    selectedStation === 'downtown_grid'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Downtown Grid
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedStation('mission_corridor')}
                  className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    selectedStation === 'mission_corridor'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Mission Corridor
                </button>
              </div>
            </div>

            {/* Callsign / Operator ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Operator Callsign or Clearance Email
              </label>
              <div className="relative">
                <Terminal className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={callsign}
                  onChange={(e) => setCallsign(e.target.value)}
                  placeholder="METRO-ALPHA-1 or sarah.dispatch@velocita.app"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Clearance Security PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Station Security PIN
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  Demo: Any PIN accepted
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={clearancePin}
                  onChange={(e) => setClearancePin(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            {/* Initial Traffic Simulation Condition Preset */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Initial Traffic Factor
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'moderate', 'heavy'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrafficCongestion(t)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border capitalize transition-all ${
                      trafficCongestion === t
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {t} ({t === 'light' ? '1.0x' : t === 'moderate' ? '1.15x' : '1.4x'})
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              <span>Unlock City Fleet Overview & Maps</span>
              <ArrowRight className="h-4 w-4" />
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
            <span className="text-slate-300 dark:text-slate-700 mx-2">·</span>
            <button
              onClick={() => onNavigatePortal('driver')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Driver Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

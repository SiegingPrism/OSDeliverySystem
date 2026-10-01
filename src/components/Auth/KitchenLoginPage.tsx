import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChefHat,
  Clock,
  Flame,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Pause,
  Play,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { INITIAL_STAFF, useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';

interface KitchenLoginPageProps {
  onSuccess: () => void;
  onNavigatePortal: (portal: 'customer' | 'restaurant' | 'driver' | 'dispatch') => void;
}

export const KitchenLoginPage: React.FC<KitchenLoginPageProps> = ({
  onSuccess,
  onNavigatePortal,
}) => {
  const { loginAsStaff, switchDemoAccount, staffMembers } = useAuth();
  const { restaurants, selectedRestaurantId, setSelectedRestaurantId, setActiveRole, orders } = useDelivery();

  const [selectedRestId, setSelectedRestId] = useState(selectedRestaurantId || restaurants[0].id);
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');
  const [jobTitle, setJobTitle] = useState<'Store Manager' | 'Head Chef' | 'Dispatch Lead'>('Store Manager');
  const [errorMessage, setErrorMessage] = useState('');

  const currentRest = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const activeKitchenOrders = orders.filter(
    (o) => o.restaurantId === selectedRestId && (o.status === 'received' || o.status === 'preparing')
  ).length;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const emailToUse = email.trim() || `${selectedRestId}.staff@velocita.app`;
    loginAsStaff(emailToUse, selectedRestId);
    setSelectedRestaurantId(selectedRestId);
    setActiveRole('restaurant');
    onSuccess();
  };

  const handleQuickDemoStaff = (staffId: string, restId: string) => {
    switchDemoAccount('restaurant_staff', staffId);
    setSelectedRestaurantId(restId);
    setActiveRole('restaurant');
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ChefHat className="h-3.5 w-3.5" />
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            <span>City Operations</span>
          </button>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline font-mono">
          Restaurant Partner & Kitchen Display Terminal (KDS)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Side: Kitchen Station Telemetry & Branch Overview */}
        <div className="lg:col-span-6 flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                <ChefHat className="h-3.5 w-3.5" />
                <span>Velocita Kitchen Operations Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
                Live Kitchen Display System & Dispatch Coordination
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                Coordinate order preparation, food readiness handovers to assigned couriers, kitchen capacity throttling, and delivery corridor grouping.
              </p>
            </div>

            {/* Selected Restaurant Overview Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    {currentRest.cuisine} Cuisine Partner
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {currentRest.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{currentRest.address}</span>
                  </p>
                </div>

                <div className="flex flex-col items-end">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
                    currentRest.isKitchenPaused
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {currentRest.isKitchenPaused ? 'Kitchen Paused' : 'Accepting Tickets'}
                  </span>
                </div>
              </div>

              {/* Kitchen Live Stats Grid */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-200/70 dark:border-slate-700 text-center">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">In Prep Queue</span>
                  <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                    {activeKitchenOrders} orders
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Est. Prep Time</span>
                  <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400">
                    ~{currentRest.avgPrepTimeMinutes} mins
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono block">Dispatch Radius</span>
                  <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">
                    {currentRest.maxDeliveryRadiusKm} km
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Demo Staff Logins */}
            <div>
              <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2.5">
                Staff Roster Quick Access (1-Click Switch):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffMembers.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleQuickDemoStaff(staff.id, staff.restaurantId)}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-indigo-50/80 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-left group"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 block truncate">
                        {staff.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate font-mono">
                        {staff.jobTitle} · {staff.restaurantName}
                      </span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>POS / Kitchen Ticket Integration v2.4</span>
            <span>Real-time Driver Proximity Alerts</span>
          </div>
        </div>

        {/* Right Side: Kitchen Login Form & Terminal Selector */}
        <div className="lg:col-span-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Sign In to Kitchen Terminal
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Select your restaurant branch and log in with your staff account or manager PIN.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Restaurant Branch Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Kitchen Branch / Location *
              </label>
              <div className="space-y-2">
                {restaurants.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRestId(r.id)}
                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                      selectedRestId === r.id
                        ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-slate-900 dark:text-white shadow-2xs'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold ${
                        selectedRestId === r.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Store className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold block">{r.name}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                          {r.cuisine} · {r.address}
                        </span>
                      </div>
                    </div>
                    {selectedRestId === r.id && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Shift Role Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Shift Duty / Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Store Manager', 'Head Chef', 'Dispatch Lead'] as const).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setJobTitle(role)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                      jobTitle === role
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            {/* Email or Manager PIN */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Staff Email or Terminal ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. marco@artigiano.com or staff PIN"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Terminal Passcode / PIN
                </label>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 cursor-pointer">
                  Demo: Any passcode accepted
                </span>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
            >
              <span>Launch Kitchen Dispatch Console</span>
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
              onClick={() => onNavigatePortal('driver')}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Driver Fleet Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

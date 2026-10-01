import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Building2,
  CheckCircle2,
  ChefHat,
  Compass,
  MapPin,
  Navigation,
  Pause,
  Play,
  Plus,
  Radio,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { CustomerLoginPage } from './CustomerLoginPage';
import { DispatcherLoginPage } from './DispatcherLoginPage';
import { DriverLoginPage } from './DriverLoginPage';
import { KitchenLoginPage } from './KitchenLoginPage';

export type PortalType = 'hub' | 'customer' | 'restaurant' | 'driver' | 'dispatch';

interface LoginPortalHubProps {
  initialPortal?: PortalType;
  onClose: () => void;
  onOpenNewOrder?: () => void;
}

export const LoginPortalHub: React.FC<LoginPortalHubProps> = ({
  initialPortal = 'hub',
  onClose,
  onOpenNewOrder,
}) => {
  const [currentPortal, setCurrentPortal] = useState<PortalType>(initialPortal);
  const { currentUser, switchDemoAccount } = useAuth();
  const {
    setActiveRole,
    setSelectedRestaurantId,
    setCurrentDriverId,
    orders,
    couriers,
    simulationSpeed,
    setSimulationSpeed,
    simulateRandomNewOrder,
    trafficCongestion,
    setTrafficCongestion,
  } = useDelivery();

  const [justSimulated, setJustSimulated] = useState(false);

  const handleLoginSuccess = () => {
    onClose();
  };

  const handleQuickLaunch = (role: 'customer' | 'restaurant' | 'driver' | 'dispatch') => {
    if (role === 'customer') {
      switchDemoAccount('customer', 'cust-1');
      setActiveRole('customer');
    } else if (role === 'restaurant') {
      switchDemoAccount('restaurant_staff', 'staff-1');
      setSelectedRestaurantId('rest-1');
      setActiveRole('restaurant');
    } else if (role === 'driver') {
      switchDemoAccount('driver', 'courier-1');
      setCurrentDriverId('courier-1');
      setActiveRole('driver');
    } else {
      switchDemoAccount('dispatcher', 'disp-1');
      setActiveRole('dispatcher_map');
    }
    onClose();
  };

  const triggerSimulateOrder = () => {
    simulateRandomNewOrder();
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2000);
  };

  // Render individual dedicated login pages
  if (currentPortal === 'customer') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => setCurrentPortal('hub')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Portals</span>
          </button>
        </div>
        <CustomerLoginPage
          onSuccess={handleLoginSuccess}
          onNavigatePortal={(p) => setCurrentPortal(p)}
        />
      </div>
    );
  }

  if (currentPortal === 'restaurant') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => setCurrentPortal('hub')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Portals</span>
          </button>
        </div>
        <KitchenLoginPage
          onSuccess={handleLoginSuccess}
          onNavigatePortal={(p) => setCurrentPortal(p)}
        />
      </div>
    );
  }

  if (currentPortal === 'driver') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => setCurrentPortal('hub')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Portals</span>
          </button>
        </div>
        <DriverLoginPage
          onSuccess={handleLoginSuccess}
          onNavigatePortal={(p) => setCurrentPortal(p)}
        />
      </div>
    );
  }

  if (currentPortal === 'dispatch') {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => setCurrentPortal('hub')}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>All Portals</span>
          </button>
        </div>
        <DispatcherLoginPage
          onSuccess={handleLoginSuccess}
          onNavigatePortal={(p) => setCurrentPortal(p)}
        />
      </div>
    );
  }

  // Hub Overview Screen
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected'
  ).length;

  const onlineDriversCount = couriers.filter((c) => c.status !== 'offline').length;

  return (
    <div className="min-h-[calc(100vh-4rem)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center">
      {/* Return to workspace button if logged in */}
      {currentUser && (
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Workspace ({currentUser.name})</span>
          </button>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">
            Logged in as <strong className="capitalize text-slate-800 dark:text-slate-200">{currentUser.role.replace('_', ' ')}</strong>
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Velocita Role-Based Access Architecture</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Select Your Dedicated Login Portal
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
          Choose a tailored authentication experience for your role with dedicated telemetry, custom tools, and specialized workspace environments.
        </p>

        {/* Live system heartbeat */}
        <div className="pt-2 flex items-center justify-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{activeOrdersCount} Live Deliveries Active</span>
          </span>
          <span>·</span>
          <span>{onlineDriversCount} Couriers in Field</span>
          <span>·</span>
          <span>4 Partner Kitchens</span>
        </div>
      </div>

      {/* 4 Dedicated Portal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
        {/* Portal 1: Customer Portal */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200 dark:border-amber-800">
                Customers
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Customer Ordering Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Track your active orders with live GPS Leaflet route corridors, view countdown timers, manage address book, and claim exclusive promotional codes.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Live turn-by-turn road tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Direct courier calling &amp; chat</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Order history &amp; digital receipts</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setCurrentPortal('customer')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Open Customer Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickLaunch('customer')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
            >
              1-Click Demo (Sophia Lin)
            </button>
            {onOpenNewOrder && (
              <button
                onClick={() => {
                  handleQuickLaunch('customer');
                  setTimeout(() => onOpenNewOrder(), 100);
                }}
                className="w-full py-1.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="h-3 w-3 stroke-[2.5]" />
                <span>Place New Order Direct</span>
              </button>
            )}
          </div>
        </div>

        {/* Portal 2: Kitchen KDS Portal */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <ChefHat className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                Restaurant Partners
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Kitchen Display (KDS) Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Accept incoming tickets, coordinate prep times, trigger food ready handovers, and manage kitchen throttle during peak rushes.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Ticket SLA countdown queue</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Branch selector for 4 kitchens</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>30-day top performers chart</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setCurrentPortal('restaurant')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Open Kitchen Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickLaunch('restaurant')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
            >
              1-Click Demo (L'Artigiano Manager)
            </button>
          </div>
        </div>

        {/* Portal 3: Courier Driver Portal */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <Bike className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                Couriers
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Courier Fleet Portal
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Connect your eBike, scooter, or car, pick up prepared orders from kitchens, deliver directly to customers, and track daily tips and shift earnings.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Pre-trip safety checklist</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>One-tap pickup &amp; delivery buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Direct customer in-app messaging</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setCurrentPortal('driver')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Open Driver Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickLaunch('driver')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
            >
              1-Click Demo (Mateo Rossi eBike)
            </button>
          </div>
        </div>

        {/* Portal 4: Dispatch Operations Portal */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                <Radio className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-200 dark:border-rose-800">
                Operations
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                City Operations Dispatch
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                Metropolitan San Francisco overview, corridor density heatmaps, traffic simulation controls, and fleet-wide dispatch rule configuration.
              </p>
            </div>

            <div className="pt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Full citywide Leaflet &amp; vector maps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Corridor batch grouping (1.2 km)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Dynamic traffic congestion scaler</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <button
              onClick={() => setCurrentPortal('dispatch')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-2"
            >
              <span>Open Ops Clearance Login</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleQuickLaunch('dispatch')}
              className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors"
            >
              1-Click Demo (Lead Controller)
            </button>
          </div>
        </div>
      </div>

      {/* Unified Logistics Engine Simulator Strip */}
      <div className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Logistics Engine Simulator Controls
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Control dynamic road dispatch speed, simulate random real-time orders, and tune traffic conditions across all portals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Simulation Speed */}
            <div className="flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 text-xs">
              <span className="px-2 text-slate-500 dark:text-slate-400 font-medium">Rate:</span>
              <button
                onClick={() => setSimulationSpeed(simulationSpeed === 0 ? 1 : 0)}
                title={simulationSpeed === 0 ? 'Resume simulation' : 'Pause simulation'}
                className={`p-1.5 rounded-lg transition-colors ${
                  simulationSpeed === 0
                    ? 'bg-rose-600 text-white font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {simulationSpeed === 0 ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
              </button>
              {[1, 3, 8].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSimulationSpeed(spd)}
                  className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors font-semibold ${
                    simulationSpeed === spd
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            {/* Traffic Congestion */}
            <div className="hidden lg:flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 text-xs">
              <span className="px-2 text-slate-500 dark:text-slate-400 font-medium">Traffic:</span>
              {(['light', 'moderate', 'heavy'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTrafficCongestion(t)}
                  className={`px-2 py-1 rounded-md text-[11px] capitalize transition-colors font-medium ${
                    trafficCongestion === t
                      ? 'bg-rose-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Simulate Random Order Trigger */}
            <button
              onClick={triggerSimulateOrder}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                justSimulated
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>{justSimulated ? 'Simulated Order Active!' : 'Simulate Order'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

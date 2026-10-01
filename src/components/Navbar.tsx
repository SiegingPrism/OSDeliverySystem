import React from 'react';
import {
  Activity,
  Bike,
  Building2,
  ChefHat,
  Clock,
  FastForward,
  LogOut,
  MapPin,
  Navigation,
  Pause,
  Play,
  Plus,
  ShoppingBag,
  User,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';

interface NavbarProps {
  onOpenNewOrder: () => void;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenNewOrder,
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
}) => {
  const {
    activeRole,
    setActiveRole,
    simulationSpeed,
    setSimulationSpeed,
    simulateRandomNewOrder,
    orders,
    couriers,
    setSelectedRestaurantId,
  } = useDelivery();

  const { currentUser, logout } = useAuth();

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status !== 'delivered' &&
      o.status !== 'cancelled' &&
      o.status !== 'rejected'
  ).length;

  const deliveringCouriersCount = couriers.filter(
    (c) => c.status === 'delivering'
  ).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveRole('restaurant');
            }}
            className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900 hover:text-indigo-600 transition-colors"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-base shadow-sm">
              V
            </span>
            <span className="text-lg font-bold tracking-tight">Velocita</span>
          </a>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500 font-mono">
            <span>{activeOrdersCount} active orders</span>
            <span aria-hidden="true">·</span>
            <span>{deliveringCouriersCount} drivers live</span>
          </div>
        </div>

        {/* Zone 2: Navigation tabs with Driver Portal included */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-sm font-medium">
          <button
            onClick={() => setActiveRole('restaurant')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeRole === 'restaurant'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Kitchen</span>
          </button>

          <button
            onClick={() => setActiveRole('customer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeRole === 'customer'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5 text-indigo-600" />
            <span>Customer</span>
          </button>

          <button
            onClick={() => setActiveRole('driver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeRole === 'driver'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Bike className="h-3.5 w-3.5 text-indigo-600" />
            <span>Driver Portal</span>
          </button>

          <button
            onClick={() => setActiveRole('dispatcher_map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeRole === 'dispatcher_map'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Navigation className="h-3.5 w-3.5 text-indigo-600" />
            <span>City Map</span>
          </button>
        </nav>

        {/* Zone 3: User Auth Status & Primary Actions */}
        <div className="flex items-center gap-2">
          {/* User Profile / Login Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 pr-2 text-xs shadow-sm">
              <button
                onClick={() => {
                  if (currentUser.role === 'customer') {
                    onOpenProfile();
                  } else if (currentUser.role === 'restaurant_staff') {
                    setSelectedRestaurantId(currentUser.restaurantId);
                    setActiveRole('restaurant');
                    if (onOpenSettings) onOpenSettings();
                  } else {
                    setActiveRole('driver');
                  }
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="View profile and settings"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200">
                  {currentUser.role === 'restaurant_staff' ? (
                    <ChefHat className="h-3.5 w-3.5" />
                  ) : currentUser.role === 'driver' ? (
                    <Bike className="h-3.5 w-3.5" />
                  ) : (
                    currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <span className="font-semibold text-slate-900 block text-[11px] leading-tight truncate max-w-[105px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono capitalize">
                    {currentUser.role === 'customer'
                      ? 'Customer'
                      : currentUser.role === 'driver'
                      ? 'Courier Driver'
                      : currentUser.jobTitle}
                  </span>
                </div>
              </button>

              <button
                onClick={logout}
                className="p-1 hover:text-rose-600 text-slate-400 transition-colors ml-1"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>Sign In / Roles</span>
            </button>
          )}

          {/* Simulation Rate controller */}
          <div className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 text-xs text-slate-500 shadow-sm">
            <button
              onClick={() => setSimulationSpeed(simulationSpeed === 0 ? 1 : 0)}
              title={simulationSpeed === 0 ? 'Resume simulation' : 'Pause simulation'}
              className={`p-1.5 rounded-lg transition-colors ${
                simulationSpeed === 0
                  ? 'bg-rose-50 text-rose-600 font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {simulationSpeed === 0 ? (
                <Play className="h-3.5 w-3.5" />
              ) : (
                <Pause className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setSimulationSpeed(1)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                simulationSpeed === 1
                  ? 'bg-slate-100 text-indigo-700 font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              1x
            </button>
            <button
              onClick={() => setSimulationSpeed(3)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                simulationSpeed === 3
                  ? 'bg-slate-100 text-indigo-700 font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              3x
            </button>
            <button
              onClick={() => setSimulationSpeed(8)}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors ${
                simulationSpeed === 8
                  ? 'bg-slate-100 text-indigo-700 font-bold'
                  : 'hover:text-slate-900'
              }`}
              title="Turbo Simulation"
            >
              8x
            </button>
          </div>

          {/* Quick random order injector */}
          <button
            onClick={() => simulateRandomNewOrder()}
            title="Simulate incoming order from random customer"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors shadow-sm whitespace-nowrap"
          >
            <Zap className="h-3.5 w-3.5 text-indigo-600" />
            <span>Simulate Order</span>
          </button>

          {/* Primary Action: Place New Order */}
          <button
            onClick={onOpenNewOrder}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>New Order</span>
          </button>
        </div>
      </div>
    </header>
  );
};

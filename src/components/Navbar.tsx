import React from 'react';
import {
  Bike,
  ChefHat,
  KeyRound,
  LogOut,
  Moon,
  Radio,
  ShoppingBag,
  Sun,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentView?: 'workspace' | 'login';
  onOpenNewOrder?: () => void;
  onOpenAuth: (portal?: 'hub' | 'customer' | 'restaurant' | 'driver' | 'dispatch') => void;
  onOpenProfile: () => void;
  onOpenSettings?: () => void;
  onSelectWorkspace?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView = 'workspace',
  onOpenAuth,
  onOpenProfile,
  onOpenSettings,
  onSelectWorkspace,
}) => {
  const {
    activeRole,
    setActiveRole,
    orders,
    couriers,
    setSelectedRestaurantId,
  } = useDelivery();

  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Telemetry Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenAuth('hub')}
            className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="Return to Portals Hub"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-black text-base shadow-sm">
              V
            </span>
            <span className="text-lg font-bold tracking-tight">Velocita</span>
          </button>

          <div className="hidden xl:flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>{activeOrdersCount} active orders</span>
            <span aria-hidden="true">·</span>
            <span>{deliveringCouriersCount} drivers live</span>
          </div>
        </div>

        {/* Center: Active Workspace Context (Clean & Uncluttered, no switcher tabs) */}
        {currentView === 'workspace' && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 font-medium">
            {activeRole === 'customer' && (
              <>
                <ShoppingBag className="h-3.5 w-3.5 text-amber-500" />
                <span>Customer Tracking & Ordering Workspace</span>
              </>
            )}
            {activeRole === 'restaurant' && (
              <>
                <ChefHat className="h-3.5 w-3.5 text-indigo-500" />
                <span>Kitchen Ticket & KDS Dispatch Workspace</span>
              </>
            )}
            {activeRole === 'driver' && (
              <>
                <Bike className="h-3.5 w-3.5 text-emerald-500" />
                <span>Courier Fleet & Road Navigation Workspace</span>
              </>
            )}
            {activeRole === 'dispatcher_map' && (
              <>
                <Radio className="h-3.5 w-3.5 text-rose-500" />
                <span>City Operations & Logistics Grid Console</span>
              </>
            )}
          </div>
        )}

        {/* Right Zone: Portals Gateway & User Actions */}
        <div className="flex items-center gap-2.5">
          {/* Main "All Portals" Button */}
          <button
            onClick={() => onOpenAuth('hub')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs whitespace-nowrap ${
              currentView === 'login'
                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-xs'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}
            title="Browse all dedicated login pages and role portals"
          >
            <KeyRound className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>All Portals</span>
          </button>

          {/* User Status / Account Indicator */}
          {currentUser ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1 pr-2 text-xs shadow-2xs transition-colors">
              <button
                onClick={() => {
                  if (currentView === 'login' && onSelectWorkspace) {
                    onSelectWorkspace();
                    return;
                  }
                  if (currentUser.role === 'customer') {
                    onOpenProfile();
                  } else if (currentUser.role === 'restaurant_staff') {
                    setSelectedRestaurantId(currentUser.restaurantId);
                    setActiveRole('restaurant');
                    if (onOpenSettings) onOpenSettings();
                  } else if (currentUser.role === 'driver') {
                    setActiveRole('driver');
                  } else {
                    setActiveRole('dispatcher_map');
                  }
                }}
                className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                title="View active profile & settings"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200 dark:border-indigo-800">
                  {currentUser.role === 'restaurant_staff' ? (
                    <ChefHat className="h-3.5 w-3.5" />
                  ) : currentUser.role === 'driver' ? (
                    <Bike className="h-3.5 w-3.5" />
                  ) : currentUser.role === 'dispatcher' ? (
                    <Radio className="h-3.5 w-3.5" />
                  ) : (
                    currentUser.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[11px] leading-tight truncate max-w-[110px]">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono capitalize">
                    {currentUser.role === 'customer'
                      ? 'Customer'
                      : currentUser.role === 'driver'
                      ? 'Courier'
                      : currentUser.role === 'dispatcher'
                      ? 'Dispatcher'
                      : currentUser.jobTitle}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  logout();
                  onOpenAuth('hub');
                }}
                className="p-1 hover:text-rose-600 text-slate-400 dark:text-slate-500 transition-colors ml-1"
                title="Sign out and return to Portals"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('hub')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Login / Sign In</span>
            </button>
          )}

          {/* Global Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to High-Contrast Dark Theme'}
            className="flex items-center justify-center h-8 w-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-2xs active:scale-95"
            aria-label="Toggle dark mode theme"
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

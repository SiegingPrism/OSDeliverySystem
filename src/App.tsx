import React, { useState } from 'react';
import { AuthModal } from './components/Auth/AuthModal';
import { LoginPortalHub, PortalType } from './components/Auth/LoginPortalHub';
import { CustomerProfileModal } from './components/Customer/CustomerProfileModal';
import { CustomerTracker } from './components/Customer/CustomerTracker';
import { NewOrderModal } from './components/Customer/NewOrderModal';
import { DriverDashboard } from './components/Driver/DriverDashboard';
import { CityFleetOverview } from './components/Map/CityFleetOverview';
import { Navbar } from './components/Navbar';
import { DispatchDashboard } from './components/Restaurant/DispatchDashboard';
import { RestaurantSettingsModal } from './components/Restaurant/RestaurantSettingsModal';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DeliveryProvider, useDelivery } from './context/DeliveryContext';
import { ThemeProvider } from './context/ThemeContext';

const MainContent: React.FC = () => {
  const { activeRole, restaurants, selectedRestaurantId } = useDelivery();
  const { currentUser } = useAuth();

  const [currentView, setCurrentView] = useState<'workspace' | 'login'>(() => {
    return currentUser ? 'workspace' : 'login';
  });
  const [activeLoginPortal, setActiveLoginPortal] = useState<PortalType>('hub');

  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileModalInitialTab, setProfileModalInitialTab] = useState<'profile' | 'history'>('profile');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const currentRestaurant =
    restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];

  const handleOpenProfile = (tab: 'profile' | 'history' = 'profile') => {
    setProfileModalInitialTab(tab);
    setIsProfileModalOpen(true);
  };

  const handleOpenAuth = (portal: PortalType = 'hub') => {
    setActiveLoginPortal(portal);
    setCurrentView('login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Bar with Three-Zone Contract */}
      <Navbar
        currentView={currentView}
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenAuth={handleOpenAuth}
        onOpenProfile={() => handleOpenProfile('profile')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onSelectWorkspace={() => setCurrentView('workspace')}
      />

      {/* Primary Workspace Content or Dedicated Login Pages */}
      <main className="flex-1">
        {currentView === 'login' ? (
          <LoginPortalHub
            initialPortal={activeLoginPortal}
            onClose={() => setCurrentView('workspace')}
            onOpenNewOrder={() => setIsNewOrderOpen(true)}
          />
        ) : (
          <>
            {activeRole === 'restaurant' && <DispatchDashboard />}
            {activeRole === 'customer' && (
              <CustomerTracker
                onOpenNewOrder={() => setIsNewOrderOpen(true)}
                onOpenProfile={() => handleOpenProfile('profile')}
                onOpenHistory={() => handleOpenProfile('history')}
              />
            )}
            {activeRole === 'driver' && <DriverDashboard />}
            {activeRole === 'dispatcher_map' && <CityFleetOverview />}
          </>
        )}
      </main>

      {/* New Order Modal */}
      {isNewOrderOpen && (
        <NewOrderModal onClose={() => setIsNewOrderOpen(false)} />
      )}

      {/* Customer / Staff / Driver Auth Modal */}
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}

      {/* Customer Profile & Order History Modal */}
      {isProfileModalOpen && (
        <CustomerProfileModal
          initialTab={profileModalInitialTab}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {/* Restaurant Settings Modal (triggered from staff profile) */}
      {isSettingsModalOpen && (
        <RestaurantSettingsModal
          restaurant={currentRestaurant}
          onClose={() => setIsSettingsModalOpen(false)}
        />
      )}

      {/* Clean Domain Footer with high-contrast dark support */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">Velocita Logistics Engine</span>
            <span>·</span>
            <span>Real-Time Distance & Timing Dispatch Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
            <span>Dynamic Haversine Routing</span>
            <span>·</span>
            <span>Corridor Batching v2</span>
            <span>·</span>
            <span>Adaptive Transit SLAs</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DeliveryProvider>
          <MainContent />
        </DeliveryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

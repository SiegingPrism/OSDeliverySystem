import React, { useState } from 'react';
import { AuthModal } from './components/Auth/AuthModal';
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

const MainContent: React.FC = () => {
  const { activeRole, restaurants, selectedRestaurantId } = useDelivery();
  const { currentUser } = useAuth();

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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Bar with Three-Zone Contract */}
      <Navbar
        onOpenNewOrder={() => setIsNewOrderOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => handleOpenProfile('profile')}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Primary Workspace Content */}
      <main className="flex-1">
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

      {/* Clean Domain Footer with crisp light styling */}
      <footer className="border-t border-slate-200 bg-white py-6 text-xs text-slate-500 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Velocita Logistics Engine</span>
            <span>·</span>
            <span>Real-Time Distance & Timing Dispatch Architecture</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
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
    <AuthProvider>
      <DeliveryProvider>
        <MainContent />
      </DeliveryProvider>
    </AuthProvider>
  );
}

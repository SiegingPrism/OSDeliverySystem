import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, CustomerProfile, DispatcherProfile, DriverProfile, RestaurantStaffProfile } from '../types/auth';

const STORAGE_KEY_AUTH = 'velocita_auth_user';
const STORAGE_KEY_CUSTOMERS = 'velocita_customers_db';
const STORAGE_KEY_STAFF = 'velocita_staff_db';
const STORAGE_KEY_DRIVERS = 'velocita_drivers_db';
const STORAGE_KEY_DISPATCHERS = 'velocita_dispatchers_db';

export const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'cust-1',
    role: 'customer',
    name: 'Sophia Lin',
    email: 'sophia@example.com',
    phone: '+1 (415) 309-8811',
    address: '333 Bush Street, Apt 14B, Financial District',
    lat: 37.7915,
    lng: -122.3985,
    defaultDeliveryNotes: 'Call box #1402, leave at apartment door on 14th floor',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
  {
    id: 'cust-2',
    role: 'customer',
    name: 'Alexander Hayes',
    email: 'alex@example.com',
    phone: '+1 (415) 778-9034',
    address: '1420 Hyde Street, Russian Hill',
    lat: 37.8012,
    lng: -122.4172,
    defaultDeliveryNotes: 'Ring bell on left gate, watch out for friendly dog',
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
  },
  {
    id: 'cust-3',
    role: 'customer',
    name: 'Isabella Zhang',
    email: 'isabella@example.com',
    phone: '+1 (415) 662-1100',
    address: '550 Union Street, Telegraph Hill',
    lat: 37.8045,
    lng: -122.4112,
    defaultDeliveryNotes: 'Package lockbox code 4491',
    createdAt: Date.now() - 5 * 24 * 3600 * 1000,
  },
];

export const INITIAL_STAFF: RestaurantStaffProfile[] = [
  {
    id: 'staff-1',
    role: 'restaurant_staff',
    name: 'Marco Rossi',
    email: 'marco@artigiano.com',
    jobTitle: 'Store Manager',
    restaurantId: 'rest-1',
    restaurantName: "L'Artigiano Woodfired Pizza",
    shiftStatus: 'active',
    createdAt: Date.now() - 90 * 24 * 3600 * 1000,
  },
  {
    id: 'staff-2',
    role: 'restaurant_staff',
    name: 'Chef Kenji',
    email: 'kenji@tokyoramen.com',
    jobTitle: 'Head Chef',
    restaurantId: 'rest-3',
    restaurantName: 'Tokyo Craft Ramen Bar',
    shiftStatus: 'active',
    createdAt: Date.now() - 60 * 24 * 3600 * 1000,
  },
  {
    id: 'staff-3',
    role: 'restaurant_staff',
    name: 'Mateo Vance',
    email: 'mateo@smashcraft.com',
    jobTitle: 'Dispatch Lead',
    restaurantId: 'rest-2',
    restaurantName: 'SmashCraft Prime Burgers',
    shiftStatus: 'active',
    createdAt: Date.now() - 45 * 24 * 3600 * 1000,
  },
  {
    id: 'staff-4',
    role: 'restaurant_staff',
    name: 'Elena Verde',
    email: 'elena@verdebowls.com',
    jobTitle: 'Store Manager',
    restaurantId: 'rest-4',
    restaurantName: 'Verde Organic Bowls & Greens',
    shiftStatus: 'active',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
  },
];

export const INITIAL_DRIVERS: DriverProfile[] = [
  {
    id: 'courier-1',
    role: 'driver',
    name: 'Mateo Rossi',
    email: 'mateo.driver@velocita.app',
    phone: '+1 (415) 555-0142',
    vehicleType: 'ebike',
    status: 'delivering',
    rating: 4.96,
    totalDeliveries: 1420,
    todayEarnings: 84.5,
    batteryPct: 88,
    createdAt: Date.now() - 120 * 24 * 3600 * 1000,
  },
  {
    id: 'courier-2',
    role: 'driver',
    name: 'Kenji Takahashi',
    email: 'kenji.driver@velocita.app',
    phone: '+1 (415) 555-0177',
    vehicleType: 'scooter',
    status: 'delivering',
    rating: 4.92,
    totalDeliveries: 980,
    todayEarnings: 68.2,
    batteryPct: 74,
    createdAt: Date.now() - 80 * 24 * 3600 * 1000,
  },
  {
    id: 'courier-3',
    role: 'driver',
    name: 'Elena Morales',
    email: 'elena.driver@velocita.app',
    phone: '+1 (415) 555-0199',
    vehicleType: 'ebike',
    status: 'idle',
    rating: 4.89,
    totalDeliveries: 760,
    todayEarnings: 42.0,
    batteryPct: 95,
    createdAt: Date.now() - 50 * 24 * 3600 * 1000,
  },
  {
    id: 'courier-4',
    role: 'driver',
    name: 'Marcus Vance',
    email: 'marcus.driver@velocita.app',
    phone: '+1 (415) 555-0211',
    vehicleType: 'car',
    status: 'idle',
    rating: 4.94,
    totalDeliveries: 2150,
    todayEarnings: 112.5,
    batteryPct: 62,
    createdAt: Date.now() - 200 * 24 * 3600 * 1000,
  },
  {
    id: 'courier-5',
    role: 'driver',
    name: 'Priya Patel',
    email: 'priya.driver@velocita.app',
    phone: '+1 (415) 555-0233',
    vehicleType: 'ebike',
    status: 'assigned',
    rating: 4.98,
    totalDeliveries: 1890,
    todayEarnings: 96.0,
    batteryPct: 81,
    createdAt: Date.now() - 150 * 24 * 3600 * 1000,
  },
];

export const INITIAL_DISPATCHERS: DispatcherProfile[] = [
  {
    id: 'disp-1',
    role: 'dispatcher',
    name: 'Sarah Chen',
    email: 'sarah.dispatch@velocita.app',
    callsign: 'METRO-ALPHA-1',
    clearanceLevel: 'Operations Lead',
    createdAt: Date.now() - 180 * 24 * 3600 * 1000,
  },
  {
    id: 'disp-2',
    role: 'dispatcher',
    name: 'Marcus Brody',
    email: 'marcus.dispatch@velocita.app',
    callsign: 'CORRIDOR-WEST',
    clearanceLevel: 'Corridor Dispatcher',
    createdAt: Date.now() - 90 * 24 * 3600 * 1000,
  },
  {
    id: 'disp-3',
    role: 'dispatcher',
    name: 'Aiden Brooks',
    email: 'aiden.dispatch@velocita.app',
    callsign: 'TRAFFIC-CENTRAL',
    clearanceLevel: 'Traffic Coordinator',
    createdAt: Date.now() - 45 * 24 * 3600 * 1000,
  },
];

interface AuthContextType {
  currentUser: AuthUser | null;
  customers: CustomerProfile[];
  staffMembers: RestaurantStaffProfile[];
  drivers: DriverProfile[];
  dispatchers: DispatcherProfile[];
  loginAsCustomer: (email: string, password?: string) => boolean;
  signUpCustomer: (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    lat?: number;
    lng?: number;
    defaultDeliveryNotes?: string;
  }) => CustomerProfile;
  loginAsStaff: (email: string, restaurantId?: string) => boolean;
  loginAsDriver: (driverId: string) => boolean;
  loginAsDispatcher: (callsignOrEmail: string, clearancePin?: string) => boolean;
  toggleDriverOnline: (driverId: string) => void;
  updateCustomerProfile: (data: Partial<CustomerProfile>) => void;
  logout: () => void;
  switchDemoAccount: (role: 'customer' | 'restaurant_staff' | 'driver' | 'dispatcher', id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [staffMembers] = useState<RestaurantStaffProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STAFF);
      return saved ? JSON.parse(saved) : INITIAL_STAFF;
    } catch {
      return INITIAL_STAFF;
    }
  });

  const [drivers, setDrivers] = useState<DriverProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRIVERS);
      return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
    } catch {
      return INITIAL_DRIVERS;
    }
  });

  const [dispatchers] = useState<DispatcherProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DISPATCHERS);
      return saved ? JSON.parse(saved) : INITIAL_DISPATCHERS;
    } catch {
      return INITIAL_DISPATCHERS;
    }
  });

  // Default initial logged-in user is Sophia Lin (Customer)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AUTH);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_CUSTOMERS[0];
  });

  // Save session changes to localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY_AUTH);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(customers));
    } catch {
      // Ignore
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DRIVERS, JSON.stringify(drivers));
    } catch {
      // Ignore
    }
  }, [drivers]);

  const loginAsCustomer = (email: string): boolean => {
    const found = customers.find(
      (c) => c.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // If not found in customers list, create a new profile
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      name: email.split('@')[0],
      email: email.trim(),
      phone: '+1 (415) 555-0100',
      address: '725 Market Street, Financial District',
      lat: 37.788,
      lng: -122.403,
      createdAt: Date.now(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    setCurrentUser(newCust);
    return true;
  };

  const signUpCustomer = (data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    lat?: number;
    lng?: number;
    defaultDeliveryNotes?: string;
  }): CustomerProfile => {
    const newCust: CustomerProfile = {
      id: `cust-${Date.now()}`,
      role: 'customer',
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      lat: data.lat ?? 37.7915,
      lng: data.lng ?? -122.3985,
      defaultDeliveryNotes: data.defaultDeliveryNotes?.trim(),
      createdAt: Date.now(),
    };

    setCustomers((prev) => [newCust, ...prev]);
    setCurrentUser(newCust);
    return newCust;
  };

  const loginAsStaff = (email: string, restaurantId?: string): boolean => {
    let found = staffMembers.find(
      (s) => s.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!found && restaurantId) {
      found = staffMembers.find((s) => s.restaurantId === restaurantId);
    }

    if (found) {
      setCurrentUser(found);
      return true;
    }

    setCurrentUser(staffMembers[0]);
    return true;
  };

  const loginAsDriver = (driverId: string): boolean => {
    const found = drivers.find((d) => d.id === driverId) || drivers[0];
    setCurrentUser(found);
    return true;
  };

  const loginAsDispatcher = (callsignOrEmail: string, clearancePin?: string): boolean => {
    const clean = callsignOrEmail.trim().toLowerCase();
    const found =
      dispatchers.find(
        (d) =>
          d.email.toLowerCase() === clean ||
          d.callsign.toLowerCase() === clean ||
          d.name.toLowerCase().includes(clean)
      ) || dispatchers[0];
    setCurrentUser(found);
    return true;
  };

  const toggleDriverOnline = (driverId: string) => {
    setDrivers((prev) =>
      prev.map((d) => {
        if (d.id !== driverId) return d;
        const nextStatus = d.status === 'offline' ? 'idle' : 'offline';
        const updated: DriverProfile = {
          ...d,
          status: nextStatus,
        };
        if (currentUser?.id === driverId) {
          setCurrentUser(updated);
        }
        return updated;
      })
    );
  };

  const updateCustomerProfile = (data: Partial<CustomerProfile>) => {
    if (!currentUser || currentUser.role !== 'customer') return;

    const updated: CustomerProfile = {
      ...currentUser,
      ...data,
    };

    setCurrentUser(updated);
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchDemoAccount = (
    role: 'customer' | 'restaurant_staff' | 'driver' | 'dispatcher',
    id: string
  ) => {
    if (role === 'customer') {
      const cust = customers.find((c) => c.id === id) || customers[0];
      setCurrentUser(cust);
    } else if (role === 'restaurant_staff') {
      const staff = staffMembers.find((s) => s.id === id) || staffMembers[0];
      setCurrentUser(staff);
    } else if (role === 'dispatcher') {
      const disp = dispatchers.find((d) => d.id === id) || dispatchers[0];
      setCurrentUser(disp);
    } else {
      const driver = drivers.find((d) => d.id === id) || drivers[0];
      setCurrentUser(driver);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        customers,
        staffMembers,
        drivers,
        dispatchers,
        loginAsCustomer,
        signUpCustomer,
        loginAsStaff,
        loginAsDriver,
        loginAsDispatcher,
        toggleDriverOnline,
        updateCustomerProfile,
        logout,
        switchDemoAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

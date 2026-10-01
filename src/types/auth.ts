import { VehicleType } from './delivery';

export type UserRole = 'customer' | 'restaurant_staff' | 'driver';

export interface CustomerProfile {
  id: string;
  role: 'customer';
  email: string;
  name: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  defaultDeliveryNotes?: string;
  createdAt: number;
}

export interface RestaurantStaffProfile {
  id: string;
  role: 'restaurant_staff';
  email: string;
  name: string;
  jobTitle: 'Store Manager' | 'Head Chef' | 'Dispatch Lead';
  restaurantId: string;
  restaurantName: string;
  shiftStatus: 'active' | 'break';
  createdAt: number;
}

export interface DriverProfile {
  id: string;
  role: 'driver';
  email: string;
  name: string;
  phone: string;
  vehicleType: VehicleType;
  status: 'idle' | 'assigned' | 'delivering' | 'offline';
  rating: number;
  totalDeliveries: number;
  todayEarnings: number;
  batteryPct: number;
  createdAt: number;
}

export type AuthUser = CustomerProfile | RestaurantStaffProfile | DriverProfile;

export interface RejectionReason {
  reason: string;
  timestamp: number;
  staffName: string;
}

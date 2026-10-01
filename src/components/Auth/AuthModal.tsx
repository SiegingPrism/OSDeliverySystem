import React, { useState } from 'react';
import {
  Building2,
  Check,
  ChefHat,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { INITIAL_CUSTOMERS, INITIAL_STAFF, useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';

interface AuthModalProps {
  onClose: () => void;
  initialTab?: 'customer_login' | 'customer_signup' | 'staff_login';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  initialTab = 'customer_login',
}) => {
  const {
    loginAsCustomer,
    signUpCustomer,
    loginAsStaff,
    switchDemoAccount,
  } = useAuth();
  const { setSelectedRestaurantId, setActiveRole, restaurants } = useDelivery();

  const [activeTab, setActiveTab] = useState<'customer_login' | 'customer_signup' | 'staff_login'>(
    initialTab
  );

  // Customer Login State
  const [custEmail, setCustEmail] = useState('');
  const [custPass, setCustPass] = useState('');

  // Customer Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPass, setSignupPass] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');
  const [signupNotes, setSignupNotes] = useState('');

  // Staff Login State
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRestId, setStaffRestId] = useState(restaurants[0].id);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custEmail) return;
    loginAsCustomer(custEmail, custPass);
    setActiveRole('customer');
    onClose();
  };

  const handleCustomerSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName || !signupEmail || !signupPhone || !signupAddress) {
      alert('Please fill out all required profile fields.');
      return;
    }

    signUpCustomer({
      name: signupName,
      email: signupEmail,
      phone: signupPhone,
      address: signupAddress,
      defaultDeliveryNotes: signupNotes,
    });
    setActiveRole('customer');
    onClose();
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsStaff(staffEmail, staffRestId);
    setSelectedRestaurantId(staffRestId);
    setActiveRole('restaurant');
    onClose();
  };

  const handleQuickDemoCustomer = (id: string) => {
    switchDemoAccount('customer', id);
    setActiveRole('customer');
    onClose();
  };

  const handleQuickDemoStaff = (id: string, restId: string) => {
    switchDemoAccount('restaurant_staff', id);
    setSelectedRestaurantId(restId);
    setActiveRole('restaurant');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg my-6 rounded-2xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 font-black text-sm">
              V
            </span>
            <div>
              <h2 className="text-base font-bold text-white">Velocita Access Portal</h2>
              <p className="text-xs text-slate-400">
                Customer Ordering & Restaurant Staff Dispatch Management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented Mode Tabs */}
        <div className="grid grid-cols-3 p-1.5 bg-slate-950 border-b border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('customer_login')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'customer_login'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Login
          </button>
          <button
            onClick={() => setActiveTab('customer_signup')}
            className={`py-2 rounded-lg transition-colors ${
              activeTab === 'customer_signup'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer Sign Up
          </button>
          <button
            onClick={() => setActiveTab('staff_login')}
            className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'staff_login'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ChefHat className="h-3.5 w-3.5" />
            <span>Staff Portal</span>
          </button>
        </div>

        {/* Tab 1: Customer Login */}
        {activeTab === 'customer_login' && (
          <div className="p-6 space-y-5">
            <form onSubmit={handleCustomerLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. sophia@example.com"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={custPass}
                    onChange={(e) => setCustPass(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                Sign In as Customer
              </button>
            </form>

            {/* Quick 1-Click Demo Accounts */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2 font-bold">
                Quick Test Accounts:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_CUSTOMERS.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => handleQuickDemoCustomer(cust.id)}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-white block">{cust.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{cust.address}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Customer Sign Up */}
        {activeTab === 'customer_signup' && (
          <div className="p-6 space-y-4">
            <form onSubmit={handleCustomerSignup} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@email.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (415) 555-0100"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Delivery Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="Street, Apartment / Suite, Neighborhood"
                    value={signupAddress}
                    onChange={(e) => setSignupAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Default Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Gate code, door drop preference..."
                  value={signupNotes}
                  onChange={(e) => setSignupNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110 text-slate-950 font-bold text-xs transition-all shadow-md mt-2"
              >
                Register Customer Account & Start Ordering
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Restaurant Staff Portal */}
        {activeTab === 'staff_login' && (
          <div className="p-6 space-y-5">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
              <span className="font-bold block text-white mb-0.5">
                Kitchen & Order Management Portal
              </span>
              Authenticate as restaurant staff to manage kitchen orders, accept or reject incoming tickets, and assign drivers.
            </div>

            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Assign to Restaurant
                </label>
                <select
                  value={staffRestId}
                  onChange={(e) => setStaffRestId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  {restaurants.map((r) => (
                    <option key={r.id} value={r.id} className="bg-slate-900 text-white">
                      {r.name} ({r.cuisine})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Staff Email or ID
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="e.g. marco@artigiano.com"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-md"
              >
                Access Restaurant Dispatch Board
              </button>
            </form>

            {/* Quick Demo Staff Logins */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-[11px] font-mono uppercase text-slate-500 block mb-2 font-bold">
                1-Click Staff Profiles:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {INITIAL_STAFF.map((staff) => (
                  <button
                    key={staff.id}
                    onClick={() => handleQuickDemoStaff(staff.id, staff.restaurantId)}
                    className="p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-slate-700 text-left transition-colors"
                  >
                    <span className="text-xs font-bold text-white block truncate">
                      {staff.name}
                    </span>
                    <span className="text-[10px] text-amber-400 block font-mono">
                      {staff.jobTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {staff.restaurantName}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

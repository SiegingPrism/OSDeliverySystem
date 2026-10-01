import React, { useState } from 'react';
import {
  Check,
  Clock,
  History,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Save,
  User,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { OrderHistory } from './OrderHistory';

interface CustomerProfileModalProps {
  onClose: () => void;
  initialTab?: 'profile' | 'history';
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({
  onClose,
  initialTab = 'profile',
}) => {
  const { currentUser, updateCustomerProfile, logout } = useAuth();
  const { orders, setSelectedOrderId, setActiveRole } = useDelivery();

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>(initialTab);

  if (!currentUser || currentUser.role !== 'customer') {
    return null;
  }

  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [address, setAddress] = useState(currentUser.address);
  const [defaultNotes, setDefaultNotes] = useState(
    currentUser.defaultDeliveryNotes || ''
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Customer order history
  const customerOrders = orders.filter(
    (o) =>
      o.customerId === currentUser.id ||
      o.customerName.toLowerCase() === currentUser.name.toLowerCase()
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomerProfile({
      name,
      phone,
      address,
      defaultDeliveryNotes: defaultNotes,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectOrderToTrack = (orderId: string) => {
    setSelectedOrderId(orderId);
    setActiveRole('customer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl my-6 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 font-extrabold text-base border border-indigo-200 shadow-sm">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Customer Account & Profile
              </h2>
              <p className="text-xs text-slate-500 font-mono">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/80 border-b border-slate-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="h-4 w-4" />
            <span>Profile & Delivery Address</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Order History ({customerOrders.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Personal & Delivery Information
                </span>
                {savedSuccess && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 animate-in fade-in">
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Profile Saved Successfully</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Default Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Default Delivery Notes / Call Box Code
                </label>
                <input
                  type="text"
                  placeholder="Gate code, door code, leave at door..."
                  value={defaultNotes}
                  onChange={(e) => setDefaultNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Profile Information</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  All Past Orders & Itemized Receipts
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {customerOrders.length} total orders placed
                </span>
              </div>

              <OrderHistory
                orders={customerOrders}
                onSelectOrderToTrack={handleSelectOrderToTrack}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-200 bg-slate-50/70">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
          >
            Sign Out of Account
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Building2,
  Check,
  Clock,
  Compass,
  MapPin,
  Pause,
  Phone,
  Play,
  Save,
  ShieldCheck,
  Utensils,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { Restaurant } from '../../types/delivery';

interface RestaurantSettingsModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

export const RestaurantSettingsModal: React.FC<RestaurantSettingsModalProps> = ({
  restaurant,
  onClose,
}) => {
  const { updateRestaurantDetails } = useDelivery();
  const { currentUser } = useAuth();

  const [name, setName] = useState(restaurant.name);
  const [cuisine, setCuisine] = useState(restaurant.cuisine);
  const [address, setAddress] = useState(restaurant.address);
  const [phone, setPhone] = useState(restaurant.phone);
  const [avgPrepTime, setAvgPrepTime] = useState(restaurant.avgPrepTimeMinutes);
  const [radius, setRadius] = useState(restaurant.maxDeliveryRadiusKm);
  const [isOpen, setIsOpen] = useState(restaurant.isOpen ?? true);
  const [isKitchenPaused, setIsKitchenPaused] = useState(
    restaurant.isKitchenPaused ?? false
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateRestaurantDetails(restaurant.id, {
      name,
      cuisine,
      address,
      phone,
      avgPrepTimeMinutes: Number(avgPrepTime),
      maxDeliveryRadiusKm: Number(radius),
      isOpen,
      isKitchenPaused,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl my-6 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Manage Restaurant Details & Dispatch Parameters
              </h2>
              <p className="text-xs text-slate-500">
                Logged in as staff:{' '}
                <span className="text-indigo-700 font-bold font-mono">
                  {currentUser?.name}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Restaurant settings and operational parameters saved successfully.</span>
            </div>
          )}

          {/* Kitchen Availability Switcher */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
              Kitchen Operational Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsKitchenPaused(false)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  !isKitchenPaused
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Accepting Orders</span>
              </button>
              <button
                type="button"
                onClick={() => setIsKitchenPaused(true)}
                className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isKitchenPaused
                    ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-600/20'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span>Rush Hold / Paused</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Restaurant Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Cuisine Style
              </label>
              <input
                type="text"
                required
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Store Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Direct Kitchen Phone Line
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Timing & Distance Parameters */}
          <div className="grid grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Avg. Prep Time (Mins)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="5"
                  max="60"
                  required
                  value={avgPrepTime}
                  onChange={(e) => setAvgPrepTime(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Max Delivery Radius (Km)
              </label>
              <div className="relative">
                <Compass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  max="25"
                  step="0.5"
                  required
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Update Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

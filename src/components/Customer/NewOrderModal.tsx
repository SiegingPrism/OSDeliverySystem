import React, { useMemo, useState } from 'react';
import {
  Bike,
  Building2,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Minus,
  Navigation,
  Plus,
  ShoppingBag,
  Sparkles,
  Utensils,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { MenuItem, Restaurant } from '../../types/delivery';
import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  estimateTransitMinutes,
} from '../../utils/geoRouting';
import { LiveDeliveryMap } from '../Map/LiveDeliveryMap';

interface NewOrderModalProps {
  onClose: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ onClose }) => {
  const { restaurants, createCustomerOrder, setActiveRole, setSelectedOrderId } = useDelivery();
  const { currentUser } = useAuth();

  const [selectedRestId, setSelectedRestId] = useState<string>(restaurants[0].id);
  const [cart, setCart] = useState<{ item: MenuItem; quantity: number; instructions: string }[]>([]);
  const [priority, setPriority] = useState<'standard' | 'express'>('standard');
  const [customerName, setCustomerName] = useState<string>(
    currentUser?.name || 'Sophia Lin'
  );
  const [customerPhone, setCustomerPhone] = useState<string>(
    currentUser && currentUser.role === 'customer'
      ? currentUser.phone
      : '+1 (415) 309-8811'
  );
  const [deliveryNotes, setDeliveryNotes] = useState<string>(
    currentUser && currentUser.role === 'customer' && currentUser.defaultDeliveryNotes
      ? currentUser.defaultDeliveryNotes
      : 'Please leave at front door'
  );

  // Address & Coordinates
  const addressPresets = [
    { name: 'Financial District', addr: '333 Bush Street, Apt 14B', lat: 37.7915, lng: -122.3985 },
    { name: 'Russian Hill', addr: '1420 Hyde Street, Apt 3', lat: 37.8012, lng: -122.4172 },
    { name: 'Telegraph Hill', addr: '550 Union Street, Unit 2B', lat: 37.8045, lng: -122.4112 },
    { name: 'Lower Haight', addr: '490 Haight Street', lat: 37.7721, lng: -122.4312 },
    { name: 'SoMa Tech Corridor', addr: '650 Townsend Street', lat: 37.7712, lng: -122.4041 },
  ];

  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(0);
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isMapPickerActive, setIsMapPickerActive] = useState<boolean>(false);

  const currentRestaurant = restaurants.find((r) => r.id === selectedRestId) || restaurants[0];

  const currentCoords = customCoords || {
    lat: addressPresets[selectedAddressIndex].lat,
    lng: addressPresets[selectedAddressIndex].lng,
  };

  const currentAddressString = customCoords
    ? `Custom Map Pin (${customCoords.lat.toFixed(4)}, ${customCoords.lng.toFixed(4)})`
    : addressPresets[selectedAddressIndex].addr;

  // Real-time distance and estimated delivery timing calculation
  const distanceInfo = useMemo(() => {
    const straightDist = calculateHaversineDistanceKm(
      currentRestaurant.lat,
      currentRestaurant.lng,
      currentCoords.lat,
      currentCoords.lng
    );
    const roadDist = calculateRoadDistanceKm(straightDist);
    const transitMins = estimateTransitMinutes(roadDist, 'ebike');
    const prepMins = currentRestaurant.avgPrepTimeMinutes;
    const totalEstMins = prepMins + transitMins;

    return {
      straightDist,
      roadDist,
      transitMins,
      prepMins,
      totalEstMins: priority === 'express' ? Math.max(12, totalEstMins - 4) : totalEstMins,
    };
  }, [currentRestaurant, currentCoords, priority]);

  // Cart operations
  const handleAddItem = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { item, quantity: 1, instructions: '' }];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.item.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prev.filter((i) => i.item.id !== itemId);
    });
  };

  const subtotal = cart.reduce((sum, i) => sum + i.item.price * i.quantity, 0);
  const deliveryFee = priority === 'express' ? 5.99 : 3.49;
  const tax = Math.round(subtotal * 0.0925 * 100) / 100;
  const tip = 5.0;
  const total = subtotal > 0 ? Math.round((subtotal + deliveryFee + tax + tip) * 100) / 100 : 0;

  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      alert('Please select at least one item from the menu.');
      return;
    }

    const newOrderId = createCustomerOrder({
      restaurantId: currentRestaurant.id,
      customerId: currentUser?.id,
      customerName,
      customerPhone,
      deliveryAddress: currentAddressString,
      customerLat: currentCoords.lat,
      customerLng: currentCoords.lng,
      priority,
      deliveryNotes,
      tip,
      items: cart.map((i, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        menuItemId: i.item.id,
        name: i.item.name,
        price: i.item.price,
        quantity: i.quantity,
        instructions: i.instructions,
      })),
    });

    setSelectedOrderId(newOrderId);
    setActiveRole('customer');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl my-6 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-slate-950 font-bold shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Create Food Delivery Order</h2>
              <p className="text-xs text-slate-500">
                Calculates real-time delivery distance, kitchen prep timing, and transit ETA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Step 1: Restaurant Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2.5">
              1. Select Restaurant Partner
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {restaurants.map((rest) => {
                const isSelected = rest.id === selectedRestId;
                return (
                  <button
                    key={rest.id}
                    onClick={() => {
                      setSelectedRestId(rest.id);
                      setCart([]); // reset cart when switching restaurant
                    }}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/80 ring-2 ring-amber-400/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block truncate">
                      {rest.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                      {rest.cuisine}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-2 font-mono">
                      <span className="text-amber-600 font-semibold">★ {rest.rating}</span>
                      <span>·</span>
                      <span>~{rest.avgPrepTimeMinutes}m prep</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Destination & Real-Time Distance Engine */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-amber-600" />
                <span>2. Delivery Address & Distance Calculation</span>
              </label>

              <button
                onClick={() => setIsMapPickerActive(!isMapPickerActive)}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 transition-colors flex items-center gap-1"
              >
                <Navigation className="h-3 w-3" />
                <span>{isMapPickerActive ? 'Hide Map Picker' : 'Drop Pin on Map'}</span>
              </button>
            </div>

            {/* Address Presets */}
            <div className="flex flex-wrap gap-2">
              {addressPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedAddressIndex(idx);
                    setCustomCoords(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedAddressIndex === idx && !customCoords
                      ? 'bg-slate-900 text-white font-semibold shadow-sm'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Interactive Map Pin Drop Container */}
            {isMapPickerActive && (
              <div className="rounded-xl overflow-hidden border border-amber-300 shadow-sm">
                <LiveDeliveryMap
                  isPickingLocation={true}
                  pickedLocation={currentCoords}
                  onPickCoordinates={(lat, lng) => {
                    setCustomCoords({ lat, lng });
                  }}
                  heightClass="h-[280px]"
                />
              </div>
            )}

            {/* Distance & Time Calculation Metric Banner */}
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-white p-3 border border-slate-200 text-center font-mono shadow-sm">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Road Distance</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {distanceInfo.roadDist} km
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">
                  ({distanceInfo.straightDist} km direct)
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Est. Prep Time</span>
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {distanceInfo.prepMins} mins
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">kitchen queue</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Total Delivery ETA</span>
                <span className="text-sm font-bold text-indigo-700 tabular-nums">
                  ~{distanceInfo.totalEstMins} mins
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">
                  {distanceInfo.transitMins}m courier transit
                </span>
              </div>
            </div>
          </div>

          {/* Step 3: Menu Items Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2.5">
              3. Select Menu Items ({currentRestaurant.name})
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentRestaurant.menu.map((menuItem) => {
                const inCart = cart.find((i) => i.item.id === menuItem.id);
                return (
                  <div
                    key={menuItem.id}
                    className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors shadow-sm"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900">
                          {menuItem.name}
                        </h4>
                        <span className="font-mono text-xs font-bold text-slate-900 tabular-nums">
                          ${menuItem.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                        {menuItem.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">
                        ~{menuItem.prepTimeMinutes}m prep
                      </span>

                      {inCart ? (
                        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
                          <button
                            onClick={() => handleRemoveItem(menuItem.id)}
                            className="p-0.5 hover:text-rose-600 text-slate-500 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-slate-900 tabular-nums px-1">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => handleAddItem(menuItem)}
                            className="p-0.5 hover:text-emerald-600 text-slate-500 transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAddItem(menuItem)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-xs font-semibold text-slate-700 transition-colors"
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 4: Speed Priority & Delivery Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Priority selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">
                4. Delivery Priority
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPriority('standard')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === 'standard'
                      ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">Standard</span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">$3.49 · Normal Dispatch</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('express')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    priority === 'express'
                      ? 'border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  <span className="text-xs font-bold text-indigo-700 block flex items-center gap-1">
                    <Zap className="h-3 w-3" /> Express Direct
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">$5.99 · Priority Courier</span>
                </button>
              </div>
            </div>

            {/* Customer Name & Notes */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">
                Special Delivery Notes
              </label>
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Gate code, door instructions..."
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer with Checkout Summary & Submit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 px-6 border-t border-slate-200 bg-slate-50/70">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-slate-500">Total Due:</span>
              <span className="text-xl font-bold font-mono text-slate-900 tabular-nums">
                ${total.toFixed(2)}
              </span>
              <span className="text-xs text-slate-500">
                ({cart.reduce((s, i) => s + i.quantity, 0)} items)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Includes ${deliveryFee} delivery fee + ${tip} courier tip
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmitOrder}
              disabled={cart.length === 0}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
            >
              Place Order & Track Live
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

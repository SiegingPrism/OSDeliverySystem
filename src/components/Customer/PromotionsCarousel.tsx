import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Flame,
  Percent,
  Sparkles,
  Tag,
  Utensils,
  Zap,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';

export interface Promotion {
  id: string;
  restaurantId: string;
  restaurantName: string;
  badge: string;
  title: string;
  code: string;
  discount: string;
  description: string;
  validUntil: string;
  cuisine: string;
  gradient: string;
  iconBg: string;
  accentText: string;
}

export const PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    restaurantId: 'rest-2',
    restaurantName: 'Golden Gate Burger Bar',
    badge: "Chef's Daily Special",
    title: 'Truffle Smash Combo & Craft Shake',
    code: 'GOLDEN25',
    discount: '25% OFF',
    description: 'Double American Wagyu smash burger with black truffle aioli & crispy parmesan herb fries.',
    validUntil: 'Valid today until 10 PM',
    cuisine: 'Artisanal Burgers & Shakes',
    gradient: 'from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/5 dark:to-transparent',
    iconBg: 'bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    accentText: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'promo-2',
    restaurantId: 'rest-3',
    restaurantName: 'Tokyo Night Ramen',
    badge: 'Night Market Special',
    title: 'Free Pan-Seared Wagyu Gyoza',
    code: 'RAMENBOOST',
    discount: 'FREE APPETIZER',
    description: 'Complimentary 6pc Wagyu gyoza automatically added when ordering any 2 ramen bowls.',
    validUntil: 'Flash special today',
    cuisine: 'Authentic Ramen',
    gradient: 'from-rose-500/10 via-rose-500/5 to-transparent dark:from-rose-500/15 dark:via-rose-500/5 dark:to-transparent',
    iconBg: 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
    accentText: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'promo-3',
    restaurantId: 'rest-1',
    restaurantName: 'Trattoria Bella Vista',
    badge: 'Woodfired Lunch Deal',
    title: 'Neapolitan Margherita & Burrata Duo',
    code: 'PIZZA15',
    discount: '$5.00 OFF',
    description: 'Handmade San Marzano Margherita pizza + burrata salad pairing with code PIZZA15.',
    validUntil: 'Daily 11 AM - 3 PM',
    cuisine: 'Woodfired Pizza & Italian',
    gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/15 dark:via-emerald-500/5 dark:to-transparent',
    iconBg: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    accentText: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'promo-4',
    restaurantId: 'rest-4',
    restaurantName: 'Mission Super Bowls',
    badge: 'Zero Delivery Fee',
    title: '$0 Express Delivery on Harvest Bowls',
    code: 'FREEDROP',
    discount: 'FREE DELIVERY',
    description: 'Healthy organic superfood bowls & elixirs delivered under 20 mins with zero delivery fee.',
    validUntil: 'All day special',
    cuisine: 'Organic Healthy Bowls',
    gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent dark:from-indigo-500/15 dark:via-indigo-500/5 dark:to-transparent',
    iconBg: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
    accentText: 'text-indigo-600 dark:text-indigo-400',
  },
];

interface PromotionsCarouselProps {
  onOpenNewOrder?: () => void;
  className?: string;
}

export const PromotionsCarousel: React.FC<PromotionsCarouselProps> = ({
  onOpenNewOrder,
  className = '',
}) => {
  const { setSelectedRestaurantId } = useDelivery();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const currentPromo = PROMOTIONS[currentIndex];

  // Auto advance every 5.5s unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + PROMOTIONS.length) % PROMOTIONS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
  };

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleClaim = (promo: Promotion) => {
    setSelectedRestaurantId(promo.restaurantId);
    if (onOpenNewOrder) {
      onOpenNewOrder();
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs transition-colors duration-200 ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Accent Gradient */}
      <div
        className={`absolute inset-0 bg-linear-to-r ${currentPromo.gradient} pointer-events-none transition-all duration-500`}
      />

      <div className="relative p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Special Details */}
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border shadow-2xs transition-colors ${currentPromo.iconBg}`}
          >
            <Tag className="h-5 w-5" />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono shadow-2xs">
                <Sparkles className="h-3 w-3" />
                <span>{currentPromo.badge}</span>
              </span>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate font-mono">
                {currentPromo.restaurantName}
              </span>

              <span className="hidden sm:inline text-slate-300 dark:text-slate-700">·</span>
              <span className="hidden sm:inline text-[11px] text-slate-500 dark:text-slate-400">
                {currentPromo.validUntil}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
              {currentPromo.title}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 max-w-xl">
              {currentPromo.description}
            </p>
          </div>
        </div>

        {/* Right: Discount Code Box & Claim Action */}
        <div className="flex flex-wrap items-center gap-2.5 self-end sm:self-center shrink-0">
          {/* Discount Code Chip with Copy */}
          <button
            type="button"
            onClick={(e) => handleCopyCode(currentPromo.code, e)}
            className="group flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/70 dark:bg-indigo-950/50 hover:bg-indigo-100/80 dark:hover:bg-indigo-900/60 transition-all text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300"
            title="Click to copy promo code"
          >
            <span className="text-[10px] uppercase text-indigo-500 dark:text-indigo-400">Code:</span>
            <span className="tracking-wider">{currentPromo.code}</span>
            {copiedCode === currentPromo.code ? (
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 text-[10px] font-sans">
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </span>
            ) : (
              <Copy className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            )}
          </button>

          {/* Claim / Order Special Button */}
          {onOpenNewOrder && (
            <button
              onClick={() => handleClaim(currentPromo)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-sm active:scale-98"
            >
              <span>{currentPromo.discount}</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          )}

          {/* Carousel Arrows */}
          <div className="flex items-center gap-1 pl-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Previous daily special"
              aria-label="Previous daily special"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Next daily special"
              aria-label="Next daily special"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Dots Bar */}
      <div className="flex items-center justify-between px-4 pb-2.5 pt-0 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="font-mono text-[10px]">
          Special {currentIndex + 1} of {PROMOTIONS.length}
        </span>

        <div className="flex items-center gap-1.5">
          {PROMOTIONS.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentIndex
                  ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                  : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
              }`}
              aria-label={`Jump to promotion ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

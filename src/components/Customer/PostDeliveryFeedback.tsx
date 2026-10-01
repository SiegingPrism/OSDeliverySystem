import React, { useState } from 'react';
import {
  Award,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Heart,
  MessageSquare,
  PackageCheck,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Utensils,
  X,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { Courier, DeliveryFeedback, Order } from '../../types/delivery';

interface PostDeliveryFeedbackProps {
  order: Order;
  courier?: Courier | null;
  onClose?: () => void;
  variant?: 'card' | 'modal';
}

const RATING_LABELS: { [key: number]: string } = {
  1: 'Disappointing',
  2: 'Needs Improvement',
  3: 'Satisfactory',
  4: 'Very Good',
  5: 'Exceptional Experience',
};

const DRIVER_TAGS = [
  '⚡ Super fast delivery',
  '🤝 Friendly & polite',
  '📝 Followed delivery instructions',
  '📦 Handled food with care',
  '💬 Great communication',
  '🔔 Respectful drop-off',
];

const RESTAURANT_TAGS = [
  '🔥 Hot & fresh',
  '🍱 Tamper-evident packaging',
  '🎯 100% order accuracy',
  '🌿 Generous portions',
  '🥣 Secure soup/drink containers',
  '🍴 Included cutlery & condiments',
];

export const PostDeliveryFeedback: React.FC<PostDeliveryFeedbackProps> = ({
  order,
  courier,
  onClose,
  variant = 'card',
}) => {
  const { submitOrderFeedback } = useDelivery();

  const existing = order.feedback;

  const [isEditing, setIsEditing] = useState<boolean>(!existing);
  const [overallRating, setOverallRating] = useState<number>(existing?.overallRating || 5);
  const [driverRating, setDriverRating] = useState<number>(existing?.driverRating || 5);
  const [restaurantRating, setRestaurantRating] = useState<number>(existing?.restaurantRating || 5);
  const [driverComments, setDriverComments] = useState<string>(existing?.driverComments || '');
  const [restaurantComments, setRestaurantComments] = useState<string>(existing?.restaurantComments || '');
  const [driverTags, setDriverTags] = useState<string[]>(existing?.driverTags || ['⚡ Super fast delivery', '📦 Handled food with care']);
  const [restaurantTags, setRestaurantTags] = useState<string[]>(existing?.restaurantTags || ['🔥 Hot & fresh', '🎯 100% order accuracy']);
  const [submittedAnimation, setSubmittedAnimation] = useState<boolean>(false);

  // Hover states for stars
  const [hoverOverall, setHoverOverall] = useState<number>(0);
  const [hoverDriver, setHoverDriver] = useState<number>(0);
  const [hoverRestaurant, setHoverRestaurant] = useState<number>(0);

  const toggleDriverTag = (tag: string) => {
    setDriverTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleRestaurantTag = (tag: string) => {
    setRestaurantTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    submitOrderFeedback(order.id, {
      overallRating,
      driverRating,
      restaurantRating,
      driverComments: driverComments.trim() || undefined,
      restaurantComments: restaurantComments.trim() || undefined,
      driverTags,
      restaurantTags,
    });

    setSubmittedAnimation(true);
    setTimeout(() => {
      setSubmittedAnimation(false);
      setIsEditing(false);
      if (variant === 'modal' && onClose) {
        onClose();
      }
    }, 1200);
  };

  const renderStarPicker = (
    value: number,
    hoverValue: number,
    onChange: (val: number) => void,
    onHover: (val: number) => void
  ) => {
    return (
      <div className="flex items-center gap-1.5" onMouseLeave={() => onHover(0)}>
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverValue || value) >= star;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => onHover(star)}
              className="p-1 rounded-lg transition-transform hover:scale-115 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`h-6 w-6 transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                    : 'text-slate-300 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
        <span className="text-xs font-semibold text-amber-700 ml-2 font-mono">
          {RATING_LABELS[hoverValue || value]}
        </span>
      </div>
    );
  };

  // View Mode when review is already submitted
  if (existing && !isEditing) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Your Delivery Feedback ({order.id})
              </h3>
              <p className="text-[11px] font-semibold text-emerald-800">
                Feedback shared with restaurant & courier partner
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-3 py-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5 text-indigo-600" />
            <span>Edit Review</span>
          </button>
        </div>

        {/* Overall Rating Pill */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-bold text-slate-800">Overall Experience</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${
                  s <= existing.overallRating
                    ? 'fill-amber-400 text-amber-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
            <span className="text-xs font-bold font-mono text-slate-900 ml-1">
              {existing.overallRating}/5
            </span>
          </div>
        </div>

        {/* Driver Review Summary */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-indigo-600" />
              <span>Driver: {order.courierName || 'Courier'}</span>
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= existing.driverRating
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {existing.driverTags && existing.driverTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {existing.driverTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {existing.driverComments && (
            <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{existing.driverComments}"
            </p>
          )}
        </div>

        {/* Restaurant Review Summary */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Utensils className="h-3.5 w-3.5 text-amber-600" />
              <span>Kitchen: {order.restaurantName}</span>
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`h-3.5 w-3.5 ${
                    s <= existing.restaurantRating
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          {existing.restaurantTags && existing.restaurantTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {existing.restaurantTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {existing.restaurantComments && (
            <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-200">
              "{existing.restaurantComments}"
            </p>
          )}
        </div>
      </div>
    );
  }

  // Edit / Input Form
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
              Rate Your Delivery Experience
            </h3>
            <p className="text-xs text-slate-500">
              Help {order.restaurantName} & your driver Mateo improve service
            </p>
          </div>
        </div>

        {variant === 'modal' && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 1. Overall Experience */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">
            1. Overall Delivery Rating
          </span>
          <span className="text-xs text-slate-400 font-mono">1 to 5 Stars</span>
        </div>
        {renderStarPicker(overallRating, hoverOverall, setOverallRating, setHoverOverall)}
      </div>

      {/* 2. Driver Performance & Specific Comments */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-100 text-indigo-700">
              <Bike className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              2. Courier Driver: {order.courierName || courier?.name || 'Assigned Driver'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-indigo-700 font-semibold">
            {order.courierVehicle || courier?.vehicleType || 'ebike'}
          </span>
        </div>

        {renderStarPicker(driverRating, hoverDriver, setDriverRating, setHoverDriver)}

        {/* Quick Driver Tags */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-slate-600 block">
            What went well or could be better with the courier?
          </label>
          <div className="flex flex-wrap gap-1.5">
            {DRIVER_TAGS.map((tag) => {
              const isSelected = driverTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleDriverTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Driver Comment Input */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span>Specific comments for driver improvements:</span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            rows={2}
            value={driverComments}
            onChange={(e) => setDriverComments(e.target.value)}
            placeholder="e.g. Navigated building gate smoothly, very courteous drop-off, handled food gently..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* 3. Restaurant Food & Packing Specific Comments */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/20 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-amber-100 text-amber-800">
              <Utensils className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-bold text-slate-900">
              3. Restaurant Quality: {order.restaurantName}
            </span>
          </div>
        </div>

        {renderStarPicker(restaurantRating, hoverRestaurant, setRestaurantRating, setHoverRestaurant)}

        {/* Quick Restaurant Tags */}
        <div className="space-y-1.5 pt-1">
          <label className="text-[11px] font-semibold text-slate-600 block">
            Kitchen packaging & preparation highlights:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {RESTAURANT_TAGS.map((tag) => {
              const isSelected = restaurantTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleRestaurantTag(tag)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Specific Restaurant Comment Input */}
        <div className="space-y-1 pt-1">
          <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
            <span>Specific comments for restaurant improvements:</span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            rows={2}
            value={restaurantComments}
            onChange={(e) => setRestaurantComments(e.target.value)}
            placeholder="e.g. Food temperature was perfect, excellent leak-proof container lids, great flavor..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {existing && (
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={submittedAnimation}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-md active:scale-[0.99] disabled:opacity-75"
        >
          {submittedAnimation ? (
            <>
              <CheckCircle2 className="h-4 w-4 animate-bounce" />
              <span>Thank you! Feedback Recorded</span>
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" />
              <span>{existing ? 'Save Updated Feedback' : 'Submit Review & Ratings'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 my-8">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      {formContent}
    </div>
  );
};

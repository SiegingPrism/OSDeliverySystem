import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Bike,
  Car,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Navigation,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Courier, Order } from '../../types/delivery';

interface DeliveryCountdownTimerProps {
  order: Order;
  courier?: Courier | null;
  compact?: boolean;
}

export const DeliveryCountdownTimer: React.FC<DeliveryCountdownTimerProps> = ({
  order,
  courier,
  compact = false,
}) => {
  const dt = order.distanceTiming;

  // Compute total baseline window in seconds
  const totalWindowSeconds = useMemo(() => {
    if (order.status === 'out_for_delivery') {
      return Math.max(120, (dt.estimatedTransitMinutes || 15) * 60);
    }
    return Math.max(
      180,
      ((dt.estimatedPrepMinutes || 12) + (dt.estimatedTransitMinutes || 15)) * 60
    );
  }, [dt.estimatedPrepMinutes, dt.estimatedTransitMinutes, order.status]);

  // Compute target route remaining seconds from route calculation
  const calculateRouteSeconds = (): number => {
    if (order.status === 'delivered') return 0;
    if (order.status === 'rejected' || order.status === 'cancelled') return 0;

    if (order.status === 'out_for_delivery' || order.status === 'picked_up') {
      const transitSec = (dt.estimatedTransitMinutes || 15) * 60;
      const progressRatio = Math.min(100, Math.max(0, dt.routeProgressPct || 0)) / 100;
      const remainingByProgress = Math.round(transitSec * (1 - progressRatio));
      
      // Also consider actualRemainingMinutes from simulated road speed
      const remainingByMinutes = Math.max(0, (dt.actualRemainingMinutes || 0) * 60);
      
      // Blend slightly or take the more granular progress calculation
      if (remainingByProgress > 0) {
        return Math.min(remainingByProgress, remainingByMinutes > 0 ? remainingByMinutes + 30 : remainingByProgress);
      }
      return remainingByMinutes;
    }

    if (order.status === 'ready') {
      const transitSec = (dt.estimatedTransitMinutes || 15) * 60;
      return transitSec + 60; // 1 min buffer for courier handoff
    }

    if (order.status === 'preparing') {
      const prepRemainingSec = Math.max(
        0,
        Math.round(((dt.estimatedPrepMinutes || 15) - (dt.minutesElapsed || 0)) * 60)
      );
      const transitSec = (dt.estimatedTransitMinutes || 15) * 60;
      return prepRemainingSec + transitSec;
    }

    // received
    return totalWindowSeconds;
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => calculateRouteSeconds());

  // Keep countdown in sync with route progression
  useEffect(() => {
    const routeSec = calculateRouteSeconds();
    setSecondsRemaining(routeSec);
  }, [
    order.status,
    dt.routeProgressPct,
    dt.actualRemainingMinutes,
    dt.minutesElapsed,
    dt.distanceRemainingKm,
  ]);

  // Active 1-second countdown tick
  useEffect(() => {
    if (order.status === 'delivered' || order.status === 'rejected' || order.status === 'cancelled') {
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [order.status]);

  // Compute display minutes and seconds
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedMinutes = String(mins).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  // Compute clock arrival window (e.g., 12:45 PM - 12:50 PM)
  const arrivalWindow = useMemo(() => {
    const now = new Date();
    const arrivalTimeMin = new Date(now.getTime() + secondsRemaining * 1000);
    const arrivalTimeMax = new Date(now.getTime() + (secondsRemaining + 180) * 1000);

    const formatOpts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };

    return {
      min: arrivalTimeMin.toLocaleTimeString([], formatOpts),
      max: arrivalTimeMax.toLocaleTimeString([], formatOpts),
    };
  }, [secondsRemaining]);

  // Circular gauge percentage (100% when starting -> 0% when arrived)
  const progressRatio = useMemo(() => {
    if (order.status === 'delivered') return 1;
    if (totalWindowSeconds <= 0) return 0;
    const completedSec = totalWindowSeconds - secondsRemaining;
    return Math.min(1, Math.max(0, completedSec / totalWindowSeconds));
  }, [totalWindowSeconds, secondsRemaining, order.status]);

  // SVG circular gauge math
  const radius = 52;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  // Live route phase commentary based on calculated route
  const routeStatusNarrative = useMemo(() => {
    if (order.status === 'delivered') {
      return {
        title: 'Order Delivered Successfully',
        subtitle: 'Food safely delivered to your designated address.',
        urgency: 'success',
      };
    }

    if (order.status === 'out_for_delivery') {
      if (dt.routeProgressPct >= 92 || secondsRemaining <= 90) {
        return {
          title: 'Driver Pulling Up to Doorstep',
          subtitle: `Courier is on your block (${dt.distanceRemainingKm} km away). Please be ready at entrance.`,
          urgency: 'imminent',
        };
      }
      if (dt.routeProgressPct >= 65 || secondsRemaining <= 300) {
        return {
          title: 'Entering Neighborhood Route',
          subtitle: `Speed ~${courier?.avgSpeedKmh || 22} km/h along final urban approach.`,
          urgency: 'close',
        };
      }
      if (dt.routeProgressPct >= 30) {
        return {
          title: 'En Route Along Calculated Corridor',
          subtitle: `Active GPS transit via road navigation (${dt.distanceRemainingKm} km remaining).`,
          urgency: 'transit',
        };
      }
      return {
        title: 'Driver Picked Up & Departed Kitchen',
        subtitle: 'Courier just merged onto the calculated delivery route.',
        urgency: 'departed',
      };
    }

    if (order.status === 'ready') {
      return {
        title: 'Kitchen Packed · Driver Arriving',
        subtitle: 'Meal is hot and ready in insulation bag awaiting handover.',
        urgency: 'ready',
      };
    }

    if (order.status === 'preparing') {
      return {
        title: 'Chef Preparing Dishes',
        subtitle: `Fresh preparation window in progress (~${Math.max(1, Math.round(dt.estimatedPrepMinutes - dt.minutesElapsed))} min left before dispatch).`,
        urgency: 'prep',
      };
    }

    return {
      title: 'Order Confirmed by Restaurant',
      subtitle: 'Order received and slotted into kitchen prep queue.',
      urgency: 'received',
    };
  }, [order.status, dt.routeProgressPct, dt.distanceRemainingKm, dt.estimatedPrepMinutes, dt.minutesElapsed, secondsRemaining, courier?.avgSpeedKmh]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-900 text-white shadow-sm">
        <div className="flex items-center gap-1.5 font-mono font-bold text-base tabular-nums text-amber-400">
          <Clock className="h-4 w-4 animate-pulse text-amber-400" />
          <span>{formattedMinutes}:{formattedSeconds}</span>
        </div>
        <div className="text-[11px] text-slate-300">
          <span>Route ETA: </span>
          <span className="font-semibold text-white">{arrivalWindow.min}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-linear-to-b from-white to-slate-50/60 p-5 shadow-sm space-y-5">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200">
            <Navigation className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              Live Route Countdown & Arrival Telemetry
            </h3>
            <p className="text-[11px] font-semibold text-slate-800">
              Calculated from {dt.roadDistanceKm} km GPS road corridor
            </p>
          </div>
        </div>

        {/* Dynamic Route Phase Badge */}
        <div className="flex items-center gap-2">
          {order.status === 'delivered' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Delivered</span>
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                {Math.round(progressRatio * 100)}% Route Progress
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Countdown Display: Circular Radial Dial + Time Window */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left: Circular Dial & Digital Ticker */}
        <div className="md:col-span-6 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-5">
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-32 h-32 -rotate-90 transform" viewBox="0 0 120 120">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-200"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              {/* Route Progress Accent Stroke */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className={`transition-all duration-700 ease-out ${
                  order.status === 'delivered'
                    ? 'stroke-emerald-500'
                    : secondsRemaining <= 120
                    ? 'stroke-emerald-600'
                    : 'stroke-indigo-600'
                }`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Countdown Numbers */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              {order.status === 'delivered' ? (
                <CheckCircle2 className="h-9 w-9 text-emerald-600 animate-in zoom-in" />
              ) : (
                <>
                  <div className="flex items-center justify-center text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                    <span>{formattedMinutes}</span>
                    <span className="animate-pulse text-indigo-600 mx-0.5">:</span>
                    <span>{formattedSeconds}</span>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Time Left
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Time text & Arrival Target */}
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider font-mono">
              Estimated Delivery
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {order.status === 'delivered' ? (
                <span className="text-emerald-700">Delivered</span>
              ) : (
                <span>
                  {arrivalWindow.min}{' '}
                  <span className="text-slate-400 font-normal text-base">–</span>{' '}
                  <span className="text-slate-700">{arrivalWindow.max}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {order.status === 'delivered'
                  ? 'Completed on time'
                  : `Target SLA guarantee: ${dt.targetDeliveryMinutes} mins total`}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Route Metrics Breakdown */}
        <div className="md:col-span-6 grid grid-cols-3 gap-2.5">
          <div className="rounded-xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Remaining
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-slate-900 mt-0.5 tabular-nums">
              {order.status === 'delivered' ? '0.0' : dt.distanceRemainingKm}{' '}
              <span className="text-xs font-bold text-slate-500">km</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              of {dt.roadDistanceKm} km total
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Pace Speed
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-indigo-700 mt-0.5 tabular-nums flex items-center justify-center gap-1">
              {courier?.vehicleType === 'car' ? (
                <Car className="h-4 w-4 text-indigo-600" />
              ) : (
                <Bike className="h-4 w-4 text-indigo-600" />
              )}
              <span>{courier?.avgSpeedKmh || (courier?.vehicleType === 'car' ? 32 : 22)}</span>
              <span className="text-[10px] font-bold text-slate-500">km/h</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 capitalize truncate">
              {courier?.vehicleType || 'ebike'} transit
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white p-3 text-center shadow-2xs">
            <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Route SLA
            </div>
            <div className="text-base sm:text-lg font-black font-mono text-emerald-700 mt-0.5 tabular-nums">
              {dt.urgencyScore > 75 ? (
                <span className="text-amber-600">Priority</span>
              ) : (
                <span className="text-emerald-600">On Track</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 truncate">
              {order.priority === 'express' ? '⚡ Express dispatch' : 'Standard flow'}
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Route Narrative Ticker */}
      <div
        className={`rounded-xl border p-3 flex items-start gap-3 transition-colors ${
          secondsRemaining <= 120 && order.status === 'out_for_delivery'
            ? 'border-emerald-300 bg-emerald-50 text-emerald-950 animate-pulse'
            : 'border-slate-200 bg-white text-slate-800'
        }`}
      >
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 mt-0.5">
          {secondsRemaining <= 120 && order.status === 'out_for_delivery' ? (
            <Bell className="h-4 w-4 text-emerald-700" />
          ) : (
            <Compass className="h-4 w-4 text-indigo-600" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-slate-900 flex items-center gap-2">
            <span>{routeStatusNarrative.title}</span>
            {secondsRemaining <= 120 && order.status === 'out_for_delivery' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900 uppercase tracking-wider font-mono">
                Arriving Now
              </span>
            )}
          </p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {routeStatusNarrative.subtitle}
          </p>
        </div>
      </div>

      {/* Linear Route Waypoint Mileposts */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
          <span className="flex items-center gap-1 font-mono">
            <MapPin className="h-3 w-3 text-indigo-600" />
            <span>{order.restaurantName}</span>
          </span>
          <span className="font-mono text-slate-700 text-xs font-bold">
            {Math.round(dt.routeProgressPct)}% Completed
          </span>
          <span className="flex items-center gap-1 font-mono">
            <span>{order.deliveryAddress.split(',')[0]}</span>
            <MapPin className="h-3 w-3 text-emerald-600" />
          </span>
        </div>

        {/* Progress Bar with Moving Courier Pin */}
        <div className="relative h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-indigo-500 via-indigo-600 to-emerald-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, dt.routeProgressPct))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

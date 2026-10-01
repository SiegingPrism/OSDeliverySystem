import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  Bike,
  Building2,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Filter,
  Flame,
  Medal,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Zap,
} from 'lucide-react';
import { Courier, Order } from '../../types/delivery';

interface TopPerformersLeaderboardProps {
  couriers: Courier[];
  orders: Order[];
  onSelectCourier?: (courierId: string) => void;
  onClose?: () => void;
}

type SortMetric = 'composite' | 'speed' | 'volume' | 'rating';

export const TopPerformersLeaderboard: React.FC<TopPerformersLeaderboardProps> = ({
  couriers,
  orders,
  onSelectCourier,
  onClose,
}) => {
  const [sortMetric, setSortMetric] = useState<SortMetric>('composite');
  const [vehicleFilter, setVehicleFilter] = useState<'all' | 'ebike' | 'scooter' | 'car' | 'van'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate live 30-day stats including any recently delivered orders
  const driverStats = useMemo(() => {
    return couriers.map((courier) => {
      const p = courier.performance30d || {
        completedOrders30d: 280,
        avgSpeedKmh: courier.avgSpeedKmh,
        avgTransitMinutes: 11.4,
        onTimeRatePct: 98.4,
        rating: courier.rating,
        totalDistanceKm: 850,
        positiveFeedbackPct: 98.0,
      };

      // Add newly delivered orders in this session for this courier
      const sessionDeliveredCount = orders.filter(
        (o) => o.courierId === courier.id && o.status === 'delivered'
      ).length;

      const totalCompleted30d = p.completedOrders30d + sessionDeliveredCount;
      const effectiveSpeed = p.avgSpeedKmh;

      // Composite score: 40% speed, 40% volume, 20% rating
      const speedScore = Math.min(100, (effectiveSpeed / 30) * 100);
      const volumeScore = Math.min(100, (totalCompleted30d / 400) * 100);
      const ratingScore = (courier.rating / 5.0) * 100;
      const compositeScore = Math.round(speedScore * 0.4 + volumeScore * 0.4 + ratingScore * 0.2);

      // Assign performance badge
      let badge = 'Top Tier';
      let badgeColor = 'bg-slate-100 text-slate-700';

      if (effectiveSpeed >= 27) {
        badge = '⚡ Speed Champion';
        badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
      } else if (totalCompleted30d >= 360) {
        badge = '📦 Volume Leader';
        badgeColor = 'bg-indigo-100 text-indigo-800 border-indigo-200';
      } else if (courier.rating >= 4.96) {
        badge = '🌟 5-Star Elite';
        badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      } else {
        badge = '🎯 High Accuracy';
        badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
      }

      return {
        ...courier,
        completedOrders30d: totalCompleted30d,
        avgSpeedKmh: effectiveSpeed,
        avgTransitMinutes: p.avgTransitMinutes,
        onTimeRatePct: p.onTimeRatePct,
        positiveFeedbackPct: p.positiveFeedbackPct,
        totalDistanceKm: p.totalDistanceKm,
        compositeScore,
        badge,
        badgeColor,
      };
    });
  }, [couriers, orders]);

  // Filter and sort leaderboard
  const sortedDrivers = useMemo(() => {
    let list = [...driverStats];

    // Filter by vehicle
    if (vehicleFilter !== 'all') {
      list = list.filter((d) => d.vehicleType === vehicleFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q));
    }

    // Sort according to metric
    list.sort((a, b) => {
      switch (sortMetric) {
        case 'composite':
          return b.compositeScore - a.compositeScore;
        case 'speed':
          return b.avgSpeedKmh - a.avgSpeedKmh;
        case 'volume':
          return b.completedOrders30d - a.completedOrders30d;
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    return list;
  }, [driverStats, sortMetric, vehicleFilter, searchQuery]);

  // Aggregate fleet benchmarks over 30 days
  const fleetAggregates = useMemo(() => {
    const totalVolume = driverStats.reduce((sum, d) => sum + d.completedOrders30d, 0);
    const avgSpeed = (
      driverStats.reduce((sum, d) => sum + d.avgSpeedKmh, 0) / (driverStats.length || 1)
    ).toFixed(1);
    const avgTransit = (
      driverStats.reduce((sum, d) => sum + d.avgTransitMinutes, 0) / (driverStats.length || 1)
    ).toFixed(1);
    const avgOnTime = (
      driverStats.reduce((sum, d) => sum + d.onTimeRatePct, 0) / (driverStats.length || 1)
    ).toFixed(1);

    return {
      totalVolume,
      avgSpeed,
      avgTransit,
      avgOnTime,
      totalDrivers: driverStats.length,
    };
  }, [driverStats]);

  const top3 = sortedDrivers.slice(0, 3);
  const maxVolume = Math.max(...driverStats.map((d) => d.completedOrders30d), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-xs">
            <Trophy className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 font-mono">
                Fleet Dispatch Intelligence
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">30-Day Trailing Window</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Top Performers Leaderboard
            </h2>
          </div>
        </div>

        {/* Sort Metric Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setSortMetric('composite')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                sortMetric === 'composite'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overall Score
            </button>
            <button
              onClick={() => setSortMetric('speed')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                sortMetric === 'speed'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="h-3 w-3" />
              <span>Speed (km/h)</span>
            </button>
            <button
              onClick={() => setSortMetric('volume')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                sortMetric === 'volume'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="h-3 w-3" />
              <span>Order Volume</span>
            </button>
            <button
              onClick={() => setSortMetric('rating')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                sortMetric === 'rating'
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
              <span>Customer Rating</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 font-semibold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* 30-Day Fleet Benchmark Overview Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Completed 30D</span>
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {fleetAggregates.totalVolume.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Across active fleet couriers</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Fleet Avg Speed</span>
            <Zap className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {fleetAggregates.avgSpeed} <span className="text-xs font-bold text-slate-500">km/h</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">City delivery road pacing</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase tracking-wider">
            <span>Avg Transit Time</span>
            <Clock className="h-3.5 w-3.5 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-1 tabular-nums">
            {fleetAggregates.avgTransit} <span className="text-xs font-bold text-slate-500">mins</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Pickup to doorstep arrival</p>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-[11px] font-mono uppercase tracking-wider">
            <span>On-Time SLA Rate</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-1 tabular-nums">
            {fleetAggregates.avgOnTime}%
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Promised target achievement</p>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      {top3.length >= 3 && (
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono block">
            Top 3 Performance Podium
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Rank 2 (Silver) */}
            <div className="rounded-2xl border-2 border-slate-300 bg-linear-to-b from-slate-50 to-white p-4 shadow-sm relative order-2 md:order-1">
              <div className="absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 border border-slate-300 shadow-2xs">
                <span>🥈 2nd Place</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{top3[1].name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 capitalize">
                    <span>{top3[1].vehicleType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-slate-800 font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {top3[1].rating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-slate-900 tabular-nums">
                    {top3[1].completedOrders30d}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Orders 30d</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-100/70 p-1.5">
                  <span className="text-[10px] text-slate-500 block">Avg Speed</span>
                  <span className="font-mono font-bold text-slate-900">{top3[1].avgSpeedKmh} km/h</span>
                </div>
                <div className="rounded-lg bg-slate-100/70 p-1.5">
                  <span className="text-[10px] text-slate-500 block">On-Time</span>
                  <span className="font-mono font-bold text-emerald-700">{top3[1].onTimeRatePct}%</span>
                </div>
              </div>
            </div>

            {/* Rank 1 (Gold Champion) */}
            <div className="rounded-2xl border-2 border-amber-400 bg-linear-to-b from-amber-50/60 via-amber-50/20 to-white p-5 shadow-md relative order-1 md:order-2 scale-102">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-slate-950 shadow-sm border border-amber-400">
                <Trophy className="h-3.5 w-3.5" />
                <span>🥇 1st Place Champion</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-slate-900">{top3[0].name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-0.5 capitalize">
                    <span>{top3[0].vehicleType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-slate-900 font-bold">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                      {top3[0].rating}
                    </span>
                    <span>·</span>
                    <span className="text-emerald-700 font-semibold">{top3[0].positiveFeedbackPct}% Positive</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-amber-700 tabular-nums">
                    {top3[0].completedOrders30d}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Orders 30d</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200/80 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-xl bg-amber-100/60 p-2">
                  <span className="text-[10px] text-amber-800 font-semibold block">Delivery Pace</span>
                  <span className="font-mono font-black text-amber-950 text-sm">{top3[0].avgSpeedKmh} km/h</span>
                </div>
                <div className="rounded-xl bg-emerald-100/60 p-2">
                  <span className="text-[10px] text-emerald-800 font-semibold block">SLA Precision</span>
                  <span className="font-mono font-black text-emerald-950 text-sm">{top3[0].onTimeRatePct}%</span>
                </div>
              </div>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="rounded-2xl border-2 border-amber-700/30 bg-linear-to-b from-amber-700/5 to-white p-4 shadow-sm relative order-3">
              <div className="absolute -top-3 left-4 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-700/10 text-amber-800 border border-amber-700/20 shadow-2xs">
                <span>🥉 3rd Place</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{top3[2].name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 capitalize">
                    <span>{top3[2].vehicleType}</span>
                    <span>·</span>
                    <span className="flex items-center gap-0.5 text-slate-800 font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      {top3[2].rating}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-slate-900 tabular-nums">
                    {top3[2].completedOrders30d}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Orders 30d</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="rounded-lg bg-slate-100/70 p-1.5">
                  <span className="text-[10px] text-slate-500 block">Avg Speed</span>
                  <span className="font-mono font-bold text-slate-900">{top3[2].avgSpeedKmh} km/h</span>
                </div>
                <div className="rounded-lg bg-slate-100/70 p-1.5">
                  <span className="text-[10px] text-slate-500 block">On-Time</span>
                  <span className="font-mono font-bold text-emerald-700">{top3[2].onTimeRatePct}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {/* Vehicle Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            <span>Fleet:</span>
          </span>
          {(['all', 'ebike', 'scooter', 'car', 'van'] as const).map((vt) => (
            <button
              key={vt}
              onClick={() => setVehicleFilter(vt)}
              className={`px-2.5 py-1 rounded-lg text-xs capitalize transition-all font-medium ${
                vehicleFilter === vt
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {vt}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search driver by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Ranked Leaderboard Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-12 text-center">Rank</th>
              <th className="py-3 px-4">Courier Driver</th>
              <th className="py-3 px-4 text-center">Vehicle</th>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortMetric('volume')}
                  className="flex items-center gap-1 hover:text-slate-900 focus:outline-none font-bold"
                >
                  <span>30D Volume</span>
                  {sortMetric === 'volume' && <ArrowDown className="h-3 w-3 text-indigo-600" />}
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => setSortMetric('speed')}
                  className="flex items-center gap-1 hover:text-slate-900 focus:outline-none font-bold"
                >
                  <span>Delivery Speed</span>
                  {sortMetric === 'speed' && <ArrowDown className="h-3 w-3 text-indigo-600" />}
                </button>
              </th>
              <th className="py-3 px-4 text-center">On-Time SLA</th>
              <th className="py-3 px-4 text-center">
                <button
                  onClick={() => setSortMetric('rating')}
                  className="flex items-center gap-1 justify-center hover:text-slate-900 focus:outline-none font-bold mx-auto"
                >
                  <span>Satisfaction</span>
                  {sortMetric === 'rating' && <ArrowDown className="h-3 w-3 text-indigo-600" />}
                </button>
              </th>
              <th className="py-3 px-4 text-right">Accolade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedDrivers.map((driver, index) => {
              const rank = index + 1;
              const isTop3 = rank <= 3;
              const volumePct = Math.round((driver.completedOrders30d / maxVolume) * 100);

              return (
                <tr
                  key={driver.id}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isTop3 ? 'bg-amber-50/15' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="py-3 px-3 text-center">
                    {rank === 1 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                        1
                      </span>
                    ) : rank === 2 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-slate-900 font-bold text-xs">
                        2
                      </span>
                    ) : rank === 3 ? (
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-900 font-bold text-xs">
                        3
                      </span>
                    ) : (
                      <span className="font-mono text-slate-500 font-semibold">{rank}</span>
                    )}
                  </td>

                  {/* Courier Info */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-200 shrink-0">
                        {driver.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{driver.name}</span>
                          <span
                            className={`h-2 w-2 rounded-full ${
                              driver.status === 'delivering'
                                ? 'bg-amber-500 animate-pulse'
                                : driver.status === 'idle'
                                ? 'bg-emerald-500'
                                : 'bg-slate-400'
                            }`}
                            title={`Status: ${driver.status}`}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {driver.totalDeliveries} all-time trips
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Vehicle */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
                      {driver.vehicleType === 'car' || driver.vehicleType === 'van' ? (
                        <Car className="h-3 w-3 text-slate-500" />
                      ) : (
                        <Bike className="h-3 w-3 text-slate-500" />
                      )}
                      <span>{driver.vehicleType}</span>
                    </span>
                  </td>

                  {/* 30D Completed Orders & Progress Bar */}
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-900">
                        <span>{driver.completedOrders30d}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {volumePct}% max
                        </span>
                      </div>
                      <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${volumePct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Delivery Speed */}
                  <td className="py-3 px-4">
                    <div className="font-mono">
                      <span className="font-bold text-slate-900">{driver.avgSpeedKmh}</span>
                      <span className="text-[10px] text-slate-500 ml-1">km/h</span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ~{driver.avgTransitMinutes}m avg transit
                      </span>
                    </div>
                  </td>

                  {/* On-Time SLA */}
                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-emerald-700">
                      {driver.onTimeRatePct}%
                    </span>
                  </td>

                  {/* Customer Rating */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1 font-mono font-bold text-slate-900">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
                      <span>{driver.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {driver.positiveFeedbackPct}% pos
                    </span>
                  </td>

                  {/* Accolade Badge */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${driver.badgeColor}`}
                    >
                      {driver.badge}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

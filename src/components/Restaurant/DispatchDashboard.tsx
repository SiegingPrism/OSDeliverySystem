import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Bike,
  Building2,
  Car,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  PackageCheck,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { DistanceFilter, Order, SortCriterion, TimeFilter } from '../../types/delivery';
import { LiveDeliveryMap } from '../Map/LiveDeliveryMap';
import { DistanceTimeAnalytics } from './DistanceTimeAnalytics';
import { OrderCard } from './OrderCard';
import { OrderVolumeAnalyticsChart } from './OrderVolumeAnalyticsChart';
import { RejectOrderModal } from './RejectOrderModal';
import { RestaurantSettingsModal } from './RestaurantSettingsModal';
import { TopPerformersLeaderboard } from './TopPerformersLeaderboard';

export const DispatchDashboard: React.FC = () => {
  const {
    orders,
    restaurants,
    couriers,
    selectedRestaurantId,
    setSelectedRestaurantId,
    distanceFilter,
    setDistanceFilter,
    timeFilter,
    setTimeFilter,
    sortCriterion,
    setSortCriterion,
    trafficCongestion,
    setTrafficCongestion,
    batchCorridors,
    batchAssignCorridor,
    selectedOrderId,
    setSelectedOrderId,
    rejectOrder,
    simulateRandomNewOrder,
  } = useDelivery();

  const { currentUser } = useAuth();

  const [activeStatusTab, setActiveStatusTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showMapSplit, setShowMapSplit] = useState<boolean>(true);
  const [show7DayChart, setShow7DayChart] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(true);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const currentRestaurant =
    restaurants.find((r) => r.id === selectedRestaurantId) || restaurants[0];

  // Real-time status counts for the selected kitchen
  const statusCounts = useMemo(() => {
    const restaurantOrders = orders.filter((o) => o.restaurantId === selectedRestaurantId);
    return {
      all: restaurantOrders.length,
      active: restaurantOrders.filter(
        (o) => o.status !== 'delivered' && o.status !== 'cancelled' && o.status !== 'rejected'
      ).length,
      new: restaurantOrders.filter((o) => o.status === 'received').length,
      preparing: restaurantOrders.filter((o) => o.status === 'preparing').length,
      ready: restaurantOrders.filter((o) => o.status === 'ready').length,
      out_for_delivery: restaurantOrders.filter(
        (o) => o.status === 'out_for_delivery' || o.status === 'picked_up'
      ).length,
      delivered: restaurantOrders.filter((o) => o.status === 'delivered').length,
      rejected: restaurantOrders.filter((o) => o.status === 'rejected').length,
    };
  }, [orders, selectedRestaurantId]);

  // Filter orders by restaurant, status, distance, time, and search
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Restaurant filter
      if (order.restaurantId !== selectedRestaurantId) return false;

      // Status filtering: 'all', 'new', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'rejected'
      if (activeStatusTab !== 'all') {
        if (activeStatusTab === 'new' || activeStatusTab === 'received') {
          if (order.status !== 'received') return false;
        } else if (activeStatusTab === 'preparing') {
          if (order.status !== 'preparing') return false;
        } else if (activeStatusTab === 'ready') {
          if (order.status !== 'ready') return false;
        } else if (activeStatusTab === 'out_for_delivery') {
          if (order.status !== 'out_for_delivery' && order.status !== 'picked_up') return false;
        } else if (activeStatusTab === 'active') {
          if (
            order.status === 'delivered' ||
            order.status === 'cancelled' ||
            order.status === 'rejected'
          ) {
            return false;
          }
        } else if (order.status !== activeStatusTab) {
          return false;
        }
      }

      // Distance filter
      const roadKm = order.distanceTiming.roadDistanceKm;
      if (distanceFilter === 'under_2km' && roadKm >= 2.0) return false;
      if (distanceFilter === '2_to_5km' && (roadKm < 2.0 || roadKm > 5.0)) return false;
      if (distanceFilter === 'over_5km' && roadKm <= 5.0) return false;

      // Time filter
      const remainingMins = order.distanceTiming.actualRemainingMinutes;
      if (timeFilter === 'under_20m' && remainingMins >= 20) return false;
      if (timeFilter === '20_to_35m' && (remainingMins < 20 || remainingMins > 35)) return false;
      if (timeFilter === 'sla_risk') {
        const slaGap =
          order.distanceTiming.targetDeliveryMinutes - order.distanceTiming.minutesElapsed;
        if (slaGap > 6 || order.status === 'delivered' || order.status === 'rejected') {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesId = order.id.toLowerCase().includes(query);
        const matchesName = order.customerName.toLowerCase().includes(query);
        const matchesAddress = order.deliveryAddress.toLowerCase().includes(query);
        if (!matchesId && !matchesName && !matchesAddress) return false;
      }

      return true;
    });
  }, [orders, selectedRestaurantId, activeStatusTab, distanceFilter, timeFilter, searchQuery]);

  // Sort orders according to distance and time criteria
  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    list.sort((a, b) => {
      switch (sortCriterion) {
        case 'smart_urgency':
          return b.distanceTiming.urgencyScore - a.distanceTiming.urgencyScore;
        case 'shortest_distance':
          return a.distanceTiming.roadDistanceKm - b.distanceTiming.roadDistanceKm;
        case 'longest_distance':
          return b.distanceTiming.roadDistanceKm - a.distanceTiming.roadDistanceKm;
        case 'least_time_remaining':
          return a.distanceTiming.actualRemainingMinutes - b.distanceTiming.actualRemainingMinutes;
        case 'most_urgent_sla': {
          const aGap = a.distanceTiming.targetDeliveryMinutes - a.distanceTiming.minutesElapsed;
          const bGap = b.distanceTiming.targetDeliveryMinutes - b.distanceTiming.minutesElapsed;
          return aGap - bGap;
        }
        case 'newest':
          return b.createdAt - a.createdAt;
        default:
          return 0;
      }
    });
    return list;
  }, [filteredOrders, sortCriterion]);

  // Batch corridor opportunities for current restaurant
  const currentBatches = useMemo(() => {
    const relevant: { key: string; orderIds: string[] }[] = [];
    batchCorridors.forEach((ids, key) => {
      const restaurantOrders = ids.filter((id) => {
        const o = orders.find((ord) => ord.id === id);
        return o && o.restaurantId === selectedRestaurantId && o.status !== 'rejected';
      });
      if (restaurantOrders.length >= 2) {
        relevant.push({ key, orderIds: restaurantOrders });
      }
    });
    return relevant;
  }, [batchCorridors, orders, selectedRestaurantId]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header: Restaurant Switcher, Staff Profile & Settings */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 font-mono tracking-wider uppercase">
            <span>Kitchen & Dispatch Management Hub</span>
            {currentUser && currentUser.role === 'restaurant_staff' && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-medium">
                  Staff: {currentUser.name} ({currentUser.jobTitle})
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentRestaurant.name}</span>
              {currentRestaurant.isKitchenPaused && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                  Kitchen Paused
                </span>
              )}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>{currentRestaurant.cuisine}</span>
              <span aria-hidden="true">·</span>
              <span>{currentRestaurant.address}</span>
            </div>
          </div>
        </div>

        {/* Restaurant Selector, Settings Trigger & Traffic Mode */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 shadow-sm">
            <span className="text-slate-500 font-medium">Kitchen:</span>
            <select
              value={selectedRestaurantId}
              onChange={(e) => setSelectedRestaurantId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Manage Restaurant Details */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <Settings className="h-3.5 w-3.5 text-indigo-600" />
            <span>Restaurant Details</span>
          </button>

          {/* Toggle Top Performers Leaderboard */}
          <button
            onClick={() => setShowLeaderboard(!showLeaderboard)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              showLeaderboard
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 font-bold'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            <span>{showLeaderboard ? 'Hide Top Performers' : 'Top Performers (30D)'}</span>
          </button>

          {/* Toggle 7-Day Chart */}
          <button
            onClick={() => setShow7DayChart(!show7DayChart)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              show7DayChart
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
            <span>{show7DayChart ? 'Hide 7-Day Chart' : '7-Day Volume & Times'}</span>
          </button>

          {/* Traffic Condition Selector */}
          <div className="flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 shadow-sm">
            <span className="text-slate-500 font-medium">Traffic:</span>
            <select
              value={trafficCongestion}
              onChange={(e) =>
                setTrafficCongestion(
                  e.target.value as 'light' | 'moderate' | 'heavy'
                )
              }
              className="bg-transparent font-bold text-indigo-700 focus:outline-none cursor-pointer"
            >
              <option value="light">Light (1.0x)</option>
              <option value="moderate">Moderate (1.15x)</option>
              <option value="heavy">Heavy Rush (1.4x)</option>
            </select>
          </div>

          <button
            onClick={() => setShowMapSplit(!showMapSplit)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
              showMapSplit
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            {showMapSplit ? 'Hide Live Map' : 'Show Live Map'}
          </button>
        </div>
      </div>

      {/* High-Density Analytics Bar */}
      <DistanceTimeAnalytics />

      {/* Top Performers 30-Day Leaderboard (Delivery Speed & Completed Volume) */}
      {showLeaderboard && (
        <TopPerformersLeaderboard
          couriers={couriers}
          orders={orders}
          onSelectCourier={(id) => setSelectedOrderId(id)}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {/* 7-Day Order Volume & Delivery Times Recharts Component */}
      {show7DayChart && (
        <OrderVolumeAnalyticsChart restaurantId={selectedRestaurantId} />
      )}

      {/* Corridor Batching Recommendation Opportunity */}
      {currentBatches.length > 0 && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Smart Delivery Corridor Match Detected
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Orders {currentBatches[0].orderIds.join(' and ')} are along the same street corridor (within 1.2 km). Grouping them saves transit miles and ensures synchronized departure.
                </p>
              </div>
            </div>

            <button
              onClick={() => batchAssignCorridor(currentBatches[0].orderIds)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-xs font-bold text-white hover:bg-indigo-700 transition-colors whitespace-nowrap self-start sm:self-auto shadow-sm"
            >
              Batch Dispatch Both
            </button>
          </div>
        </div>
      )}

      {/* Distance and Time Control Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4 shadow-sm">
        {/* Row 1: Search & Sort Criterion */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order ID (#ORD-), customer name, or street..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <ArrowUpDown className="h-3.5 w-3.5 text-amber-600" />
              <span>Prioritize By:</span>
            </div>
            <select
              value={sortCriterion}
              onChange={(e) => setSortCriterion(e.target.value as SortCriterion)}
              className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="smart_urgency">Smart Urgency Score (Priority SLA)</option>
              <option value="shortest_distance">Shortest Distance (Fast Turnaround)</option>
              <option value="longest_distance">Longest Distance (Early Dispatch)</option>
              <option value="least_time_remaining">Least Time Remaining (Immediate ETA)</option>
              <option value="most_urgent_sla">Critical SLA Buffer</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Row 2: Distance & Time Segmented Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          {/* Distance Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <MapPin className="h-3 w-3 text-amber-600" />
              <span>Distance:</span>
            </span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setDistanceFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  distanceFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setDistanceFilter('under_2km')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  distanceFilter === 'under_2km'
                    ? 'bg-white text-amber-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 2.0 km (Express)
              </button>
              <button
                onClick={() => setDistanceFilter('2_to_5km')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  distanceFilter === '2_to_5km'
                    ? 'bg-white text-amber-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2.0 - 5.0 km
              </button>
              <button
                onClick={() => setDistanceFilter('over_5km')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  distanceFilter === 'over_5km'
                    ? 'bg-white text-amber-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &gt; 5.0 km
              </button>
            </div>
          </div>

          {/* Time Filter Controls */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-slate-500 mr-1 flex items-center gap-1">
              <Clock className="h-3 w-3 text-blue-600" />
              <span>Timing Window:</span>
            </span>
            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setTimeFilter('under_20m')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeFilter === 'under_20m'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                &lt; 20m ETA
              </button>
              <button
                onClick={() => setTimeFilter('20_to_35m')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  timeFilter === '20_to_35m'
                    ? 'bg-white text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                20 - 35m ETA
              </button>
              <button
                onClick={() => setTimeFilter('sla_risk')}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  timeFilter === 'sla_risk'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <AlertTriangle className="h-3 w-3 text-rose-600" />
                <span>SLA Alerts</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center justify-between overflow-x-auto pb-1">
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
          {[
            { id: 'all', label: 'All' },
            { id: 'received', label: 'New' },
            { id: 'preparing', label: 'Preparing' },
            { id: 'ready', label: 'Ready' },
            { id: 'out_for_delivery', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => {
            const count = orders.filter((o) => {
              if (o.restaurantId !== selectedRestaurantId) return false;
              if (tab.id === 'all') return true;
              if (tab.id === 'active') {
                return (
                  o.status !== 'delivered' &&
                  o.status !== 'cancelled' &&
                  o.status !== 'rejected'
                );
              }
              if (tab.id === 'out_for_delivery') {
                return o.status === 'out_for_delivery' || o.status === 'picked_up';
              }
              if (tab.id === 'received') {
                return o.status === 'received';
              }
              return o.status === tab.id;
            }).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveStatusTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeStatusTab === tab.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 font-mono text-[11px] opacity-80 tabular-nums">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <span className="text-xs font-mono text-slate-500 hidden sm:inline">
          Showing {sortedOrders.length} orders
        </span>
      </div>

      {/* Main Content Area: Split View (Orders List + Live Map) */}
      <div
        className={`grid grid-cols-1 ${
          showMapSplit ? 'lg:grid-cols-12' : ''
        } gap-6 items-start`}
      >
        {/* Orders Queue Column */}
        <div className={`${showMapSplit ? 'lg:col-span-7' : 'w-full'} space-y-3`}>
          {sortedOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Clock className="mx-auto h-8 w-8 text-slate-400 mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No orders match your current distance, time, and status filter settings. Try adjusting your filter parameters or simulate a new order.
              </p>
            </div>
          ) : (
            sortedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onSelectForMap={(id) => setSelectedOrderId(id)}
                onOpenRejectModal={(ord) => setRejectingOrder(ord)}
              />
            ))
          )}
        </div>

        {/* Live Map Column */}
        {showMapSplit && (
          <div className="lg:col-span-5 sticky top-20 space-y-3">
            <LiveDeliveryMap
              focusedOrderId={selectedOrderId}
              onSelectOrder={(id) => setSelectedOrderId(id)}
              heightClass="h-[620px]"
              initialHeatmap={true}
            />
          </div>
        )}
      </div>

      {/* Order Rejection Modal */}
      {rejectingOrder && (
        <RejectOrderModal
          order={rejectingOrder}
          onClose={() => setRejectingOrder(null)}
          onConfirmReject={(orderId, reason) => {
            rejectOrder(orderId, reason);
          }}
        />
      )}

      {/* Restaurant Details Management Modal */}
      {isSettingsOpen && (
        <RestaurantSettingsModal
          restaurant={currentRestaurant}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </div>
  );
};

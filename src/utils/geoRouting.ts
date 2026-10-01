import { Courier, Order, VehicleType } from '../types/delivery';

// Earth radius in kilometers
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight line distance between two coordinates using Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c * 100) / 100;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Generates realistic urban road waypoints between two coordinates.
 * Instead of a single straight diagonal, this simulates navigating city grid blocks and turns.
 */
export function generateRealisticRoadRoute(
  startLat: number,
  startLng: number,
  endLat: number,
  endLng: number,
  segments: number = 8
): [number, number][] {
  const waypoints: [number, number][] = [[startLat, startLng]];

  const latDelta = endLat - startLat;
  const lngDelta = endLng - startLng;

  // Midpoint corner 1 and corner 2 to simulate street grid routing (Manhattan grid style with gentle curve)
  // Step 1: initial street exit
  const p1: [number, number] = [
    startLat + latDelta * 0.15 + (Math.sin(startLat * 10) * 0.001),
    startLng + lngDelta * 0.05
  ];
  // Step 2: main avenue traversal
  const p2: [number, number] = [
    startLat + latDelta * 0.45,
    startLng + lngDelta * 0.25
  ];
  // Step 3: primary cross-street turn
  const p3: [number, number] = [
    startLat + latDelta * 0.55,
    startLng + lngDelta * 0.65
  ];
  // Step 4: secondary street
  const p4: [number, number] = [
    startLat + latDelta * 0.85,
    startLng + lngDelta * 0.85
  ];
  // Step 5: final arrival approach
  const p5: [number, number] = [
    startLat + latDelta * 0.96,
    startLng + lngDelta * 0.98
  ];

  waypoints.push(p1, p2, p3, p4, p5, [endLat, endLng]);
  return waypoints;
}

/**
 * Approximates realistic road distance in km (typically ~1.28x of straight Euclidean)
 */
export function calculateRoadDistanceKm(straightKm: number): number {
  return Math.round(straightKm * 1.28 * 10) / 10;
}

/**
 * Typical city speed by courier vehicle type
 */
export function getVehicleSpeedKmh(vehicle: VehicleType): number {
  switch (vehicle) {
    case 'ebike':
      return 22; // nimble in city traffic
    case 'scooter':
      return 28;
    case 'car':
      return 24; // impacted by congestion
    case 'van':
      return 20;
    default:
      return 22;
  }
}

/**
 * Estimate transit time in minutes given road distance and vehicle type
 */
export function estimateTransitMinutes(
  roadDistanceKm: number,
  vehicle: VehicleType = 'ebike',
  trafficFactor: number = 1.15
): number {
  const speed = getVehicleSpeedKmh(vehicle);
  const hours = (roadDistanceKm / speed) * trafficFactor;
  // Add 2 minutes parking/pickup/dropoff buffer
  return Math.max(3, Math.round(hours * 60 + 2));
}

/**
 * Calculates current position along multi-segment waypoints given progress percentage (0 - 100)
 */
export function getPositionAlongRoute(
  waypoints: [number, number][],
  progressPct: number
): [number, number] {
  if (!waypoints || waypoints.length === 0) return [0, 0];
  if (waypoints.length === 1 || progressPct <= 0) return waypoints[0];
  if (progressPct >= 100) return waypoints[waypoints.length - 1];

  const totalSegments = waypoints.length - 1;
  const scaledProgress = (progressPct / 100) * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalSegments - 1);
  const segmentFraction = scaledProgress - segmentIndex;

  const start = waypoints[segmentIndex];
  const end = waypoints[segmentIndex + 1];

  const lat = start[0] + (end[0] - start[0]) * segmentFraction;
  const lng = start[1] + (end[1] - start[1]) * segmentFraction;

  return [lat, lng];
}

/**
 * Smart Dispatch / Urgency Score calculation (0 - 100)
 * Higher score = higher dispatch priority
 */
export function calculateUrgencyScore(
  status: Order['status'],
  minutesElapsed: number,
  targetDeliveryMinutes: number,
  roadDistanceKm: number,
  priority: 'standard' | 'express'
): number {
  if (status === 'delivered' || status === 'cancelled') return 0;

  let score = 20;

  // Factor 1: Express orders get automatic boost
  if (priority === 'express') score += 15;

  // Factor 2: SLA Risk (Remaining time vs Target)
  const remainingTarget = targetDeliveryMinutes - minutesElapsed;
  if (remainingTarget <= 5) {
    score += 45; // Critical SLA danger
  } else if (remainingTarget <= 12) {
    score += 30; // Approaching SLA limit
  } else if (remainingTarget <= 20) {
    score += 15;
  }

  // Factor 3: Food quality / status timing
  if (status === 'ready') {
    // Food is sitting on counter getting cold! Needs immediate pickup
    score += 25;
  } else if (status === 'preparing' && minutesElapsed > 10) {
    score += 15;
  } else if (status === 'out_for_delivery') {
    score += 10;
  }

  // Factor 4: Distance compensation
  // Orders far away (> 5km) need earlier dispatch to arrive on time
  if (roadDistanceKm > 5) {
    score += 10;
  }

  return Math.min(100, Math.max(5, Math.round(score)));
}

/**
 * Finds the most optimal courier for an order based on:
 * 1. Proximity to restaurant
 * 2. Courier status (idle first)
 * 3. Vehicle efficiency
 */
export function findBestCourierForOrder(
  couriers: Courier[],
  restaurantLat: number,
  restaurantLng: number
): { courier: Courier | null; distanceToRestaurantKm: number } {
  const availableCouriers = couriers.filter(
    (c) => c.status === 'idle' || c.status === 'assigned'
  );

  if (availableCouriers.length === 0) {
    return { courier: null, distanceToRestaurantKm: 0 };
  }

  let bestCourier = availableCouriers[0];
  let minScore = Infinity;
  let bestDistance = 0;

  for (const courier of availableCouriers) {
    const distKm = calculateHaversineDistanceKm(
      courier.lat,
      courier.lng,
      restaurantLat,
      restaurantLng
    );

    // Score: distance (lower is better) + status penalty (if already assigned)
    let score = distKm;
    if (courier.status === 'assigned') score += 2.5;

    // E-bikes have high city agility for < 4km, cars better for > 5km
    if (distKm < 4 && courier.vehicleType === 'ebike') score -= 0.5;

    if (score < minScore) {
      minScore = score;
      bestCourier = courier;
      bestDistance = distKm;
    }
  }

  return { courier: bestCourier, distanceToRestaurantKm: bestDistance };
}

/**
 * Detects order clusters that can be batched together along the same delivery corridor
 */
export function detectBatchableOrders(orders: Order[]): Map<string, string[]> {
  const batches = new Map<string, string[]>();
  const activeOrders = orders.filter(
    (o) => o.status === 'received' || o.status === 'preparing' || o.status === 'ready'
  );

  for (let i = 0; i < activeOrders.length; i++) {
    for (let j = i + 1; j < activeOrders.length; j++) {
      const o1 = activeOrders[i];
      const o2 = activeOrders[j];

      // Same restaurant (or within 0.8km)
      const restDist = calculateHaversineDistanceKm(
        o1.restaurantLat,
        o1.restaurantLng,
        o2.restaurantLat,
        o2.restaurantLng
      );

      // Customer drops within 1.4km of each other
      const custDist = calculateHaversineDistanceKm(
        o1.customerLat,
        o1.customerLng,
        o2.customerLat,
        o2.customerLng
      );

      // Time placed within 12 minutes of each other
      const timeDiffMins = Math.abs(o1.createdAt - o2.createdAt) / 60000;

      if (restDist <= 0.8 && custDist <= 1.4 && timeDiffMins <= 14) {
        const batchKey = `CORRIDOR-${o1.restaurantId.slice(-3)}-${Math.min(
          o1.customerLat,
          o2.customerLat
        ).toFixed(2)}`;

        const existing = batches.get(batchKey) || [];
        if (!existing.includes(o1.id)) existing.push(o1.id);
        if (!existing.includes(o2.id)) existing.push(o2.id);
        batches.set(batchKey, existing);
      }
    }
  }

  return batches;
}

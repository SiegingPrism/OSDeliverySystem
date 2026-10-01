import { Courier, Order, Restaurant } from '../types/delivery';
import {
  calculateHaversineDistanceKm,
  calculateRoadDistanceKm,
  calculateUrgencyScore,
  estimateTransitMinutes,
  generateRealisticRoadRoute,
  getPositionAlongRoute,
} from '../utils/geoRouting';

// Metropolitan coordinates centered around downtown
// Base Center: 37.7749, -122.4194 (San Francisco style urban layout)
export const CITY_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
  name: 'Metro Center',
};

export const INITIAL_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: "L'Artigiano Woodfired Pizza",
    cuisine: 'Artisanal Italian',
    rating: 4.9,
    reviewsCount: 382,
    address: '452 Columbus Avenue, North Beach',
    lat: 37.7988,
    lng: -122.4072,
    currentPrepQueueMinutes: 14,
    avgPrepTimeMinutes: 16,
    maxDeliveryRadiusKm: 6.5,
    phone: '+1 (415) 890-2341',
    themeColor: '#e11d48', // rose
    isOpen: true,
    isKitchenPaused: false,
    menu: [
      {
        id: 'menu-101',
        name: 'Margherita D.O.P.',
        description: 'San Marzano tomatoes, buffalo mozzarella, fresh basil, organic olive oil',
        price: 18.5,
        prepTimeMinutes: 12,
        category: 'Pizzas',
        popular: true,
      },
      {
        id: 'menu-102',
        name: 'Diavola & Hot Honey',
        description: 'Spicy calabrese salame, smoked provolone, wild oregano, habanero honey drizzle',
        price: 21.0,
        prepTimeMinutes: 14,
        category: 'Pizzas',
        popular: true,
      },
      {
        id: 'menu-103',
        name: 'Tartufo & Wild Mushroom',
        description: 'Roasted maitake, black truffle cream, fontina cheese, fresh thyme',
        price: 23.5,
        prepTimeMinutes: 15,
        category: 'Pizzas',
      },
      {
        id: 'menu-104',
        name: 'Burrata Pugliese',
        description: 'Creamy burrata, heirloom cherry tomatoes, toasted pine nuts, grilled focaccia',
        price: 15.0,
        prepTimeMinutes: 8,
        category: 'Starters',
      },
    ],
  },
  {
    id: 'rest-2',
    name: 'SmashCraft Prime Burgers',
    cuisine: 'Gourmet American',
    rating: 4.8,
    reviewsCount: 512,
    address: '884 Mission Street, SoMa',
    lat: 37.7825,
    lng: -122.4047,
    currentPrepQueueMinutes: 10,
    avgPrepTimeMinutes: 12,
    maxDeliveryRadiusKm: 7.0,
    phone: '+1 (415) 762-9912',
    themeColor: '#ea580c', // orange
    isOpen: true,
    isKitchenPaused: false,
    menu: [
      {
        id: 'menu-201',
        name: 'Double Truffle Smash',
        description: 'Two dry-aged patties, black garlic aioli, caramelized shallots, gruyere',
        price: 17.5,
        prepTimeMinutes: 10,
        category: 'Burgers',
        popular: true,
      },
      {
        id: 'menu-202',
        name: 'Crispy Nashville Hot Bird',
        description: 'Double fried pasture chicken thigh, habanero slaw, house dill pickles, brioche',
        price: 16.0,
        prepTimeMinutes: 12,
        category: 'Sandwiches',
        popular: true,
      },
      {
        id: 'menu-203',
        name: 'Rosemary Sea Salt Frites',
        description: 'Twice-cooked Kennebec potatoes with smoked paprika dip and truffle mayo',
        price: 7.5,
        prepTimeMinutes: 6,
        category: 'Sides',
      },
    ],
  },
  {
    id: 'rest-3',
    name: 'Tokyo Craft Ramen Bar',
    cuisine: 'Japanese Ramen & Izakaya',
    rating: 4.9,
    reviewsCount: 640,
    address: '1210 Polk Street, Nob Hill',
    lat: 37.7901,
    lng: -122.4208,
    currentPrepQueueMinutes: 18,
    avgPrepTimeMinutes: 15,
    maxDeliveryRadiusKm: 6.0,
    phone: '+1 (415) 540-1129',
    themeColor: '#0284c7', // sky
    isOpen: true,
    isKitchenPaused: false,
    menu: [
      {
        id: 'menu-301',
        name: '24-Hour Tonkotsu Deluxe',
        description: 'Rich slow-simmered pork broth, hand-pulled noodles, torched chashu, ajitsuke tamago',
        price: 19.5,
        prepTimeMinutes: 14,
        category: 'Ramen',
        popular: true,
      },
      {
        id: 'menu-302',
        name: 'Spicy Black Sesame TanTan',
        description: 'Roasted sesame tare, spiced plant protein, bok choy, chili crunch oil',
        price: 18.5,
        prepTimeMinutes: 13,
        category: 'Ramen',
      },
      {
        id: 'menu-303',
        name: 'Pan-Seared Wagyu Gyoza (6pc)',
        description: 'A5 minced wagyu, scallion, garlic chives with spicy black vinegar dip',
        price: 12.0,
        prepTimeMinutes: 8,
        category: 'Izakaya',
        popular: true,
      },
    ],
  },
  {
    id: 'rest-4',
    name: 'Verde Organic Bowls & Greens',
    cuisine: 'Healthy Mediterranean & Bowls',
    rating: 4.7,
    reviewsCount: 290,
    address: '220 Hayes Street, Civic Center',
    lat: 37.7768,
    lng: -122.4215,
    currentPrepQueueMinutes: 8,
    avgPrepTimeMinutes: 9,
    maxDeliveryRadiusKm: 5.5,
    phone: '+1 (415) 332-4488',
    themeColor: '#059669', // emerald
    isOpen: true,
    isKitchenPaused: false,
    menu: [
      {
        id: 'menu-401',
        name: 'Super Green Harvest Bowl',
        description: 'Wild grains, roasted sweet potato, charred broccoli, avocado, tahini citrus dressing',
        price: 15.5,
        prepTimeMinutes: 8,
        category: 'Bowls',
        popular: true,
      },
      {
        id: 'menu-402',
        name: 'Harissa Grilled Salmon Bowl',
        description: 'Wild Alaskan salmon, spiced quinoa, marinated cucumber, pickled radish, sumac',
        price: 19.0,
        prepTimeMinutes: 10,
        category: 'Bowls',
      },
      {
        id: 'menu-403',
        name: 'Cold-Pressed Golden Turmeric Elixir',
        description: 'Fresh pressed orange, turmeric root, ginger, black pepper, honey',
        price: 6.5,
        prepTimeMinutes: 2,
        category: 'Drinks',
      },
    ],
  },
];

export const INITIAL_COURIERS: Courier[] = [
  {
    id: 'courier-1',
    name: 'Mateo Rossi',
    phone: '+1 (415) 555-0142',
    rating: 4.96,
    totalDeliveries: 1420,
    vehicleType: 'ebike',
    avgSpeedKmh: 24,
    lat: 37.794,
    lng: -122.409,
    status: 'delivering',
    currentOrderId: 'ORD-8821',
    batteryPct: 88,
    performance30d: {
      completedOrders30d: 342,
      avgSpeedKmh: 24.2,
      avgTransitMinutes: 11.2,
      onTimeRatePct: 98.8,
      rating: 4.96,
      totalDistanceKm: 890,
      positiveFeedbackPct: 99.1,
    },
  },
  {
    id: 'courier-2',
    name: 'Kenji Takahashi',
    phone: '+1 (415) 555-0177',
    rating: 4.92,
    totalDeliveries: 980,
    vehicleType: 'scooter',
    avgSpeedKmh: 28,
    lat: 37.788,
    lng: -122.416,
    status: 'delivering',
    currentOrderId: 'ORD-8822',
    batteryPct: 74,
    performance30d: {
      completedOrders30d: 310,
      avgSpeedKmh: 28.5,
      avgTransitMinutes: 9.6,
      onTimeRatePct: 99.2,
      rating: 4.92,
      totalDistanceKm: 940,
      positiveFeedbackPct: 98.4,
    },
  },
  {
    id: 'courier-3',
    name: 'Elena Morales',
    phone: '+1 (415) 555-0199',
    rating: 4.89,
    totalDeliveries: 760,
    vehicleType: 'ebike',
    avgSpeedKmh: 22,
    lat: 37.797,
    lng: -122.405,
    status: 'idle',
    batteryPct: 95,
    performance30d: {
      completedOrders30d: 215,
      avgSpeedKmh: 22.8,
      avgTransitMinutes: 12.2,
      onTimeRatePct: 97.6,
      rating: 4.89,
      totalDistanceKm: 560,
      positiveFeedbackPct: 96.8,
    },
  },
  {
    id: 'courier-4',
    name: 'Marcus Vance',
    phone: '+1 (415) 555-0211',
    rating: 4.94,
    totalDeliveries: 2150,
    vehicleType: 'car',
    avgSpeedKmh: 26,
    lat: 37.781,
    lng: -122.402,
    status: 'idle',
    batteryPct: 62,
    performance30d: {
      completedOrders30d: 395,
      avgSpeedKmh: 25.8,
      avgTransitMinutes: 11.4,
      onTimeRatePct: 98.4,
      rating: 4.94,
      totalDistanceKm: 1180,
      positiveFeedbackPct: 98.9,
    },
  },
  {
    id: 'courier-5',
    name: 'Priya Patel',
    phone: '+1 (415) 555-0233',
    rating: 4.98,
    totalDeliveries: 1890,
    vehicleType: 'ebike',
    avgSpeedKmh: 23,
    lat: 37.773,
    lng: -122.418,
    status: 'assigned',
    currentOrderId: 'ORD-8823',
    batteryPct: 81,
    performance30d: {
      completedOrders30d: 368,
      avgSpeedKmh: 24.5,
      avgTransitMinutes: 10.8,
      onTimeRatePct: 99.6,
      rating: 4.98,
      totalDistanceKm: 1020,
      positiveFeedbackPct: 99.7,
    },
  },
  {
    id: 'courier-6',
    name: 'Lucas Silva',
    phone: '+1 (415) 555-0288',
    rating: 4.91,
    totalDeliveries: 1120,
    vehicleType: 'scooter',
    avgSpeedKmh: 27,
    lat: 37.798,
    lng: -122.399,
    status: 'idle',
    batteryPct: 89,
    performance30d: {
      completedOrders30d: 290,
      avgSpeedKmh: 27.2,
      avgTransitMinutes: 10.3,
      onTimeRatePct: 98.1,
      rating: 4.91,
      totalDistanceKm: 810,
      positiveFeedbackPct: 97.9,
    },
  },
  {
    id: 'courier-7',
    name: 'Chloe Chen',
    phone: '+1 (415) 555-0312',
    rating: 4.95,
    totalDeliveries: 1640,
    vehicleType: 'ebike',
    avgSpeedKmh: 24,
    lat: 37.776,
    lng: -122.394,
    status: 'idle',
    batteryPct: 93,
    performance30d: {
      completedOrders30d: 355,
      avgSpeedKmh: 25.4,
      avgTransitMinutes: 11.0,
      onTimeRatePct: 99.0,
      rating: 4.95,
      totalDistanceKm: 970,
      positiveFeedbackPct: 99.2,
    },
  },
  {
    id: 'courier-8',
    name: 'Jackson Reed',
    phone: '+1 (415) 555-0344',
    rating: 4.88,
    totalDeliveries: 840,
    vehicleType: 'ebike',
    avgSpeedKmh: 21,
    lat: 37.795,
    lng: -122.401,
    status: 'delivering',
    batteryPct: 78,
    performance30d: {
      completedOrders30d: 225,
      avgSpeedKmh: 22.1,
      avgTransitMinutes: 12.8,
      onTimeRatePct: 96.9,
      rating: 4.88,
      totalDistanceKm: 610,
      positiveFeedbackPct: 96.2,
    },
  },
  {
    id: 'courier-9',
    name: 'Sophie Martin',
    phone: '+1 (415) 555-0390',
    rating: 4.93,
    totalDeliveries: 1310,
    vehicleType: 'van',
    avgSpeedKmh: 25,
    lat: 37.784,
    lng: -122.423,
    status: 'idle',
    batteryPct: 71,
    performance30d: {
      completedOrders30d: 280,
      avgSpeedKmh: 25.0,
      avgTransitMinutes: 11.6,
      onTimeRatePct: 98.2,
      rating: 4.93,
      totalDistanceKm: 850,
      positiveFeedbackPct: 98.0,
    },
  },
];

// Helper to construct mock initial orders
export function generateInitialOrders(): Order[] {
  const now = Date.now();

  // Order 1: Out for delivery (Express burger order to Financial District)
  const restBurger = INITIAL_RESTAURANTS[1];
  const custLat1 = 37.7915;
  const custLng1 = -122.3985;
  const straightDist1 = calculateHaversineDistanceKm(
    restBurger.lat,
    restBurger.lng,
    custLat1,
    custLng1
  );
  const roadDist1 = calculateRoadDistanceKm(straightDist1);
  const transit1 = estimateTransitMinutes(roadDist1, 'ebike');
  const routeWaypoints1 = generateRealisticRoadRoute(
    restBurger.lat,
    restBurger.lng,
    custLat1,
    custLng1
  );
  const progressPct1 = 65;
  const courierPos1 = getPositionAlongRoute(routeWaypoints1, progressPct1);
  const remainingDist1 = Math.max(0.2, Math.round(roadDist1 * (1 - progressPct1 / 100) * 10) / 10);
  const remainingMins1 = Math.max(2, Math.round(transit1 * (1 - progressPct1 / 100)));

  const order1: Order = {
    id: 'ORD-8821',
    customerName: 'Sophia Lin',
    customerPhone: '+1 (415) 309-8811',
    deliveryAddress: '333 Bush Street, Apt 14B, Financial District',
    customerLat: custLat1,
    customerLng: custLng1,
    restaurantId: restBurger.id,
    restaurantName: restBurger.name,
    restaurantLat: restBurger.lat,
    restaurantLng: restBurger.lng,
    courierId: 'courier-1',
    courierName: 'Mateo Rossi',
    courierVehicle: 'ebike',
    courierPhone: '+1 (415) 555-0142',
    items: [
      {
        id: 'item-1',
        menuItemId: 'menu-201',
        name: 'Double Truffle Smash',
        price: 17.5,
        quantity: 2,
        instructions: 'Extra caramelized shallots, medium well',
      },
      {
        id: 'item-2',
        menuItemId: 'menu-203',
        name: 'Rosemary Sea Salt Frites',
        price: 7.5,
        quantity: 1,
      },
    ],
    subtotal: 42.5,
    deliveryFee: 3.99,
    tax: 3.82,
    tip: 7.0,
    total: 57.31,
    status: 'out_for_delivery',
    createdAt: now - 22 * 60 * 1000,
    prepStartedAt: now - 20 * 60 * 1000,
    readyAt: now - 9 * 60 * 1000,
    pickedUpAt: now - 7 * 60 * 1000,
    priority: 'express',
    deliveryNotes: 'Call box #1402, leave at apartment door on 14th floor',
    distanceTiming: {
      straightDistanceKm: straightDist1,
      roadDistanceKm: roadDist1,
      estimatedPrepMinutes: 12,
      estimatedTransitMinutes: transit1,
      totalEstimatedMinutes: 12 + transit1,
      targetDeliveryMinutes: 28,
      minutesElapsed: 22,
      actualRemainingMinutes: remainingMins1,
      urgencyScore: calculateUrgencyScore(
        'out_for_delivery',
        22,
        28,
        roadDist1,
        'express'
      ),
      routeWaypoints: routeWaypoints1,
      courierPosition: courierPos1,
      routeProgressPct: progressPct1,
      distanceRemainingKm: remainingDist1,
      speedMultiplier: 1,
    },
    chatMessages: [
      {
        id: 'msg-init-1',
        sender: 'driver',
        senderName: 'Mateo Rossi',
        message: "Hi Alex! I've picked up your order and I'm en route. Feel free to message here if you have any gate codes or drop-off instructions!",
        timestamp: now - 6 * 60 * 1000,
      },
    ],
  };

  // Order 2: Out for delivery (Ramen to Russian Hill)
  const restRamen = INITIAL_RESTAURANTS[2];
  const custLat2 = 37.8012;
  const custLng2 = -122.4172;
  const straightDist2 = calculateHaversineDistanceKm(
    restRamen.lat,
    restRamen.lng,
    custLat2,
    custLng2
  );
  const roadDist2 = calculateRoadDistanceKm(straightDist2);
  const transit2 = estimateTransitMinutes(roadDist2, 'scooter');
  const routeWaypoints2 = generateRealisticRoadRoute(
    restRamen.lat,
    restRamen.lng,
    custLat2,
    custLng2
  );
  const progressPct2 = 35;
  const courierPos2 = getPositionAlongRoute(routeWaypoints2, progressPct2);
  const remainingDist2 = Math.max(0.4, Math.round(roadDist2 * (1 - progressPct2 / 100) * 10) / 10);
  const remainingMins2 = Math.max(3, Math.round(transit2 * (1 - progressPct2 / 100)));

  const order2: Order = {
    id: 'ORD-8822',
    customerName: 'Alexander Hayes',
    customerPhone: '+1 (415) 778-9034',
    deliveryAddress: '1420 Hyde Street, Russian Hill',
    customerLat: custLat2,
    customerLng: custLng2,
    restaurantId: restRamen.id,
    restaurantName: restRamen.name,
    restaurantLat: restRamen.lat,
    restaurantLng: restRamen.lng,
    courierId: 'courier-2',
    courierName: 'Kenji Takahashi',
    courierVehicle: 'scooter',
    courierPhone: '+1 (415) 555-0177',
    items: [
      {
        id: 'item-3',
        menuItemId: 'menu-301',
        name: '24-Hour Tonkotsu Deluxe',
        price: 19.5,
        quantity: 2,
        instructions: 'Noodles extra firm, broth separate container',
      },
      {
        id: 'item-4',
        menuItemId: 'menu-303',
        name: 'Pan-Seared Wagyu Gyoza (6pc)',
        price: 12.0,
        quantity: 1,
      },
    ],
    subtotal: 51.0,
    deliveryFee: 4.49,
    tax: 4.59,
    tip: 8.5,
    total: 68.58,
    status: 'out_for_delivery',
    createdAt: now - 18 * 60 * 1000,
    prepStartedAt: now - 17 * 60 * 1000,
    readyAt: now - 6 * 60 * 1000,
    pickedUpAt: now - 4 * 60 * 1000,
    priority: 'standard',
    deliveryNotes: 'Ring bell on left gate, watch out for friendly golden retriever',
    distanceTiming: {
      straightDistanceKm: straightDist2,
      roadDistanceKm: roadDist2,
      estimatedPrepMinutes: 14,
      estimatedTransitMinutes: transit2,
      totalEstimatedMinutes: 14 + transit2,
      targetDeliveryMinutes: 32,
      minutesElapsed: 18,
      actualRemainingMinutes: remainingMins2,
      urgencyScore: calculateUrgencyScore(
        'out_for_delivery',
        18,
        32,
        roadDist2,
        'standard'
      ),
      routeWaypoints: routeWaypoints2,
      courierPosition: courierPos2,
      routeProgressPct: progressPct2,
      distanceRemainingKm: remainingDist2,
      speedMultiplier: 1,
    },
  };

  // Order 3: Ready for pickup (Woodfired Pizza - hot and waiting for assigned courier)
  const restPizza = INITIAL_RESTAURANTS[0];
  const custLat3 = 37.8045;
  const custLng3 = -122.4112; // North Beach / Telegraph Hill
  const straightDist3 = calculateHaversineDistanceKm(
    restPizza.lat,
    restPizza.lng,
    custLat3,
    custLng3
  );
  const roadDist3 = calculateRoadDistanceKm(straightDist3);
  const transit3 = estimateTransitMinutes(roadDist3, 'ebike');
  const routeWaypoints3 = generateRealisticRoadRoute(
    restPizza.lat,
    restPizza.lng,
    custLat3,
    custLng3
  );

  const order3: Order = {
    id: 'ORD-8823',
    customerName: 'Isabella Zhang',
    customerPhone: '+1 (415) 662-1100',
    deliveryAddress: '550 Union Street, Telegraph Hill',
    customerLat: custLat3,
    customerLng: custLng3,
    restaurantId: restPizza.id,
    restaurantName: restPizza.name,
    restaurantLat: restPizza.lat,
    restaurantLng: restPizza.lng,
    courierId: 'courier-5',
    courierName: 'Priya Patel',
    courierVehicle: 'ebike',
    courierPhone: '+1 (415) 555-0233',
    items: [
      {
        id: 'item-5',
        menuItemId: 'menu-101',
        name: 'Margherita D.O.P.',
        price: 18.5,
        quantity: 1,
      },
      {
        id: 'item-6',
        menuItemId: 'menu-102',
        name: 'Diavola & Hot Honey',
        price: 21.0,
        quantity: 1,
      },
    ],
    subtotal: 39.5,
    deliveryFee: 2.99,
    tax: 3.55,
    tip: 6.0,
    total: 52.04,
    status: 'ready',
    createdAt: now - 15 * 60 * 1000,
    prepStartedAt: now - 14 * 60 * 1000,
    readyAt: now - 2 * 60 * 1000,
    priority: 'standard',
    deliveryNotes: 'Steep hill stairs, drop in package lockbox code 4491',
    distanceTiming: {
      straightDistanceKm: straightDist3,
      roadDistanceKm: roadDist3,
      estimatedPrepMinutes: 14,
      estimatedTransitMinutes: transit3,
      totalEstimatedMinutes: 14 + transit3,
      targetDeliveryMinutes: 28,
      minutesElapsed: 15,
      actualRemainingMinutes: transit3,
      urgencyScore: calculateUrgencyScore('ready', 15, 28, roadDist3, 'standard'),
      routeWaypoints: routeWaypoints3,
      courierPosition: [restPizza.lat, restPizza.lng],
      routeProgressPct: 0,
      distanceRemainingKm: roadDist3,
      speedMultiplier: 1,
    },
  };

  // Order 4: Preparing in kitchen (Organic Bowls - close distance, high throughput)
  const restBowls = INITIAL_RESTAURANTS[3];
  const custLat4 = 37.7721;
  const custLng4 = -122.4312; // Hayes Valley / Lower Haight
  const straightDist4 = calculateHaversineDistanceKm(
    restBowls.lat,
    restBowls.lng,
    custLat4,
    custLng4
  );
  const roadDist4 = calculateRoadDistanceKm(straightDist4);
  const transit4 = estimateTransitMinutes(roadDist4, 'ebike');
  const routeWaypoints4 = generateRealisticRoadRoute(
    restBowls.lat,
    restBowls.lng,
    custLat4,
    custLng4
  );

  const order4: Order = {
    id: 'ORD-8824',
    customerName: 'Devon Miller',
    customerPhone: '+1 (415) 889-4412',
    deliveryAddress: '490 Haight Street, Lower Haight',
    customerLat: custLat4,
    customerLng: custLng4,
    restaurantId: restBowls.id,
    restaurantName: restBowls.name,
    restaurantLat: restBowls.lat,
    restaurantLng: restBowls.lng,
    items: [
      {
        id: 'item-7',
        menuItemId: 'menu-401',
        name: 'Super Green Harvest Bowl',
        price: 15.5,
        quantity: 2,
        instructions: 'Dressing on the side please',
      },
      {
        id: 'item-8',
        menuItemId: 'menu-403',
        name: 'Cold-Pressed Golden Turmeric Elixir',
        price: 6.5,
        quantity: 2,
      },
    ],
    subtotal: 44.0,
    deliveryFee: 3.49,
    tax: 3.96,
    tip: 6.5,
    total: 57.95,
    status: 'preparing',
    createdAt: now - 8 * 60 * 1000,
    prepStartedAt: now - 7 * 60 * 1000,
    priority: 'standard',
    deliveryNotes: 'Front lobby reception is open 24/7',
    distanceTiming: {
      straightDistanceKm: straightDist4,
      roadDistanceKm: roadDist4,
      estimatedPrepMinutes: 9,
      estimatedTransitMinutes: transit4,
      totalEstimatedMinutes: 9 + transit4,
      targetDeliveryMinutes: 25,
      minutesElapsed: 8,
      actualRemainingMinutes: 3 + transit4,
      urgencyScore: calculateUrgencyScore(
        'preparing',
        8,
        25,
        roadDist4,
        'standard'
      ),
      routeWaypoints: routeWaypoints4,
      courierPosition: [restBowls.lat, restBowls.lng],
      routeProgressPct: 0,
      distanceRemainingKm: roadDist4,
      speedMultiplier: 1,
    },
  };

  // Order 5: Received / New Order (Woodfired Pizza - needs acceptance & courier assignment)
  const custLat5 = 37.8015;
  const custLng5 = -122.4095; // Near Order 3 for corridor batching!
  const straightDist5 = calculateHaversineDistanceKm(
    restPizza.lat,
    restPizza.lng,
    custLat5,
    custLng5
  );
  const roadDist5 = calculateRoadDistanceKm(straightDist5);
  const transit5 = estimateTransitMinutes(roadDist5, 'ebike');
  const routeWaypoints5 = generateRealisticRoadRoute(
    restPizza.lat,
    restPizza.lng,
    custLat5,
    custLng5
  );

  const order5: Order = {
    id: 'ORD-8825',
    customerName: 'Claire Thornton',
    customerPhone: '+1 (415) 441-3329',
    deliveryAddress: '228 Green Street, Telegraph Hill',
    customerLat: custLat5,
    customerLng: custLng5,
    restaurantId: restPizza.id,
    restaurantName: restPizza.name,
    restaurantLat: restPizza.lat,
    restaurantLng: restPizza.lng,
    items: [
      {
        id: 'item-9',
        menuItemId: 'menu-103',
        name: 'Tartufo & Wild Mushroom',
        price: 23.5,
        quantity: 1,
      },
      {
        id: 'item-10',
        menuItemId: 'menu-104',
        name: 'Burrata Pugliese',
        price: 15.0,
        quantity: 1,
      },
    ],
    subtotal: 38.5,
    deliveryFee: 2.99,
    tax: 3.46,
    tip: 6.0,
    total: 50.95,
    status: 'received',
    createdAt: now - 3 * 60 * 1000,
    priority: 'standard',
    deliveryNotes: 'Please ring bell 2B',
    distanceTiming: {
      straightDistanceKm: straightDist5,
      roadDistanceKm: roadDist5,
      estimatedPrepMinutes: 15,
      estimatedTransitMinutes: transit5,
      totalEstimatedMinutes: 15 + transit5,
      targetDeliveryMinutes: 30,
      minutesElapsed: 3,
      actualRemainingMinutes: 15 + transit5,
      urgencyScore: calculateUrgencyScore(
        'received',
        3,
        30,
        roadDist5,
        'standard'
      ),
      routeWaypoints: routeWaypoints5,
      courierPosition: [restPizza.lat, restPizza.lng],
      routeProgressPct: 0,
      distanceRemainingKm: roadDist5,
      speedMultiplier: 1,
    },
  };

  // Order 6: Delivered (Earlier today for telemetry and order history)
  const order6: Order = {
    id: 'ORD-8819',
    customerName: 'Jordan Vance',
    customerPhone: '+1 (415) 992-3341',
    deliveryAddress: '580 Howard Street, SoMa',
    customerLat: 37.7872,
    customerLng: -122.3991,
    restaurantId: restBurger.id,
    restaurantName: restBurger.name,
    restaurantLat: restBurger.lat,
    restaurantLng: restBurger.lng,
    courierId: 'courier-4',
    courierName: 'Marcus Vance',
    courierVehicle: 'car',
    courierPhone: '+1 (415) 555-0211',
    items: [
      {
        id: 'item-11',
        menuItemId: 'menu-202',
        name: 'Crispy Nashville Hot Bird',
        price: 16.0,
        quantity: 2,
      },
    ],
    subtotal: 32.0,
    deliveryFee: 3.99,
    tax: 2.88,
    tip: 5.0,
    total: 43.87,
    status: 'delivered',
    createdAt: now - 48 * 60 * 1000,
    prepStartedAt: now - 46 * 60 * 1000,
    readyAt: now - 34 * 60 * 1000,
    pickedUpAt: now - 31 * 60 * 1000,
    deliveredAt: now - 14 * 60 * 1000,
    priority: 'standard',
    deliveryNotes: 'Delivered to reception desk',
    feedback: {
      orderId: 'ORD-8819',
      overallRating: 5,
      driverRating: 5,
      restaurantRating: 5,
      driverComments: 'Marcus arrived very quickly and was very polite at the lobby reception!',
      restaurantComments: 'The chicken sandwich was piping hot and perfectly crispy. Excellent tamper-evident sealing.',
      driverTags: ['Super fast delivery', 'Polite & professional', 'Handled with care'],
      restaurantTags: ['Hot & fresh food', 'Secure packaging', 'Accurate items'],
      submittedAt: now - 10 * 60 * 1000,
    },
    distanceTiming: {
      straightDistanceKm: 1.1,
      roadDistanceKm: 1.4,
      estimatedPrepMinutes: 12,
      estimatedTransitMinutes: 8,
      totalEstimatedMinutes: 20,
      targetDeliveryMinutes: 28,
      minutesElapsed: 34,
      actualRemainingMinutes: 0,
      urgencyScore: 0,
      routeWaypoints: generateRealisticRoadRoute(
        restBurger.lat,
        restBurger.lng,
        37.7872,
        -122.3991
      ),
      courierPosition: [37.7872, -122.3991],
      routeProgressPct: 100,
      distanceRemainingKm: 0,
      speedMultiplier: 1,
    },
  };

  return [order1, order2, order3, order4, order5, order6];
}

import React, { useMemo, useRef, useState } from 'react';
import {
  Bike,
  Building2,
  Car,
  Compass,
  Eye,
  Flame,
  Layers,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  Trees,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useDelivery } from '../../context/DeliveryContext';
import { useTheme } from '../../context/ThemeContext';
import { Courier, Order, Restaurant, VehicleType } from '../../types/delivery';

interface LiveDeliveryMapProps {
  focusedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  onPickCoordinates?: (lat: number, lng: number) => void;
  isPickingLocation?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  heightClass?: string;
  initialHeatmap?: boolean;
  className?: string;
}

// Bounding box for the metropolitan service region (San Francisco East Bayfront)
const MAP_BOUNDS = {
  minLat: 37.765,
  maxLat: 37.812,
  minLng: -122.445,
  maxLng: -122.385,
};

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 800;

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  focusedOrderId,
  onSelectOrder,
  onPickCoordinates,
  isPickingLocation = false,
  pickedLocation,
  heightClass = 'h-[560px]',
  initialHeatmap = true,
  className = '',
}) => {
  const {
    orders,
    restaurants,
    couriers,
    selectedOrderId,
    setSelectedOrderId,
    selectedRestaurantId,
    setSelectedRestaurantId,
  } = useDelivery();

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Map viewport pan & zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map layer toggles
  const [showZones, setShowZones] = useState<boolean>(true);
  const [showRoutes, setShowRoutes] = useState<boolean>(true);
  const [showCouriers, setShowCouriers] = useState<boolean>(true);
  const [showTraffic, setShowTraffic] = useState<boolean>(true);
  const [showLandmarks, setShowLandmarks] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(initialHeatmap);

  // Convert GPS Coordinates [lat, lng] to SVG viewport [x, y]
  const projectCoords = (lat: number, lng: number): [number, number] => {
    const xFraction = (lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    // Invert Y because latitude increases northward (up), SVG Y increases downward
    const yFraction = 1 - (lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);

    const x = xFraction * VIEWBOX_WIDTH;
    const y = yFraction * VIEWBOX_HEIGHT;
    return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
  };

  // Convert SVG [x, y] back to GPS [lat, lng]
  const unprojectCoords = (x: number, y: number): [number, number] => {
    const xFraction = x / VIEWBOX_WIDTH;
    const yFraction = 1 - y / VIEWBOX_HEIGHT;

    const lng = MAP_BOUNDS.minLng + xFraction * (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng);
    const lat = MAP_BOUNDS.minLat + yFraction * (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat);
    return [lat, lng];
  };

  // Active / online couriers across the city
  const onlineCouriers = useMemo(() => {
    return couriers.filter((c) => c.status !== 'offline');
  }, [couriers]);

  // Compute driver density for heatmap layer
  const driverDensityData = useMemo(() => {
    return onlineCouriers.map((c) => {
      const [cx, cy] = projectCoords(c.lat, c.lng);
      // Count other couriers within ~140px (~2.2km radius)
      const nearbyNeighbors = onlineCouriers.filter((other) => {
        if (other.id === c.id) return false;
        const [ox, oy] = projectCoords(other.lat, other.lng);
        const dist = Math.sqrt((cx - ox) ** 2 + (cy - oy) ** 2);
        return dist < 140;
      });

      const densityScore = nearbyNeighbors.length + 1; // including self
      const level: 'high' | 'medium' | 'normal' =
        densityScore >= 3 ? 'high' : densityScore === 2 ? 'medium' : 'normal';

      return {
        courier: c,
        x: cx,
        y: cy,
        neighborsCount: nearbyNeighbors.length,
        densityScore,
        level,
      };
    });
  }, [onlineCouriers]);

  // High-coverage geographic clusters for visual badges
  const coverageClusters = useMemo(() => {
    const visited = new Set<string>();
    const clusters: {
      id: string;
      centroidX: number;
      centroidY: number;
      count: number;
      label: string;
      level: 'high' | 'medium';
    }[] = [];

    driverDensityData.forEach((item) => {
      if (visited.has(item.courier.id)) return;
      if (item.densityScore < 2) return;

      const clusterMembers = [item];
      visited.add(item.courier.id);

      driverDensityData.forEach((other) => {
        if (visited.has(other.courier.id)) return;
        const dist = Math.sqrt((item.x - other.x) ** 2 + (item.y - other.y) ** 2);
        if (dist < 135) {
          clusterMembers.push(other);
          visited.add(other.courier.id);
        }
      });

      if (clusterMembers.length >= 2) {
        const sumX = clusterMembers.reduce((acc, m) => acc + m.x, 0);
        const sumY = clusterMembers.reduce((acc, m) => acc + m.y, 0);
        const centroidX = Math.round(sumX / clusterMembers.length);
        const centroidY = Math.round(sumY / clusterMembers.length);

        let label = 'Central Metro Cluster';
        if (centroidY < 320 && centroidX > 550) label = 'Financial & Waterfront';
        else if (centroidY < 350 && centroidX <= 550) label = 'Nob Hill / Polk Corridor';
        else if (centroidY >= 320 && centroidY < 580 && centroidX > 480) label = 'SoMa Tech Corridor';
        else if (centroidY >= 580) label = 'Mission District Hub';

        clusters.push({
          id: `cluster-${item.courier.id}`,
          centroidX,
          centroidY,
          count: clusterMembers.length,
          label,
          level: clusterMembers.length >= 3 ? 'high' : 'medium',
        });
      }
    });

    return clusters;
  }, [driverDensityData]);

  // Active orders with routing
  const activeOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status !== 'cancelled' && (focusedOrderId ? o.id === focusedOrderId : true)
    );
  }, [orders, focusedOrderId]);

  // Highlighted order for focus
  const highlightedOrder = useMemo(() => {
    const targetId = focusedOrderId || selectedOrderId;
    return orders.find((o) => o.id === targetId);
  }, [orders, focusedOrderId, selectedOrderId]);

  // Handle map panning
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isPickingLocation) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoom((prev) => Math.min(2.8, Math.max(0.7, prev + delta)));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Click on SVG to pick delivery coordinate
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPickingLocation || !onPickCoordinates || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left - pan.x) / (rect.width * zoom)) * VIEWBOX_WIDTH;
    const clickY = ((e.clientY - rect.top - pan.y) / (rect.height * zoom)) * VIEWBOX_HEIGHT;

    const [lat, lng] = unprojectCoords(clickX, clickY);
    onPickCoordinates(
      Math.round(lat * 10000) / 10000,
      Math.round(lng * 10000) / 10000
    );
  };

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden ${
        className ? className : 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm'
      } bg-slate-50 dark:bg-slate-950 select-none transition-colors duration-200`}
    >
      {/* Top Map Floating HUD */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 border border-slate-200 backdrop-blur-md text-xs font-medium text-slate-700 shadow-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-900">Metropolitan Grid (High Detail)</span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-slate-500">
            {activeOrders.filter((o) => o.status === 'out_for_delivery').length} in transit
          </span>
          <span className="text-slate-300">|</span>
          <span className="font-mono text-amber-700 font-bold flex items-center gap-1">
            <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span>{onlineCouriers.length} Drivers Online</span>
          </span>
        </div>

        {isPickingLocation && (
          <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md animate-bounce">
            <MapPin className="h-3.5 w-3.5 fill-current" />
            <span>Click on the map to set delivery pin</span>
          </div>
        )}
      </div>

      {/* Layer Toggles & Zoom Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5">
        <div className="flex items-center rounded-xl bg-white/95 p-1 border border-slate-200 backdrop-blur-md text-xs text-slate-600 shadow-md">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            title="Toggle Driver Density Heatmap"
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
              showHeatmap
                ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300 shadow-sm'
                : 'hover:text-slate-900'
            }`}
          >
            <Flame className={`h-3 w-3 ${showHeatmap ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
            <span>Heatmap</span>
          </button>
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            title="Toggle Live Traffic Speeds"
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showTraffic ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Traffic
          </button>
          <button
            onClick={() => setShowLandmarks(!showLandmarks)}
            title="Toggle Landmarks & Parks"
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showLandmarks ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            POIs
          </button>
          <button
            onClick={() => setShowZones(!showZones)}
            title="Toggle Delivery Distance Zones"
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showZones ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Zones
          </button>
          <button
            onClick={() => setShowRoutes(!showRoutes)}
            title="Toggle Route Polylines"
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showRoutes ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Routes
          </button>
          <button
            onClick={() => setShowCouriers(!showCouriers)}
            title="Toggle Fleet Couriers"
            className={`px-2 py-1 rounded-lg transition-colors font-medium ${
              showCouriers ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:text-slate-900'
            }`}
          >
            Couriers
          </button>
        </div>

        <div className="flex items-center rounded-xl bg-white/95 p-1 border border-slate-200 backdrop-blur-md text-slate-600 shadow-md">
          <button
            onClick={() => handleZoom(0.25)}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleZoom(-0.25)}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="Reset Map View"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas Map with Detailed Cartography */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        className={`w-full h-full ${
          isPickingLocation ? 'cursor-crosshair' : isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleSvgClick}
      >
        <defs>
          {/* Subtle Grid Pattern for Minor City Blocks */}
          <pattern id="urbanGrid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.6" strokeOpacity="0.8" />
          </pattern>

          {/* Waterway / Bay gradient */}
          <linearGradient id="bayWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="60%" stopColor="#bae6fd" />
            <stop offset="100%" stopColor="#93c5fd" />
          </linearGradient>

          {/* Bay ripples pattern */}
          <pattern id="waterRipple" width="40" height="20" patternUnits="userSpaceOnUse">
            <path d="M 0 10 Q 10 5, 20 10 T 40 10" fill="none" stroke="#7dd3fc" strokeWidth="0.8" strokeOpacity="0.6" />
          </pattern>

          {/* Park Grass Pattern */}
          <pattern id="grassPattern" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="6" cy="6" r="1.2" fill="#86efac" opacity="0.6" />
          </pattern>

          {/* Glowing filter for high-visibility markers */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Driver Density Heatmap Gradients */}
          {/* High Density: Hot Red -> Orange -> Amber -> Fade */}
          <radialGradient id="heatBlobHigh" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#f97316" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="85%" stopColor="#10b981" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>

          {/* Medium Density: Orange -> Yellow/Amber -> Cyan -> Fade */}
          <radialGradient id="heatBlobMed" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.7" />
            <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.45" />
            <stop offset="75%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>

          {/* Single Driver / Normal Coverage: Cyan -> Indigo -> Fade */}
          <radialGradient id="heatBlobLow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="45%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="80%" stopColor="#6366f1" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Ambient Diffuse Heat Glow */}
          <radialGradient id="heatAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>

          {/* Heatmap Gaussian Diffusion Filter */}
          <filter id="heatBlur" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="16" result="blur" />
          </filter>
        </defs>

        {/* Scaled/Panned Group */}
        <g
          transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
          style={{ transformOrigin: 'center center', transition: isDragging ? 'none' : 'transform 0.15s ease-out' }}
        >
          {/* 1. Base Canvas Landmass */}
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="#f8fafc" />
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="url(#urbanGrid)" />

          {/* 2. Water / Bay Geometry (San Francisco Bay & Waterfront) */}
          <path
            d="M 750,0 C 710,140 730,280 790,460 C 840,580 910,680 1000,740 L 1000,0 Z"
            fill="url(#bayWater)"
          />
          <path
            d="M 750,0 C 710,140 730,280 790,460 C 840,580 910,680 1000,740 L 1000,0 Z"
            fill="url(#waterRipple)"
          />
          {/* Water Edge Line */}
          <path
            d="M 750,0 C 710,140 730,280 790,460 C 840,580 910,680 1000,740"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3"
            strokeDasharray="8 4"
          />

          {/* 3. Embarcadero Piers Extending into Bay */}
          <g fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1">
            {/* Pier 39 / Fisherman's Wharf */}
            <rect x="670" y="25" width="45" height="14" rx="2" />
            <text x="692" y="35" textAnchor="middle" fill="#475569" className="text-[7px] font-mono font-bold">PIER 39</text>
            {/* Pier 7 Public Walkway */}
            <rect x="740" y="145" width="65" height="10" rx="2" fill="#e2e8f0" />
            <text x="772" y="153" textAnchor="middle" fill="#64748b" className="text-[6px] font-mono">PIER 7</text>
            {/* Pier 1 & Ferry Building Arcade */}
            <rect x="760" y="240" width="40" height="24" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.5" />
            <text x="780" y="255" textAnchor="middle" fill="#0f172a" className="text-[8px] font-bold">FERRY BLDG</text>
            {/* Pier 14 Promenade */}
            <rect x="800" y="370" width="70" height="12" rx="2" fill="#e2e8f0" />
            <text x="835" y="379" textAnchor="middle" fill="#64748b" className="text-[6px] font-mono">PIER 14</text>
            {/* Pier 30-32 Maritime Wharf */}
            <rect x="840" y="500" width="55" height="26" rx="3" />
          </g>

          {/* 4. San Francisco-Oakland Bay Bridge (I-80) Spanning Across Bay */}
          <g stroke="#64748b" strokeLinecap="round">
            {/* Bridge Deck Double Line */}
            <line x1="775" y1="380" x2="1000" y2="340" stroke="#475569" strokeWidth="9" />
            <line x1="775" y1="380" x2="1000" y2="340" stroke="#f8fafc" strokeWidth="2" strokeDasharray="6 6" />
            {/* Suspension Tower A */}
            <rect x="845" y="355" width="8" height="30" fill="#334155" />
            {/* Suspension Tower B */}
            <rect x="925" y="340" width="8" height="30" fill="#334155" />
            {/* Suspension Cables */}
            <path d="M 775,380 Q 845,350 925,335 T 1000,340" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
            {/* Bridge Label */}
            <g transform="translate(885, 330)">
              <rect x="-35" y="-12" width="70" height="14" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
              <text x="0" y="-2" textAnchor="middle" fill="#1e293b" className="text-[8px] font-mono font-bold">I-80 BAY BRIDGE</text>
            </g>
          </g>

          {/* 5. Urban Parks & Green Sanctuaries */}
          {showLandmarks && (
            <g>
              {/* Yerba Buena Gardens */}
              <g transform="translate(560, 390)">
                <rect width="90" height="55" rx="8" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
                <rect width="90" height="55" rx="8" fill="url(#grassPattern)" />
                {/* Center Fountain */}
                <circle cx="45" cy="27" r="7" fill="#67e8f9" stroke="#06b6d4" strokeWidth="1" />
                <text x="45" y="47" textAnchor="middle" fill="#166534" className="text-[8px] font-bold font-sans">Yerba Buena</text>
              </g>

              {/* Washington Square Park (North Beach) */}
              <g transform="translate(590, 85)">
                <rect width="70" height="45" rx="6" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
                <rect width="70" height="45" rx="6" fill="url(#grassPattern)" />
                <text x="35" y="27" textAnchor="middle" fill="#166534" className="text-[8px] font-bold">Wash. Square</text>
              </g>

              {/* South Park (Oval in SoMa) */}
              <g transform="translate(710, 430)">
                <ellipse cx="35" cy="20" rx="35" ry="18" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
                <text x="35" y="23" textAnchor="middle" fill="#166534" className="text-[7.5px] font-bold">South Park</text>
              </g>

              {/* Portsmouth Square (Chinatown) */}
              <g transform="translate(610, 195)">
                <rect width="50" height="35" rx="4" fill="#dcfce7" stroke="#86efac" strokeWidth="1.2" />
                <text x="25" y="21" textAnchor="middle" fill="#166534" className="text-[7px] font-bold">Portsmouth Sq</text>
              </g>

              {/* Mission Dolores Park (Southwest) */}
              <g transform="translate(180, 680)">
                <polygon points="0,0 120,20 100,90 10,80" fill="#dcfce7" stroke="#86efac" strokeWidth="1.5" />
                <text x="55" y="45" textAnchor="middle" fill="#166534" className="text-[9px] font-bold">Dolores Park</text>
              </g>
            </g>
          )}

          {/* 6. City Building Blocks & Structural Parcels */}
          <g fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1">
            {/* Financial District Commercial Highrises */}
            <rect x="670" y="180" width="35" height="30" rx="3" />
            <rect x="715" y="180" width="30" height="30" rx="3" />
            <rect x="670" y="220" width="35" height="35" rx="3" />
            <rect x="715" y="220" width="30" height="35" rx="3" />
            <rect x="660" y="280" width="40" height="30" rx="3" />
            <rect x="710" y="280" width="45" height="30" rx="3" />

            {/* SoMa Tech & Innovation Blocks */}
            <rect x="470" y="420" width="45" height="30" rx="3" />
            <rect x="525" y="420" width="45" height="30" rx="3" />
            <rect x="470" y="465" width="45" height="35" rx="3" />
            <rect x="525" y="465" width="45" height="35" rx="3" />
            <rect x="580" y="465" width="50" height="35" rx="3" />
            <rect x="640" y="465" width="55" height="35" rx="3" />
            <rect x="705" y="465" width="45" height="35" rx="3" />

            {/* Mission Bay Warehouses & Bio Hub */}
            <rect x="640" y="550" width="60" height="40" rx="4" />
            <rect x="710" y="550" width="70" height="40" rx="4" />
            <rect x="640" y="600" width="60" height="45" rx="4" />
            <rect x="710" y="600" width="70" height="45" rx="4" />

            {/* Hayes Valley Residential Grid */}
            <rect x="250" y="480" width="45" height="30" rx="3" />
            <rect x="305" y="480" width="45" height="30" rx="3" />
            <rect x="250" y="520" width="45" height="35" rx="3" />
            <rect x="305" y="520" width="45" height="35" rx="3" />
          </g>

          {/* 7. Major Arterial Roadways & Avenues */}
          <g stroke="#cbd5e1" strokeLinecap="round">
            {/* Secondary Grid Lines */}
            <g strokeWidth="3" opacity="0.8">
              <line x1="80" y1="140" x2="730" y2="140" />
              <line x1="80" y1="220" x2="740" y2="220" />
              <line x1="80" y1="280" x2="750" y2="280" />
              <line x1="80" y1="360" x2="770" y2="360" />
              <line x1="80" y1="420" x2="780" y2="420" />
              <line x1="80" y1="500" x2="790" y2="500" />
              <line x1="80" y1="560" x2="800" y2="560" />
              <line x1="80" y1="640" x2="800" y2="640" />

              <line x1="180" y1="60" x2="180" y2="760" />
              <line x1="260" y1="60" x2="260" y2="760" />
              <line x1="330" y1="60" x2="330" y2="760" />
              <line x1="450" y1="60" x2="450" y2="760" />
              <line x1="530" y1="60" x2="530" y2="760" />
              <line x1="610" y1="60" x2="610" y2="760" />
              <line x1="670" y1="60" x2="670" y2="760" />
            </g>

            {/* US-101 Elevated Central Freeway Corridor */}
            <path
              d="M 180,780 C 220,660 260,600 360,540 L 360,250"
              fill="none"
              stroke="#64748b"
              strokeWidth="9"
              opacity="0.9"
            />
            <path
              d="M 180,780 C 220,660 260,600 360,540 L 360,250"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.5"
              strokeDasharray="8 6"
            />

            {/* Market Street Diagonal Grand Boulevard */}
            <line x1="210" y1="770" x2="820" y2="270" stroke="#475569" strokeWidth="10" />
            {/* Streetcar Muni Tracks down Market St */}
            <line x1="210" y1="770" x2="820" y2="270" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="3 3" />

            {/* Mission Street Parallel Arterial */}
            <line x1="200" y1="790" x2="810" y2="300" stroke="#94a3b8" strokeWidth="7" />

            {/* Columbus Avenue Diagonal (North Beach) */}
            <line x1="580" y1="240" x2="680" y2="40" stroke="#64748b" strokeWidth="7" />

            {/* Van Ness Avenue (Avenue with Transit median) */}
            <line x1="390" y1="40" x2="390" y2="760" stroke="#64748b" strokeWidth="8" />

            {/* The Embarcadero Waterfront Promenade */}
            <path
              d="M 680,30 C 730,130 735,260 800,420 C 830,500 870,610 930,730"
              fill="none"
              stroke="#475569"
              strokeWidth="9"
            />
            <path
              d="M 680,30 C 730,130 735,260 800,420 C 830,500 870,610 930,730"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
          </g>

          {/* 8. Live Traffic Flow Indicators (When showTraffic is active) */}
          {showTraffic && (
            <g strokeLinecap="round" opacity="0.85">
              {/* Free Flow Green on Embarcadero (45 km/h) */}
              <path
                d="M 695,45 C 740,140 745,265 805,415"
                fill="none"
                stroke="#10b981"
                strokeWidth="3.5"
                strokeDasharray="12 6"
                className="animate-[dash_1.5s_linear_infinite]"
              />
              {/* Moderate Flow Amber on Van Ness Ave (26 km/h) */}
              <line
                x1="390"
                y1="100"
                x2="390"
                y2="450"
                stroke="#f59e0b"
                strokeWidth="3.5"
                strokeDasharray="10 5"
              />
              {/* Heavy Congestion Rose on Lower Market Street (12 km/h) */}
              <line
                x1="620"
                y1="430"
                x2="780"
                y2="300"
                stroke="#f43f5e"
                strokeWidth="4.5"
                strokeDasharray="8 4"
                className="animate-pulse"
              />
              {/* Moderate Flow Amber on Columbus Ave */}
              <line
                x1="600"
                y1="210"
                x2="670"
                y2="60"
                stroke="#f59e0b"
                strokeWidth="3"
              />
            </g>
          )}

          {/* 9. Key Architectural Landmarks & POIs */}
          {showLandmarks && (
            <g className="font-sans">
              {/* Transamerica Pyramid Landmark */}
              <g transform="translate(680, 160)" className="pointer-events-none">
                <polygon points="12,0 24,24 0,24" fill="#3b82f6" opacity="0.8" />
                <circle cx="12" cy="12" r="2" fill="#ffffff" />
                <text x="12" y="34" textAnchor="middle" fill="#1e293b" className="text-[7.5px] font-bold">Transamerica Pyramid</text>
              </g>

              {/* Salesforce Tower Landmark */}
              <g transform="translate(710, 310)" className="pointer-events-none">
                <circle cx="12" cy="12" r="10" fill="#6366f1" opacity="0.85" />
                <circle cx="12" cy="12" r="4" fill="#ffffff" />
                <text x="12" y="32" textAnchor="middle" fill="#1e293b" className="text-[7.5px] font-bold">Salesforce Tower</text>
              </g>

              {/* Moscone Convention Center */}
              <g transform="translate(530, 360)" className="pointer-events-none">
                <rect x="0" y="0" width="30" height="20" rx="3" fill="#94a3b8" opacity="0.8" />
                <text x="15" y="13" textAnchor="middle" fill="#ffffff" className="text-[6.5px] font-bold">MOSCONE</text>
              </g>

              {/* Coit Tower Landmark (Telegraph Hill) */}
              <g transform="translate(640, 50)" className="pointer-events-none">
                <circle cx="10" cy="10" r="14" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
                <rect x="7" y="2" width="6" height="16" rx="2" fill="#d97706" />
                <text x="10" y="28" textAnchor="middle" fill="#1e293b" className="text-[7px] font-bold">Coit Tower</text>
              </g>

              {/* Highway Shields */}
              <g transform="translate(360, 480)">
                <polygon points="12,2 22,7 18,22 6,22 2,7" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <text x="12" y="15" textAnchor="middle" fill="#ffffff" className="text-[7px] font-mono font-bold">101</text>
              </g>
              <g transform="translate(800, 360)">
                <polygon points="12,2 22,7 18,22 6,22 2,7" fill="#1e293b" stroke="#ffffff" strokeWidth="1" />
                <text x="12" y="15" textAnchor="middle" fill="#ffffff" className="text-[7px] font-mono font-bold">I-80</text>
              </g>
            </g>
          )}

          {/* 10. Clean Typographic Street Names */}
          <g className="font-mono text-[8px] font-bold fill-slate-400 tracking-wider pointer-events-none uppercase">
            <text x="660" y="22" transform="rotate(-60 660,22)">Columbus Ave</text>
            <text x="440" y="580" transform="rotate(-38 440,580)">Market Street Corridor</text>
            <text x="450" y="615" transform="rotate(-38 450,615)">Mission Street</text>
            <text x="400" y="200" transform="rotate(90 400,200)">Van Ness Ave</text>
            <text x="730" y="100">North Beach</text>
            <text x="700" y="210">Financial Dist</text>
            <text x="440" y="170">Nob Hill</text>
            <text x="500" y="515">SoMa Commercial Hub</text>
            <text x="260" y="510">Hayes Valley</text>
            <text x="690" y="540">Mission Bay</text>
          </g>

          {/* 11. Driver Density Heatmap Layer (Visualizing Courier Coverage across the City) */}
          {showHeatmap && (
            <g id="driver-density-heatmap-layer" className="transition-opacity duration-300">
              {/* Layer 1: Ambient Merging Heatmap Glow */}
              <g filter="url(#heatBlur)" opacity="0.85">
                {driverDensityData.map(({ courier, x, y, level }) => {
                  const auraRadius = level === 'high' ? 145 : level === 'medium' ? 115 : 90;
                  return (
                    <circle
                      key={`aura-${courier.id}`}
                      cx={x}
                      cy={y}
                      r={auraRadius}
                      fill={
                        level === 'high'
                          ? 'url(#heatBlobHigh)'
                          : level === 'medium'
                          ? 'url(#heatBlobMed)'
                          : 'url(#heatBlobLow)'
                      }
                      style={{ mixBlendMode: 'multiply' }}
                    />
                  );
                })}
              </g>

              {/* Layer 2: Core Radiant Density Blobs */}
              {driverDensityData.map(({ courier, x, y, level }) => {
                const coreRadius = level === 'high' ? 70 : level === 'medium' ? 55 : 42;
                return (
                  <g key={`core-${courier.id}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r={coreRadius}
                      fill={
                        level === 'high'
                          ? 'url(#heatBlobHigh)'
                          : level === 'medium'
                          ? 'url(#heatBlobMed)'
                          : 'url(#heatBlobLow)'
                      }
                      opacity={0.88}
                    />
                    {/* Concentric radar indicator for high-coverage zones */}
                    {level === 'high' && (
                      <circle
                        cx={x}
                        cy={y}
                        r={coreRadius * 0.85}
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="1.2"
                        strokeDasharray="4 4"
                        opacity={0.5}
                        className="animate-spin-slow"
                      />
                    )}
                  </g>
                );
              })}

              {/* Layer 3: High-Coverage Geographic Cluster Floating HUD Badges */}
              {coverageClusters.map((cluster) => (
                <g
                  key={cluster.id}
                  transform={`translate(${cluster.centroidX}, ${cluster.centroidY - 42})`}
                  className="pointer-events-none select-none transition-all"
                >
                  <line
                    x1="0"
                    y1="14"
                    x2="0"
                    y2="34"
                    stroke={cluster.level === 'high' ? '#ef4444' : '#f59e0b'}
                    strokeWidth="1.2"
                    strokeDasharray="2 2"
                    opacity={0.7}
                  />
                  <rect
                    x="-82"
                    y="0"
                    width="164"
                    height="24"
                    rx="8"
                    fill="#ffffff"
                    stroke={cluster.level === 'high' ? '#fca5a5' : '#fde68a'}
                    strokeWidth="1.5"
                    className="shadow-md"
                  />
                  <g transform="translate(-74, 5)">
                    <circle
                      cx="7"
                      cy="7"
                      r="5"
                      fill={cluster.level === 'high' ? '#ef4444' : '#f59e0b'}
                    />
                    <text
                      x="16"
                      y="10.5"
                      fill="#0f172a"
                      className="text-[9.5px] font-sans font-bold tracking-tight"
                    >
                      {cluster.level === 'high' ? '🔥 HIGH COVERAGE' : '⚡ ACTIVE COVERAGE'}
                    </text>
                  </g>
                  <text
                    x="74"
                    y="15.5"
                    textAnchor="end"
                    fill="#475569"
                    className="text-[9px] font-mono font-bold"
                  >
                    {cluster.count} Drivers
                  </text>
                </g>
              ))}
            </g>
          )}

          {/* 12. Delivery Distance Zones (Radius circles around active restaurants) */}
          {showZones &&
            restaurants.map((rest) => {
              const [rx, ry] = projectCoords(rest.lat, rest.lng);
              const isSelected = selectedRestaurantId === rest.id;

              return (
                <g key={`zone-${rest.id}`} opacity={isSelected ? 0.85 : 0.3} className="transition-opacity duration-300">
                  {/* Express 2km Radius Circle */}
                  <circle
                    cx={rx}
                    cy={ry}
                    r="85"
                    fill={rest.themeColor}
                    fillOpacity="0.04"
                    stroke={rest.themeColor}
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  {/* Standard 5km Radius Circle */}
                  <circle
                    cx={rx}
                    cy={ry}
                    r="200"
                    fill="none"
                    stroke={rest.themeColor}
                    strokeWidth="1"
                    strokeDasharray="8 6"
                  />
                  {/* Express Zone Tag */}
                  {isSelected && (
                    <text
                      x={rx + 60}
                      y={ry - 60}
                      fill={rest.themeColor}
                      className="text-[8px] font-mono font-bold"
                    >
                      2.0km Express Hub
                    </text>
                  )}
                </g>
              );
            })}

          {/* 12. Active Order Route Polylines */}
          {showRoutes &&
            activeOrders.map((order) => {
              const dt = order.distanceTiming;
              const isSelected = (focusedOrderId || selectedOrderId) === order.id;

              if (!dt.routeWaypoints || dt.routeWaypoints.length < 2) return null;

              const pathString = dt.routeWaypoints
                .map((wp, idx) => {
                  const [px, py] = projectCoords(wp[0], wp[1]);
                  return `${idx === 0 ? 'M' : 'L'} ${px},${py}`;
                })
                .join(' ');

              return (
                <g key={`route-${order.id}`} className="transition-all">
                  {/* Underlay glow if selected */}
                  {isSelected && (
                    <path
                      d={pathString}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="7"
                      strokeOpacity="0.35"
                      strokeLinecap="round"
                    />
                  )}
                  {/* Primary route line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={isSelected ? '#4f46e5' : '#64748b'}
                    strokeWidth={isSelected ? '3.5' : '2'}
                    strokeLinecap="round"
                    strokeDasharray={order.status === 'out_for_delivery' ? '6 4' : 'none'}
                    className={order.status === 'out_for_delivery' ? 'animate-[dash_1s_linear_infinite]' : ''}
                  />
                </g>
              );
            })}

          {/* 13. Restaurant Pins */}
          {restaurants.map((rest) => {
            const [rx, ry] = projectCoords(rest.lat, rest.lng);
            const isSelected = selectedRestaurantId === rest.id;

            return (
              <g
                key={`rest-${rest.id}`}
                transform={`translate(${rx}, ${ry})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRestaurantId(rest.id);
                }}
                className="cursor-pointer group"
              >
                {/* Pulse ring */}
                <circle
                  r="20"
                  fill={rest.themeColor}
                  fillOpacity="0.18"
                  className={isSelected ? 'animate-ping' : ''}
                />
                {/* Core badge */}
                <circle
                  r="14"
                  fill="#ffffff"
                  stroke={rest.themeColor}
                  strokeWidth={isSelected ? '3.5' : '2.5'}
                  filter="url(#glow)"
                />
                {/* Center marker */}
                <circle r="6" fill={rest.themeColor} />

                {/* Tooltip Label */}
                <g transform="translate(0, -22)" className="pointer-events-none">
                  <rect
                    x="-55"
                    y="-18"
                    width="110"
                    height="20"
                    rx="6"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                    className="shadow-sm"
                  />
                  <text
                    x="0"
                    y="-5"
                    textAnchor="middle"
                    fill="#0f172a"
                    className="text-[10px] font-bold tracking-tight font-sans"
                  >
                    {rest.name.length > 15 ? rest.name.slice(0, 14) + '…' : rest.name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 14. Customer Destination Pins */}
          {activeOrders.map((order) => {
            const [cx, cy] = projectCoords(order.customerLat, order.customerLng);
            const isSelected = (focusedOrderId || selectedOrderId) === order.id;

            return (
              <g
                key={`cust-${order.id}`}
                transform={`translate(${cx}, ${cy})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedOrderId(order.id);
                  if (onSelectOrder) onSelectOrder(order.id);
                }}
                className="cursor-pointer group"
              >
                {/* Dropoff ring */}
                <circle
                  r={isSelected ? '14' : '9'}
                  fill={isSelected ? '#10b981' : '#3b82f6'}
                  fillOpacity="0.25"
                  className={order.status === 'out_for_delivery' ? 'animate-pulse' : ''}
                />
                {/* Pin head */}
                <circle
                  r={isSelected ? '7' : '5'}
                  fill={isSelected ? '#059669' : '#2563eb'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />

                {/* Small ID Badge */}
                <g transform="translate(0, 16)" className="pointer-events-none">
                  <rect
                    x="-24"
                    y="-2"
                    width="48"
                    height="14"
                    rx="4"
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="8"
                    textAnchor="middle"
                    fill="#475569"
                    className="text-[9px] font-mono font-bold"
                  >
                    {order.id}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 15. Interactive Picked Pin for New Orders */}
          {pickedLocation && (
            <g
              transform={`translate(${projectCoords(pickedLocation.lat, pickedLocation.lng)[0]}, ${
                projectCoords(pickedLocation.lat, pickedLocation.lng)[1]
              })`}
              className="animate-bounce"
            >
              <circle r="16" fill="#4f46e5" fillOpacity="0.3" />
              <circle r="8" fill="#4f46e5" stroke="#ffffff" strokeWidth="2" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#4f46e5"
                className="text-[11px] font-extrabold font-mono"
              >
                TARGET DROP
              </text>
            </g>
          )}

          {/* 16. Active Couriers Live Vector Position Markers */}
          {showCouriers &&
            onlineCouriers.map((courier) => {
              const [vx, vy] = projectCoords(courier.lat, courier.lng);
              const activeOrder = orders.find(
                (o) => o.courierId === courier.id && o.status === 'out_for_delivery'
              );
              const isSelected = activeOrder
                ? (focusedOrderId || selectedOrderId) === activeOrder.id
                : false;
              const isDelivering = courier.status === 'delivering';
              const isAssigned = courier.status === 'assigned';

              return (
                <g
                  key={`courier-marker-${courier.id}`}
                  transform={`translate(${vx}, ${vy})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeOrder) {
                      setSelectedOrderId(activeOrder.id);
                      if (onSelectOrder) onSelectOrder(activeOrder.id);
                    }
                  }}
                  className="cursor-pointer group"
                >
                  {/* Animated radar ripple for moving / delivering couriers */}
                  {isDelivering ? (
                    <circle
                      r="18"
                      fill="#4f46e5"
                      fillOpacity="0.25"
                      className="animate-ping"
                    />
                  ) : (
                    <circle
                      r="12"
                      fill="#10b981"
                      fillOpacity="0.18"
                    />
                  )}
                  {/* Courier marker background */}
                  <circle
                    r="13"
                    fill="#ffffff"
                    stroke={isDelivering ? '#4f46e5' : isAssigned ? '#f59e0b' : '#10b981'}
                    strokeWidth={isSelected ? '3.5' : '2.5'}
                    filter="url(#glow)"
                  />
                  {/* Inner Vehicle Glyph */}
                  <circle
                    r="5.5"
                    fill={isDelivering ? '#4f46e5' : isAssigned ? '#f59e0b' : '#10b981'}
                  />

                  {/* Courier identity & ETA badge */}
                  <g transform="translate(0, -22)" className="pointer-events-none">
                    <rect
                      x="-48"
                      y="-16"
                      width="96"
                      height="18"
                      rx="5"
                      fill="#ffffff"
                      stroke={isDelivering ? '#4f46e5' : isAssigned ? '#f59e0b' : '#cbd5e1'}
                      strokeWidth="1.2"
                      className="shadow-md"
                    />
                    <text
                      x="0"
                      y="-4"
                      textAnchor="middle"
                      fill="#0f172a"
                      className="text-[9.5px] font-mono font-bold"
                    >
                      {activeOrder
                        ? `${activeOrder.distanceTiming.actualRemainingMinutes}m · ${activeOrder.id}`
                        : `${courier.name.split(' ')[0]} (${courier.vehicleType})`}
                    </text>
                  </g>
                </g>
              );
            })}
        </g>
      </svg>

      {/* Bottom Telemetry Legend & Heatmap Density Scale */}
      <div className="absolute bottom-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/95 px-4 py-2 border border-slate-200 backdrop-blur-md text-xs text-slate-700 shadow-md">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-slate-600 font-medium">Kitchens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 inline-block animate-pulse" />
            <span className="text-slate-600 font-medium">Couriers</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 inline-block" />
            <span className="text-slate-600 font-medium">Doorsteps</span>
          </div>

          {/* Driver Density Heatmap Legend */}
          {showHeatmap ? (
            <div className="flex items-center gap-2.5 border-l border-slate-200 pl-3">
              <span className="text-amber-800 font-mono text-[10px] font-bold flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span>COVERAGE DENSITY:</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-700 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" /> High (3+)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-700 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" /> Moderate (2)
              </span>
              <span className="flex items-center gap-1 text-[11px] text-cyan-700 font-bold">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block" /> Single (1)
              </span>
              <span className="text-[11px] font-mono text-slate-400 hidden xl:inline">
                ({coverageClusters.length} Hotspots Identified)
              </span>
            </div>
          ) : showTraffic ? (
            <div className="hidden md:flex items-center gap-2 border-l border-slate-200 pl-3">
              <span className="text-slate-400 font-mono text-[10px]">CORRIDOR TRAFFIC:</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                <span className="h-1.5 w-3 rounded-full bg-emerald-500 inline-block" /> Free
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-700 font-medium">
                <span className="h-1.5 w-3 rounded-full bg-amber-500 inline-block" /> Moderate
              </span>
              <span className="flex items-center gap-1 text-[11px] text-rose-700 font-medium">
                <span className="h-1.5 w-3 rounded-full bg-rose-500 inline-block" /> Heavy
              </span>
            </div>
          ) : null}
        </div>

        {highlightedOrder ? (
          <div className="flex items-center gap-2 font-mono text-[11px] text-indigo-800 font-bold">
            <span>{highlightedOrder.id}</span>
            <span className="text-slate-300">/</span>
            <span>{highlightedOrder.distanceTiming.roadDistanceKm} km road</span>
            <span className="text-slate-300">/</span>
            <span>{highlightedOrder.distanceTiming.actualRemainingMinutes} mins ETA</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">{onlineCouriers.length} Drivers Online</span>
            <span>·</span>
            <span>{onlineCouriers.filter((c) => c.status === 'idle').length} Standby Pickups</span>
          </div>
        )}
      </div>
    </div>
  );
};

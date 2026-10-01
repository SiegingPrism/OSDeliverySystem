import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import {
  Bike,
  Building2,
  Car,
  CheckCircle2,
  Compass,
  Home,
  Layers,
  LocateFixed,
  MapPin,
  Maximize2,
  Navigation,
  Phone,
  Radio,
  RefreshCw,
  ShieldCheck,
  Star,
  Utensils,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { Courier, Order, VehicleType } from '../../types/delivery';

export interface LiveTrackingMapProps {
  order: Order;
  courier?: Courier | null;
  heightClass?: string;
  autoCenterDriver?: boolean;
  className?: string;
  onContactDriver?: () => void;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  order,
  courier,
  heightClass = 'h-[500px]',
  autoCenterDriver = true,
  className = '',
  onContactDriver,
}) => {
  const { isDark } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer references for dynamic updates without re-instantiating the whole map
  const courierMarkerRef = useRef<L.Marker | null>(null);
  const courierRadiusRef = useRef<L.Circle | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const customerMarkerRef = useRef<L.Marker | null>(null);
  const customerGeofenceRef = useRef<L.Circle | null>(null);
  const routeBackgroundPolylineRef = useRef<L.Polyline | null>(null);
  const routeCompletedPolylineRef = useRef<L.Polyline | null>(null);
  const routeRemainingPolylineRef = useRef<L.Polyline | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [followCourier, setFollowCourier] = useState(autoCenterDriver);
  const [mapStyle, setMapStyle] = useState<'auto' | 'dark' | 'voyager' | 'positron'>('auto');

  const dt = order.distanceTiming;

  // Determine effective courier coordinates
  const courierPos: [number, number] = courier
    ? [courier.lat, courier.lng]
    : dt.courierPosition || [order.restaurantLat, order.restaurantLng];

  const restPos: [number, number] = [order.restaurantLat, order.restaurantLng];
  const custPos: [number, number] = [order.customerLat, order.customerLng];

  // Helper to determine tile URL
  const getTileUrl = useCallback(() => {
    if (mapStyle === 'dark' || (mapStyle === 'auto' && isDark)) {
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    }
    if (mapStyle === 'voyager') {
      return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    }
    return 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  }, [mapStyle, isDark]);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: courierPos,
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      const tileLayer = L.tileLayer(getTileUrl(), {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      // Fit all 3 points initially with good padding
      const initialBounds = L.latLngBounds([restPos, custPos, courierPos]);
      map.fitBounds(initialBounds, { padding: [70, 70], maxZoom: 16 });

      // Resize observer to handle dynamic layout / tab changes
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Error initializing Leaflet LiveTrackingMap:', err);
    }
  }, [order.id]); // re-init only if order changes

  // 2. Update basemap tile layer when theme or mapStyle changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(getTileUrl(), {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);
  }, [getTileUrl, mapReady]);

  // 3. Update Route Polylines and Customer Geofence
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const waypoints = dt.routeWaypoints && dt.routeWaypoints.length > 1
      ? dt.routeWaypoints
      : [restPos, courierPos, custPos];

    // Clean old lines
    if (routeBackgroundPolylineRef.current) routeBackgroundPolylineRef.current.remove();
    if (routeCompletedPolylineRef.current) routeCompletedPolylineRef.current.remove();
    if (routeRemainingPolylineRef.current) routeRemainingPolylineRef.current.remove();
    if (customerGeofenceRef.current) customerGeofenceRef.current.remove();

    // Route background casing
    const casingColor = isDark ? '#1e293b' : '#ffffff';
    routeBackgroundPolylineRef.current = L.polyline(waypoints, {
      color: casingColor,
      weight: 8,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // Remaining route (Courier -> Customer)
    const remainingColor = isDark ? '#f59e0b' : '#d97706';
    routeRemainingPolylineRef.current = L.polyline(waypoints, {
      color: remainingColor,
      weight: 4.5,
      dashArray: '8, 8',
      opacity: 0.95,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map);

    // If out for delivery and has progressed, draw completed path
    if (dt.routeProgressPct > 0) {
      const splitIdx = Math.max(
        1,
        Math.floor((waypoints.length * dt.routeProgressPct) / 100)
      );
      const completedWaypoints = waypoints.slice(0, splitIdx + 1);
      if (completedWaypoints.length >= 2) {
        routeCompletedPolylineRef.current = L.polyline(completedWaypoints, {
          color: isDark ? '#38bdf8' : '#2563eb',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(map);
      }
    }

    // Customer Arrival Geofence Circle (350m buffer)
    customerGeofenceRef.current = L.circle(custPos, {
      radius: 350,
      color: '#10b981',
      fillColor: '#10b981',
      fillOpacity: isDark ? 0.08 : 0.05,
      weight: 1.5,
      dashArray: '4, 4',
    }).addTo(map);

  }, [dt.routeWaypoints, dt.routeProgressPct, isDark, mapReady, restPos[0], restPos[1], custPos[0], custPos[1]]);

  // 4. Update Restaurant & Customer Fixed Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Restaurant Origin Icon
    if (restaurantMarkerRef.current) restaurantMarkerRef.current.remove();
    const restIconHtml = `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-500 shadow-lg text-rose-600 dark:text-rose-400 font-bold transition-transform hover:scale-110">
          <span style="font-size: 18px;">🍽️</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-rose-500 rotate-45"></div>
      </div>
    `;

    const restIcon = L.divIcon({
      className: 'live-tracking-restaurant-icon',
      html: restIconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 42],
      popupAnchor: [0, -42],
    });

    const restPopup = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 170px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #e11d48; letter-spacing: 0.5px;">Pickup Origin</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${order.restaurantName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${order.restaurantAddress}</div>
        <div style="font-size: 11px; color: #10b981; font-weight: 600; margin-top: 4px;">Food safely prepared & packaged</div>
      </div>
    `;

    restaurantMarkerRef.current = L.marker(restPos, { icon: restIcon })
      .bindPopup(restPopup)
      .addTo(map);

    // Customer Destination Icon
    if (customerMarkerRef.current) customerMarkerRef.current.remove();
    const custIconHtml = `
      <div class="relative group cursor-pointer">
        <div class="flex items-center justify-center w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-lg text-emerald-600 dark:text-emerald-400 font-bold transition-transform hover:scale-110">
          <span style="font-size: 18px;">🏠</span>
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-500 rotate-45"></div>
      </div>
    `;

    const custIcon = L.divIcon({
      className: 'live-tracking-customer-icon',
      html: custIconHtml,
      iconSize: [40, 40],
      iconAnchor: [20, 42],
      popupAnchor: [0, -42],
    });

    const custPopup = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 170px;">
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #059669; letter-spacing: 0.5px;">Delivery Destination</div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${order.customerName}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${order.deliveryAddress}</div>
        ${
          order.deliveryNotes
            ? `<div style="font-size: 10px; color: #475569; font-style: italic; background: #f1f5f9; padding: 4px; border-radius: 6px; margin-top: 4px;">"${order.deliveryNotes}"</div>`
            : ''
        }
      </div>
    `;

    customerMarkerRef.current = L.marker(custPos, { icon: custIcon })
      .bindPopup(custPopup)
      .addTo(map);

  }, [order.restaurantName, order.restaurantAddress, order.customerName, order.deliveryAddress, order.deliveryNotes, mapReady]);

  // 5. Update Live Courier Marker and GPS Radar Wave on coordinate shifts
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const courierName = courier ? courier.name : order.courierName || 'Assigned Driver';
    const vehicleType: VehicleType = courier ? courier.vehicleType : (order.courierVehicle as VehicleType) || 'ebike';
    const vehicleEmoji =
      vehicleType === 'car' ? '🚗' : vehicleType === 'van' ? '🚐' : vehicleType === 'scooter' ? '🛵' : '⚡🚲';

    const courierIconHtml = `
      <div class="relative flex items-center justify-center">
        <!-- Live GPS Radar Beacon Rings -->
        <div class="absolute w-12 h-12 rounded-full bg-indigo-500/25 animate-ping"></div>
        <div class="absolute w-8 h-8 rounded-full bg-indigo-500/35"></div>
        
        <!-- Center Vehicle Badge -->
        <div class="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-600 text-white border-2 border-white dark:border-slate-900 shadow-xl transition-transform transform">
          <span style="font-size: 16px;">${vehicleEmoji}</span>
        </div>

        <!-- Live status mini tag -->
        <div class="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold ring-2 ring-white dark:ring-slate-900">
          ✓
        </div>
      </div>
    `;

    const courierIcon = L.divIcon({
      className: 'live-courier-gps-icon',
      html: courierIconHtml,
      iconSize: [48, 48],
      iconAnchor: [24, 24],
      popupAnchor: [0, -26],
    });

    const courierPopup = `
      <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 180px;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #4f46e5; letter-spacing: 0.5px;">Live GPS Signal</span>
          <span style="display: inline-block; width: 6px; height: 6px; background: #10b981; border-radius: 9999px;"></span>
        </div>
        <div style="font-size: 13px; font-weight: 800; color: #0f172a; margin-top: 2px;">${courierName}</div>
        <div style="font-size: 11px; color: #64748b; text-transform: capitalize; margin-top: 1px;">
          ${vehicleType} · Speed: ${courier ? courier.avgSpeedKmh : 24} km/h
        </div>
        <div style="display: flex; gap: 4px; margin-top: 6px; font-size: 11px; font-weight: 700; color: #4f46e5; background: #eef2ff; padding: 4px 8px; border-radius: 8px;">
          <span>${dt.actualRemainingMinutes}m remaining</span>
          <span>·</span>
          <span>${dt.distanceRemainingKm} km to door</span>
        </div>
      </div>
    `;

    if (!courierMarkerRef.current) {
      courierMarkerRef.current = L.marker(courierPos, {
        icon: courierIcon,
        zIndexOffset: 1000,
      })
        .bindPopup(courierPopup)
        .addTo(map);
    } else {
      courierMarkerRef.current.setIcon(courierIcon);
      courierMarkerRef.current.setLatLng(courierPos);
      courierMarkerRef.current.setPopupContent(courierPopup);
    }

    // Auto camera follow if active
    if (followCourier) {
      map.panTo(courierPos, { animate: true, duration: 0.6 });
    }
  }, [courierPos[0], courierPos[1], courier, followCourier, mapReady, dt.actualRemainingMinutes, dt.distanceRemainingKm]);

  // Recenter controls
  const handleRecenterCourier = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.panTo(courierPos, { animate: true, duration: 0.6 });
    setFollowCourier(true);
  };

  const handleFitFullRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([restPos, custPos, courierPos]);
    map.fitBounds(bounds, { padding: [70, 70], animate: true });
    setFollowCourier(false);
  };

  const handleZoom = (delta: number) => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setZoom(map.getZoom() + delta);
  };

  const assignedCourierName = courier?.name || order.courierName || 'Assigned Courier';
  const assignedCourierVehicle = courier?.vehicleType || order.courierVehicle || 'ebike';
  const assignedSpeed = courier?.avgSpeedKmh || 24;

  return (
    <div
      className={`relative w-full ${heightClass} overflow-hidden ${
        className ? className : 'rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm'
      } bg-slate-100 dark:bg-slate-950 select-none transition-colors duration-200`}
    >
      {/* Leaflet DOM Node */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Top Left Floating HUD: Live Order Telemetry & Delivery Progress */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-2 max-w-sm sm:max-w-md pointer-events-auto">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 p-2 sm:px-3.5 sm:py-2 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-md text-xs transition-colors">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div className="flex items-center gap-1.5 font-mono">
            <span className="font-bold text-slate-900 dark:text-white">{order.id}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
              {order.status.replace(/_/g, ' ')}
            </span>
          </div>

          {order.status === 'out_for_delivery' && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-bold font-mono text-[11px]">
              <Zap className="h-3 w-3 text-amber-600 dark:text-amber-400 fill-amber-500" />
              <span>~{dt.actualRemainingMinutes}m ETA</span>
            </div>
          )}
        </div>

        {/* Courier Active Badge */}
        {order.status !== 'delivered' && order.status !== 'rejected' && (
          <div className="hidden sm:flex items-center justify-between gap-3 rounded-xl bg-white/90 dark:bg-slate-900/90 px-3 py-1.5 border border-slate-200 dark:border-slate-800 backdrop-blur-md text-[11px] text-slate-600 dark:text-slate-300 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[10px]">
                {assignedCourierName.charAt(0)}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {assignedCourierName}
              </span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-500 capitalize">{assignedCourierVehicle}</span>
              <span className="text-slate-400">·</span>
              <span className="font-mono text-slate-500">{assignedSpeed} km/h</span>
            </div>

            {onContactDriver && (
              <button
                onClick={onContactDriver}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-[10px]"
              >
                Call Driver
              </button>
            )}
          </div>
        )}
      </div>

      {/* Top Right Floating Controls: Basemap Toggle, Follow Courier, Full Route, Zoom */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col sm:flex-row items-end sm:items-center gap-1.5 pointer-events-auto">
        {/* Basemap Cartography Selector */}
        <button
          onClick={() =>
            setMapStyle((prev) =>
              prev === 'auto'
                ? 'voyager'
                : prev === 'voyager'
                ? 'dark'
                : prev === 'dark'
                ? 'positron'
                : 'auto'
            )
          }
          title="Cycle Map Cartography style (Auto, Voyager, Dark, Clean)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-md transition-colors"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span className="capitalize text-[11px]">
            {mapStyle === 'auto' ? (isDark ? 'Dark Mode' : 'Standard') : mapStyle}
          </span>
        </button>

        {/* Follow Driver Lock Toggle */}
        <button
          onClick={handleRecenterCourier}
          title="Follow courier GPS position as they travel"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-md transition-all ${
            followCourier
              ? 'bg-indigo-600 text-white border-indigo-500 font-bold ring-2 ring-indigo-400/30'
              : 'bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          <span className="text-[11px] whitespace-nowrap">
            {followCourier ? 'Tracking Courier' : 'Follow Courier'}
          </span>
        </button>

        {/* Fit Entire Corridor */}
        <button
          onClick={handleFitFullRoute}
          title="Fit full delivery corridor from kitchen to doorstep"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-md transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span className="text-[11px] whitespace-nowrap">Full Route</span>
        </button>

        {/* Zoom In & Out */}
        <div className="flex items-center rounded-xl bg-white/95 dark:bg-slate-900/95 p-0.5 border border-slate-200 dark:border-slate-800 backdrop-blur-md shadow-md">
          <button
            onClick={() => handleZoom(1)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleZoom(-1)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Live Routing Telemetry Banner */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 px-4 py-2.5 border border-slate-200 dark:border-slate-800 backdrop-blur-md text-xs shadow-md transition-colors pointer-events-auto">
        {/* Route Origin & Destination */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-700 dark:text-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
            <span className="font-bold text-slate-900 dark:text-white truncate max-w-[130px] sm:max-w-[170px]">
              {order.restaurantName}
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">→</span>

          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] sm:max-w-[210px]">
              {order.deliveryAddress}
            </span>
          </div>
        </div>

        {/* Live Distance, Progress and ETA Numbers */}
        <div className="flex items-center justify-between sm:justify-end gap-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 pt-1.5 sm:pt-0">
          <div className="flex items-center gap-1.5">
            <Navigation className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {dt.distanceRemainingKm} km
            </span>
            <span>remaining</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">·</span>

          <div className="flex items-center gap-1.5">
            <Radio className="h-3 w-3 text-emerald-500" />
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {dt.routeProgressPct}%
            </span>
            <span>progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

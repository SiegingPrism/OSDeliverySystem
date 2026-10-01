import React, { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import {
  Bike,
  Building2,
  Car,
  Compass,
  Layers,
  LocateFixed,
  MapPin,
  Maximize2,
  Navigation,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { Order, VehicleType } from '../../types/delivery';

interface IntegratedMapServiceProps {
  order: Order;
  heightClass?: string;
  autoCenterDriver?: boolean;
}

export const IntegratedMapService: React.FC<IntegratedMapServiceProps> = ({
  order,
  heightClass = 'h-[500px]',
  autoCenterDriver = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const radiusCircleRef = useRef<L.Circle | null>(null);
  const waypointMarkersRef = useRef<L.Marker[]>([]);

  const [mapReady, setMapReady] = useState(false);
  const [followDriver, setFollowDriver] = useState(autoCenterDriver);
  const [tileLayerType, setTileLayerType] = useState<'positron' | 'voyager'>('positron');

  const dt = order.distanceTiming;
  const currentPos = dt.courierPosition || [order.restaurantLat, order.restaurantLng];

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [order.restaurantLat, order.restaurantLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      // High-detail vector-rendered basemap
      const tileUrl =
        tileLayerType === 'voyager'
          ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
          : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      mapInstanceRef.current = map;
      setMapReady(true);

      const bounds = L.latLngBounds([
        [order.restaurantLat, order.restaurantLng],
        [order.customerLat, order.customerLng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60] });

      return () => {
        map.remove();
        mapInstanceRef.current = null;
      };
    } catch (err) {
      console.error('Leaflet initialization error:', err);
    }
  }, [order.id, tileLayerType]);

  // Update Markers, Route and Delivery Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Clear old waypoint markers
    waypointMarkersRef.current.forEach((m) => m.remove());
    waypointMarkersRef.current = [];

    // 1. Restaurant Origin Marker with clean SVG icon
    const restaurantIcon = L.divIcon({
      className: 'custom-rest-icon',
      html: `
        <div style="
          width: 34px;
          height: 34px;
          background: #ffffff;
          border: 2.5px solid #e11d48;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(225, 29, 72, 0.35);
          font-weight: bold;
          font-size: 15px;
        ">
          🍽️
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const restMarker = L.marker([order.restaurantLat, order.restaurantLng], {
      icon: restaurantIcon,
    }).addTo(map);
    restMarker.bindTooltip(
      `<div style="font-family: sans-serif; font-size: 11px;"><strong>${order.restaurantName}</strong><br/><span style="color: #64748b;">Pickup Kitchen Hub</span></div>`,
      { direction: 'top' }
    );

    // 2. Customer Destination Marker with dropoff pin
    const customerIcon = L.divIcon({
      className: 'custom-cust-icon',
      html: `
        <div style="
          width: 32px;
          height: 32px;
          background: #ffffff;
          border: 2.5px solid #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          font-size: 14px;
        ">
          📍
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const custMarker = L.marker([order.customerLat, order.customerLng], {
      icon: customerIcon,
    }).addTo(map);
    custMarker.bindTooltip(
      `<div style="font-family: sans-serif; font-size: 11px;"><strong>${order.customerName}</strong><br/><span style="color: #64748b;">${order.deliveryAddress}</span></div>`,
      { direction: 'top' }
    );

    // 3. Express Delivery Service Radius Circle (2.0 km)
    if (radiusCircleRef.current) {
      map.removeLayer(radiusCircleRef.current);
    }
    const circle = L.circle([order.restaurantLat, order.restaurantLng], {
      radius: 2000,
      color: '#4f46e5',
      fillColor: '#6366f1',
      fillOpacity: 0.04,
      weight: 1.5,
      dashArray: '5, 5',
    }).addTo(map);
    radiusCircleRef.current = circle;

    // 4. Route Polyline with sleek Indigo stroke
    if (dt.routeWaypoints && dt.routeWaypoints.length > 0) {
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }

      const polyline = L.polyline(dt.routeWaypoints, {
        color: '#4f46e5',
        weight: 4.5,
        opacity: 0.9,
        dashArray: order.status === 'out_for_delivery' ? '8, 6' : undefined,
      }).addTo(map);

      routePolylineRef.current = polyline;

      // Add intermediate waypoint milestone markers along the path
      if (dt.routeWaypoints.length > 3) {
        const midIdx = Math.floor(dt.routeWaypoints.length / 2);
        const midPt = dt.routeWaypoints[midIdx];
        const waypointIcon = L.divIcon({
          className: 'custom-wp-icon',
          html: `<div style="width: 8px; height: 8px; background: #4f46e5; border: 2px solid #ffffff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
          iconSize: [8, 8],
          iconAnchor: [4, 4],
        });
        const wpMarker = L.marker(midPt, { icon: waypointIcon }).addTo(map);
        wpMarker.bindTooltip(
          `<span style="font-size: 10px; font-family: monospace;">Transit Corridor · ${(dt.roadDistanceKm / 2).toFixed(1)}km</span>`,
          { direction: 'top' }
        );
        waypointMarkersRef.current.push(wpMarker);
      }
    }

    return () => {
      restMarker.remove();
      custMarker.remove();
      if (radiusCircleRef.current) {
        map.removeLayer(radiusCircleRef.current);
      }
      if (routePolylineRef.current) {
        map.removeLayer(routePolylineRef.current);
      }
      waypointMarkersRef.current.forEach((m) => m.remove());
    };
  }, [mapReady, order.restaurantId, order.deliveryAddress, dt.roadDistanceKm]);

  // Dynamic Driver Marker update with live position
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (order.status !== 'out_for_delivery' && order.status !== 'ready') {
      if (driverMarkerRef.current) {
        map.removeLayer(driverMarkerRef.current);
        driverMarkerRef.current = null;
      }
      return;
    }

    const driverIcon = L.divIcon({
      className: 'custom-driver-icon',
      html: `
        <div style="position: relative; width: 44px; height: 44px;">
          <div style="
            position: absolute;
            inset: -4px;
            border-radius: 50%;
            background: rgba(79, 70, 229, 0.3);
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: absolute;
            inset: 0;
            background: #ffffff;
            border: 3px solid #4f46e5;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 14px rgba(79, 70, 229, 0.45);
            font-size: 18px;
          ">
            ${order.courierVehicle === 'car' ? '🚗' : order.courierVehicle === 'scooter' ? '🛵' : '🚴'}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    if (!driverMarkerRef.current) {
      driverMarkerRef.current = L.marker(currentPos, { icon: driverIcon }).addTo(map);
    } else {
      driverMarkerRef.current.setLatLng(currentPos);
    }

    driverMarkerRef.current.bindTooltip(
      `<div style="font-family: sans-serif; font-size: 11px;">
        <strong>${order.courierName || 'Courier Driver'}</strong><br/>
        <span style="color: #4f46e5; font-family: monospace; font-weight: bold;">
          ${dt.actualRemainingMinutes}m · ${dt.distanceRemainingKm}km remaining
        </span>
      </div>`,
      { direction: 'top', permanent: false }
    );

    if (followDriver && order.status === 'out_for_delivery') {
      map.panTo(currentPos, { animate: true, duration: 0.5 });
    }
  }, [currentPos[0], currentPos[1], order.status, followDriver, mapReady]);

  const handleRecenterRoute = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const bounds = L.latLngBounds([
      [order.restaurantLat, order.restaurantLng],
      [order.customerLat, order.customerLng],
    ]);
    map.fitBounds(bounds, { padding: [60, 60], animate: true });
    setFollowDriver(false);
  };

  const handleFocusDriver = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.panTo(currentPos, { animate: true, duration: 0.5 });
    setFollowDriver(true);
  };

  return (
    <div className={`relative w-full ${heightClass} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm select-none`}>
      {/* Map Viewport Container */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Floating HUD Top Left: Live Status Overlay */}
      <div className="absolute top-3.5 left-3.5 z-20 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 border border-slate-200 backdrop-blur-md text-xs font-medium text-slate-700 shadow-md">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold text-slate-900 font-mono">{order.id}</span>
          <span className="text-slate-300">·</span>
          <span className="text-indigo-700 capitalize font-mono font-bold">
            {order.status.replace(/_/g, ' ')}
          </span>
        </div>

        {order.status === 'out_for_delivery' && (
          <div className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>
              Arriving in {dt.actualRemainingMinutes}m · {dt.distanceRemainingKm} km away
            </span>
          </div>
        )}
      </div>

      {/* Floating Controls Top Right: Camera Follow, Recenter & Map Style */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
        <button
          onClick={() => setTileLayerType(tileLayerType === 'positron' ? 'voyager' : 'positron')}
          title="Switch Map Cartography"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 backdrop-blur-md shadow-md transition-colors"
        >
          <Layers className="h-3.5 w-3.5 text-indigo-600" />
          <span>{tileLayerType === 'positron' ? 'Detailed' : 'Light'}</span>
        </button>

        <button
          onClick={handleFocusDriver}
          title="Follow Driver Live"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold backdrop-blur-md shadow-md transition-all ${
            followDriver
              ? 'bg-indigo-600 text-white border-indigo-500 font-bold'
              : 'bg-white/95 border-slate-200 text-slate-700 hover:text-slate-900'
          }`}
        >
          <LocateFixed className="h-3.5 w-3.5" />
          <span>Follow Driver</span>
        </button>

        <button
          onClick={handleRecenterRoute}
          title="Fit Whole Route"
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/95 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 backdrop-blur-md shadow-md transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          <span>Full Route</span>
        </button>
      </div>

      {/* Bottom Live Telemetry Overlay */}
      <div className="absolute bottom-3.5 left-3.5 right-3.5 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white/95 px-4 py-2.5 border border-slate-200 backdrop-blur-md text-xs text-slate-700 shadow-md">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-600 font-bold">●</span>
            <span className="text-slate-900 font-semibold">{order.restaurantName}</span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-1.5">
            <span className="text-blue-600 font-bold">●</span>
            <span className="text-slate-700 truncate max-w-[200px]">
              {order.deliveryAddress}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-600">
          <span>{dt.roadDistanceKm} km road</span>
          <span className="text-slate-300">/</span>
          {order.courierName ? (
            <span className="text-indigo-700 font-bold">
              {order.courierName} ({order.courierVehicle})
            </span>
          ) : (
            <span className="text-slate-400">Pending Driver</span>
          )}
        </div>
      </div>
    </div>
  );
};

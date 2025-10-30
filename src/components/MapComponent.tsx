import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Enhanced map styles
const mapStyles = {
  standard: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
};

interface MapLocation {
  lat: number;
  lng: number;
  label: string;
  type: 'start' | 'stop' | 'destination' | 'current';
}

interface MapComponentProps {
  locations: MapLocation[];
  showRoute?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  style?: 'standard' | 'satellite' | 'dark' | 'terrain';
  interactive?: boolean;
  showTraffic?: boolean;
  show3D?: boolean;
}

export function MapComponent({ 
  locations, 
  showRoute = true, 
  center, 
  zoom = 10,
  height = '400px',
  className = '',
  style = 'standard',
  interactive = true,
  showTraffic = false,
  show3D = false
}: MapComponentProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Determine center based on locations if not provided
    const mapCenter = center || (locations.length > 0 
      ? [locations[0].lat, locations[0].lng] as [number, number]
      : [25.2048, 55.2708] as [number, number]); // Default: Dubai

    // Initialize map with enhanced options
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      zoomAnimation: true,
      fadeAnimation: true,
      markerZoomAnimation: true
    }).setView(mapCenter, zoom);
    mapRef.current = map;

    // Add enhanced tile layer
    L.tileLayer(mapStyles[style], {
      attribution: style === 'satellite' ? '© Esri' : '© OpenStreetMap contributors',
      maxZoom: 19,
      opacity: 0.9
    }).addTo(map);

    // Add traffic layer if requested
    if (showTraffic) {
      L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png?apikey=YOUR_API_KEY', {
        attribution: '© Thunderforest',
        opacity: 0.5
      }).addTo(map);
    }

    // Disable interaction if specified
    if (!interactive) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || locations.length === 0) return;

    const map = mapRef.current;

    // Clear existing layers except tile layer
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polyline) {
        map.removeLayer(layer);
      }
    });

    // Enhanced custom icons with animations
    const createIcon = (type: string, color: string) => {
      const isCurrentLocation = type === 'current';
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background: ${isCurrentLocation ? `radial-gradient(circle, ${color}, ${color}80)` : color};
            width: ${isCurrentLocation ? '20px' : '36px'};
            height: ${isCurrentLocation ? '20px' : '36px'};
            border-radius: ${isCurrentLocation ? '50%' : '50% 50% 50% 0'};
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transform: ${isCurrentLocation ? 'none' : 'rotate(-45deg)'};
            display: flex;
            align-items: center;
            justify-content: center;
            animation: ${isCurrentLocation ? 'pulse 2s infinite' : 'none'};
          ">
            <div style="
              transform: ${isCurrentLocation ? 'none' : 'rotate(45deg)'};
              color: white;
              font-size: ${isCurrentLocation ? '10px' : '16px'};
              font-weight: bold;
            ">${type === 'start' ? 'A' : type === 'destination' ? 'B' : type === 'current' ? '●' : '◉'}</div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.2); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
        iconSize: [isCurrentLocation ? 20 : 36, isCurrentLocation ? 20 : 36],
        iconAnchor: [isCurrentLocation ? 10 : 18, isCurrentLocation ? 10 : 36],
        popupAnchor: [0, isCurrentLocation ? -10 : -36],
      });
    };

    const markers: L.Marker[] = [];
    const routePoints: [number, number][] = [];

    // Add markers for each location
    locations.forEach((loc, index) => {
      let iconColor = '#008080'; // Primary teal
      if (loc.type === 'destination') iconColor = '#880044'; // Accent burgundy
      if (loc.type === 'stop') iconColor = '#607D4B'; // Secondary olive green
      if (loc.type === 'current') iconColor = '#0ea5e9'; // Blue for current location

      const marker = L.marker([loc.lat, loc.lng], {
        icon: createIcon(loc.type, iconColor)
      }).addTo(map);

      marker.bindPopup(`
        <div style="min-width: 180px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="background: linear-gradient(135deg, ${iconColor}, ${iconColor}80); color: white; padding: 8px; margin: -8px -8px 8px -8px; border-radius: 4px 4px 0 0;">
            <strong style="font-size: 16px;">${loc.label}</strong>
          </div>
          <div style="padding: 4px 0;">
            <small style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
              ${loc.type === 'start' ? '🚀 Starting Point' : 
                loc.type === 'destination' ? '🎯 Destination' :
                loc.type === 'current' ? '📍 Current Location' : 
                '⭕ Stop ' + index}
            </small>
          </div>
          ${loc.type === 'current' ? '<div style="font-size: 11px; color: #10b981; margin-top: 4px;">● Live tracking active</div>' : ''}
        </div>
      `, {
        closeButton: true,
        autoClose: false,
        className: 'custom-popup'
      });

      markers.push(marker);
      routePoints.push([loc.lat, loc.lng]);
    });

    // Enhanced route visualization
    if (showRoute && routePoints.length > 1) {
      // Main route line with gradient effect
      const polyline = L.polyline(routePoints, {
        color: '#0088ff',
        weight: 6,
        opacity: 0.8,
        smoothFactor: 1,
        className: 'animated-route'
      }).addTo(map);

      // Route outline for better visibility
      const routeOutline = L.polyline(routePoints, {
        color: '#ffffff',
        weight: 10,
        opacity: 0.6,
        smoothFactor: 1,
      }).addTo(map);
      
      // Send outline to back
      routeOutline.bringToBack();

      // Add direction arrows
      for (let i = 0; i < routePoints.length - 1; i++) {
        const start = routePoints[i];
        const end = routePoints[i + 1];
        const midpoint: [number, number] = [
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2
        ];
        
        const angle = Math.atan2(end[1] - start[1], end[0] - start[0]) * 180 / Math.PI;
        
        const arrowIcon = L.divIcon({
          html: `<div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-bottom: 16px solid #0088ff;
            transform: rotate(${angle + 90}deg);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });
        
        L.marker(midpoint, { icon: arrowIcon }).addTo(map);
      }

      // Fit map to show all markers with padding
      const group = L.featureGroup([...markers, polyline]);
      map.fitBounds(group.getBounds().pad(0.15));
    } else if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.15));
    }

    // Add custom CSS for animations
    const style = document.createElement('style');
    style.textContent = `
      .animated-route {
        animation: routeFlow 3s linear infinite;
      }
      @keyframes routeFlow {
        0% { stroke-dasharray: 0 20; }
        100% { stroke-dasharray: 20 0; }
      }
    `;
    document.head.appendChild(style);
  }, [locations, showRoute]);

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapContainerRef} 
        style={{ height, width: '100%' }}
        className="rounded-lg overflow-hidden border border-border shadow-lg"
      />
      {show3D && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700">
          3D View Active
        </div>
      )}
      {showTraffic && (
        <div className="absolute top-2 left-2 bg-red-500/90 text-white px-2 py-1 rounded text-xs font-medium">
          🚦 Traffic Layer
        </div>
      )}
    </div>
  );
}

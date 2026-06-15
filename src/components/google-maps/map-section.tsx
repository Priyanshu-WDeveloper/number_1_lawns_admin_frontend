import { useCallback, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '100%',
};

interface MapSectionProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onPick: (lat: number, lng: number, address?: string) => void;
  onControllerReady: (controller: MapController) => void;
  apiKey: string;
  initialCenter: { lat: number; lng: number };
}

export interface MapController {
  panTo: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
}

export default function MapSection({
  latitude,
  longitude,
  onPick,
  onControllerReady,
  apiKey,
  initialCenter,
}: MapSectionProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const lastNominatimRef = useRef(0);
  const geocodingRef = useRef(false);
  const lastAddressRef = useRef('');

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng || geocodingRef.current) return;
      const lat = Math.round(e.latLng.lat() * 10000) / 10000;
      const lng = Math.round(e.latLng.lng() * 10000) / 10000;

      const now = Date.now();
      if (now - lastNominatimRef.current < 1100) {
        onPick(lat, lng, lastAddressRef.current || undefined);
        return;
      }

      geocodingRef.current = true;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          { headers: { 'User-Agent': 'No1LawnsAdmin/1.0' } },
        );
        if (res.ok) {
          const data = await res.json();
          lastNominatimRef.current = Date.now();
          lastAddressRef.current = data.display_name;
          geocodingRef.current = false;
          onPick(lat, lng, data.display_name);
          return;
        }
      } catch {
      }
      geocodingRef.current = false;
      onPick(lat, lng, lastAddressRef.current || undefined);
    },
    [onPick],
  );

  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      onControllerReady({
        panTo: (lat: number, lng: number) => {
          map.panTo({ lat, lng });
        },
        setZoom: (zoom: number) => {
          map.setZoom(zoom);
        },
      });
    },
    [onControllerReady],
  );

  if (loadError) {
    return (
      <div className="relative h-56 rounded-xl overflow-hidden border border-border bg-[#e8f0e4] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-destructive/30 mx-auto" />
          <p className="text-xs text-destructive/60 mt-1">Failed to load map. Check API key.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-56 rounded-xl overflow-hidden border border-border bg-[#e8f0e4] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-primary/20 mx-auto" />
          <p className="text-xs text-primary/40 mt-1">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-56 rounded-xl overflow-hidden border border-border">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={initialCenter}
        zoom={12}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onClick={handleMapClick}
        onLoad={handleLoad}
      >
        {latitude && longitude && (
          <Marker position={{ lat: latitude, lng: longitude }} />
        )}
      </GoogleMap>
    </div>
  );
}

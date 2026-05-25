import { useCallback, useRef, useState } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { MapPin, Crosshair, Search } from 'lucide-react';
import { MockMapPicker } from '@/components/forms/mock-map-picker';

const containerStyle = {
  width: '100%',
  height: '100%',
};

interface GoogleMapPickerProps {
  latitude: number;
  longitude: number;
  onPick: (lat: number, lng: number) => void;
}

const statusMessages: Record<string, string> = {
  ZERO_RESULTS: 'No results found for this address.',
  OVER_QUERY_LIMIT: 'Too many requests. Please wait a moment.',
  REQUEST_DENIED: 'Geocoding API is not enabled. Enable it in Google Cloud Console.',
  INVALID_REQUEST: 'Invalid search request. Please enter a valid address.',
  UNKNOWN_ERROR: 'Server error. Please try again.',
};

export function GoogleMapPicker({
  latitude,
  longitude,
  onPick,
}: GoogleMapPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  });

  const initialCenter = useRef<{ lat: number; lng: number }>({
    lat: latitude || 20.5937,
    lng: longitude || 78.9629,
  });

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !mapRef.current) return;

    setIsSearching(true);
    setSearchError(null);

    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ address: searchQuery }, (results, status) => {
      setIsSearching(false);

      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        const lat = Math.round(location.lat() * 10000) / 10000;
        const lng = Math.round(location.lng() * 10000) / 10000;

        mapRef.current?.panTo({ lat, lng });
        mapRef.current?.setZoom(15);
        onPick(lat, lng);
        setSearchQuery(results[0].formatted_address);
      } else {
        const message = statusMessages[status] || `Address not found (status: ${status}). Try a different search.`;
        setSearchError(message);
        console.warn('Geocoding failed:', status, results);
      }
    });
  }, [searchQuery, onPick]);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = Math.round(e.latLng.lat() * 10000) / 10000;
      const lng = Math.round(e.latLng.lng() * 10000) / 10000;
      setSearchError(null);
      onPick(lat, lng);
    },
    [onPick],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!apiKey || loadError) {
    return (
      <MockMapPicker
        latitude={latitude}
        longitude={longitude}
        onPick={onPick}
      />
    );
  }

  if (!isLoaded) {
    return (
      <div className="relative h-56 rounded-xl overflow-hidden border border-[#e5e5e5] bg-[#e8f0e4] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="h-10 w-10 text-[#16610E]/20 mx-auto" />
          <p className="text-xs text-[#16610E]/40 mt-1">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#777]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter address to search..."
            className="w-full h-12 pl-10 pr-4 rounded-xl border border-[#e5e5e5] bg-[#fafaf8] text-sm focus:outline-none focus:ring-2 focus:ring-[#16610E]/20 focus:border-[#16610E]"
          />
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="h-12 px-4 rounded-xl bg-[#16610E] text-white font-medium text-sm hover:bg-[#145a0c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-500">{searchError}</p>
      )}

      <div className="relative h-56 rounded-xl overflow-hidden border border-[#e5e5e5]">
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={initialCenter.current}
          zoom={12}
          options={{
            disableDefaultUI: true,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          }}
          onClick={handleMapClick}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {latitude && longitude && (
            <Marker position={{ lat: latitude, lng: longitude }} />
          )}
        </GoogleMap>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#777] flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Click on the map or search to set coordinates
        </p>
        {(latitude || longitude) && (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs border border-[#e5e5e5]">
            <Crosshair className="h-3 w-3 text-[#16610E]" />
            <span className="text-[#151515] font-mono">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

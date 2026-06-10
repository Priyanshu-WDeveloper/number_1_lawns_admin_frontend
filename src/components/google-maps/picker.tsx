import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import { MapPin, Crosshair, Search, X } from 'lucide-react';
import { MockMapPicker } from '@/components/forms/mock-map-picker';

const MapSection = lazy(() => import('./map-section'));

interface MapController {
  panTo: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleMapPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onPick: (lat: number, lng: number) => void;
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
}

export function GoogleMapPicker({
  latitude,
  longitude,
  onPick,
}: GoogleMapPickerProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const controllerRef = useRef<MapController | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    searchTimerRef.current = setTimeout(() => {
      setIsSearching(true);
      setSearchError(null);
      fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=in,nz&limit=5`,
        { headers: { 'User-Agent': 'No1LawnsAdmin/1.0' } },
      )
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data: NominatimResult[]) => {
          setSearchResults(data);
          setShowResults(data.length > 0);
          if (data.length === 0) setSearchError('No results found. Try a different search.');
        })
        .catch((err) => {
          setSearchError('Search failed. Please try again.');
          console.error('Nominatim search error:', err);
        })
        .finally(() => setIsSearching(false));
    }, 500);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchQuery]);

  const initialCenter = useRef<{ lat: number; lng: number }>({
    lat: latitude || 20.5937,
    lng: longitude || 78.9629,
  });

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);

    setIsSearching(true);
    setSearchError(null);
    setShowResults(false);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&countrycodes=in,nz&limit=5`,
        { headers: { 'User-Agent': 'No1LawnsAdmin/1.0' } },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
      setShowResults(data.length > 0);
      if (data.length === 0) {
        setSearchError('No results found. Try a different search.');
      }
    } catch (err) {
      setSearchError('Search failed. Please try again.');
      console.error('Nominatim search error:', err);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  const handleSelectResult = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    controllerRef.current?.panTo(lat, lng);
    controllerRef.current?.setZoom(15);
    onPick(
      Math.round(lat * 10000) / 10000,
      Math.round(lng * 10000) / 10000,
    );
    setSearchQuery(result.display_name);
    setShowResults(false);
    setSearchError(null);
  };

  const handleControllerReady = useCallback((controller: MapController) => {
    controllerRef.current = controller;
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  if (!apiKey) {
    return (
      <MockMapPicker
        latitude={latitude}
        longitude={longitude}
        onPick={onPick}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter address to search..."
            className="w-full h-12 pl-10 pr-10 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowResults(false);
                setSearchError(null);
                setSearchResults([]);
                if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {showResults && (
            <div className="absolute z-10 w-full mt-1 rounded-xl border border-border bg-white shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((r) => (
                <button
                  key={r.place_id}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-muted/50 border-b border-border last:border-0 transition-colors"
                >
                  <span className="text-foreground">{r.display_name}</span>
                  <span className="text-xs text-muted-foreground capitalize ml-2">
                    ({r.type})
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="h-12 px-4 rounded-xl bg-green-600 text-white font-medium text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchError && (
        <p className="text-xs text-red-500">{searchError}</p>
      )}

      <Suspense
        fallback={
          <div className="relative h-56 rounded-xl overflow-hidden border border-border bg-[#e8f0e4] flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-10 w-10 text-primary/20 mx-auto" />
              <p className="text-xs text-primary/40 mt-1">Loading map...</p>
            </div>
          </div>
        }
      >
        <MapSection
          latitude={latitude}
          longitude={longitude}
          onPick={onPick}
          onControllerReady={handleControllerReady}
          apiKey={apiKey}
          initialCenter={initialCenter.current}
        />
      </Suspense>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          Click on the map or search to set coordinates
        </p>
        {latitude != null && longitude != null && (
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs border border-border">
            <Crosshair className="h-3 w-3 text-primary" />
            <span className="text-foreground font-mono">
              {latitude.toFixed(4)}, {longitude.toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

import { MapPin, Crosshair } from 'lucide-react';

interface MockMapPickerProps {
  latitude: number | undefined;
  longitude: number | undefined;
  onPick: (lat: number, lng: number) => void;
}

const DEFAULT_LAT = 20.5937;
const DEFAULT_LNG = 78.9629;
const LAT_RANGE = 10;
const LNG_RANGE = 12;

export function MockMapPicker({ latitude, longitude, onPick }: MockMapPickerProps) {
  const displayLat = latitude != null ? latitude : DEFAULT_LAT;
  const displayLng = longitude != null ? longitude : DEFAULT_LNG;

  const pinX = Math.min(
    95,
    Math.max(5, ((displayLng - (DEFAULT_LNG - LNG_RANGE)) / (LNG_RANGE * 2)) * 100)
  );
  const pinY = Math.min(
    90,
    Math.max(5, ((DEFAULT_LAT + LAT_RANGE - displayLat) / (LAT_RANGE * 2)) * 100)
  );

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const lng = (DEFAULT_LNG - LNG_RANGE) + (x / 100) * (LNG_RANGE * 2);
    const lat = (DEFAULT_LAT + LAT_RANGE) - (y / 100) * (LAT_RANGE * 2);

    onPick(
      Math.round(lat * 10000) / 10000,
      Math.round(lng * 10000) / 10000
    );
  };

  return (
    <div className="space-y-3">
      <div
        className="relative h-56 rounded-xl overflow-hidden border border-border bg-[#e8f0e4] cursor-crosshair select-none"
        onClick={handleClick}
      >
        <div className="absolute inset-0 opacity-20">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute w-full border-t border-primary"
              style={{ top: `${(i + 1) * 8}%` }}
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute h-full border-l border-primary"
              style={{ left: `${(i + 1) * 8}%` }}
            />
          ))}
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <MapPin className="h-10 w-10 text-primary/20 mx-auto" />
            <p className="text-xs text-primary/40 mt-1">Click anywhere to place pin</p>
          </div>
        </div>

        {(latitude || longitude) && (
          <div
            className="absolute z-10 -translate-x-1/2 -translate-y-full transition-all duration-150"
            style={{ left: `${pinX}%`, top: `${pinY}%` }}
          >
            <div className="relative">
              <MapPin className="h-8 w-8 text-primary drop-shadow-lg" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-primary rounded-full" />
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs">
          <Crosshair className="h-3 w-3 text-primary" />
          <span className="text-foreground font-mono">
            {displayLat.toFixed(4)}, {displayLng.toFixed(4)}
          </span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        Click on the map to set coordinates. Address fields below can be filled manually.
      </p>
    </div>
  );
}

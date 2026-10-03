import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

const DEFAULT_CENTER = { lat: 47.5316, lng: 21.6273 };

export default function MapContainer({
  lat,
  lng,
}: {
  lat?: number;
  lng?: number;
}) {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const hasPosition = Number.isFinite(lat) && Number.isFinite(lng);

  const center = useMemo(
    () =>
      hasPosition
        ? { lat: lat as number, lng: lng as number }
        : DEFAULT_CENTER,
    [hasPosition, lat, lng],
  );

  const options = useMemo(
    () => ({
      disableDefaultUI: true,
      zoomControl: true,
    }),
    [],
  );

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="h-full w-full overflow-hidden shadow-sm">
      <GoogleMap
        zoom={15}
        center={center}
        mapContainerClassName="h-full w-full"
        options={options}
      >
        {hasPosition && (
          <Marker
            position={center}
            icon="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMap>
    </div>
  );
}

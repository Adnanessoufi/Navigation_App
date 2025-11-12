import PhotoGallery from "./PhotoGallery";
import PhotoUploader from "./PhotoUploader";
import ReviewSection from "./Review/ReviewSection";
import { useNavigate } from "react-router-dom";

type PlaceLite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  ratingAvg?: number;
  ratingCount?: number;
  type?: string;
};

type LatLng = { lat: number; lng: number };

export default function PlaceMediaPanel({
  place, isLoggedIn, onUploaded, refreshKey, fallbackCenter, onOpenComposer, onStats,                         // ⬅️ NEW
}: {
  place?: PlaceLite; isLoggedIn: boolean;
  onUploaded?: () => void; refreshKey?: number | string;
  fallbackCenter?: LatLng | null; onOpenComposer: () => void;
  onStats?: (s: { avg: number; total: number }) => void;  // ⬅️ NEW
}) {
  const mapsLat = place?.lat ?? fallbackCenter?.lat ?? 0;
  const mapsLng = place?.lng ?? fallbackCenter?.lng ?? 0;

  const navigate = useNavigate();

  const ratingAvg = place?.ratingAvg ?? 0;
  const ratingCount = place?.ratingCount ?? 0;
  const fullStars = Math.round(ratingAvg);

  function handleClick() {
    console.log("IsLoggedIn: ",isLoggedIn);
    if(!isLoggedIn){
      alert("Please log in to write a review.");
      navigate("/login");
      return;
    }
    onOpenComposer();
  }

  return (
    <div className="rounded-2xl border bg-white shadow-sm p-0 overflow-hidden">
      {/* Photo on top */}
      <div className="p-0">
        {place ? (
          <PhotoGallery
            key={String(refreshKey ?? place.id)}
            placeId={place.id}
            variant="cardCover"
          />
        ) : (
          <div className="aspect-[16/9] grid place-items-center bg-gray-50 text-sm text-gray-500">
            Choose a place to see photos.
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <h2 className="text-xl font-medium text-gray-900 truncate flex items-baseline">
          {place?.name ?? "Select a place"}
        </h2>

        {/* stars + avg + count */}
        <div className="mt-1 flex items-center gap-1">
          <span className="text-amber-500 text-base">
            {"★".repeat(fullStars)}
          </span>
          <span className="text-gray-300 text-base">
            {"★".repeat(5 - fullStars)}
          </span>
          <span className="ml-1 text-sm font-medium text-gray-800">
            {ratingAvg.toFixed(1)}
          </span>
          <span className="text-sm text-gray-500">({ratingCount})</span>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between">
          <div onClick={(e) => e.stopPropagation()}>
            {!!place && isLoggedIn && (
              <PhotoUploader placeId={place.id} onUploaded={onUploaded} />
            )}
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapsLat},${mapsLng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#002676] underline text-sm hover:no-underline hover:text-gray-600"
          >
            {/* icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                 fill="currentColor" className="h-4 w-4">
              <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7m0 9.5a2.5 2.5 0 1 1 0-5a2.5 2.5 0 0 1 0 5" />
            </svg>
            View on Google Maps
          </a>
        </div>
      </div>

      <div className="px-4 pb-2">
          <div className="flex justify-center">
            {!!place && (
              <button
                type="button"
                onClick={handleClick}
                className="inline-flex items-center gap-2 rounded-full border border-[#c5c5c5] px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
              > Write a review
              </button>
            )}
          </div>
      </div>

      {/* ⬇️ Reviews inside the panel, under the button */}
      {!!place?.id && (
        <div className="px-4 pb-4">
          <ReviewSection
            placeId={place.id}
            onStats={onStats}
            refreshKey={typeof refreshKey === "number" ? refreshKey : undefined}
          />
        </div>
      )}
    </div>
  );
}

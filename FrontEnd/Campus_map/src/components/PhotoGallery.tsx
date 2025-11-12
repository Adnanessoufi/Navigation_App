import { useEffect, useState, useMemo } from "react";
import { clThumb } from "../lib/cloudinaryUrl";


type Photo = {
  id: string;
  url: string;
  caption: string | null;
  isPrimary: boolean;
  order: number | null;
};

export default function PhotoGallery({ placeId, variant = "default" }: { placeId: string, variant?: "default" | "cardCover" }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    try {
      setErr(null);
      setLoading(true);
      const res = await fetch(`/api/places/${placeId}/photos`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load photos");
      const data: Photo[] = await res.json();
      data.sort(
        (a, b) =>
          Number(b.isPrimary) - Number(a.isPrimary) ||
          (a.order ?? 9999) - (b.order ?? 9999)
      );
      setPhotos(data);
      setIdx(0);
    } catch (e: any) {
      setErr(e.message || "Failed to load photos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (placeId) load();
  }, [placeId]);

  // helpers
  const canNav = photos.length > 1;
  const current = photos[idx] ?? null;
  const heroSrc = useMemo(
    () => (current ? clThumb(current.url, { w: 900, h: 520, fit: "fill" }) : ""),
    [current]
  );
  const cover = variant === "cardCover";
  const goPrev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const goNext = () => setIdx((i) => (i + 1) % photos.length);

  if (!placeId) return null;
  if (loading) return <div className="text-sm text-gray-500">Loading photos…</div>;
  if (err) return <div className="text-sm text-red-600">{err}</div>;
  if (!photos.length) return <div className="text-sm text-gray-500">No photos yet.<span className="ml-1">Add the first one →</span></div>;

  return (
    <div className="relative">
      {/* image box */}
    <div
        className={ cover ? // no rounding/border/shadow (card will provide it)
              "w-full h-56 sm:h-64 md:h-72 overflow-hidden bg-gray-50 relative"
            : // your current standalone styling
              "w-full aspect-[16/9] rounded-2xl overflow-hidden border shadow-sm bg-gray-50 relative focus-visible:ring-2 focus-visible:ring-black/30 "
        }>
        <img
          src={heroSrc} sizes="(min-width: 1024px) 720px, 100vw"
          alt={current?.caption ?? "Place photo"} className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* primary badge */}
      {current?.isPrimary && (
        <span className="absolute top-3 left-3 text-[11px] bg-black/70 text-white px-2 py-0.5 rounded">
          Primary
        </span>
      )}

      {/* counter */}
      <span className="absolute bottom-3 right-3 text-xs bg-black/65 text-white px-2 py-0.5 rounded">
        {idx + 1} / {photos.length}
      </span>

      {/* arrows */}
      {canNav && (
        <>
          <button
            onClick={goPrev}
            aria-label="Previous photo"
            className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/55 shadow p-2 border"
          >
            ‹
          </button>
          <button
            onClick={goNext}
            aria-label="Next photo"
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/20 hover:bg-white/55 shadow p-2 border"
          >
            ›
          </button>
        </>
      )}

    </div>
  );
}

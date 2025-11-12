// src/components/AddReviewModal.tsx
import { useEffect, useState } from "react";


export default function AddReviewModal({
  open,
  onClose,
  placeId,
  onPosted, // tell parent to refresh reviews
}: {
  open: boolean;
  onClose: () => void;
  placeId: string;
  onPosted?: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRating(0);
      setHover(null);
      setComment("");
      setErr(null);
      setLoading(false);
    }
  }, [open]);

  async function submit() {
    if (!rating) return (
      alert("Please select a star rating."),
      setErr("Please select a star rating.")
    );
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, rating, comment }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to post review");
      onPosted?.();
      onClose();
    } catch (e: any) {
      setErr(e.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-[min(94vw,560px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="px-5 py-4 border-b">
          <h3 className="text-lg font-medium">Add a review</h3>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* stars */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover ?? rating) >= n;
              return (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setRating(n)}
                  className={`text-3xl leading-none ${active ? "text-amber-500" : "text-gray-300"}`}
                  aria-label={`${n} star${n > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              );
            })}
          </div>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience at this place"
            className="w-full min-h-[96px] rounded-xl border border-gray-300 px-3 py-2 text-[15px] leading-relaxed focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100"
          />

          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}

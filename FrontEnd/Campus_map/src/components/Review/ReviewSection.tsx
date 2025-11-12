import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";

type Review = {
  id: string;
  comment: string;
  rating: number;       // 1..5
  createdAt: string;
  user?: { name: string };
};

type Props = {
  placeId?: string;
  onStats?: (s: { avg: number; total: number }) => void;
  refreshKey?: number;
};

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-[14px] leading-none">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= rating ? "text-amber-500" : "text-gray-300"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function ReviewSection({ placeId, onStats, refreshKey }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [fetching, setFetching] = useState(true);
  const [visibleCount, setVisibleCount] = useState(1);
  const PAGE = 3;

  const navigate = useNavigate();
  const { isAdmin } = useMe(); // 👈 use your existing hook

  useEffect(() => {
    setFetching(true);
    fetch(`/api/reviews?placeId=${placeId}`, { credentials: "include" })
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok || !Array.isArray(data)) {
          console.warn("Unexpected reviews payload:", data);
          setReviews([]);
          return;
        }
        setReviews(data);
        setVisibleCount(1);
      })
      .catch((err) => {
        console.error(err);
        setReviews([]);
      })
      .finally(() => setFetching(false));
  }, [placeId, refreshKey]);

  const stats = useMemo(() => {
    if (!reviews.length) return { avg: 0, total: 0, buckets: [0, 0, 0, 0, 0] };
    const buckets = [0, 0, 0, 0, 0];
    let sum = 0;
    for (const r of reviews) {
      sum += r.rating;
      const idx = Math.min(Math.max(r.rating, 1), 5) - 1;
      buckets[idx] += 1;
    }
    return { avg: sum / reviews.length, total: reviews.length, buckets };
  }, [reviews]);

  const last = (useRef as any)._lastStats ?? (useRef as any)();
  useEffect(() => {
    if (!onStats) return;
    const avg = Number(stats.avg.toFixed(2));
    const payload = { avg, total: stats.total };

    if (!last.current || last.current.avg !== payload.avg || last.current.total !== payload.total) {
      onStats(payload);
      last.current = payload;
    }
  }, [stats, onStats]);

  const visible = reviews.slice(0, visibleCount);

  // 👇 Admin-only delete handler with optimistic UI and proper auth handling
  async function handleDelete(reviewId: string) {
    if (!window.confirm("Delete this review? This cannot be undone.")) return;

    const prev = reviews;
    setReviews((r) => r.filter((x) => x.id !== reviewId));

    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.status === 401) {
        alert("Please log in as admin.");
        setReviews(prev); // rollback
        navigate("/login");
        return;
      }
      if (res.status === 403) {
        alert("Admin only.");
        setReviews(prev); // rollback
        return;
      }

      const json = await res.json().catch(() => ({} as any));
      if (!res.ok || json?.ok !== true) {
        throw new Error(json?.error || "Failed to delete review");
      }
      // success: keep optimistic removal
    } catch (err: any) {
      alert(err?.message || "Network error");
      setReviews(prev); // rollback on failure
    }
  }

  return (
    <div className="mt-2 border-t">
      {/* Reviews list (Google-style) */}
      <div className="mt-4 rounded-xl border bg-white">
        {fetching && (
          <div className="p-4 text-sm text-gray-500">Loading reviews…</div>
        )}

        {!fetching && reviews.length === 0 && (
          <p className="p-4 text-gray-500">No reviews yet. Be the first!</p>
        )}

        {!fetching && reviews.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {visible.map((rev) => (
              <li key={rev.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex gap-3">
                  {/* Avatar */}
                  <div className="h-9 w-9 rounded-full bg-sky-500 text-white grid place-items-center text-xs font-bold">
                    {(rev.user?.name ?? "A")[0].toUpperCase()}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name + stars | date + (admin delete) */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {rev.user?.name ?? "Anonymous"}
                        </span>
                        <StarRow rating={rev.rating} />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-gray-500">
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(rev.id)}
                            className="text-xs text-red-600 hover:text-red-700 underline"
                            aria-label="Delete review"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {rev.comment && (
                      <p className="mt-2 text-[16px] text-gray-800 text-left leading-relaxed">
                        {rev.comment}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Pagination */}
        {!fetching && reviews.length > 0 && (
          <div className="flex items-center gap-2 p-3">
            {visibleCount < reviews.length && (
              <button
                onClick={() => setVisibleCount((v) => Math.min(v + PAGE, reviews.length))}
                className="px-3 py-1.5 rounded-lg border bg-white text-sm hover:bg-gray-50"
              >
                More (+{Math.min(PAGE, reviews.length - visibleCount)})
              </button>
            )}
            {visibleCount > 3 && (
              <button
                onClick={() => setVisibleCount(3)}
                className="px-3 py-1.5 rounded-lg border bg-white text-sm hover:bg-gray-50"
              >
                Less
              </button>
            )}
            {reviews.length > PAGE && visibleCount < reviews.length && (
              <button
                onClick={() => setVisibleCount(reviews.length)}
                className="px-3 py-1.5 rounded-lg border bg-white text-sm hover:bg-gray-50"
              >
                All ({reviews.length})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
        
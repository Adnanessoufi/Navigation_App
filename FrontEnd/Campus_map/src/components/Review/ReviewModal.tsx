import { useState } from "react";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../hooks/useMe";

export default function ReviewModal({
  open, onClose, placeId, onPosted,
}: {
  open: boolean; onClose: () => void; placeId: string; onPosted?: (review:any) => void;
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const {me} = useMe();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) alert("Please select a star rating.");
    setLoading(true);
    
    if (!me) {
        alert("Please log in to post a review.");
        navigate("/login");
        return;
      }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId, rating }),
      });



      const json = await res.json().catch(() => ({} as any));
      if (!res.ok) throw new Error(json?.error || "Failed to post review");

      onPosted?.(json?.review ?? json);
      onClose();
      setRating(0);
      setComment("");
    } catch (err) {
      alert((err as Error).message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} titleId="review-title">
      <form onSubmit={handleSubmit} className="p-5">
        <h2 id="review-title" className="text-lg font-semibold mb-2">Write a review</h2>

        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-sky-500 text-white grid place-items-center text-xs font-bold">A</div>
          <div className="text-sm text-gray-700">Posting publicly</div>
        </div>

        <div className="flex gap-3 mb-3 justify-center" aria-label="Rating">
          {[1,2,3,4,5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              className="text-4xl leading-none focus:outline-none"
              aria-pressed={rating >= n}
              aria-label={`${n} star${n>1?"s":""}`}
            >
              <span className={rating >= n ? "text-yellow-500" : "text-[#dad9d9]"}>★</span>
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share details of your experience at this place"
          className="w-full border rounded-xl p-3 min-h-[120px] text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-sky-300"
        />

        <button type="button" className="w-full py-3 rounded-xl bg-gray-50 border text-sm mb-4">
          Add photos & videos
        </button>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="submit" disabled={loading } className="px-5 py-2 rounded-xl text-white bg-black disabled:opacity-60">
            {loading ? "Posting…" : "Post"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

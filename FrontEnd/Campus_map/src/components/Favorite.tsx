import { useFavorites } from "../hooks/useFavorites";

export default function FavoritesPage() {
  const { favorites, loading } = useFavorites();

  if (loading) return <div className="p-4">Loading favorites…</div>;

  if (!favorites.length) {
    return (
      <div className="p-4 text-gray-600">
        You haven’t added any favorites yet. Tap “☆ Favorite” on a place to save it.
      </div>
    );
  }

  return (
    <div className="p-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map(p => (
        <div key={p.id} className="border rounded-lg p-3">
          <div className="font-semibold mb-1">{p.name}</div>
          <div className="text-sm text-gray-600">
            ({p.lat.toFixed(5)}, {p.lng.toFixed(5)})
          </div>

          <button
            className="mt-2 underline text-green-700"
            onClick={() =>
              window.dispatchEvent(new CustomEvent("focus-place", { detail: p }))
            }
          >
            View on map
          </button>
        </div>
      ))}
    </div>
  );
}

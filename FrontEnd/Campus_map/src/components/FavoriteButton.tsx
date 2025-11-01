import type { Item } from "../api/search";

type Props = {
  place: Item;
  isFavorite: (id: string) => boolean;
  toggle: (place: Item) => Promise<void>;
  className?: string;
};

export default function FavoriteButton({
  place,
  isFavorite,
  toggle,
  className = "",
}: Props) {
  const active = isFavorite(place.id);

  return (
    <button
      onClick={() => toggle(place)}
      aria-pressed={active}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={[
        "rounded-full border px-3 py-1 text-sm transition",
        active
          ? "bg-green-600 text-white border-green-700"
          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50",
        className,
      ].join(" ")}
    >
      {active ? "★" : "☆ "}
    </button>
  );
}

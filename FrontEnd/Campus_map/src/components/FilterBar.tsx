// components/FilterBar.tsx
import { useMemo } from "react";
import { FILTERS, type PlaceType } from "../api/filter";

type Props = {
  active: Set<PlaceType>;
  onToggle: (key: PlaceType) => void;
  onClear?: () => void;
};

export default function FilterBar({ active, onToggle, onClear }: Props) {
  const hasAny = useMemo(() => active.size > 0, [active]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-semibold text-gray-800">Filter listings</span>
      {FILTERS.map(f => {
        const isOn = active.has(f.key);
        return (
          <button
            key={f.key}
            onClick={() => onToggle(f.key)}
            className={`px-4 py-2 rounded-full text-sm border transition
              ${isOn ? "bg-black text-white border-black" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"}`}
            aria-pressed={isOn}
          >
            {f.label}
          </button>
        );
      })}
      {hasAny && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm text-gray-600 hover:underline"
          title="Clear filters"
        >
          Clear
        </button>
      )}
    </div>
  );
}

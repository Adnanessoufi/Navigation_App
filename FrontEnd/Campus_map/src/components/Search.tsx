import { useState, useRef, useMemo, useEffect } from "react";
import MapContainer from "./MapContainer";
import type { Item } from "../api/search";
import { searchPlaces } from "../api/search";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "./FavoriteButton";
import SuggestDropdown from "./SuggestDropdown";
import type { SuggestItem } from "../api/suggest";
import {type PlaceType, FILTERS} from "../api/filter";
import PrimaryThumb from "./PrimaryThumb";
import ReviewModal from "./Review/ReviewModal";
import PlaceMediaPanel from "./PlacePanel";
import DescriptionSection from "./DescriptionSection";
import {useMe} from "../hooks/useMe";


type Coords = { lat: number; lng: number };

type Stats = { avg: number; total: number };

function Chip({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (

    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm border transition
        ${active ? "bg-black text-white border-black" : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export default function SearchPage({isLoggedIn}: {isLoggedIn: boolean}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [center, setCenter] = useState<Coords | null>(null);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [active, setActive] = useState<Set<PlaceType>>(new Set());
  const [refreshKey, setRefreshKey] = useState(0);
  const [placeRating, setPlaceRating] = useState<Stats>({avg: 0, total: 0});
  const [showComposer, setShowComposer] = useState(false);
  const bump = () => setRefreshKey(k => k + 1);
  const { isFavorite, toggle } = useFavorites();
  const isAdmin = useMe().isAdmin;

  async function searchNow(qStr: string, typesArr: PlaceType[]) {
    setLoading(true);
    setErr(null);
    try {
      const r = await searchPlaces(
        qStr, 
        typesArr
      );
      setResults(Array.isArray(r) ? r : []);
      if (r.length > 0) setCenter({ lat: r[0].lat, lng: r[0].lng });
      else setCenter(null);
    } catch (e: any) {
      setErr(e.message ?? "Request failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    setExpanded(false);
    await searchNow(q, [...active]);
  }

 
  function toggleFilter(k: PlaceType) {
    setActive(prev => {
      const next = new Set(prev);
      next.has(k) ? next.delete(k) : next.add(k);
      searchNow(q, [...next]);
      return next;
    });
  }

  function clearFilters() {
    setActive(new Set());
    searchNow(q, []);
  }

  const filteredResults = useMemo(() => {
    if (active.size === 0) return results;
    return results.filter(it => !it.type || active.has(it.type as PlaceType));
  }, [results, active]);

  const visibleResults = expanded ? filteredResults : filteredResults.slice(0, 1);
  const selected =
  center ? filteredResults.find(r => r.lat === center.lat && r.lng === center.lng) : null;

  const selectedPlaceId = selected?.id ?? "";

  useEffect(() => { setPlaceRating({ avg: 0, total: 0 }); }, [selectedPlaceId]);

  

useEffect(() => setShowComposer(false), [selectedPlaceId]);

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-start w-full mt-6">

          {/* Filter bar */}
          <div className="w-full max-w-4xl mb-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-gray-800">Filter listings</span>
              {FILTERS.map(f => (
                <Chip
                  key={f.key}
                  label={f.label}
                  active={active.has(f.key)}
                  onClick={() => toggleFilter(f.key)}
                />
              ))}
              {active.size > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:underline"
                  title="Clear filters"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Search input + suggestions */}
          <div className="relative w-full max-w-2xl">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search building or abbreviation (e.g., LSB)…"
              className="w-full h-12 rounded-full border-2 border-[#CBE7D2] bg-white text-gray-800 placeholder-gray-500 pl-5 pr-12 outline-none hover:bg-[#F5F5F5] transition-all duration-200"
            />

            <SuggestDropdown
              query={q}
              bindTo={inputRef}
              onPick={(s: SuggestItem) => {
                setQ(s.name);
                setExpanded(false);
                searchNow(s.name, [...active]);
              }}
            />

            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setResults([]);
                  setCenter(null);
                  setErr(null);
                  setExpanded(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full text-gray-500 hover:bg-gray-100 active:scale-95 transition"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {loading && <p className="mt-3">Searching…</p>}
          {err && <p className="mt-3 text-red-600">Error: {err}</p>}

          {/* RESULTS */}
          <ul className="mt-6 w-full max-w-2xl grid grid-cols-1  gap-4 rounded-2xl bg-transparent p-2">
            {visibleResults.map((it) => (
              <li
                key={it.id}
                className="p-3 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md flex items-center justify-between cursor-pointer transition gap-3"
                onClick={() => {
                  setCenter({ lat: it.lat, lng: it.lng });
                  setQ(it.name);
                  setResults([it]);
                  setExpanded(false);
                }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <PrimaryThumb placeId={it.id} />
                  <div className="min-w-0">
                    <div className="font-medium underline text-blue-800 truncate">{it.name}</div>
                    <div className="text-sm text-slate-600 truncate">
                      {it.abbr ? `(${it.abbr})` : ""} {it.type ? `• ${it.type}` : ""}
                    </div>
                  </div>
                </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <FavoriteButton place={it} isFavorite={isFavorite} toggle={toggle} />
                    
                  </div>
              </li>
            ))}

            {!loading && filteredResults.length === 0 && !err && (
              <li className="p-3 text-slate-500">No results match the current filters.</li>
            )}
          </ul>

          {filteredResults.length > 1 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-gray-600 hover:text-gray-800 transition"
            >
              <span className="mr-1 font-medium">
                {expanded ? "Hide results" : "Show all results"}
              </span>
              <span className={`inline-block transform transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}>
                ˅
              </span>
            </button>
          )}
        </div>
      </div>

  <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
    {/* Left: Photos + actions */}
        {results[0] && (
    <aside className="lg:col-span-1">
      <PlaceMediaPanel
        place={
          selected
            ? {
                id: selected.id,
                name: selected.name,
                lat: selected.lat,
                lng: selected.lng,
                type: selected.type ?? undefined,
                ratingAvg: placeRating.avg,
                ratingCount: placeRating.total,
              }
            : undefined
        }
        isLoggedIn={isLoggedIn}
        onUploaded={bump}
        refreshKey={refreshKey}
        fallbackCenter={center}
        onOpenComposer={() => setShowComposer(true)}
      />
      <ReviewModal
        open={showComposer} onClose={() => setShowComposer(false)} placeId={selectedPlaceId} onPosted={()=>bump()}
      />
    </aside>
  )}
    <section className="lg:col-span-2">
    <div className="lg:sticky lg:top-4 space-y-3">
      <div className="overflow-hidden border-amber-100 bg-white shadow-sm h-[420px]">
        <MapContainer lat={center?.lat} lng={center?.lng} />
      </div>
      {selected && (
        <DescriptionSection
          placeId={selected.id}
          initialDescription={selected.description}
          isAdmin={isAdmin}
        />
      )}
    </div>
  </section>    
  </div>
    </>
  );
}

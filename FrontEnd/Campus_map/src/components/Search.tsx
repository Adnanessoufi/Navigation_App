import { useState, useRef } from "react";
import MapContainer from "./MapContainer";
import type { Item } from "../api/search";
import { searchPlaces } from "../api/search";
import { useFavorites } from "../hooks/useFavorites";
import FavoriteButton from "./FavoriteButton";
import SuggestDropdown from "./SuggestDropdown";
import type { SuggestItem } from "../api/suggest";

type Coords = {
  lat: number;
  lng: number;
};

export default function SearchPage() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [center, setCenter] = useState<Coords | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { isFavorite, toggle } = useFavorites();

  async function handleSearch() {
    if (!q.trim()) return;
    setLoading(true);
    setErr(null);
    setExpanded(false);
    try {
      const results = await searchPlaces(q);
      setResults(Array.isArray(results) ? results : []);
      if (results.length > 0) {
        setCenter({
          lat: results[0].lat,
          lng: results[0].lng,
        });
      } else {
        setCenter(null);
      }
    } catch (e: any) {
      setErr(e.message ?? "Request failed");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const visibleResults = expanded ? results : results.slice(0, 1);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
  <>
    <div className="space-y-4">
      {/* Centered stack: input + suggestions + results */}
      <div className="flex flex-col items-center justify-start w-full mt-6">
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
              (async () => {
                setLoading(true);
                setErr(null);
                setExpanded(false);
                try {
                  const r = await searchPlaces(s.name);
                  setResults(Array.isArray(r) ? r : []);
                  if (r.length > 0) setCenter({ lat: r[0].lat, lng: r[0].lng });
                  else setCenter(null);
                } catch (e: any) {
                  setErr(e.message ?? "Request failed");
                  setResults([]);
                } finally {
                  setLoading(false);
                }
              })();
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

        {/* keep loading/error just under the input if you want */}
        {loading && <p className="mt-3">Searching…</p>}
        {err && <p className="mt-3 text-red-600">Error: {err}</p>}

        {/* RESULTS: now live in the same centered container */}
        <ul className="mt-6 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-transparent p-2">
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
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-slate-600">
                {it.abbr ? `(${it.abbr})` : ""} {it.type ? `• ${it.type}` : ""}
              </div>
              <FavoriteButton place={it} isFavorite={isFavorite} toggle={toggle} />
            </li>
          ))}

          {!loading && results.length === 0 && !err && q && (
            <li className="p-3 text-slate-500">No results yet — try a query.</li>
          )}
        </ul>

        {results.length > 1 && (
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

    {/* Map stays below everything */}
    <div className="mt-6">
      <MapContainer lat={center?.lat} lng={center?.lng} />
    </div>
  </>
);
}

import { useEffect, useState, useRef } from "react";
import { useDebounce} from "../hooks/useDebounce";
import { fetchSuggestions, type SuggestItem } from "../api/suggest";

type InputRef =
  | React.RefObject<HTMLInputElement | null>
  | React.MutableRefObject<HTMLInputElement | null>;

type Props = {
  query: string;
  onPick: (s: SuggestItem) => void;
  limit?: number;
  bindTo?: InputRef;
};

function Highlighted({ text, query }: { text: string; query: string }) {
  const lower = text.toLowerCase();
  const ql = query.toLowerCase();
  const idx = lower.indexOf(ql);
  if (idx < 0) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <strong>{text.slice(idx, idx + ql.length)}</strong>
      {text.slice(idx + ql.length)}
    </span>
  );
}

export default function SuggestDropdown({ query, onPick, limit = 8, bindTo }: Props) {
  const debounced = useDebounce(query, 150);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [activeIdx, setActiveIdx] = useState<number>(-1);

  const suppressNextOpenRef = useRef(false);

  const pick = (idx: number) => {
    const s = suggestions[idx];
    if (!s) return;
    onPick(s);
    suppressNextOpenRef.current = true; 
    setOpen(false);
    setSuggestions([]);                       
    setActiveIdx(-1);
  };


  useEffect(() => {
    if (suppressNextOpenRef.current) {
      suppressNextOpenRef.current = false;
      return;
    }
    let alive = true;
    const term = debounced.trim();
    if (!term) {
      if (alive) {
        setOpen(false);
        setSuggestions([]);
        setActiveIdx(-1);
      }
      return;
    }
    (async () => {
      const items = await fetchSuggestions(term, limit);
      if (!alive) return;
      setSuggestions(items);
      const has = items.length > 0;
      setOpen(has);
      setActiveIdx(-1);
    })();
    return () => { alive = false; };
  }, [debounced, limit]);

  useEffect(() => {
    const el = bindTo?.current;
    if (!el) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (!open || suggestions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => (i < 0 ? 0 : (i + 1) % suggestions.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => (i < 0 ? suggestions.length - 1 : (i - 1 + suggestions.length) % suggestions.length));
      } else if (e.key === "Enter") {
        if (activeIdx >= 0 && suggestions[activeIdx]) {
            e.preventDefault(); 
            pick(activeIdx);
        } else {
            suppressNextOpenRef.current = true; 
            setOpen(false);
            setSuggestions([]);
            setActiveIdx(-1);
  }
      } else if (e.key === "Escape") {
        setOpen(false);
      } 
    };

    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [bindTo, open, suggestions, activeIdx, onPick]);

  if (!open || suggestions.length === 0) return null;

  return (
    <ul
      role="listbox"
      className="absolute z-20 mt-2 w-full rounded-2xl border bg-white shadow-xl max-h-80 overflow-auto"
      aria-label="Search suggestions"
    >
      {suggestions.map((s, i) => (
        <li
          key={s.id}
          role="option"
          aria-selected={i === activeIdx}
          onMouseDown={(e) => e.preventDefault()} 
          onMouseEnter={() => setActiveIdx(i)}
          onClick={() => pick(i)}
          className={`cursor-pointer px-4 py-2 ${i === activeIdx ? "bg-gray-100" : ""}`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="truncate">
              <Highlighted text={s.name} query={debounced} />
            </span>
            {s.abbr ? <span className="text-xs text-gray-500">{s.abbr}</span> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}

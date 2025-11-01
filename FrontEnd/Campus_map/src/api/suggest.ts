export type SuggestItem = {
  id: string;
  name: string;
  abbr?: string | null;
  lat: number;
  lng: number;
};

const cache = new Map<string, SuggestItem[]>();

export async function fetchSuggestions(q: string, limit = 8): Promise<SuggestItem[]> {
  const key = `${q}::${limit}`;
  if (cache.has(key)) return cache.get(key)!;
  const res = await fetch(`/api/suggest?q=${encodeURIComponent(q)}&limit=${limit}`);
  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data?.results) ? data.results as SuggestItem[] : [];
  cache.set(key, items);
  return items;
}
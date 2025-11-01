const API = ""; 

export type Item = {
  id: string;   
  name: string;
  abbr?: string;
  type?: string;
  lat: number;
  lng: number;
};

export async function searchPlaces(q: string): Promise<Item[]> {
  const res = await fetch(`${API}/api/search?q=${encodeURIComponent(q)}`, {
    credentials: "include", 
  });
  if (!res.ok) throw new Error("Search request failed");
  const data: { q: string; count: number; results: Item[] } = await res.json();
  return data.results;
}

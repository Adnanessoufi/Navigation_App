import axios from "axios";
axios.defaults.withCredentials = true;

export type Item = {
  id: string;   
  name: string;
  abbr?: string;
  type?: string;
  lat: number;
  lng: number;
  description?: string;
 
};

export type NewPlace = {
  name: string;
  abbr?: string;
  type?: string;
  lat: number;
  lng: number;
  description?: string;
};

// api/search.ts
export async function searchPlaces(q: string, types?: string[]) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (types?.length) params.set("types", types.join(","));
  const res = await fetch(`/api/search?${params.toString()}`, { credentials: "include" });
  if (!res.ok) throw new Error("Search request failed");
  const data = await res.json();
  return data.results;
}


export async function createPlace(p: NewPlace): Promise<Item>  {
  const { data } = await axios.post("/api/search", {
    ...p,
    lat: Number(p.lat),
    lng: Number(p.lng),
  });
  return data as Item;
}
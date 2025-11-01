import axios from "axios";
import type { Item } from "./search";
axios.defaults.withCredentials = true; 

type FavoriteRow = {
  place: Item;
};

export async function getFavorites(): Promise<Item[]> {
  const { data } = await axios.get("/api/favorites");
  return data.favorites.map((f: FavoriteRow) => f.place);
}

export async function addFavorite(placeId: string): Promise<void> {
  await axios.post(`/api/favorites/`, { placeId });
}

export async function removeFavorite(placeId: string): Promise<void> {
  await axios.delete(`/api/favorites/${placeId}`);
}

import { useEffect, useMemo, useState } from "react";
import type { Item } from "../api/search";
import { getFavorites, addFavorite, removeFavorite } from "../api/favorites";
import { useNavigate } from "react-router-dom";

type UseFavorites = {
  favorites: Item[];
  loading: boolean;
  isFavorite: (id: string) => boolean;
  toggle: (place: Item) => Promise<void>;
};

export function useFavorites(): UseFavorites {
  const [favorites, setFavorites] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getFavorites();
        if (alive) setFavorites(data);
      } catch {

      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const idSet = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  function isFavorite(id: string) {
    return idSet.has(id);
  }

  async function toggle(place: Item) {
    const fav = isFavorite(place.id);

    setFavorites(curr =>
      fav ? curr.filter(p => p.id !== place.id) : [place, ...curr]
    );

    try {
      if (fav) {
        await removeFavorite(place.id);
      } else {
        await addFavorite(place.id);
      }
    } catch(err:any) {
      setFavorites(curr =>
        fav ? [place, ...curr] : curr.filter(p => p.id !== place.id)
      );
      if (err.response?.status === 401) {
        navigate("/login");
      } else {
        console.error("Favorite toggle failed:", err);
      }
    }
  }

  return { favorites, loading, isFavorite, toggle };
}

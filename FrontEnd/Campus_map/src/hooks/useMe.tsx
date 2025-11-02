import { useEffect, useState } from "react";
import { getMe, type Me } from "../api/me";

export function useMe(watch?:unknown) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getMe();
        if (alive) setMe(data);
      } catch (e: any) {
        if (alive) { setMe(null); setErr(e?.message || "Not auth"); }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [watch]);

  return { me, loading, err, isAdmin: me?.role === "ADMIN" };
}

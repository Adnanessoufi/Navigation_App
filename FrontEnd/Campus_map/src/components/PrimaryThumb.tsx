import { useEffect, useState } from "react";
import { clThumb } from "../lib/cloudinaryUrl"; // adjust path

export default function PrimaryThumb({ placeId }: { placeId: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/places/${placeId}/primaryPhoto`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(p => { if (alive) setUrl(p ? clThumb(p.url, { w: 40, h: 40 }) : null); })
      .catch(() => { if (alive) setUrl(null); });
    return () => { alive = false; };
  }, [placeId]);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 border shrink-0">
      {url
        ? <img src={url} alt="" loading="lazy" className="w-full h-full object-cover" />
        : <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">No img</div>}
    </div>
  );
}


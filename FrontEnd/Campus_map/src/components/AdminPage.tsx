import { useEffect, useMemo, useState } from "react";
import { getPending, approvePlace, rejectPlace, type PendingPlace } from "../api/admin";

export default function AdminPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<PendingPlace[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const take = 10;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canPrev = skip > 0;
  const canNext = skip + take < total;

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await getPending(q, skip, take);
      setRows(data.results);
      setTotal(data.total);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [skip]); // paginate
  const onSearch = async () => { setSkip(0); await load(); };

  async function doApprove(id: string) {
    try {
      await approvePlace(id);
      setRows(prev => prev.filter(p => p.id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e: any) {
      alert(e?.message || "Approve failed");
    }
  }

  async function doReject(id: string) {
    try {
      await rejectPlace(id);
      setRows(prev => prev.filter(p => p.id !== id));
      setTotal(t => Math.max(0, t - 1));
    } catch (e: any) {
      alert(e?.message || "Reject failed");
    }
  }

  const header = useMemo(() => (
    <div className="flex items-center gap-2 mb-3">
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Search pending (name/abbr)…"
        className="border rounded px-3 py-2 w-full"
      />
      <button onClick={onSearch} disabled={loading} className="px-3 py-2 rounded bg-black text-white">
        {loading ? "Loading…" : "Search"}
      </button>
    </div>
  ), [q, loading]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Pending Places</h1>
      {header}
      {err && <div className="text-red-600 mb-2">{err}</div>}
      {!loading && rows.length === 0 && <div className="text-gray-500">No pending items.</div>}

      <ul className="space-y-2">
        {rows.map(p => (
          <li key={p.id} className="border rounded p-3 flex items-center justify-between">
            <div className="min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-sm text-gray-600">
                {p.abbr ? `${p.abbr} · ` : ""}{p.type || "—"} · {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </div>
              <div className="text-xs text-gray-500">
                Submitted by {p.createdBy?.name || p.createdBy?.email || p.createdById}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => doReject(p.id)} className="px-3 py-1 rounded border border-gray-400">Reject</button>
              <button onClick={() => doApprove(p.id)} className="px-3 py-1 rounded bg-green-600 text-white">Approve</button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">Total: {total}</span>
        <div className="flex gap-2">
          <button disabled={!canPrev || loading} onClick={() => setSkip(Math.max(0, skip - take))}
                  className="px-3 py-1 rounded border disabled:opacity-50">Prev</button>
          <button disabled={!canNext || loading} onClick={() => setSkip(skip + take)}
                  className="px-3 py-1 rounded border disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}

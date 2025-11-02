import { useEffect, useState } from "react";
import {
  listUsers,
  makeAdmin,
  type AdminUserRow,
  listUserPlaces,
  type UserPlace,
} from "../api/adminUsers";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const take = 20;
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Drawer state for viewing a user's places
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewStatus, setViewStatus] = useState<
    "PENDING" | "APPROVED" | "REJECTED" | undefined
  >(undefined);
  const [viewRows, setViewRows] = useState<UserPlace[]>([]);
  const [viewTotal, setViewTotal] = useState(0);
  const [viewSkip, setViewSkip] = useState(0);
  const viewTake = 10;
  const [viewLoading, setViewLoading] = useState(false);
  const [viewCounts, setViewCounts] = useState<{
    PENDING: number;
    APPROVED: number;
    REJECTED: number;
  }>({ PENDING: 0, APPROVED: 0, REJECTED: 0 });

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const data = await listUsers(q, skip, take);
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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  const onSearch = async () => {
    setSkip(0);
    await load();
  };

  async function onMakeAdmin(id: string) {
    try {
      const res = await makeAdmin(id);
      if (res.role === "ADMIN") {
        setRows((prev) => prev.map((u) => (u.id === id ? { ...u, role: "ADMIN" } : u)));
      }
    } catch (e: any) {
      alert(e?.message || "Failed to promote");
    }
  }

  // ----- Per-user places drawer -----
  async function loadUserPlaces(resetPage = false) {
    if (!viewUserId) return;
    if (resetPage) setViewSkip(0);
    setViewLoading(true);
    try {
      const data = await listUserPlaces(
        viewUserId,
        viewStatus,
        resetPage ? 0 : viewSkip,
        viewTake
      );
      setViewRows(data.results);
      setViewTotal(data.total);
      setViewCounts(data.byStatus);
    } finally {
      setViewLoading(false);
    }
  }

  useEffect(() => {
    if (viewUserId) loadUserPlaces(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSkip, viewUserId, viewStatus]);

  const openView = (userId: string) => {
    setViewUserId(userId);
    setViewStatus(undefined);
    setViewSkip(0);
    // kick off initial load
    loadUserPlaces(true);
  };

  const closeView = () => {
    setViewUserId(null);
    setViewRows([]);
    setViewTotal(0);
    setViewCounts({ PENDING: 0, APPROVED: 0, REJECTED: 0 });
  };

  const canPrev = skip > 0;
  const canNext = skip + take < total;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Users (Admin)</h1>

      <div className="flex items-center gap-2 mb-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => (e.key === "Enter" ? onSearch() : undefined)}
          placeholder="Search by name or email…"
          className="border rounded px-3 py-2 w-full"
          autoFocus
        />
        <button
          onClick={onSearch}
          disabled={loading}
          className="px-3 py-2 rounded bg-black text-white"
        >
          {loading ? "Loading…" : "Search"}
        </button>
      </div>

      {err && <div className="text-red-600 mb-2">{err}</div>}
      {!loading && rows.length === 0 && (
        <div className="text-gray-500">No users found.</div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Role</th>
              <th className="text-right p-2">Places</th>
              <th className="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  {u.role === "ADMIN" ? (
                    <span className="px-2 py-0.5 rounded text-white bg-green-600 text-xs">
                      ADMIN
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 text-xs">USER</span>
                  )}
                </td>
                <td className="p-2 text-right">{u.totalPlaces}</td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => openView(u.id)}
                    className="px-3 py-1 rounded border hover:bg-slate-50"
                    title="View user's places"
                  >
                    View
                  </button>
                  <button
                    disabled={u.role === "ADMIN"}
                    onClick={() => onMakeAdmin(u.id)}
                    className={`px-3 py-1 rounded border ${
                      u.role === "ADMIN"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-50"
                    }`}
                    title={u.role === "ADMIN" ? "Already admin" : "Promote to admin"}
                  >
                    Make Admin
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-600">
          Total: {total} · Page {Math.floor(skip / take) + 1} /{" "}
          {Math.max(1, Math.ceil(total / take))}
        </span>
        <div className="flex gap-2">
          <button
            disabled={!canPrev || loading}
            onClick={() => setSkip(Math.max(0, skip - take))}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={!canNext || loading}
            onClick={() => setSkip(skip + take)}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Drawer / Modal for a user's places */}
      {viewUserId && (
        <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50">
          <div className="bg-white w-full md:max-w-3xl max-h-[85vh] rounded-t-2xl md:rounded-2xl overflow-hidden shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <div className="font-semibold">User’s Places</div>
              <button
                onClick={closeView}
                className="text-sm px-2 py-1 rounded border"
              >
                Close
              </button>
            </div>

            {/* Status filter summary */}
            <div className="p-3 flex items-center gap-2 border-b">
              <button
                onClick={() => {
                  setViewStatus(undefined);
                  loadUserPlaces(true);
                }}
                className={`px-2 py-1 rounded border ${
                  viewStatus ? "" : "bg-slate-100"
                }`}
              >
                All ({viewCounts.PENDING + viewCounts.APPROVED + viewCounts.REJECTED})
              </button>
              <button
                onClick={() => {
                  setViewStatus("PENDING");
                  loadUserPlaces(true);
                }}
                className={`px-2 py-1 rounded border ${
                  viewStatus === "PENDING" ? "bg-slate-100" : ""
                }`}
              >
                Pending ({viewCounts.PENDING})
              </button>
              <button
                onClick={() => {
                  setViewStatus("APPROVED");
                  loadUserPlaces(true);
                }}
                className={`px-2 py-1 rounded border ${
                  viewStatus === "APPROVED" ? "bg-slate-100" : ""
                }`}
              >
                Approved ({viewCounts.APPROVED})
              </button>
              <button
                onClick={() => {
                  setViewStatus("REJECTED");
                  loadUserPlaces(true);
                }}
                className={`px-2 py-1 rounded border ${
                  viewStatus === "REJECTED" ? "bg-slate-100" : ""
                }`}
              >
                Rejected ({viewCounts.REJECTED})
              </button>
            </div>

            <div className="p-3 overflow-auto">
              {viewLoading ? (
                <div className="p-4">Loading…</div>
              ) : viewRows.length === 0 ? (
                <div className="p-4 text-gray-500">No places found.</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Abbr</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-right p-2">Coords</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewRows.map((p) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{p.name}</td>
                        <td className="p-2">{p.abbr || "—"}</td>
                        <td className="p-2">{p.type || "—"}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              p.status === "APPROVED"
                                ? "bg-green-600 text-white"
                                : p.status === "PENDING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                        <td className="p-2 text-right">
                          {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            <div className="p-3 border-t flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Total: {viewTotal} · Page {Math.floor(viewSkip / viewTake) + 1} /{" "}
                {Math.max(1, Math.ceil(viewTotal / viewTake))}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={viewSkip === 0 || viewLoading}
                  onClick={() => setViewSkip(Math.max(0, viewSkip - viewTake))}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  disabled={viewSkip + viewTake >= viewTotal || viewLoading}
                  onClick={() => setViewSkip(viewSkip + viewTake)}
                  className="px-3 py-1 rounded border disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

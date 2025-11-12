import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPlace, type Item } from "../api/search";

export default function AddPlacePage() {
  const nav = useNavigate();
  const loc = useLocation();

  const [form, setForm] = useState<Item>({
    id: "",
    name: "",
    abbr: "",
    type: "",
    lat: 0 ,
    lng: 0,
  });
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Item>(k: K, v: Item[K]) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!form.name.trim()) return setErr("Name is required");
    if (Number.isNaN(form.lat) || Number.isNaN(form.lng)) return setErr("Lat/Lng must be numbers");
    if (form.lat < -90 || form.lat > 90) return setErr("Latitude must be between -90 and 90");
    if (form.lng == 0 || form.lng ==0 ) return setErr("Longitude must be between -180 and 180");

    try {
      setSaving(true);
      const created = await createPlace({
        ...form,
        lat: Number(form.lat),
        lng: Number(form.lng),
      });

      nav("/", { replace: true, state: { createdPlaceId: created.id, from: loc.pathname } });
    } catch (e: any) {
      if (e.response?.status === 401) {
        nav("/login", { state: { from: loc.pathname } });
      } else {
        setErr(e.response?.data?.error || "Failed to create place");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Add a New Place</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="text-sm text-gray-700">Name *</span>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
              placeholder="e.g., Informatik kar"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-700">Abbreviation</span>
              <input
                value={form.abbr}
                onChange={(e) => update("abbr", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="e.g., IK"
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Type</span>
              <input
                value={form.type}
                onChange={(e) => update("type", e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="e.g., Library, Building…"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-700">Latitude *</span>
              <input
                type="number"
                step="any"
                value={form.lat}
                onChange={(e) => update("lat", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="e.g., 47.5432"
                required
              />
            </label>

            <label className="block">
              <span className="text-sm text-gray-700">Longitude *</span>
              <input
                type="number"
                step="any"
                value={form.lng}
                onChange={(e) => update("lng", Number(e.target.value))}
                className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="e.g., 21.6234"
                required
              />
            </label>
          </div>
          <div className="block">
            <span className="text-sm text-gray-700">Description</span>
            <textarea
              value={form.description || ""}
              onChange={(e) => update("description", e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring"
              placeholder="Optional description for the place"
              rows={4}
            />
          </div>
        </div>

        {err && <p className="text-red-600">{err}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-green-700 text-white px-4 py-2 hover:bg-green-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save place"}
          </button>
          <button
            type="button"
            onClick={() => nav(-1)}
            className="rounded-xl border px-4 py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

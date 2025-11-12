import { useState } from "react";
import DescriptionCard from "./DescriptionCard";

export default function DescriptionSection({
  placeId,
  initialDescription,
  isAdmin,
}: {
  placeId: string;
  initialDescription?: string | null;
  isAdmin: boolean;
}) {
  const [desc, setDesc] = useState(initialDescription ?? "");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/search/${placeId}/description`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: desc }),
    });
    setSaving(false);
    if (!res.ok) {
      const msg = await res.json().catch(() => ({}));
      alert(msg?.message ?? "Failed to save description");
      return;
    }
    setEditing(false);
  }

  return (
    <div className="mt-2">
      <DescriptionCard description={desc} />

      {isAdmin && (
        <div className="mt-2">
          {!editing ? (
            <button
              type="button"
              className="text-sm rounded-md border px-3 py-1.5 hover:bg-gray-50"
              onClick={() => setEditing(true)}
            >
              {desc?.trim() ? "Edit description" : "Add description"}
            </button>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Edit description                                 
              </label>
              <textarea
                className="w-full min-h-32 rounded-md border border-gray-300 p-2 text-sm"
                placeholder="Write a short, helpful description…"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={save}
                  disabled={saving}
                  className="rounded-md bg-emerald-600 px-3 py-1.5 text-white text-sm hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="rounded-md border px-3 py-1.5 text-sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                {desc?.trim() && (
                  <button
                    type="button"
                    className="ml-auto rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
                    onClick={async () => {
                      setDesc("");
                      await save(); 
                    }}
                  > Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

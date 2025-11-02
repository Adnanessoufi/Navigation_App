// src/api/admin.ts
export type PendingPlace = {
  id: string;
  name: string;
  abbr?: string | null;
  type?: string | null;
  lat: number;
  lng: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdById: string;
  approvedById?: string | null;
  approvedAt?: string | null;
  createdBy?: { id: string; name: string; email: string };
};

const BASE = "/api/admin";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function getPending(q = "", skip = 0, take = 50) {
  const url = new URL(`${BASE}/places/pending`, window.location.origin);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));

  const res = await fetch(url.toString().replace(window.location.origin, ""), {
    credentials: "include",
  });
  return json<{ total: number; skip: number; take: number; results: PendingPlace[] }>(res);
}

export async function approvePlace(id: string) {
  const res = await fetch(`${BASE}/places/${id}/approve`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  return json<PendingPlace>(res);
}

export async function rejectPlace(id: string) {
  const res = await fetch(`${BASE}/places/${id}/reject`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  return json<PendingPlace>(res);
}

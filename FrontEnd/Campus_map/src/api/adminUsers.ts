// types.ts (or alongside the file)
export const PLACE_STATUSES = ["PENDING","APPROVED","REJECTED"] as const;
export type PlaceStatus = typeof PLACE_STATUSES[number];

export const ROLES = ["USER","ADMIN"] as const;
export type Role = typeof ROLES[number];

export type UserPlace = {
  id: string;
  name: string;
  abbr?: string | null;
  type?: string | null;
  lat: number;
  lng: number;
  status: PlaceStatus;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: Role;
  totalPlaces: number;
};

type ListResponse = {
  total: number;
  skip: number;
  take: number;
  results: AdminUserRow[];
};

// --- fetch helpers ---

function makeController(ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return { signal: ctrl.signal, done: () => clearTimeout(id) };
}

async function asJson<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error("Please log in.");
  if (res.status === 403) throw new Error("Admin only.");
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json())?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// --- API calls ---

export async function listUserPlaces(
  userId: string,
  status?: PlaceStatus,
  skip = 0,
  take = 20
) {
  const url = new URL(`/api/admin/users/${userId}/places`, window.location.origin);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));

  const t = makeController();
  try {
    const res = await fetch(url.pathname + url.search, {
      credentials: "include",
      signal: t.signal,
    });
    return asJson<{
      total: number;
      skip: number;
      take: number;
      byStatus: { PENDING: number; APPROVED: number; REJECTED: number };
      results: UserPlace[];
    }>(res);
  } finally {
    t.done();
  }
}

export async function listUsers(q = "", skip = 0, take = 20) {
  const url = new URL("/api/admin/users", window.location.origin);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));

  const t = makeController();
  try {
    const res = await fetch(url.pathname + url.search, {
      credentials: "include",
      signal: t.signal,
    });
    return asJson<ListResponse>(res);
  } finally {
    t.done();
  }
}

export async function makeAdmin(id: string) {
  const t = makeController();
  try {
    const res = await fetch(`/api/admin/users/${id}/make-admin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}", // idempotent
      signal: t.signal,
    });
    return asJson<{ id: string; role: Role; changed: boolean }>(res);
  } finally {
    t.done();
  }
}

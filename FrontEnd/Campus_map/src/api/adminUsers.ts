export type UserPlace = {
  id: string;
  name: string;
  abbr?: string | null;
  type?: string | null;
  lat: number;
  lng: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  totalPlaces: number;
};

type ListResponse = {
  total: number;
  skip: number;
  take: number;
  results: AdminUserRow[];
};

export async function listUserPlaces(
  userId: string,
  status?: "PENDING" | "APPROVED" | "REJECTED",
  skip = 0,
  take = 20
) {
  const url = new URL(`/api/admin/users/${userId}/places`, window.location.origin);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));

  const res = await fetch(url.toString().replace(window.location.origin, ""), {
    credentials: "include",
  });
  if (res.status === 401) throw new Error("Please log in.");
  if (res.status === 403) throw new Error("Admin only.");
  if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || `HTTP ${res.status}`);
  return res.json() as Promise<{
    total: number;
    skip: number;
    take: number;
    byStatus: { PENDING: number; APPROVED: number; REJECTED: number };
    results: UserPlace[];
  }>;
}


async function asJson<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new Error("Please log in.");
  if (res.status === 403) throw new Error("Admin only.");
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { const j = await res.json(); msg = j?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function listUsers(q = "", skip = 0, take = 20) {
  const url = new URL("/api/admin/users", window.location.origin);
  if (q) url.searchParams.set("q", q);
  url.searchParams.set("skip", String(skip));
  url.searchParams.set("take", String(take));
  const res = await fetch(url.toString().replace(window.location.origin, ""), {
    credentials: "include",
  });
  return asJson<ListResponse>(res);
}

export async function makeAdmin(id: string) {
  const res = await fetch(`/api/admin/users/${id}/make-admin`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
  return asJson<{ id: string; role: "USER" | "ADMIN"; changed: boolean }>(res);
}


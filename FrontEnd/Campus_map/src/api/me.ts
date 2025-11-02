export type Me = { id: string; name: string; email: string; role: "USER" | "ADMIN" };

export async function getMe(): Promise<Me> {
  const res = await fetch("/api/me", { credentials: "include" });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

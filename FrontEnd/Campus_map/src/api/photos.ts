// Ask your backend for a short-lived Cloudinary signature
export async function getPhotoSignature(placeId: string) {
  const res = await fetch(`/api/places/${placeId}/photos/sign`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to get upload signature");
  return res.json() as Promise<{
    signature: string; timestamp: number; folder: string;
    cloudName: string; apiKey: string;
  }>;
}

// After Cloudinary upload, tell your backend to create the DB row
export async function savePhotoRecord(placeId: string, data: {
  url: string; publicId?: string; caption?: string;
}) {
  const res = await fetch(`/api/places/${placeId}/photos`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to save photo record");
  return res.json();
}

export async function getPrimaryPhoto(placeId: string) {
  const res = await fetch(`/api/places/${placeId}/primaryPhoto`, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to get primary photo");
  return (await res.json()) as { id: string; url: string; isPrimary: boolean } | null;
}


import { useRef, useState } from "react";
import { getPhotoSignature, savePhotoRecord } from "../api/photos";


export default function PhotoUploader({ placeId, onUploaded }: { placeId: string; onUploaded?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setErr(null);
    setUploading(true);
    try {
      // 1) Get signature from your backend
      const { signature, timestamp, folder, cloudName, apiKey } =
        await getPhotoSignature(placeId);

      // 2) Build the form for Cloudinary
      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      // 3) Upload directly to Cloudinary
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;
      const up = await fetch(cloudinaryUrl, { method: "POST", body: form });
      if (!up.ok) throw new Error("Cloudinary upload failed");
      const json = await up.json(); // has secure_url, public_id, width, height, etc.

      // 4) Save DB record in your backend
      await savePhotoRecord(placeId, {
        url: json.secure_url,
        publicId: json.public_id,
      });
      onUploaded?.();
      alert("Photo uploaded!");
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="px-3 py-2 rounded-xl border cursor-pointer border-[#b3adad]">
        {uploading ? "Uploading..." : "Upload photo"}
        <input
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          disabled={uploading}
        />
      </label>
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  );
}

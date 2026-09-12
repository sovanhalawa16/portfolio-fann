"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
};

export default function ImageUploader({
  value,
  onChange,
  bucket = "media",
  label = "Upload Gambar",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi: max 5MB, hanya gambar
    if (file.size > 5 * 1024 * 1024) {
      setError("File terlalu besar. Maksimal 5MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File harus berupa gambar (JPG, PNG, WebP).");
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    onChange(urlData.publicUrl);
    setUploading(false);

    // Reset input biar bisa upload file yg sama lagi
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-neutral-800">
          <img
            src={value}
            alt="Cover"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg bg-white text-neutral-950 px-3 py-1.5 text-xs font-semibold hover:bg-neutral-200"
            >
              Ganti
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="rounded-lg bg-red-500 text-white px-3 py-1.5 text-xs font-semibold hover:bg-red-600"
            >
              Hapus
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-neutral-800 hover:border-violet-500/50 bg-neutral-900/40 hover:bg-neutral-900/60 p-8 text-center transition disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-sm text-neutral-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-sm font-medium">Klik untuk upload gambar</span>
              <span className="text-xs text-neutral-500">JPG, PNG, WebP (max 5MB)</span>
            </div>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />

      {error && (
        <div className="mt-2 rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
          ❌ {error}
        </div>
      )}
    </div>
  );
}
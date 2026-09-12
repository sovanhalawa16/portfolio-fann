"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

type Props = {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
};

export default function DocumentUploader({
  value,
  onChange,
  bucket = "media",
  label = "Upload File",
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSizeMB}MB.`);
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `documents/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath);
    onChange(urlData.publicUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileName = value ? value.split("/").pop() : "";

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {value ? (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-950 p-3">
          <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm truncate">{fileName || "Document"}</div>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:underline"
            >
              Lihat file →
            </a>
          </div>
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition"
              title="Ganti"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg p-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Hapus"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-neutral-800 hover:border-violet-500/50 bg-neutral-900/40 hover:bg-neutral-900/60 p-6 text-center transition disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-xs text-neutral-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-500">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-xs font-medium">Klik buat upload file</span>
              <span className="text-[10px] text-neutral-500">
                {accept} (max {maxSizeMB}MB)
              </span>
            </div>
          )}
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
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
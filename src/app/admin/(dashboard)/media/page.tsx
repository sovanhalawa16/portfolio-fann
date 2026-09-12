"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

type MediaFile = {
  name: string;
  id: string;
  created_at: string;
  metadata: {
    size: number;
    mimetype: string;
  };
};

export default function MediaLibraryPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cuma 1 folder utama. Kalo ada folder lain, bakal di-include nanti.
  const FOLDERS = ["uploads"];

  const fetchFiles = async () => {
    setLoading(true);
    setErrorMsg("");
    const supabase = createClient();
    const allFiles: MediaFile[] = [];

    try {
      for (const folder of FOLDERS) {
        // Timeout 5 detik biar gak hang
        const timeoutPromise = new Promise<{ data: null; error: any }>((resolve) =>
          setTimeout(
            () => resolve({ data: null, error: { message: "Timeout" } }),
            5000
          )
        );

        const fetchPromise = supabase.storage.from("media").list(folder, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });

        const result = (await Promise.race([
          fetchPromise,
          timeoutPromise,
        ])) as any;

        if (result.error) {
          console.warn(`⚠️ Folder ${folder}:`, result.error.message);
          continue;
        }

        if (result.data) {
          result.data.forEach((file: any) => {
            if (!file.id && !file.name) return;
            if (file.name === ".emptyFolderPlaceholder") return;
            allFiles.push({
              ...file,
              id: `${folder}/${file.name}`,
            });
          });
        }
      }

      allFiles.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setFiles(allFiles);
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      setErrorMsg(err.message || "Gagal fetch files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setErrorMsg("");
    const supabase = createClient();
    let successCount = 0;
    let failCount = 0;

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        if (file.size > 10 * 1024 * 1024) {
          alert(`File "${file.name}" terlalu besar. Maksimal 10MB.`);
          failCount++;
          continue;
        }

        setUploadProgress(`${i + 1}/${selectedFiles.length}`);

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { error } = await supabase.storage
          .from("media")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error(`❌ Upload ${file.name}:`, error.message);
          failCount++;
        } else {
          successCount++;
        }
      }

      if (failCount > 0) {
        setErrorMsg(`${failCount} file gagal upload. Cek F12 Console.`);
      }

      await fetchFiles();
    } catch (err: any) {
      console.error("❌ Upload error:", err);
      setErrorMsg(err.message || "Upload gagal");
    } finally {
      setUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (file: MediaFile) => {
    if (!confirm(`Hapus file "${file.name}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.storage.from("media").remove([file.id]);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setFiles(files.filter((f) => f.id !== file.id));
      if (selectedFile?.id === file.id) setSelectedFile(null);
    }
  };

  const getPublicUrl = (file: MediaFile) => {
    const supabase = createClient();
    const { data } = supabase.storage.from("media").getPublicUrl(file.id);
    return data.publicUrl;
  };

  const handleCopyUrl = async (file: MediaFile) => {
    const url = getPublicUrl(file);
    await navigator.clipboard.writeText(url);
    setCopiedUrl(file.id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  const isImage = (file: MediaFile) =>
    file.metadata?.mimetype?.startsWith("image/");

  const isPdf = (file: MediaFile) =>
    file.metadata?.mimetype?.includes("pdf");

  const filteredFiles = files.filter((file) => {
    const matchSearch = file.name.toLowerCase().includes(search.toLowerCase());
    const matchType =
      filterType === "all" ||
      (filterType === "image" && isImage(file)) ||
      (filterType === "pdf" && isPdf(file)) ||
      (filterType === "other" && !isImage(file) && !isPdf(file));
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
          <p className="text-neutral-400 mt-1">
            Semua gambar & file yang pernah lo upload.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <button
            onClick={fetchFiles}
            disabled={loading}
            className="rounded-lg border border-neutral-800 px-4 py-2.5 text-sm font-medium hover:bg-neutral-900 transition disabled:opacity-50"
            title="Refresh"
          >
            🔄
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-neutral-400/30 border-t-neutral-950 rounded-full animate-spin" />
                {uploadProgress || "Uploading..."}
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Upload File
              </>
            )}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {errorMsg && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {errorMsg}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "All" },
            { key: "image", label: "🖼️ Gambar" },
            { key: "pdf", label: "📄 PDF" },
            { key: "other", label: "📎 Lainnya" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                filterType === f.key
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!loading && (
        <p className="text-xs text-neutral-500">
          {filteredFiles.length} file • {files.filter(isImage).length} gambar •{" "}
          {files.filter(isPdf).length} PDF
        </p>
      )}

      {loading ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-16 text-center text-neutral-500">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm">Loading media...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-16 text-center">
          <div className="text-5xl mb-4">🖼️</div>
          <h3 className="text-lg font-semibold mb-2">
            {search ? "File gak ketemu" : "Belum ada file"}
          </h3>
          <p className="text-sm text-neutral-400 mb-6">
            {search ? "Coba keyword lain." : "Upload gambar pertama lo sekarang!"}
          </p>
          {!search && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-block rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
            >
              + Upload File
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="group relative rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 transition"
            >
              <div
                className="aspect-square bg-neutral-950 relative overflow-hidden cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                {isImage(file) ? (
                  <img
                    src={getPublicUrl(file)}
                    alt={file.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    loading="lazy"
                  />
                ) : isPdf(file) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-red-400">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <path d="M14 2v6h6" />
                    </svg>
                    <span className="text-xs font-medium">PDF</span>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                      <path d="M13 2v7h7" />
                    </svg>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyUrl(file);
                    }}
                    className="rounded-lg bg-white text-neutral-950 p-2 hover:bg-neutral-200 transition"
                    title="Copy URL"
                  >
                    {copiedUrl === file.id ? (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    className="rounded-lg bg-red-500 text-white p-2 hover:bg-red-600 transition"
                    title="Hapus"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="p-3">
                <div className="text-xs font-medium truncate" title={file.name}>
                  {file.name}
                </div>
                <div className="text-[10px] text-neutral-500 mt-1">
                  {formatSize(file.metadata?.size || 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedFile && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold truncate">
                  {selectedFile.name}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {formatSize(selectedFile.metadata?.size || 0)}
                </div>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 transition ml-4"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 bg-neutral-900 p-4 flex items-center justify-center overflow-hidden">
              {isImage(selectedFile) ? (
                <img
                  src={getPublicUrl(selectedFile)}
                  alt={selectedFile.name}
                  className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-neutral-500 text-sm">Preview gak tersedia</div>
              )}
            </div>

            <div className="p-5 border-t border-neutral-800 flex flex-wrap gap-2">
              <button
                onClick={() => handleCopyUrl(selectedFile)}
                className="rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                {copiedUrl === selectedFile.id ? "✅ Tercopy!" : "Copy URL"}
              </button>

              <a
                href={getPublicUrl(selectedFile)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 transition"
              >
                Buka di Tab Baru ↗
              </a>

              <button
                onClick={() => handleDelete(selectedFile)}
                className="ml-auto rounded-lg border border-red-900/50 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950/30 transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
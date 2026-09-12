"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

type Media = {
  id: number;
  type: "image" | "video";
  url: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export default function HeroMediaPage() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "video">("image");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<number | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("hero_media")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setMedia(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = uploadType === "video" ? 20 : 10;
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File terlalu besar. Maksimal ${maxSize}MB.`);
      return;
    }

    setUploading(true);
    setError("");

    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `hero/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);

    const maxOrder =
      media.length > 0 ? Math.max(...media.map((m) => m.sort_order || 0)) + 1 : 0;

    const { error: insertError } = await supabase.from("hero_media").insert({
      type: uploadType,
      url: urlData.publicUrl,
      caption: caption.trim() || null,
      sort_order: maxOrder,
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setCaption("");
      await fetchMedia();
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: number, url: string) => {
    if (!confirm("Hapus media ini?")) return;
    setDeletingId(id);
    const supabase = createClient();

    // Hapus dari storage juga
    const path = url.split("/media/")[1];
    if (path) {
      await supabase.storage.from("media").remove([decodeURIComponent(path)]);
    }

    const { error } = await supabase.from("hero_media").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setMedia(media.filter((m) => m.id !== id));
    }
    setDeletingId(null);
  };

  const handleUpdateCaption = async (id: number) => {
    const supabase = createClient();
    await supabase
      .from("hero_media")
      .update({ caption: captionDraft.trim() || null })
      .eq("id", id);
    setMedia(
      media.map((m) => (m.id === id ? { ...m, caption: captionDraft.trim() || null } : m))
    );
    setEditingCaption(null);
    setCaptionDraft("");
  };

  const moveUp = async (index: number) => {
    if (index === 0) return;
    const newMedia = [...media];
    [newMedia[index - 1], newMedia[index]] = [newMedia[index], newMedia[index - 1]];
    // Update sort_order
    newMedia.forEach((m, i) => (m.sort_order = i));
    setMedia(newMedia);
    const supabase = createClient();
    await Promise.all(
      newMedia.map((m) =>
        supabase.from("hero_media").update({ sort_order: m.sort_order }).eq("id", m.id)
      )
    );
  };

  const moveDown = async (index: number) => {
    if (index === media.length - 1) return;
    const newMedia = [...media];
    [newMedia[index + 1], newMedia[index]] = [newMedia[index], newMedia[index + 1]];
    newMedia.forEach((m, i) => (m.sort_order = i));
    setMedia(newMedia);
    const supabase = createClient();
    await Promise.all(
      newMedia.map((m) =>
        supabase.from("hero_media").update({ sort_order: m.sort_order }).eq("id", m.id)
      )
    );
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hero Media</h1>
        <p className="text-neutral-400 mt-1">
          Foto/video yang muncul di hero section homepage. Urutan pertama muncul duluan.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {/* UPLOAD FORM */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h3 className="font-semibold">Upload Media Baru</h3>

        <div className="flex gap-2">
          {(["image", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setUploadType(t)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                uploadType === t
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"
              }`}
            >
              {t === "image" ? "📷 Image" : "🎬 Video"}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Caption (opsional)"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-neutral-800 hover:border-violet-500/50 bg-neutral-950/40 hover:bg-neutral-900/60 p-6 text-center transition disabled:opacity-50"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="h-5 w-5 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
              <span className="text-xs text-neutral-400">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-neutral-500">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span className="text-sm font-medium">
                Klik upload {uploadType === "video" ? "video (MP4, WebM)" : "gambar (JPG, PNG, WebP)"}
              </span>
              <span className="text-[10px] text-neutral-500">
                Max {uploadType === "video" ? "20" : "10"}MB
              </span>
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept={uploadType === "video" ? "video/*" : "image/*"}
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🖼️</div>
            <h3 className="text-lg font-semibold mb-2">Belum ada media</h3>
            <p className="text-sm text-neutral-400">
              Upload foto atau video pertama lo!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {media.map((item, i) => (
              <div key={item.id} className="p-4 hover:bg-neutral-900/40 transition">
                <div className="flex gap-4">
                  {/* PREVIEW */}
                  <div className="shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        muted
                        loop
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={item.caption || ""}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2 py-0.5 text-[10px] font-bold">
                        {item.type === "video" ? "🎬 VIDEO" : "📷 IMAGE"}
                      </span>
                      <span className="text-xs text-neutral-500">#{i + 1}</span>
                    </div>

                    {editingCaption === item.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          value={captionDraft}
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateCaption(item.id);
                            if (e.key === "Escape") {
                              setEditingCaption(null);
                              setCaptionDraft("");
                            }
                          }}
                          autoFocus
                          className="flex-1 rounded-lg border border-violet-500/50 bg-neutral-950 px-3 py-1.5 text-sm focus:outline-none"
                          placeholder="Caption..."
                        />
                        <button
                          onClick={() => handleUpdateCaption(item.id)}
                          className="rounded-lg bg-green-500/20 text-green-400 px-3 py-1.5 text-xs font-medium hover:bg-green-500/30"
                        >
                          Simpan
                        </button>
                      </div>
                    ) : (
                      <p
                        className="text-sm text-neutral-300 cursor-pointer hover:text-white mt-1 truncate"
                        onClick={() => {
                          setEditingCaption(item.id);
                          setCaptionDraft(item.caption || "");
                        }}
                        title="Klik buat edit caption"
                      >
                        {item.caption || <span className="text-neutral-500 italic">Klik buat nambah caption...</span>}
                      </p>
                    )}
                  </div>

                  {/* ACTIONS */}
                  <div className="shrink-0 flex flex-col gap-1">
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      className="rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30"
                      title="Naikkan"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <path d="M18 15l-6-6-6 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i === media.length - 1}
                      className="rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30"
                      title="Turunkan"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(item.id, item.url)}
                      disabled={deletingId === item.id}
                      className="rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === item.id ? (
                        <div className="h-3.5 w-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Total: {media.length} media
      </p>
    </div>
  );
}
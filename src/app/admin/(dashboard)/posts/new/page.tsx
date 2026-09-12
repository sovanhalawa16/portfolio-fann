"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";

type Category = { id: number; name: string };

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugEdited && title) setSlug(generateSlug(title));
  }, [title, slugEdited]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!title.trim() || !slug.trim()) {
      setError("Judul dan slug wajib diisi!");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("posts").insert({
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt.trim() || null,
      content: content || null,
      cover_image: coverImage || null,
      category_id: categoryId ? parseInt(categoryId) : null,
      status,
      published_at: status === "published" ? new Date().toISOString() : null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition mb-2"
          >
            ← Kembali ke Posts
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Tulis Artikel Baru</h1>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ COVER IMAGE - INI YANG BAKAL MUNCUL */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              label="Cover Image"
            />
          </div>

          {/* TITLE + SLUG + EXCERPT */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Judul Artikel *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul yang menarik..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug URL</label>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm">
                <span className="text-neutral-500">/blog/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
                  className="flex-1 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Excerpt</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Ringkasan singkat artikel..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none"
              />
            </div>
          </div>

          {/* CONTENT */}
<div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
  <label className="block text-sm font-medium mb-3">Konten Artikel</label>
  <RichTextEditor
    value={content}
    onChange={setContent}
    placeholder="Tulis konten artikel di sini... Bisa pake heading, list, quote, code block, dll."
  />
</div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Publish</h3>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="draft">📝 Draft</option>
              <option value="published">✅ Published</option>
              <option value="scheduled">⏰ Scheduled</option>
            </select>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Kategori</h3>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="">— Pilih Kategori —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </form>
  );
}
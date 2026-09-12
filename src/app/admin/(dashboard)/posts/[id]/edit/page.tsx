"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";

type Category = { id: number; name: string };

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState("draft");
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const [postRes, catsRes] = await Promise.all([
        supabase.from("posts").select("*").eq("id", postId).single(),
        supabase.from("categories").select("id, name").order("name"),
      ]);

      if (postRes.error || !postRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const post = postRes.data;
      setTitle(post.title || "");
      setSlug(post.slug || "");
      setExcerpt(post.excerpt || "");
      setContent(post.content || "");
      setCoverImage(post.cover_image || "");
      setCategoryId(post.category_id?.toString() || "");
      setStatus(post.status || "draft");
      setCategories(catsRes.data || []);
      setLoading(false);
    };

    fetchData();
  }, [postId]);

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
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        excerpt: excerpt.trim() || null,
        content: content || null,
        cover_image: coverImage || null,
        category_id: categoryId ? parseInt(categoryId) : null,
        status,
        published_at:
          status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin mau hapus artikel "${title}"? Tindakan ini gak bisa dibatalkan.`)) return;

    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/posts");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-neutral-500">Loading artikel...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Artikel gak ketemu</h1>
        <p className="text-neutral-400 mb-6">
          Artikel dengan ID <code className="bg-neutral-900 px-2 py-1 rounded">{postId}</code> gak ada di database.
        </p>
        <Link
          href="/admin/posts"
          className="inline-block rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
        >
          ← Kembali ke Posts
        </Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Artikel</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Post ID: <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-xs">{postId}</code>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting || saving}
            className="rounded-lg border border-red-900/50 text-red-400 px-4 py-2.5 text-sm font-medium hover:bg-red-950/30 transition disabled:opacity-50"
          >
            {deleting ? "Hapus..." : "Hapus"}
          </button>
          <button
            type="submit"
            disabled={saving || deleting}
            className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "Update"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* ✅ COVER IMAGE */}
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
                  onChange={(e) => setSlug(e.target.value)}
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
    placeholder="Tulis konten artikel di sini..."
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

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Hapus artikel secara permanen. Tindakan ini gak bisa di-undo.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-lg border border-red-900/50 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950/30 transition disabled:opacity-50"
            >
              Hapus Artikel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
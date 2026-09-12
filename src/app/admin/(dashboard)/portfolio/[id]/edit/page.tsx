"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";
import TechStackPicker from "@/components/TechStackPicker";

export default function EditPortfolioPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState("");
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("portfolio")
        .select("*")
        .eq("id", projectId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setShortDescription(data.short_description || "");
      setContent(data.content || "");
      setThumbnail(data.thumbnail || "");
      setTechStack(data.tech_stack || []);
      setDemoUrl(data.demo_url || "");
      setRepoUrl(data.repo_url || "");
      setClient(data.client || "");
      setYear(data.year?.toString() || "");
      setDuration(data.duration || "");
      setStatus(data.status || "draft");
      setFeatured(data.featured || false);
      setLoading(false);
    };

    fetchData();
  }, [projectId]);

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
      .from("portfolio")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim() || null,
        content: content || null,
        thumbnail: thumbnail || null,
        tech_stack: techStack,
        demo_url: demoUrl.trim() || null,
        repo_url: repoUrl.trim() || null,
        client: client.trim() || null,
        year: year ? parseInt(year) : null,
        duration: duration.trim() || null,
        status,
        featured,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/portfolio");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin mau hapus project "${title}"? Tindakan ini gak bisa dibatalkan.`))
      return;

    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", projectId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }

    router.push("/admin/portfolio");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-neutral-500">Loading project...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Project gak ketemu</h1>
        <p className="text-neutral-400 mb-6">
          Project dengan ID <code className="bg-neutral-900 px-2 py-1 rounded">{projectId}</code> gak ada di database.
        </p>
        <Link
          href="/admin/portfolio"
          className="inline-block rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
        >
          ← Kembali ke Portfolio
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
            href="/admin/portfolio"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition mb-2"
          >
            ← Kembali ke Portfolio
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Project ID: <code className="bg-neutral-900 px-1.5 py-0.5 rounded text-xs">{projectId}</code>
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
          {/* THUMBNAIL */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ImageUploader
              value={thumbnail}
              onChange={setThumbnail}
              label="Thumbnail Project"
            />
          </div>

          {/* TITLE + SLUG + SHORT DESC */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nama Project *</label>
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
                <span className="text-neutral-500">/portfolio/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deskripsi Singkat</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none"
              />
            </div>
          </div>

          {/* CONTENT */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <label className="block text-sm font-medium mb-3">Case Study</label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Ceritain detail project..."
            />
          </div>

          {/* TECH STACK - FULL WIDTH */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tech Stack</h3>
              <span className="text-xs text-neutral-500">
                Pilih tech yang dipake di project ini
              </span>
            </div>
            <TechStackPicker value={techStack} onChange={setTechStack} />
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          {/* PUBLISH */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Publish</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              >
                <option value="draft">📝 Draft</option>
                <option value="published">✅ Published</option>
                <option value="archived">📦 Archived</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-violet-500 focus:ring-violet-500/20"
              />
              <span className="text-sm">⭐ Featured</span>
            </label>
          </div>

          {/* LINKS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Links</h3>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Demo URL
              </label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Repository URL
              </label>
              <input
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>

          {/* DETAILS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Details</h3>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Client
              </label>
              <input
                type="text"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Hapus project secara permanen. Gak bisa di-undo.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-lg border border-red-900/50 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950/30 transition disabled:opacity-50"
            >
              Hapus Project
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
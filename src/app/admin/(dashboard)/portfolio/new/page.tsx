"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import ImageUploader from "@/components/ImageUploader";
import RichTextEditor from "@/components/RichTextEditor";
import TechStackPicker from "@/components/TechStackPicker";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPortfolioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [shortDescription, setShortDescription] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [client, setClient] = useState("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [duration, setDuration] = useState("");
  const [status, setStatus] = useState("draft");
  const [featured, setFeatured] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slugEdited && title) setSlug(generateSlug(title));
  }, [title, slugEdited]);

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
    const { error: insertError } = await supabase.from("portfolio").insert({
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
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/portfolio");
    router.refresh();
  };

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
          <h1 className="text-3xl font-bold tracking-tight">Tambah Project Baru</h1>
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
                placeholder="Judul project yang keren..."
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
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugEdited(true);
                  }}
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
                placeholder="1-2 kalimat ringkasan project..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none"
              />
            </div>
          </div>

          {/* CONTENT (Case Study) */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <label className="block text-sm font-medium mb-3">
              Case Study (Problem, Role, Solution, Result)
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Ceritain detail project: problem apa yang dipecahin, role lo apa, solution-nya gimana, dan hasilnya apa..."
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
              <span className="text-sm">⭐ Featured (tampil di atas)</span>
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
                placeholder="Nama client / personal"
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
                  placeholder="2025"
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
                  placeholder="2 bulan"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
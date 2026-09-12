"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";
import ImageUploader from "@/components/ImageUploader";
import KeywordsInput from "@/components/KeywordsInput";
import AuthorsInput, { type Author } from "@/components/AuthorsInput";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

const RANKING_OPTIONS = [
  { value: "sinta_1", label: "Sinta 1" },
  { value: "sinta_2", label: "Sinta 2" },
  { value: "sinta_3", label: "Sinta 3" },
  { value: "sinta_4", label: "Sinta 4" },
  { value: "sinta_5", label: "Sinta 5" },
  { value: "sinta_6", label: "Sinta 6" },
  { value: "scopus_q1", label: "Scopus Q1" },
  { value: "scopus_q2", label: "Scopus Q2" },
  { value: "scopus_q3", label: "Scopus Q3" },
  { value: "scopus_q4", label: "Scopus Q4" },
  { value: "wos", label: "Web of Science" },
  { value: "garuda", label: "Garuda" },
  { value: "other", label: "Lainnya" },
  { value: "none", label: "Tidak ada" },
];

const TYPE_OPTIONS = [
  { value: "journal", label: "📄 Journal Article" },
  { value: "conference", label: "🎤 Conference Paper" },
  { value: "book_chapter", label: "📚 Book Chapter" },
  { value: "preprint", label: "📝 Preprint" },
  { value: "thesis", label: "🎓 Thesis" },
  { value: "workshop", label: "🔧 Workshop" },
];

export default function NewPublicationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [abstract, setAbstract] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [journalName, setJournalName] = useState("");
  const [pubType, setPubType] = useState("journal");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [volume, setVolume] = useState("");
  const [issue, setIssue] = useState("");
  const [pages, setPages] = useState("");
  const [doi, setDoi] = useState("");
  const [urlJournal, setUrlJournal] = useState("");
  const [urlScholar, setUrlScholar] = useState("");
  const [urlPdf, setUrlPdf] = useState("");
  const [ranking, setRanking] = useState("none");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [researchArea, setResearchArea] = useState("");
  const [citations, setCitations] = useState("0");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState("published");
  const [featured, setFeatured] = useState(false);

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!slugEdited) setSlug(generateSlug(v));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (!title.trim() || !slug.trim() || !journalName.trim()) {
      setError("Judul, slug, dan nama jurnal wajib diisi!");
      setSaving(false);
      return;
    }

    if (authors.length === 0) {
      setError("Minimal 1 author wajib diisi!");
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error: insertError } = await supabase.from("publications").insert({
      title: title.trim(),
      slug: slug.trim(),
      abstract: abstract.trim() || null,
      authors,
      journal_name: journalName.trim(),
      publication_type: pubType,
      year: parseInt(year),
      volume: volume.trim() || null,
      issue: issue.trim() || null,
      pages: pages.trim() || null,
      doi: doi.trim() || null,
      url_journal: urlJournal.trim() || null,
      url_scholar: urlScholar.trim() || null,
      url_pdf: urlPdf.trim() || null,
      ranking,
      keywords,
      research_area: researchArea.trim() || null,
      citations: parseInt(citations) || 0,
      cover_image: coverImage || null,
      status,
      featured,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/publications");
    router.refresh();
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/publications"
            className="inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition mb-2"
          >
            <Icons.ArrowRight className="w-3.5 h-3.5 rotate-180" />
            Kembali ke Publications
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Tambah Publikasi</h1>
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
        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ImageUploader
              value={coverImage}
              onChange={setCoverImage}
              label="Cover / Thumbnail (opsional)"
            />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Judul Paper *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Judul penelitian..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slug URL</label>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm">
                <span className="text-neutral-500">/publications/</span>
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
              <label className="block text-sm font-medium mb-2">Abstract</label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={6}
                placeholder="Abstrak penelitian..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* AUTHORS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Authors *</h3>
              <span className="text-xs text-neutral-500">
                Urutan sesuai paper
              </span>
            </div>
            <AuthorsInput value={authors} onChange={setAuthors} />
          </div>

          {/* PUBLICATION DETAILS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Detail Publikasi</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipe *</label>
                <select
                  value={pubType}
                  onChange={(e) => setPubType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tahun *</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nama Jurnal / Conference *</label>
              <input
                type="text"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
                placeholder="Jurnal Teknologi Indonesia"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Volume</label>
                <input
                  type="text"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                  placeholder="Vol. 12"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Issue</label>
                <input
                  type="text"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="No. 3"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Pages</label>
                <input
                  type="text"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  placeholder="125-138"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Links & Identifier</h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">DOI</label>
                <input
                  type="text"
                  value={doi}
                  onChange={(e) => setDoi(e.target.value)}
                  placeholder="10.1234/journal.2024.01"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL Jurnal</label>
                <input
                  type="url"
                  value={urlJournal}
                  onChange={(e) => setUrlJournal(e.target.value)}
                  placeholder="https://journal.com/..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL Google Scholar</label>
                <input
                  type="url"
                  value={urlScholar}
                  onChange={(e) => setUrlScholar(e.target.value)}
                  placeholder="https://scholar.google.com/..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL PDF</label>
                <input
                  type="url"
                  value={urlPdf}
                  onChange={(e) => setUrlPdf(e.target.value)}
                  placeholder="https://journal.com/pdf/..."
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
            </div>
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
              >
                <option value="published">✅ Published</option>
                <option value="draft">📝 Draft</option>
                <option value="under_review">🔍 Under Review</option>
                <option value="in_press">📰 In Press</option>
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

          {/* RANKING */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Ranking</h3>
            <select
              value={ranking}
              onChange={(e) => setRanking(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
            >
              {RANKING_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* CITATIONS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <h3 className="font-semibold">Citations</h3>
            <input
              type="number"
              min="0"
              value={citations}
              onChange={(e) => setCitations(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
            />
            <p className="text-[10px] text-neutral-500">
              Manual. Update dari Google Scholar.
            </p>
          </div>

          {/* KEYWORDS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Keywords</h3>
            <KeywordsInput value={keywords} onChange={setKeywords} />
          </div>

          {/* RESEARCH AREA */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <h3 className="font-semibold">Bidang Riset</h3>
            <input
              type="text"
              value={researchArea}
              onChange={(e) => setResearchArea(e.target.value)}
              placeholder="Web Development, ML, IoT..."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
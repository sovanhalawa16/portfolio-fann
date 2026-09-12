"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";
import ImageUploader from "@/components/ImageUploader";
import KeywordsInput from "@/components/KeywordsInput";
import AuthorsInput, { type Author } from "@/components/AuthorsInput";

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

export default function EditPublicationPage() {
  const router = useRouter();
  const params = useParams();
  const pubId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [abstract, setAbstract] = useState("");
  const [authors, setAuthors] = useState<Author[]>([]);
  const [journalName, setJournalName] = useState("");
  const [pubType, setPubType] = useState("journal");
  const [year, setYear] = useState("");
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

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("publications")
        .select("*")
        .eq("id", pubId)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title || "");
      setSlug(data.slug || "");
      setAbstract(data.abstract || "");
      setAuthors(data.authors || []);
      setJournalName(data.journal_name || "");
      setPubType(data.publication_type || "journal");
      setYear(data.year?.toString() || "");
      setVolume(data.volume || "");
      setIssue(data.issue || "");
      setPages(data.pages || "");
      setDoi(data.doi || "");
      setUrlJournal(data.url_journal || "");
      setUrlScholar(data.url_scholar || "");
      setUrlPdf(data.url_pdf || "");
      setRanking(data.ranking || "none");
      setKeywords(data.keywords || []);
      setResearchArea(data.research_area || "");
      setCitations(data.citations?.toString() || "0");
      setCoverImage(data.cover_image || "");
      setStatus(data.status || "published");
      setFeatured(data.featured || false);
      setLoading(false);
    };
    fetch();
  }, [pubId]);

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
    const { error: updateError } = await supabase
      .from("publications")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", pubId);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push("/admin/publications");
    router.refresh();
  };

  const handleDelete = async () => {
    if (!confirm(`Yakin hapus publikasi "${title}"?`)) return;
    setDeleting(true);
    const supabase = createClient();
    const { error: deleteError } = await supabase
      .from("publications")
      .delete()
      .eq("id", pubId);

    if (deleteError) {
      setError(deleteError.message);
      setDeleting(false);
      return;
    }
    router.push("/admin/publications");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-neutral-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="text-2xl font-bold mb-2">Publikasi gak ketemu</h1>
        <Link
          href="/admin/publications"
          className="inline-block mt-4 rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
        >
          ← Kembali
        </Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Publikasi</h1>
          <p className="text-sm text-neutral-500 mt-1">ID: {pubId}</p>
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
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ImageUploader value={coverImage} onChange={setCoverImage} label="Cover / Thumbnail" />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Judul *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-base focus:border-violet-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Slug</label>
              <div className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-3 text-sm">
                <span className="text-neutral-500">/publications/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
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
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition resize-none leading-relaxed"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <h3 className="font-semibold">Authors</h3>
            <AuthorsInput value={authors} onChange={setAuthors} />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Detail Publikasi</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tipe</label>
                <select
                  value={pubType}
                  onChange={(e) => setPubType(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
                >
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tahun</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nama Jurnal</label>
              <input
                type="text"
                value={journalName}
                onChange={(e) => setJournalName(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Volume</label>
                <input type="text" value={volume} onChange={(e) => setVolume(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Issue</label>
                <input type="text" value={issue} onChange={(e) => setIssue(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">Pages</label>
                <input type="text" value={pages} onChange={(e) => setPages(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Links</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">DOI</label>
                <input type="text" value={doi} onChange={(e) => setDoi(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL Jurnal</label>
                <input type="url" value={urlJournal} onChange={(e) => setUrlJournal(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL Scholar</label>
                <input type="url" value={urlScholar} onChange={(e) => setUrlScholar(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-2 text-neutral-400">URL PDF</label>
                <input type="url" value={urlPdf} onChange={(e) => setUrlPdf(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Publish</h3>
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-violet-500 focus:ring-violet-500/20" />
              <span className="text-sm">⭐ Featured</span>
            </label>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Ranking</h3>
            <select value={ranking} onChange={(e) => setRanking(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition">
              {RANKING_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <h3 className="font-semibold">Citations</h3>
            <input type="number" min="0" value={citations} onChange={(e) => setCitations(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition" />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Keywords</h3>
            <KeywordsInput value={keywords} onChange={setKeywords} />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3">
            <h3 className="font-semibold">Bidang Riset</h3>
            <input type="text" value={researchArea} onChange={(e) => setResearchArea(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none transition" />
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6">
            <h3 className="font-semibold text-yellow-300 mb-2">⚠️ Danger Zone</h3>
            <p className="text-xs text-neutral-400 mb-3">
              Hapus publikasi permanen.
            </p>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full rounded-lg border border-red-900/50 text-red-400 px-4 py-2 text-sm font-medium hover:bg-red-950/30 transition disabled:opacity-50"
            >
              Hapus Publikasi
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
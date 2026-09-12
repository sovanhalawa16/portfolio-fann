"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";

type Publication = {
  id: number;
  title: string;
  slug: string;
  journal_name: string;
  publication_type: string;
  year: number;
  ranking: string;
  citations: number;
  status: string;
  featured: boolean;
  created_at: string;
  authors: { name: string; is_me: boolean }[];
};

const RANKING_LABEL: Record<string, string> = {
  sinta_1: "Sinta 1", sinta_2: "Sinta 2", sinta_3: "Sinta 3",
  sinta_4: "Sinta 4", sinta_5: "Sinta 5", sinta_6: "Sinta 6",
  scopus_q1: "Scopus Q1", scopus_q2: "Scopus Q2",
  scopus_q3: "Scopus Q3", scopus_q4: "Scopus Q4",
  wos: "WoS", garuda: "Garuda", other: "Other", none: "—",
};

const TYPE_LABEL: Record<string, string> = {
  journal: "📄 Journal",
  conference: "🎤 Conference",
  book_chapter: "📚 Book Chapter",
  preprint: "📝 Preprint",
  thesis: "🎓 Thesis",
  workshop: "🔧 Workshop",
};

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterRanking, setFilterRanking] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPublications = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("publications")
      .select("*")
      .order("year", { ascending: false })
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (filterRanking !== "all") query = query.eq("ranking", filterRanking);

    const { data, error } = await query;

    if (error) {
      console.error("Error:", error);
      setPublications([]);
    } else {
      setPublications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPublications();
  }, [filterStatus, filterRanking]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Yakin hapus publikasi "${title}"?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("publications").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setPublications(publications.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  const handleToggleFeatured = async (id: number, current: boolean) => {
    const supabase = createClient();
    await supabase
      .from("publications")
      .update({ featured: !current })
      .eq("id", id);
    setPublications(
      publications.map((p) => (p.id === id ? { ...p, featured: !current } : p))
    );
  };

  const filtered = publications.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.journal_name.toLowerCase().includes(q) ||
      p.authors.some((a) => a.name.toLowerCase().includes(q))
    );
  });

  const statusColors: Record<string, string> = {
    published: "bg-green-500/10 text-green-400 border-green-500/20",
    draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    under_review: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    in_press: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };

  const rankingColors: Record<string, string> = {
    sinta_1: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    sinta_2: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    sinta_3: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    sinta_4: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    sinta_5: "bg-teal-500/15 text-teal-300 border-teal-500/30",
    sinta_6: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    scopus_q1: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    scopus_q2: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    scopus_q3: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    scopus_q4: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    wos: "bg-red-500/15 text-red-300 border-red-500/30",
    garuda: "bg-green-500/15 text-green-300 border-green-500/30",
    other: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
    none: "bg-neutral-500/10 text-neutral-500 border-neutral-800",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publications</h1>
          <p className="text-neutral-400 mt-1">
            Kelola publikasi jurnal, konferensi, dan penelitian lo.
          </p>
        </div>
        <div className="flex gap-2 self-start">
          <Link
            href="/admin/publications/metrics"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 px-4 py-2.5 text-sm font-medium hover:bg-neutral-900 transition"
          >
            <Icons.Award className="w-4 h-4" />
            Metrics
          </Link>
          <Link
            href="/admin/publications/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
          >
            <Icons.Plus className="w-4 h-4" />
            Tambah Publikasi
          </Link>
        </div>
      </div>

      {/* SEARCH & FILTER */}
      <div className="space-y-3">
        <div className="relative">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Cari judul, jurnal, atau author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex gap-2 flex-wrap">
            {["all", "published", "draft", "under_review", "in_press"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`rounded-lg border px-3 py-2 text-xs font-medium transition capitalize ${
                  filterStatus === s
                    ? "border-violet-500 bg-violet-500/10 text-violet-300"
                    : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"
                }`}
              >
                {s.replace("_", " ")}
              </button>
            ))}
          </div>

          <select
            value={filterRanking}
            onChange={(e) => setFilterRanking(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-xs font-medium focus:border-violet-500 focus:outline-none md:ml-auto"
          >
            <option value="all">Semua Ranking</option>
            {Object.entries(RANKING_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIST */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
              <Icons.Bookmark className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? "Publikasi gak ketemu" : "Belum ada publikasi"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              {search
                ? "Coba keyword lain atau reset filter."
                : "Mulai tambah publikasi pertama lo!"}
            </p>
            {!search && (
              <Link
                href="/admin/publications/new"
                className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                <Icons.Plus className="w-4 h-4" />
                Tambah Publikasi
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {filtered.map((pub) => (
              <div
                key={pub.id}
                className="p-4 md:p-5 hover:bg-neutral-900/40 transition group"
              >
                <div className="flex items-start gap-4">
                  {/* ICON */}
                  <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Icons.Bookmark className="w-5 h-5" />
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1 min-w-0">
                    {/* TITLE + ACTIONS */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-sm md:text-base leading-snug">
                        {pub.featured && (
                          <span className="inline-flex items-center mr-1.5 align-middle">
                            <Icons.Star className="w-3.5 h-3.5 text-violet-400" />
                          </span>
                        )}
                        {pub.title}
                      </h3>
                      <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleToggleFeatured(pub.id, pub.featured)}
                          className={`rounded-lg p-1.5 transition ${
                            pub.featured
                              ? "text-violet-400 bg-violet-500/10"
                              : "text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10"
                          }`}
                          title={pub.featured ? "Unfeature" : "Feature"}
                        >
                          <Icons.Star className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/admin/publications/${pub.id}/edit`}
                          className="rounded-lg p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="Edit"
                        >
                          <Icons.Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(pub.id, pub.title)}
                          disabled={deletingId === pub.id}
                          className="rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === pub.id ? (
                            <div className="h-3.5 w-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <Icons.Trash className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* AUTHORS */}
                    <p className="text-xs text-neutral-400 mb-2 line-clamp-1">
                      {pub.authors.map((a, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          <span className={a.is_me ? "font-bold text-violet-300" : ""}>
                            {a.name}
                          </span>
                        </span>
                      ))}
                    </p>

                    {/* META BADGES */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 px-2 py-0.5 font-medium">
                        {TYPE_LABEL[pub.publication_type] || pub.publication_type}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 px-2 py-0.5 font-medium">
                        <Icons.Calendar className="w-2.5 h-2.5" />
                        {pub.year}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${
                          rankingColors[pub.ranking] || rankingColors.other
                        }`}
                      >
                        {RANKING_LABEL[pub.ranking] || pub.ranking}
                      </span>
                      {pub.citations > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 px-2 py-0.5 font-medium">
                          <Icons.Users className="w-2.5 h-2.5" />
                          {pub.citations} sitasi
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium capitalize ${
                          statusColors[pub.status] || statusColors.draft
                        }`}
                      >
                        {pub.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 mt-2 truncate">
                      {pub.journal_name}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <p className="text-xs text-neutral-500 text-center">
          Menampilkan {filtered.length} publikasi
        </p>
      )}
    </div>
  );
}
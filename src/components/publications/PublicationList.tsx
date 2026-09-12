"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/lib/icons";
import PublicationCard, { type Publication } from "./PublicationCard";

const RANKING_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "sinta", label: "Sinta" },
  { value: "scopus", label: "Scopus" },
  { value: "wos", label: "WoS" },
  { value: "garuda", label: "Garuda" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Semua Tipe" },
  { value: "journal", label: "Journal" },
  { value: "conference", label: "Conference" },
  { value: "book_chapter", label: "Book Chapter" },
  { value: "thesis", label: "Thesis" },
];

type SortKey = "newest" | "oldest" | "cited" | "az";

export default function PublicationList({ publications }: { publications: Publication[] }) {
  const [search, setSearch] = useState("");
  const [rankingFilter, setRankingFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const allYears = useMemo(() => {
    const set = new Set(publications.map((p) => p.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [publications]);

  const filtered = useMemo(() => {
    let result = [...publications];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.journal_name.toLowerCase().includes(q) ||
          p.authors.some((a) => a.name.toLowerCase().includes(q)) ||
          p.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }

    if (rankingFilter !== "all") {
      result = result.filter((p) => p.ranking.startsWith(rankingFilter));
    }

    if (typeFilter !== "all") {
      result = result.filter((p) => p.publication_type === typeFilter);
    }

    if (yearFilter !== "all") {
      result = result.filter((p) => p.year === parseInt(yearFilter));
    }

    result.sort((a, b) => {
      if (sort === "newest") return b.year - a.year;
      if (sort === "oldest") return a.year - b.year;
      if (sort === "cited") return b.citations - a.citations;
      if (sort === "az") return a.title.localeCompare(b.title);
      return 0;
    });

    // Featured first
    return result.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [publications, search, rankingFilter, typeFilter, yearFilter, sort]);

  const sortLabels: Record<SortKey, string> = {
    newest: "Terbaru",
    oldest: "Terlama",
    cited: "Paling Dikutip",
    az: "A-Z",
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, author, jurnal, atau keyword..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 pl-10 pr-10 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
            >
              <Icons.Close className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative shrink-0">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 px-4 py-2.5 text-sm font-medium transition"
          >
            <span className="inline-flex items-center gap-2">
              <Icons.ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
              {sortLabels[sort]}
            </span>
            <Icons.ChevronDown className={`w-3.5 h-3.5 text-neutral-500 transition ${sortOpen ? "rotate-180" : ""}`} />
          </button>

          {sortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden z-30">
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setSort(key);
                    setSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition ${
                    sort === key
                      ? "bg-violet-500/10 text-violet-300"
                      : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {sortLabels[key]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FILTERS */}
      <div className="space-y-3 mb-5">
        {/* RANKING */}
        <div className="flex flex-wrap gap-2">
          {RANKING_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRankingFilter(f.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                rankingFilter === f.value
                  ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                  : "border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icons.Award className="w-3 h-3" />
              {f.label}
              {f.value === "all" && (
                <span className="text-[10px] text-neutral-500 tabular-nums">
                  ({publications.length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TYPE + YEAR */}
        <div className="flex flex-wrap gap-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs font-medium focus:border-violet-500 focus:outline-none"
          >
            {TYPE_FILTERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs font-medium focus:border-violet-500 focus:outline-none"
          >
            <option value="all">Semua Tahun</option>
            {allYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between mb-4 text-xs text-neutral-500">
        <span>
          {filtered.length} publikasi
          {search && ` untuk "${search}"`}
        </span>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
            <Icons.Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Gak ada hasil</h3>
          <p className="text-sm text-neutral-500">
            Coba keyword lain atau hapus filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((pub) => (
            <PublicationCard key={pub.id} pub={pub} />
          ))}
        </div>
      )}
    </>
  );
}
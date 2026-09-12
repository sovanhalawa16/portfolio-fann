"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/lib/icons";
import BlogCard from "./BlogCard";

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
  views: number;
  content: string | null;
  category_id: number | null;
  categories: { name: string } | null;
};

type Category = { id: number; name: string; slug: string };

type Props = {
  posts: Post[];
  categories: Category[];
};

type SortKey = "newest" | "oldest" | "popular" | "az";

export default function BlogGrid({ posts, categories }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sortOpen, setSortOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...posts];

    // Filter kategori
    if (activeCategory !== null) {
      result = result.filter((p) => p.category_id === activeCategory);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.excerpt?.toLowerCase() || "").includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === "newest")
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      if (sort === "oldest")
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      if (sort === "popular") return (b.views || 0) - (a.views || 0);
      if (sort === "az") return a.title.localeCompare(b.title);
      return 0;
    });

    return result;
  }, [posts, search, activeCategory, sort]);

  const sortLabels: Record<SortKey, string> = {
    newest: "Terbaru",
    oldest: "Terlama",
    popular: "Populer",
    az: "A-Z",
  };

  return (
    <>
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* SEARCH */}
        <div className="relative flex-1">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari artikel..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
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

        {/* SORT */}
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
            <div className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-neutral-800 bg-neutral-900 shadow-2xl overflow-hidden z-30">
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

      {/* KATEGORI CHIPS */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveCategory(null)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
              activeCategory === null
                ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                : "border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900 hover:text-white"
            }`}
          >
            <Icons.LayoutGrid className="w-3 h-3" />
            Semua
            <span className="text-[10px] text-neutral-500 tabular-nums">
              ({posts.length})
            </span>
          </button>

          {categories.map((cat) => {
            const count = posts.filter((p) => p.category_id === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  activeCategory === cat.id
                    ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                    : "border border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                }`}
              >
                {cat.name}
                <span className="text-[10px] text-neutral-500 tabular-nums">
                  ({count})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between mb-4 text-xs text-neutral-500">
        <span>
          {filtered.length} artikel
          {search && ` untuk "${search}"`}
        </span>
      </div>

      {/* GRID — 2 KOLOM MOBILE, 3 TABLET, 4 DESKTOP */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
            <Icons.Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Gak ada hasil</h3>
          <p className="text-sm text-neutral-500">
            Coba keyword lain atau hapus filter.
          </p>
          {(search || activeCategory !== null) && (
            <button
              onClick={() => {
                setSearch("");
                setActiveCategory(null);
              }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-4 py-2 text-xs font-medium hover:bg-neutral-900 transition"
            >
              <Icons.Close className="w-3 h-3" />
              Reset filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
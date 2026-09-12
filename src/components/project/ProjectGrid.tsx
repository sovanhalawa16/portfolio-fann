"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/lib/icons";
import { TECH_LIST, getTechLogo } from "@/lib/techStack";
import ProjectCard from "./ProjectCard";

type Project = {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail: string | null;
  tech_stack: string[];
  featured: boolean;
  year: number | null;
  views?: number | null;
  demo_url: string | null;
  repo_url: string | null;
};

type Props = {
  projects: Project[];
};

type SortKey = "newest" | "oldest" | "az" | "popular";

export default function ProjectGrid({ projects }: Props) {
  const [search, setSearch] = useState("");
  const [activeTech, setActiveTech] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Unique tech
  const allTechs = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => (p.tech_stack || []).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [projects]);

  const filtered = useMemo(() => {
    let result = [...projects];

    if (activeTech) {
      result = result.filter((p) => (p.tech_stack || []).includes(activeTech));
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          (p.short_description?.toLowerCase() || "").includes(q) ||
          (p.tech_stack || []).some((t) => t.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      if (sort === "newest") return (b.year || 0) - (a.year || 0);
      if (sort === "oldest") return (a.year || 0) - (b.year || 0);
      if (sort === "popular") return (b.views || 0) - (a.views || 0);
      if (sort === "az") return a.title.localeCompare(b.title);
      return 0;
    });

    // Featured first
    return result.sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [projects, search, activeTech, sort]);

  const activeFilterCount = [activeTech].filter(Boolean).length;

  const sortLabels: Record<SortKey, string> = {
    newest: "Terbaru",
    oldest: "Terlama",
    popular: "Populer",
    az: "A-Z",
  };

  const sortCycle: Record<SortKey, SortKey> = {
    newest: "popular",
    popular: "oldest",
    oldest: "az",
    az: "newest",
  };

  return (
    <>
      {/* TOOLBAR ROW */}
      <div className="flex items-center gap-2 mb-5">
        {/* SEARCH */}
        <div className="relative flex-1 min-w-0">
          <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari project..."
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

        {/* FILTER TOGGLE */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`shrink-0 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
            filtersOpen || activeFilterCount > 0
              ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
              : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900 hover:text-white"
          }`}
        >
          <Icons.Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Filter</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center h-4 min-w-[16px] rounded-full bg-violet-500 text-white text-[10px] font-bold px-1">
              {activeFilterCount}
            </span>
          )}
          <Icons.ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              filtersOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* SORT CYCLE BUTTON */}
        <button
          onClick={() => setSort(sortCycle[sort])}
          className="shrink-0 inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 px-4 py-2.5 text-sm font-medium transition"
          title={`Sort: ${sortLabels[sort]}`}
        >
          <Icons.ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
          <span className="hidden md:inline">{sortLabels[sort]}</span>
        </button>
      </div>

      {/* FILTER PANEL — COLLAPSIBLE */}
      <div
        className="overflow-hidden"
        style={{
          maxHeight: filtersOpen ? "500px" : "0",
          transition: "max-height 400ms cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="mb-5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icons.Code2 className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Filter by Tech
              </span>
            </div>
            {activeTech && (
              <button
                onClick={() => setActiveTech(null)}
                className="inline-flex items-center gap-1 text-[11px] text-neutral-500 hover:text-white transition"
              >
                <Icons.Close className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* ALL */}
            <button
              onClick={() => setActiveTech(null)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                activeTech === null
                  ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                  : "border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              <Icons.LayoutGrid className="w-3 h-3" />
              Semua
              <span className="text-[10px] text-neutral-500 tabular-nums">
                ({projects.length})
              </span>
            </button>

            {allTechs.map((tech) => {
              const count = projects.filter((p) =>
                (p.tech_stack || []).includes(tech)
              ).length;
              const t = TECH_LIST.find((x) => x.name === tech);
              const isActive = activeTech === tech;

              return (
                <button
                  key={tech}
                  onClick={() => setActiveTech(tech)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                      : "border border-neutral-800 bg-neutral-950 text-neutral-400 hover:bg-neutral-900 hover:text-white"
                  }`}
                >
                  {t && (
                    <img
                      src={getTechLogo(t.slug, t.color)}
                      alt=""
                      className="w-3 h-3 shrink-0"
                      loading="lazy"
                    />
                  )}
                  {tech}
                  <span className="text-[10px] text-neutral-500 tabular-nums">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RESULT COUNT */}
      <div className="flex items-center justify-between mb-4 text-xs text-neutral-500">
        <span>
          {filtered.length} project
          {search && ` untuk "${search}"`}
          {activeTech && ` · ${activeTech}`}
        </span>
      </div>

      {/* GRID */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-12 md:p-16 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
            <Icons.Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold mb-1.5">Gak ada hasil</h3>
          <p className="text-sm text-neutral-500">
            Coba keyword lain atau hapus filter.
          </p>
          {(search || activeTech) && (
            <button
              onClick={() => {
                setSearch("");
                setActiveTech(null);
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
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
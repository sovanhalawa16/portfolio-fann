"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Project = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  thumbnail: string;
  tech_stack: string[];
  status: string;
  featured: boolean;
  year: number;
  created_at: string;
};

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("portfolio")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching portfolio:", error);
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, [filterStatus]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Yakin mau hapus project "${title}"?`)) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("portfolio").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setProjects(projects.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    published: "bg-green-500/10 text-green-400 border-green-500/20",
    draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    archived: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-neutral-400 mt-1">
            Kelola semua project portfolio lo.
          </p>
        </div>
        <Link
          href="/admin/portfolio/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition self-start"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tambah Project
        </Link>
      </div>

      {/* SEARCH & FILTER */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Cari project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        <div className="flex gap-2">
          {["all", "published", "draft", "archived"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition capitalize ${
                filterStatus === status
                  ? "border-violet-500 bg-violet-500/10 text-violet-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-900"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-16 text-center text-neutral-500">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm">Loading...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-16 text-center">
          <div className="text-5xl mb-4">💼</div>
          <h3 className="text-lg font-semibold mb-2">
            {search ? "Project gak ketemu" : "Belum ada project"}
          </h3>
          <p className="text-sm text-neutral-400 mb-6">
            {search
              ? "Coba keyword lain atau reset filter."
              : "Tambah project pertama lo sekarang!"}
          </p>
          {!search && (
            <Link
              href="/admin/portfolio/new"
              className="inline-block rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
            >
              + Tambah Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 transition"
            >
              {/* THUMBNAIL */}
              <div className="aspect-video bg-neutral-900 relative overflow-hidden">
                {project.thumbnail ? (
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-700 text-4xl">
                    💼
                  </div>
                )}
                {project.featured && (
                  <div className="absolute top-3 right-3 rounded-full bg-yellow-500 text-neutral-950 px-2.5 py-1 text-xs font-bold">
                    ⭐ Featured
                  </div>
                )}
              </div>

              {/* INFO */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold truncate">{project.title}</h3>
                  <span
                    className={`shrink-0 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize ${
                      statusColors[project.status] || statusColors.draft
                    }`}
                  >
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-neutral-400 line-clamp-2 mb-3 min-h-[2rem]">
                  {project.short_description || "Belum ada deskripsi"}
                </p>

                {/* TECH STACK */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tech_stack.slice(0, 3).map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.tech_stack.length > 3 && (
                      <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-400">
                        +{project.tech_stack.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/60">
                  <span className="text-xs text-neutral-500">
                    {project.year || "—"}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/admin/portfolio/${project.id}/edit`}
                      className="rounded-lg p-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                      title="Edit"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      disabled={deletingId === project.id}
                      className="rounded-lg p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === project.id ? (
                        <div className="h-3.5 w-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredProjects.length > 0 && (
        <p className="text-xs text-neutral-500 text-center">
          Menampilkan {filteredProjects.length} project
        </p>
      )}
    </div>
  );
}
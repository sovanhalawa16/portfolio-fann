"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Post = {
  id: number;
  title: string;
  slug: string;
  status: string;
  views: number;
  created_at: string;
  categories: { name: string } | null;
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("posts")
      .select("id, title, slug, status, views, created_at, categories(name)")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } else {
      setPosts((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, [filterStatus]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Yakin mau hapus artikel "${title}"?`)) return;

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("posts").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setPosts(posts.filter((p) => p.id !== id));
    }
    setDeletingId(null);
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    published: "bg-green-500/10 text-green-400 border-green-500/20",
    draft: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-neutral-400 mt-1">
            Kelola semua artikel blog lo di sini.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition self-start"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Tulis Artikel Baru
        </Link>
      </div>

      {/* FILTER & SEARCH */}
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
            placeholder="Cari artikel..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        <div className="flex gap-2">
          {["all", "published", "draft", "scheduled"].map((status) => (
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

      {/* TABLE */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
            <p className="mt-4 text-sm">Loading...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-lg font-semibold mb-2">
              {search ? "Artikel gak ketemu" : "Belum ada artikel"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              {search
                ? "Coba keyword lain atau reset filter."
                : "Mulai tulis artikel pertama lo sekarang!"}
            </p>
            {!search && (
              <Link
                href="/admin/posts/new"
                className="inline-block rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                + Tulis Artikel
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800 text-left">
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Judul
                </th>
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Kategori
                </th>
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden md:table-cell">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider hidden lg:table-cell">
                  Views
                </th>
                <th className="px-6 py-4 text-xs font-medium text-neutral-500 uppercase tracking-wider text-right">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr
                  key={post.id}
                  className="border-b border-neutral-800/60 hover:bg-neutral-900/40 transition"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium">{post.title}</div>
                    <div className="text-xs text-neutral-500 mt-1">
                      /{post.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
                        statusColors[post.status] || statusColors.draft
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400 hidden md:table-cell">
                    {post.categories?.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400 hidden md:table-cell">
                    {new Date(post.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-400 hidden lg:table-cell">
                    {post.views || 0}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="rounded-lg p-2 text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
                        title="Lihat"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </Link>
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg p-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                        title="Edit"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        disabled={deletingId === post.id}
                        className="rounded-lg p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === post.id ? (
                          <div className="h-4 w-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6M10 11v6M14 11v6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* COUNT */}
      {!loading && filteredPosts.length > 0 && (
        <p className="text-xs text-neutral-500 text-center">
          Menampilkan {filteredPosts.length} artikel
        </p>
      )}
    </div>
  );
}
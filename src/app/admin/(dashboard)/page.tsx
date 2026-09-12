"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Stats = {
  posts: number;
  portfolio: number;
  messages: number;
  unread: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ posts: 0, portfolio: 0, messages: 0, unread: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [postsRes, portfolioRes, messagesRes, unreadRes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase.from("portfolio").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }),
        supabase.from("messages").select("*", { count: "exact", head: true }).eq("status", "unread"),
      ]);

      setStats({
        posts: postsRes.count || 0,
        portfolio: portfolioRes.count || 0,
        messages: messagesRes.count || 0,
        unread: unreadRes.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Total Posts", value: stats.posts, icon: "📝", href: "/admin/posts", color: "from-violet-500 to-purple-500" },
    { label: "Portfolio", value: stats.portfolio, icon: "💼", href: "/admin/portfolio", color: "from-blue-500 to-cyan-500" },
    { label: "Messages", value: stats.messages, icon: "✉️", href: "/admin/messages", color: "from-green-500 to-emerald-500" },
    { label: "Unread", value: stats.unread, icon: "🔔", href: "/admin/messages", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* WELCOME */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-neutral-400 mt-1">
          Selamat datang kembali! Ini ringkasan konten lo hari ini.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group relative rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 hover:border-neutral-700 transition-all overflow-hidden"
          >
            <div className={`absolute top-0 right-0 h-24 w-24 rounded-full bg-gradient-to-br ${card.color} opacity-10 blur-2xl group-hover:opacity-20 transition`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl">{card.icon}</span>
              </div>
              <div className="text-3xl font-bold">
                {loading ? "—" : card.value}
              </div>
              <div className="text-sm text-neutral-400 mt-1">{card.label}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* QUICK ACTIONS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-medium hover:bg-neutral-200 transition"
          >
            + Tulis Artikel Baru
          </Link>
          <Link
            href="/admin/portfolio/new"
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 transition"
          >
            + Tambah Project
          </Link>
          <Link
            href="/admin/profile"
            className="rounded-lg border border-neutral-800 px-4 py-2 text-sm font-medium hover:bg-neutral-900 transition"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* INFO PANEL */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">🚀 Tips Cepat</h2>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex gap-3">
              <span className="text-violet-400">→</span>
              <span>Klik <b className="text-white">Posts</b> di sidebar buat kelola artikel blog.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-400">→</span>
              <span>Buat draft dulu, publish nanti kalau udah siap.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-violet-400">→</span>
              <span>Upload gambar lewat Media Library biar rapi.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
          <h2 className="text-lg font-semibold mb-4">📌 Yang Perlu Dibikin</h2>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex gap-3">
              <span className="text-yellow-400">●</span>
              <span>Halaman Posts CRUD</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">●</span>
              <span>Halaman Portfolio CRUD</span>
            </li>
            <li className="flex gap-3">
              <span className="text-yellow-400">●</span>
              <span>Media Library & Settings</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
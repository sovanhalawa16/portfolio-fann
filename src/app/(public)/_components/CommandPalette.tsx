"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Item = {
  id: string;
  label: string;
  sublabel?: string;
  category: "Pages" | "Posts" | "Projects";
  href: string;
  icon: React.ReactNode;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const Icons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
    </svg>
  ),
  Blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  Projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  About: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  Post: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8M16 17H8" />
    </svg>
  ),
  Project: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <path d="M14 3h7v7M21 3l-9 9" />
    </svg>
  ),
  Search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  ),
  Enter: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
      <path d="M9 10L4 15l5 5" />
      <path d="M20 4v7a4 4 0 01-4 4H4" />
    </svg>
  ),
};

const PAGE_ITEMS: Item[] = [
  { id: "p-home", label: "Home", category: "Pages", href: "/", icon: Icons.Home },
  { id: "p-blog", label: "Blog", category: "Pages", href: "/blog", icon: Icons.Blog },
  { id: "p-projects", label: "Projects", category: "Pages", href: "/projects", icon: Icons.Projects },
  { id: "p-about", label: "About", category: "Pages", href: "/about", icon: Icons.About },
  { id: "p-contact", label: "Contact", category: "Pages", href: "/contact", icon: Icons.Contact },
];

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const [dynamicItems, setDynamicItems] = useState<Item[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch posts + projects sekali (cache selama sesi)
  useEffect(() => {
    if (!open || dynamicItems.length > 0) return;

    const fetchData = async () => {
      setLoading(true);
      const supabase = createClient();
      const [postsRes, projectsRes] = await Promise.all([
        supabase
          .from("posts")
          .select("title, slug, excerpt")
          .eq("status", "published")
          .order("published_at", { ascending: false })
          .limit(50),
        supabase
          .from("portfolio")
          .select("title, slug, short_description")
          .eq("status", "published")
          .limit(50),
      ]);

      const posts: Item[] = (postsRes.data || []).map((p) => ({
        id: `post-${p.slug}`,
        label: p.title,
        sublabel: p.excerpt,
        category: "Posts",
        href: `/blog/${p.slug}`,
        icon: Icons.Post,
      }));

      const projects: Item[] = (projectsRes.data || []).map((p) => ({
        id: `proj-${p.slug}`,
        label: p.title,
        sublabel: p.short_description,
        category: "Projects",
        href: `/projects/${p.slug}`,
        icon: Icons.Project,
      }));

      setDynamicItems([...posts, ...projects]);
      setLoading(false);
    };
    fetchData();
  }, [open, dynamicItems.length]);

  const allItems = [...PAGE_ITEMS, ...dynamicItems];

  const filtered = query.trim()
    ? allItems.filter(
        (i) =>
          i.label.toLowerCase().includes(query.toLowerCase()) ||
          (i.sublabel?.toLowerCase() || "").includes(query.toLowerCase())
      )
    : allItems;

  // Group by category
  const grouped = filtered.reduce<Record<string, Item[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  // Flat list untuk keyboard nav (dalam urutan yang sama dengan render)
  const flatList: Item[] = [];
  (["Pages", "Posts", "Projects"] as const).forEach((cat) => {
    if (grouped[cat]) flatList.push(...grouped[cat]);
  });

  // Focus input saat open
  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Reset index saat query berubah
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard nav
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, flatList.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = flatList[selectedIndex];
        if (item) {
          router.push(item.href);
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, flatList, selectedIndex, onClose, router]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-index="${selectedIndex}"]`
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" />

      {/* MODAL */}
      <div
        className="relative w-full max-w-xl rounded-2xl border border-neutral-800 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* INPUT */}
        <div className="flex items-center gap-3 border-b border-neutral-800/60 px-4 py-3.5">
          <span className="text-neutral-500">{Icons.Search}</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari halaman, artikel, atau project..."
            className="flex-1 bg-transparent text-sm text-white placeholder:text-neutral-600 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center rounded border border-neutral-800 bg-neutral-900 px-1.5 py-0.5 text-[10px] text-neutral-500 font-mono">
            ESC
          </kbd>
        </div>

        {/* RESULTS */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {loading ? (
            <div className="py-12 text-center">
              <div className="inline-block h-5 w-5 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
              <p className="mt-3 text-xs text-neutral-500">Memuat...</p>
            </div>
          ) : flatList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-sm text-neutral-400">
                Gak ada hasil untuk{" "}
                <span className="text-white font-medium">"{query}"</span>
              </p>
              <p className="text-xs text-neutral-600 mt-1">
                Coba keyword lain
              </p>
            </div>
          ) : (
            (["Pages", "Posts", "Projects"] as const).map((cat) => {
              if (!grouped[cat] || grouped[cat].length === 0) return null;
              return (
                <div key={cat} className="mb-2">
                  <div className="px-4 py-1.5 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                    {cat}
                  </div>
                  {grouped[cat].map((item) => {
                    runningIndex++;
                    const currentIndex = runningIndex;
                    const isSelected = currentIndex === selectedIndex;
                    return (
                      <button
                        key={item.id}
                        data-index={currentIndex}
                        onClick={() => {
                          router.push(item.href);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition ${
                          isSelected
                            ? "bg-violet-500/10 text-white"
                            : "text-neutral-300 hover:bg-neutral-900/60"
                        }`}
                      >
                        <span
                          className={`shrink-0 rounded-lg p-1.5 border ${
                            isSelected
                              ? "border-violet-500/30 bg-violet-500/10 text-violet-300"
                              : "border-neutral-800 text-neutral-500"
                          }`}
                        >
                          {item.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium truncate">
                            {item.label}
                          </div>
                          {item.sublabel && (
                            <div className="text-xs text-neutral-500 truncate mt-0.5">
                              {item.sublabel}
                            </div>
                          )}
                        </div>
                        {isSelected && (
                          <span className="shrink-0 text-violet-400">
                            {Icons.Enter}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-2 border-t border-neutral-800/60 px-4 py-2.5 text-[10px] text-neutral-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 font-mono">
                ↑↓
              </kbd>
              <span>Navigasi</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 font-mono">
                ↵
              </kbd>
              <span>Buka</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 font-mono">
                ESC
              </kbd>
              <span>Tutup</span>
            </div>
          </div>
          <div className="hidden sm:block text-neutral-700">
            {flatList.length} hasil
          </div>
        </div>
      </div>
    </div>
  );
}
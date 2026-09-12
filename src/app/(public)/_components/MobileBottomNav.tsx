"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Props = {
  onProfileClick: () => void;
};

const Icons = {
  Home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M3 12l9-9 9 9" />
      <path d="M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
    </svg>
  ),
  Blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  ),
  Projects: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  About: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ChevronUp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M18 15l-6-6-6 6" />
    </svg>
  ),
  ChevronDown: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M6 9l6 6 6-6" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Icons.Home },
  { label: "Blog", href: "/blog", icon: Icons.Blog },
  { label: "Projects", href: "/projects", icon: Icons.Projects },
  { label: "About", href: "/about", icon: Icons.About },
];

export default function MobileBottomNav({ onProfileClick }: Props) {
  const currentPath = usePathname();
  const [pathname, setPathname] = useState("");
  const [expanded, setExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarInitial, setAvatarInitial] = useState("F");
  const [status, setStatus] = useState<"online" | "offline" | "busy" | "away">("online");

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("mobile-nav-expanded");
    if (saved === "false") setExpanded(false);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("mobile-nav-expanded", expanded.toString());
    }
  }, [expanded, mounted]);

  useEffect(() => {
    setPathname(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profile")
        .select("name, photo")
        .limit(1)
        .maybeSingle();

      if (data) {
        setAvatarUrl(data.photo || "");
        setAvatarInitial((data.name || "F").charAt(0).toUpperCase());
      }

      const { data: statusData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "online_status")
        .maybeSingle();

      if (statusData?.value) {
        const v = statusData.value as any;
        if (["online", "busy", "away", "offline"].includes(v)) setStatus(v);
      } else {
        const hour = new Date().getHours();
        setStatus(hour >= 6 && hour < 22 ? "online" : "offline");
      }
    };
    fetchData();
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const statusColors = {
    online: "bg-green-500",
    busy: "bg-red-500",
    away: "bg-yellow-500",
    offline: "bg-neutral-500",
  };

  if (!mounted) {
    return (
      <nav className="lg:hidden fixed bottom-4 left-0 right-0 z-30 pointer-events-none px-4">
        <div className="mx-auto max-w-md pointer-events-auto">
          <div className="h-14 rounded-full border border-neutral-800/80 bg-neutral-950/95" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="lg:hidden fixed bottom-4 left-0 right-0 z-30 pointer-events-none px-4">
      <div
        className={`mx-auto relative pointer-events-auto transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          expanded ? "max-w-md" : "max-w-[240px]"
        }`}
      >
        {/* ===== CHEVRON TAB (floating di atas pill) ===== */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute left-1/2 -translate-x-1/2 -top-3 z-20 h-6 px-3 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-violet-400 hover:border-violet-500/40 hover:bg-neutral-800 transition-all duration-200 shadow-lg shadow-black/40 group"
          aria-label={expanded ? "Kecilkan navigasi" : "Perbesar navigasi"}
        >
          <span className="transition-transform duration-300 group-hover:scale-110">
            {expanded ? Icons.ChevronDown : Icons.ChevronUp}
          </span>
        </button>

        {/* ===== MAIN PILL ===== */}
        <div
          className={`rounded-full border border-neutral-800/80 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 transition-all duration-500 ${
            expanded ? "h-14 px-2" : "h-12 px-1.5"
          }`}
        >
          <div
            className={`h-full flex items-center justify-around transition-all duration-300 ${
              expanded ? "gap-0.5" : "gap-0"
            }`}
          >
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center justify-center transition-all duration-300 group ${
                    expanded
                      ? "flex-col gap-0 rounded-full px-3.5 py-1.5 min-w-[52px]"
                      : "rounded-full p-2.5 min-w-[42px]"
                  } ${
                    active
                      ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 text-violet-300 shadow-inner"
                      : "text-neutral-500 hover:text-white active:scale-95"
                  }`}
                >
                  {item.icon}
                  {expanded && (
                    <span
                      className={`text-[10px] font-semibold transition-all duration-200 leading-none mt-0.5 ${
                        active ? "text-violet-300" : "text-neutral-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* ===== AVATAR BUTTON ===== */}
            <button
              onClick={onProfileClick}
              className={`relative flex items-center justify-center transition-all duration-300 group ${
                expanded
                  ? "flex-col gap-0 rounded-full px-3.5 py-1.5 min-w-[52px]"
                  : "rounded-full p-2.5 min-w-[42px]"
              } text-neutral-500 hover:text-white active:scale-95`}
            >
              <div className="relative">
                <div
                  className={`rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white overflow-hidden ring-2 ring-transparent group-hover:ring-violet-500/30 transition-all ${
                    expanded ? "h-5 w-5 text-[9px]" : "h-4.5 w-4.5 text-[8px]"
                  }`}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-neutral-950 ${statusColors[status]} ${
                    expanded ? "h-2.5 w-2.5" : "h-2 w-2"
                  }`}
                />
              </div>
              {expanded && (
                <span className="text-[10px] font-semibold leading-none mt-0.5 text-neutral-500">
                  Profile
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
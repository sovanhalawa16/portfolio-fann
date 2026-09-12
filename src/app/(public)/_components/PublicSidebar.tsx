"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type ProfileData = {
  name: string;
  tagline: string;
  photo: string;
  email: string;
  social_links: Record<string, string>;
};

type Props = {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
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
      <path d="M16 13H8M16 17H8M10 9H8" />
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
  Contact: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  ),
  ChevronLeft: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  ChevronRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),
  Github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  Twitter: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  Linkedin: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  Youtube: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  Website: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
    </svg>
  ),
  ArrowRight: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  Award: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
),
};

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Icons.Home },
  { label: "Blog", href: "/blog", icon: Icons.Blog },
  { label: "Publications", href: "/publications", icon: Icons.Award },
  { label: "Projects", href: "/projects", icon: Icons.Projects },
  { label: "About", href: "/about", icon: Icons.About },
  { label: "Contact", href: "/contact", icon: Icons.Contact },
];

export default function PublicSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: Props) {
  const currentPath = usePathname();
  const [pathname, setPathname] = useState("");
  const [profile, setProfile] = useState<ProfileData>({
    name: "Fann",
    tagline: "Developer & Writer",
    photo: "",
    email: "",
    social_links: {},
  });
  const [onlineStatus, setOnlineStatus] = useState<"online" | "offline" | "busy" | "away">("online");
const [statusText, setStatusText] = useState<string>("Online");

  useEffect(() => {
    setPathname(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      const { data } = await supabase
        .from("profile")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (data) {
        const taglines = data.taglines || [];
        const firstTagline = Array.isArray(taglines) && taglines.length > 0
          ? taglines[0]
          : data.tagline || "Developer & Writer";

        setProfile({
          name: data.name || "Fann",
          tagline: firstTagline,
          photo: data.photo || "",
          email: data.email || "",
          social_links: data.social_links || {},
        });
      }

      const { data: statusRows } = await supabase
  .from("settings")
  .select("key, value")
  .in("key", ["online_status", "online_status_text"]);

const statusMap = (statusRows || []).reduce<Record<string, string>>(
  (acc, s) => ({ ...acc, [s.key]: s.value }),
  {}
);

const status = statusMap.online_status || "online";
if (["online", "busy", "away", "offline"].includes(status)) {
  setOnlineStatus(status as any);
}

const customText = statusMap.online_status_text?.trim();
if (customText) {
  setStatusText(customText);
} else {
  const defaultLabels: Record<string, string> = {
    online: "Online",
    busy: "Busy",
    away: "Away",
    offline: "Offline",
  };
  setStatusText(defaultLabels[status] || "Online");
}
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (mobileOpen) onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPath]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const statusConfig = {
    online: { color: "bg-green-500", text: "Online", textColor: "text-green-400" },
    busy: { color: "bg-red-500", text: "Busy", textColor: "text-red-400" },
    away: { color: "bg-yellow-500", text: "Away", textColor: "text-yellow-400" },
    offline: { color: "bg-neutral-500", text: "Offline", textColor: "text-neutral-400" },
  };

  const status = statusConfig[onlineStatus];
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* PROFILE HEADER */}
      <div className={`border-b border-neutral-800/60 transition-all duration-300 ${collapsed ? "p-4" : "p-6"}`}>
        <div className={`flex flex-col items-center text-center ${collapsed ? "gap-2" : "gap-3"}`}>
          <div className="relative">
            <div className={`rounded-full ring-2 ring-violet-500/30 overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-xl shadow-violet-500/20 transition-all duration-300 ${
              collapsed ? "h-11 w-11" : "h-20 w-20"
            }`}>
              {profile.photo ? (
                <img
                  src={profile.photo}
                  alt={profile.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white font-bold text-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span
              className={`absolute bottom-0.5 right-0.5 ${status.color} rounded-full ring-2 ring-neutral-950 ${
                collapsed ? "h-3 w-3" : "h-4 w-4"
              }`}
            >
              {onlineStatus === "online" && (
                <span className={`absolute inset-0 ${status.color} rounded-full animate-ping opacity-75`} />
              )}
            </span>
          </div>

          {!collapsed && (
  <>
    <div>
      <div className="font-bold text-base">{profile.name}</div>
      <div className="text-xs text-neutral-500 mt-0.5 truncate max-w-[220px]">
        {profile.tagline}
      </div>
    </div>

    <div
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 max-w-[220px] ${
        onlineStatus === "online"
          ? "border-green-500/20 bg-green-500/5"
          : onlineStatus === "busy"
          ? "border-red-500/20 bg-red-500/5"
          : onlineStatus === "away"
          ? "border-yellow-500/20 bg-yellow-500/5"
          : "border-neutral-800 bg-neutral-900/50"
      }`}
      title={statusText}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${status.color} shrink-0`} />
      <span className={`text-[10px] font-medium ${status.textColor} truncate`}>
        {statusText}
      </span>
    </div>
  </>
)}
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
            Menu
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-gradient-to-r from-violet-500/15 to-fuchsia-500/10 text-violet-200 border border-violet-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900/70 border border-transparent"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <span className={`shrink-0 transition-colors ${active ? "text-violet-300" : "text-neutral-500 group-hover:text-neutral-300"}`}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="truncate font-medium">{item.label}</span>
              )}
              {!collapsed && active && (
                <span className="ml-auto text-violet-400">
                  {Icons.ArrowRight}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={`hidden lg:flex fixed left-0 top-0 bottom-0 z-40 flex-col border-r border-neutral-800/60 bg-neutral-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out ${
          collapsed ? "w-[88px]" : "w-[300px]"
        }`}
      >
        {sidebarContent}

        {/* ✅ FLOATING CHEVRON TOGGLE */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-white hover:border-violet-500/50 hover:bg-neutral-800 transition shadow-lg z-50"
          title={collapsed ? "Tampilkan sidebar" : "Sembunyikan sidebar"}
        >
          {collapsed ? Icons.ChevronRight : Icons.ChevronLeft}
        </button>
      </aside>

      {/* ===== MOBILE DRAWER ===== */}
      <>
        <div
          onClick={onCloseMobile}
          className={`lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        />

        <aside
          className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[300px] flex flex-col border-r border-neutral-800/60 bg-neutral-950 shadow-2xl transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button
            onClick={onCloseMobile}
            className="absolute top-4 right-4 rounded-lg p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 transition z-10"
            aria-label="Tutup menu"
          >
            {Icons.Close}
          </button>

          {sidebarContent}
        </aside>
      </>
    </>
  );
}
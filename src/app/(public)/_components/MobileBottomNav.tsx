"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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
  Publications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
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
  Chat: (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
  </svg>
),
};

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Icons.Home },
  { label: "Blog", href: "/blog", icon: Icons.Blog },
  { label: "Projects", href: "/projects", icon: Icons.Projects },
  { label: "Publications", href: "/publications", shortLabel: "Pub", icon: Icons.Publications },
  { label: "Chat", href: "/chat", shortLabel: "Chat", icon: Icons.Chat },
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
  const [hidden, setHidden] = useState(false);

  // Refs buat scroll tracking (biar gak re-render tiap pixel)
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Load saved preference
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

  // Fetch avatar + status
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

  // ===== AUTO-HIDE ON SCROLL =====
  useEffect(() => {
    const SCROLL_THRESHOLD = 6; // px — minimun delta biar trigger
    const TOP_THRESHOLD = 80; // kalo deket atas, selalu show

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const diff = currentY - lastScrollY.current;

        // Selalu show kalo deket atas
        if (currentY < TOP_THRESHOLD) {
          setHidden(false);
          lastScrollY.current = currentY;
          ticking.current = false;
          return;
        }

        // Scroll DOWN — sembunyiin
        if (diff > SCROLL_THRESHOLD) {
          setHidden(true);
        }
        // Scroll UP — munculin
        else if (diff < -SCROLL_THRESHOLD) {
          setHidden(false);
        }

        lastScrollY.current = currentY;
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    // Hide di halaman chat
  const isChatPage = pathname.startsWith("/chat");
  if (isChatPage) return null;
  
  if (!mounted) {
    return (
      <nav className="lg:hidden fixed bottom-4 left-0 right-0 z-30 pointer-events-none px-3">
        <div className="mx-auto max-w-md pointer-events-auto">
          <div className="h-14 rounded-full border border-neutral-800/80 bg-neutral-950/95" />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="lg:hidden fixed bottom-4 left-0 right-0 z-30 pointer-events-none px-3"
      style={{
        transform: hidden
          ? "translate3d(0, 140%, 0)"
          : "translate3d(0, 0, 0)",
        transition: "transform 350ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "transform",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
      }}
    >
      <div
        className={`mx-auto relative pointer-events-auto ${
          expanded ? "max-w-md" : "max-w-[260px]"
        }`}
        style={{
          transition:
            "max-width 550ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease-out",
          willChange: "max-width",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {/* CHEVRON TAB */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="absolute left-1/2 z-20 h-6 px-3 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-violet-400 hover:border-violet-500/40 hover:bg-neutral-800 shadow-lg shadow-black/40 group"
          style={{
            top: "-12px",
            transform: "translate3d(-50%, 0, 0)",
            transition:
              "color 200ms ease, border-color 200ms ease, background-color 200ms ease",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
          aria-label={expanded ? "Kecilkan navigasi" : "Perbesar navigasi"}
        >
          <span
            className="transition-transform duration-300 group-hover:scale-110"
            style={{ transform: "translateZ(0)" }}
          >
            {expanded ? Icons.ChevronDown : Icons.ChevronUp}
          </span>
        </button>

        {/* MAIN PILL */}
        <div
          className={`rounded-full border border-neutral-800/80 bg-neutral-950/95 backdrop-blur-2xl shadow-2xl shadow-black/60 ${
            expanded ? "h-14 px-1.5" : "h-12 px-1.5"
          }`}
          style={{
            transition:
              "height 550ms cubic-bezier(0.22, 1, 0.36, 1), padding 550ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "height, padding",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
          }}
        >
          <div className="h-full flex items-center justify-around">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const displayLabel = (item as any).shortLabel || item.label;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`relative flex items-center justify-center group ${
                    expanded
                      ? "flex-col gap-0 rounded-full px-2 py-1 min-w-[44px]"
                      : "rounded-full p-2.5 min-w-[40px]"
                  } ${
                    active
                      ? "bg-gradient-to-br from-violet-500/20 to-fuchsia-500/15 text-violet-300 shadow-inner"
                      : "text-neutral-500 hover:text-white"
                  }`}
                  style={{
                    transition:
                      "background-color 300ms cubic-bezier(0.22, 1, 0.36, 1), color 250ms ease, transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "transform, background-color",
                    transform: "translateZ(0)",
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <span
                    className="shrink-0"
                    style={{ transform: "translateZ(0)" }}
                  >
                    {item.icon}
                  </span>

                  {expanded && (
                    <span
                      className={`text-[9px] font-semibold leading-none mt-0.5 whitespace-nowrap ${
                        active ? "text-violet-300" : "text-neutral-500"
                      }`}
                      style={{
                        transition: "opacity 250ms ease-out, color 250ms ease",
                        willChange: "opacity",
                      }}
                    >
                      {displayLabel}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* AVATAR BUTTON */}
            <button
              onClick={onProfileClick}
              className={`relative flex items-center justify-center group text-neutral-500 hover:text-white ${
                expanded
                  ? "flex-col gap-0 rounded-full px-2 py-1 min-w-[44px]"
                  : "rounded-full p-2.5 min-w-[40px]"
              }`}
              style={{
                transition:
                  "color 250ms ease, transform 150ms cubic-bezier(0.22, 1, 0.36, 1)",
                willChange: "transform",
                transform: "translateZ(0)",
                backfaceVisibility: "hidden",
              }}
            >
              <div
                className="relative"
                style={{ transform: "translateZ(0)" }}
              >
                <div
                  className={`rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold text-white overflow-hidden ring-2 ring-transparent group-hover:ring-violet-500/30 ${
                    expanded ? "h-5 w-5 text-[9px]" : "h-4.5 w-4.5 text-[8px]"
                  }`}
                  style={{
                    transition:
                      "width 350ms cubic-bezier(0.22, 1, 0.36, 1), height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
                    willChange: "width, height",
                  }}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      style={{ transform: "translateZ(0)" }}
                    />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-neutral-950 ${
                    statusColors[status]
                  } ${expanded ? "h-2.5 w-2.5" : "h-2 w-2"}`}
                  style={{
                    transition:
                      "width 350ms cubic-bezier(0.22, 1, 0.36, 1), height 350ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </div>

              {expanded && (
                <span
                  className="text-[9px] font-semibold leading-none mt-0.5 text-neutral-500"
                  style={{
                    transition: "opacity 250ms ease-out",
                    willChange: "opacity",
                  }}
                >
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
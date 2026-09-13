"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import TypingText from "@/components/TypingText";

type Props = {
  onSearchOpen: () => void;
};

const TYPING_PHRASES = [
  "Halo, selamat datang 👋",
  "Welcome to my space ✨",
  "Full-stack Developer 💻",
  "Writer & Storyteller ✍️",
  "Coffee-powered coding ☕",
  "Let's build something 🚀",
];

export default function UtilityBar({ onSearchOpen }: Props) {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: seg
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }));

  const isTopLevel = crumbs.length < 2;

  // Hide command palette hints di halaman chat
  const isChatPage = pathname.startsWith("/chat");

  return (
    <div className="sticky top-0 z-20">
      <div className="h-12 border-b border-neutral-800/60 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between gap-3 px-4 lg:px-6">
        {/* LEFT: Typing Text / Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs min-w-0 flex-1 overflow-hidden">
          {isTopLevel ? (
            <div className="flex items-center gap-2 min-w-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-400" />
              </span>
              <TypingText
                phrases={TYPING_PHRASES}
                className="text-neutral-300 font-mono text-xs truncate"
              />
            </div>
          ) : (
            crumbs.map((crumb, i) => {
              const shouldHideOnMobile =
                crumbs.length > 2 && i < crumbs.length - 2;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 min-w-0 ${
                    shouldHideOnMobile ? "hidden sm:flex" : ""
                  }`}
                >
                  {i > 0 && (
                    <span className="text-neutral-700 shrink-0">/</span>
                  )}
                  {crumb.isLast ? (
                    <span className="text-neutral-300 font-medium truncate">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-neutral-500 hover:text-white transition shrink-0"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* RIGHT: SEARCH (hidden di halaman chat) */}
        {!isChatPage && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onSearchOpen}
              className="group flex items-center gap-2 rounded-lg border border-neutral-800/80 bg-neutral-900/40 hover:bg-neutral-900 hover:border-neutral-700 px-2.5 sm:px-3 py-1.5 text-xs transition"
              aria-label="Buka pencarian"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-300"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <span className="text-neutral-500 group-hover:text-neutral-300 hidden xl:inline">
                Search
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
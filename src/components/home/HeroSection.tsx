"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icons } from "@/lib/icons";
import LiveVisitor from "@/components/LiveVisitor";
import HeroMedia from "./HeroMedia";
import type { Profile } from "@/lib/types";
import type React from "react";

type Props = {
  profile: Profile;
  media: { id: number; type: "image" | "video"; url: string; caption: string | null }[];
};

const SOCIAL_MAP: Record<
  string,
  { label: string; Icon: (p: any) => React.ReactElement }
> = {
  github: { label: "GitHub", Icon: Icons.Github },
  twitter: { label: "Twitter", Icon: Icons.Twitter },
  linkedin: { label: "LinkedIn", Icon: Icons.Linkedin },
  instagram: { label: "Instagram", Icon: Icons.Instagram },
  youtube: { label: "YouTube", Icon: Icons.Youtube },
  website: { label: "Website", Icon: Icons.Globe },
};

export default function HeroSection({ profile, media }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const socials = Object.entries(profile?.social_links || {})
    .filter(([key, url]) => url && url.trim() && SOCIAL_MAP[key])
    .map(([key, url]) => ({
      key,
      url,
      ...SOCIAL_MAP[key],
    }));

  return (
    <section className="relative overflow-hidden isolate">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/15 via-neutral-950 to-neutral-950" />

      <div className="pointer-events-none absolute top-20 left-0 w-64 h-64 rounded-full bg-violet-600/10 blur-3xl -translate-x-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-64 h-64 rounded-full bg-fuchsia-600/10 blur-3xl translate-x-1/2" />

      <div className="relative mx-auto max-w-6xl px-6 lg:px-8 pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
        <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          {/* LEFT */}
          <div className="order-2 lg:order-1 min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur px-3 py-1.5 text-xs text-neutral-400 mb-5">
              <Icons.Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate">Available for collaboration</span>
              <span className="w-px h-3 bg-neutral-700 mx-0.5 shrink-0" />
              <LiveVisitor showLabel={false} className="text-xs shrink-0" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-5 leading-[1.15] max-w-xl">
              Halo, saya{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradient_3s_ease_infinite]">
                {profile?.name || "Fann"}
              </span>
              .
            </h1>

            {profile?.bio && (
  <p className="text-xs sm:text-sm md:text-base text-neutral-400 max-w-lg leading-relaxed mb-7">
    {profile.bio}
  </p>
)}

            {/* CTA */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/projects"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 px-5 md:px-6 py-2.5 md:py-3 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                <Icons.Code2 className="w-4 h-4" />
                Lihat Projects
                <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 md:px-6 py-2.5 md:py-3 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
              >
                <Icons.BookOpen className="w-4 h-4" />
                Baca Blog
              </Link>
            </div>

            {/* ✅ SOCIAL ICONS — cuma icon, di bawah CTA */}
            {mounted && socials.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-600 mr-1">Connect:</span>
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-full border border-neutral-800 bg-neutral-900/40 flex items-center justify-center text-neutral-500 hover:text-white hover:border-violet-500/50 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all"
                  >
                    <s.Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: MEDIA */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end relative min-w-0 max-w-full">
            <HeroMedia
              media={media}
              fallbackInitial={profile?.name?.charAt(0)?.toUpperCase() || "F"}
            />

            {/* FLOATING BADGE — LOCATION (masih ada) */}
            {mounted && profile?.location && (
              <div className="absolute -top-2 right-2 md:right-0 rounded-xl md:rounded-2xl border border-neutral-800 bg-neutral-900/95 backdrop-blur px-3 py-1.5 md:px-3.5 md:py-2 shadow-xl z-20 max-w-[150px]">
                <div className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs">
                  <Icons.MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-violet-400 shrink-0" />
                  <span className="font-medium truncate">{profile.location}</span>
                </div>
              </div>
            )}

            {/* ✅ BADGE AVAILABLE — DIHAPUS (sesuai request) */}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% center; }
          50% { background-position: 100% center; }
        }
      `}</style>
    </section>
  );
}
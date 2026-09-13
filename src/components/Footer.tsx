"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";
import VisitorCountries from "./VisitorCountries";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "Publications", href: "/publications" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL_MAP: Record<
  string,
  { label: string; Icon: (p: any) => JSX.Element }
> = {
  github: { label: "GitHub", Icon: Icons.Github },
  twitter: { label: "Twitter", Icon: Icons.Twitter },
  linkedin: { label: "LinkedIn", Icon: Icons.Linkedin },
  instagram: { label: "Instagram", Icon: Icons.Instagram },
  youtube: { label: "YouTube", Icon: Icons.Youtube },
  website: { label: "Website", Icon: Icons.Globe },
};

type FooterData = {
  authorName: string;
  socialLinks: Record<string, string>;
};

export default function Footer() {
  const [data, setData] = useState<FooterData>({
    authorName: "",
    socialLinks: {},
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchData = async () => {
      const supabase = createClient();

      const [settingsRes, profileRes] = await Promise.all([
        supabase
          .from("settings")
          .select("key, value")
          .eq("key", "author_name")
          .maybeSingle(),
        supabase
          .from("profile")
          .select("name, social_links")
          .limit(1)
          .maybeSingle(),
      ]);

      setData({
        authorName:
          profileRes.data?.name ||
          settingsRes.data?.value ||
          "Sovantri Putra Paskah Halawa",
        socialLinks: profileRes.data?.social_links || {},
      });
    };
    fetchData();
  }, []);

  const socials = Object.entries(data.socialLinks || {})
    .filter(([key, url]) => url && (url as string).trim() && SOCIAL_MAP[key])
    .map(([key, url]) => ({
      key,
      url: url as string,
      ...SOCIAL_MAP[key],
    }));

  const year = new Date().getFullYear();
  const authorName =
    mounted && data.authorName
      ? data.authorName.toUpperCase()
      : "SOVANTRI PUTRA PASKAH HALAWA";

  return (
    <footer className="border-t border-neutral-800/60 mt-24">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-10 md:py-12">
        {/* ============ TOP: 2 KOLOM ============ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-8 md:mb-10">
          {/* ===== KIRI: VISITORS ===== */}
          <div>
            <VisitorCountries />
          </div>

          {/* ===== KANAN: SOCIAL + NAV ===== */}
          <div className="space-y-6 md:space-y-7">
            {/* SOCIAL */}
            {socials.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
                  Connect
                </div>
                <div className="flex flex-wrap gap-2">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-900/40 flex items-center justify-center text-neutral-500 hover:text-white hover:border-violet-500/40 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all"
                    >
                      <s.Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* NAV */}
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
                Navigasi
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 text-xs text-neutral-500 hover:text-white transition"
                  >
                    <span className="w-1 h-1 rounded-full bg-neutral-700 group-hover:bg-violet-400 transition" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ============ BOTTOM: COPYRIGHT ============ */}
        <div className="pt-6 md:pt-8 border-t border-neutral-800/60">
          <p className="text-center text-xs text-neutral-500 leading-relaxed">
            © {year}{" "}
            <span className="text-neutral-400 font-medium">{authorName}</span>.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
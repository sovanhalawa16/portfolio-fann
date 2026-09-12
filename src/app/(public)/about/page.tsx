import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import { TECH_LIST, getTechLogo } from "@/lib/techStack";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedProgress from "@/components/AnimatedProgress";
import type React from "react";

export const metadata = {
  title: "About",
  description:
    "Kenalan lebih dekat — tentang saya, pengalaman, skills, dan hal-hal yang saya kerjain.",
};

export const revalidate = 60;

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

export default async function AboutPage() {
  const supabase = await createClient();

  const [profileRes, experiencesRes] = await Promise.all([
    supabase.from("profile").select("*").limit(1).maybeSingle(),
    supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false }),
  ]);

  const profile = profileRes.data;
  const experiences = experiencesRes.data || [];

  const taglines =
    profile?.taglines && Array.isArray(profile.taglines) && profile.taglines.length > 0
      ? profile.taglines
      : [];

  const skills =
    profile?.skills && Array.isArray(profile.skills) ? profile.skills : [];

  const socialLinks = profile?.social_links || {};
  const socials = Object.entries(socialLinks)
    .filter(([key, url]) => url && (url as string).trim() && SOCIAL_MAP[key])
    .map(([key, url]) => ({
      key,
      url: url as string,
      ...SOCIAL_MAP[key],
    }));

  const workExperiences = experiences.filter((e) => e.type === "work");
  const educationExperiences = experiences.filter((e) => e.type === "education");

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  const formatPeriod = (exp: any) => {
    const start = formatDate(exp.start_date);
    const end = exp.end_date ? formatDate(exp.end_date) : "Sekarang";
    if (!start) return end;
    return `${start} — ${end}`;
  };

  return (
    <div className="mx-auto max-w-4xl px-6 lg:px-8 py-10 md:py-14">
      {/* ==================== HERO ==================== */}
      <ScrollReveal>
        <section className="mb-12 md:mb-16">
          {/* BADGE */}
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-400 mb-6">
            <Icons.Sparkles className="w-3 h-3 text-violet-400" />
            <span>About Me</span>
          </div>

          {/* HERO LAYOUT: foto kiri, info kanan — horizontal compact */}
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
            {/* FOTO — KECIL */}
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-500/20 to-fuchsia-500/20 blur-xl" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-2 ring-neutral-800 overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500">
                {profile?.photo ? (
                  <img
                    src={profile.photo}
                    alt={profile.name || "Profile"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                    {(profile?.name || "F").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-green-500 ring-2 ring-neutral-950">
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-75" />
              </span>
            </div>

            {/* INFO */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">
                {profile?.name || "Fann"}
              </h1>

              {/* TAGLINE BADGES */}
              {taglines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {taglines.map((label: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 px-2.5 py-1 text-[11px] md:text-xs text-neutral-400"
                    >
                      <Icons.Sparkle className="w-2.5 h-2.5 text-violet-400 shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>
              )}

              {/* QUICK INFO */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-neutral-500 mb-4">
                {profile?.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icons.MapPin className="w-3 h-3 text-violet-400" />
                    {profile.location}
                  </span>
                )}
                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-white transition"
                  >
                    <Icons.Mail className="w-3 h-3 text-violet-400" />
                    {profile.email}
                  </a>
                )}
              </div>

              {/* CTA COMPACT */}
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/contact"
                  className="group inline-flex items-center gap-1.5 rounded-full bg-white text-neutral-950 px-4 py-2 text-xs md:text-sm font-semibold hover:bg-neutral-200 transition"
                >
                  <Icons.Send className="w-3.5 h-3.5" />
                  Hubungi saya
                </Link>
                {profile?.cv_url && (
                  <a
                    href={profile.cv_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 px-4 py-2 text-xs md:text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
                  >
                    <Icons.Download className="w-3.5 h-3.5" />
                    Download CV
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* BIO — FULL WIDTH DI BAWAH */}
          {profile?.bio && (
            <div className="mt-8 pt-6 border-t border-neutral-800/60">
              <p className="text-sm md:text-[15px] text-neutral-400 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
            </div>
          )}
        </section>
      </ScrollReveal>

      {/* ==================== PENGALAMAN KERJA ==================== */}
      {workExperiences.length > 0 && (
        <ScrollReveal>
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Icons.Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Pengalaman Kerja
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Perjalanan karir profesional.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-neutral-800" />

              <div className="space-y-3">
                {workExperiences.map((exp, i) => (
                  <ScrollReveal key={exp.id} delay={i * 60} direction="left">
                    <div className="relative pl-11">
                      {/* DOT */}
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <Icons.Briefcase className="w-3.5 h-3.5" />
                      </div>

                      {/* CARD */}
                      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 transition">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
                          <h3 className="text-sm md:text-base font-semibold">
                            {exp.title}
                          </h3>
                          <span className="text-[11px] text-neutral-500 whitespace-nowrap tabular-nums">
                            {formatPeriod(exp)}
                          </span>
                        </div>

                        {(exp.company || exp.location) && (
                          <div className="text-xs text-neutral-500 mb-2 flex flex-wrap items-center gap-x-2">
                            {exp.company && <span>{exp.company}</span>}
                            {exp.company && exp.location && (
                              <span className="text-neutral-700">·</span>
                            )}
                            {exp.location && <span>{exp.location}</span>}
                          </div>
                        )}

                        {exp.description && (
                          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed whitespace-pre-line line-clamp-4">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ==================== PENDIDIKAN ==================== */}
      {educationExperiences.length > 0 && (
        <ScrollReveal>
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Icons.GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Pendidikan
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Latar belakang akademik.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-neutral-800" />

              <div className="space-y-3">
                {educationExperiences.map((exp, i) => (
                  <ScrollReveal key={exp.id} delay={i * 60} direction="left">
                    <div className="relative pl-11">
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Icons.GraduationCap className="w-3.5 h-3.5" />
                      </div>

                      <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 transition">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-1">
                          <h3 className="text-sm md:text-base font-semibold">
                            {exp.level && (
                              <span className="inline-block rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 px-1.5 py-0.5 text-[10px] font-bold mr-1.5 align-middle">
                                {exp.level}
                              </span>
                            )}
                            {exp.title}
                          </h3>
                          <span className="text-[11px] text-neutral-500 whitespace-nowrap tabular-nums">
                            {formatPeriod(exp)}
                          </span>
                        </div>

                        {(exp.company || exp.location) && (
                          <div className="text-xs text-neutral-500 mb-2 flex flex-wrap items-center gap-x-2">
                            {exp.company && <span>{exp.company}</span>}
                            {exp.company && exp.location && (
                              <span className="text-neutral-700">·</span>
                            )}
                            {exp.location && <span>{exp.location}</span>}
                          </div>
                        )}

                        {exp.description && (
                          <p className="text-xs md:text-sm text-neutral-400 leading-relaxed whitespace-pre-line line-clamp-4">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ==================== TECH STACK ==================== */}
      {skills.length > 0 && (
        <ScrollReveal>
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Icons.Code2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">
                  Tech Stack
                </h2>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Alat yang saya pake sehari-hari.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
              {skills.map((skill: any, i: number) => {
                const tech = TECH_LIST.find((t) => t.name === skill.name);
                return (
                  <ScrollReveal key={skill.name} delay={i * 40}>
                    <div className="group rounded-lg border border-neutral-800 bg-neutral-900/40 p-3 hover:border-violet-500/30 hover:bg-neutral-900/70 transition">
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className="shrink-0 w-8 h-8 rounded-md bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden group-hover:scale-110 transition">
                          {tech ? (
                            <img
                              src={getTechLogo(tech.slug, tech.color)}
                              alt={skill.name}
                              className="w-4 h-4"
                              loading="lazy"
                            />
                          ) : (
                            <Icons.Code2 className="w-3.5 h-3.5 text-neutral-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs md:text-sm font-medium truncate">
                            {skill.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 tabular-nums">
                            {skill.level}%
                          </div>
                        </div>
                      </div>
                      <AnimatedProgress value={skill.level} />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* ==================== LET'S CONNECT ==================== */}
      {socials.length > 0 && (
        <ScrollReveal>
          <section className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 sm:flex-col sm:items-start">
                <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
                  <Icons.Globe className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-bold tracking-tight">
                    Let's Connect
                  </h2>
                  <p className="text-[11px] text-neutral-500 mt-0.5">
                    Ngobrol di salah satu platform ini.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 sm:ml-auto">
                {socials.map((s) => (
                  <a
                    key={s.key}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:border-violet-500/50 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all"
                  >
                    <s.Icon className="w-4 h-4" />
                  </a>
                ))}

                {profile?.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    aria-label="Email"
                    title="Email"
                    className="w-9 h-9 rounded-lg border border-neutral-800 bg-neutral-950 flex items-center justify-center text-neutral-500 hover:text-white hover:border-violet-500/50 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all"
                  >
                    <Icons.Mail className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}
    </div>
  );
}
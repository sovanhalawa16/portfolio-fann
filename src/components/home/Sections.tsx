import Link from "next/link";
import { Icons } from "@/lib/icons";
import { TECH_LIST, getTechLogo } from "@/lib/techStack";
import ScrollReveal from "@/components/ScrollReveal";
import AnimatedCounter from "@/components/AnimatedCounter";
import AnimatedProgress from "@/components/AnimatedProgress";
import type { Post, Project, Profile, Experience } from "@/lib/types";

export function StatsBar({
  postsCount,
  projectsCount,
  publicationsCount,
  totalViews,
}: {
  postsCount: number;
  projectsCount: number;
  publicationsCount: number;
  totalViews: number;
}) {
  const stats = [
    { icon: Icons.FileText, label: "Articles", value: postsCount, color: "text-violet-400" },
    { icon: Icons.Briefcase, label: "Projects", value: projectsCount, color: "text-blue-400" },
    { icon: Icons.Bookmark, label: "Publications", value: publicationsCount, color: "text-fuchsia-400" },
    { icon: Icons.Eye, label: "Total Views", value: totalViews, color: "text-green-400" },
  ];

  return (
    <section className="border-y border-neutral-800/60 bg-neutral-950/50">
      <div className="mx-auto max-w-6xl px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((s, i) => (
            <ScrollReveal key={i} delay={i * 80}>
              <div className="flex items-center gap-3 md:gap-4">
                <div className={`shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-lg md:text-2xl font-bold leading-none">
                    <AnimatedCounter value={s.value} />
                  </div>
                  <div className="text-xs md:text-sm text-neutral-500 mt-1 truncate">
                    {s.label}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ========== SECTION HEADER ==========
function SectionHeader({
  title,
  subtitle,
  href,
  linkLabel = "Lihat semua",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <ScrollReveal>
      <div className="flex items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-neutral-500 mt-1.5">{subtitle}</p>
          )}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 inline-flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition group"
          >
            {linkLabel}
            <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </Link>
        )}
      </div>
    </ScrollReveal>
  );
}

// ========== FEATURED PROJECTS ==========
export function FeaturedProjects({ projects }: { projects: Project[] }) {
  if (!projects || projects.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      <SectionHeader
        title="Featured Projects"
        subtitle="Karya pilihan yang saya banggain."
        href="/projects"
      />

      {/* MOBILE: horizontal scroll */}
      <div className="md:hidden -mx-6 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-3 pb-2">
          {projects.map((project) => (
            <div key={project.id} className="snap-start shrink-0 w-[75vw] max-w-[280px]">
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project, i) => (
          <ScrollReveal key={project.id} delay={i * 80}>
            <ProjectCard project={project} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all h-full"
    >
      <div className="aspect-[16/10] bg-neutral-950 relative overflow-hidden">
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <Icons.Code2 className="w-8 h-8" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm md:text-base font-semibold group-hover:text-violet-300 transition line-clamp-1 flex-1">
            {project.title}
          </h3>
          {project.featured && (
            <Icons.Star className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
          )}
        </div>

        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 min-h-[2rem]">
          {project.short_description || "Lihat detail project ini."}
        </p>

        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tech_stack.slice(0, 3).map((tech, idx) => {
              const t = TECH_LIST.find((x) => x.name === tech);
              return (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-neutral-950 border border-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-500"
                >
                  {t && (
                    <img
                      src={getTechLogo(t.slug, t.color)}
                      alt=""
                      className="w-2.5 h-2.5"
                      loading="lazy"
                    />
                  )}
                  {tech}
                </span>
              );
            })}
            {project.tech_stack.length > 3 && (
              <span className="inline-flex items-center rounded bg-neutral-950 border border-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-600">
                +{project.tech_stack.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

// ========== LATEST POSTS ==========
export function LatestPosts({ posts }: { posts: Post[] }) {
  if (!posts || posts.length === 0) return null;

  const calcReadingTime = (html: string | null) => {
    if (!html) return 1;
    const text = html.replace(/<[^>]*>/g, "");
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  };

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      <SectionHeader
        title="Tulisan Terbaru"
        subtitle="Catatan, tutorial, dan pemikiran."
        href="/blog"
      />

      {/* MOBILE: horizontal scroll */}
      <div className="md:hidden -mx-6 px-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        <div className="flex gap-3 pb-2">
          {posts.map((post) => (
            <div key={post.id} className="snap-start shrink-0 w-[75vw] max-w-[280px]">
              <PostCard post={post} calcReadingTime={calcReadingTime} />
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <ScrollReveal key={post.id} delay={i * 80}>
            <PostCard post={post} calcReadingTime={calcReadingTime} />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

function PostCard({
  post,
  calcReadingTime,
}: {
  post: Post;
  calcReadingTime: (html: string | null) => number;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all h-full"
    >
      {post.cover_image && (
        <div className="aspect-[16/10] bg-neutral-950 overflow-hidden">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5 mb-2 text-[10px] text-neutral-500">
          {post.categories?.name && (
            <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 px-1.5 py-0.5 font-medium">
              {post.categories.name}
            </span>
          )}
          <span className="inline-flex items-center gap-0.5">
            <Icons.Clock className="w-2.5 h-2.5" />
            {calcReadingTime(post.content)} min
          </span>
          <span className="inline-flex items-center gap-0.5">
            <Icons.Eye className="w-2.5 h-2.5" />
            {post.views || 0}
          </span>
        </div>

        <h3 className="text-sm md:text-base font-semibold mb-1.5 group-hover:text-violet-300 transition line-clamp-2 leading-snug">
          {post.title}
        </h3>

        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 min-h-[2rem]">
          {post.excerpt || "Baca selengkapnya..."}
        </p>

        <div className="flex items-center gap-1 text-[11px] text-neutral-600 group-hover:text-white transition">
          <span>Baca</span>
          <Icons.ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </Link>
  );
}

// ========== SKILLS & TECH STACK ==========
export function SkillsSection({
  skills,
  taglines,
}: {
  skills: Profile["skills"];
  taglines: string[];
}) {
  const labels =
    taglines.length > 0 ? taglines : ["Full-stack Developer", "Writer"];

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      {/* ==================== BAGIAN 1: SKILLS (Tagline Badges) ==================== */}
      <ScrollReveal>
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Icons.Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                Skills
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Bidang yang saya tekunin.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {labels.map((label, i) => (
              <span
                key={i}
                className="group inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/60 backdrop-blur px-4 py-2.5 text-sm md:text-base text-neutral-300 hover:border-violet-500/40 hover:bg-neutral-900 hover:-translate-y-0.5 transition-all"
              >
                <Icons.Sparkle className="w-3.5 h-3.5 text-violet-400 shrink-0 group-hover:scale-110 transition" />
                <span className="font-medium">{label}</span>
              </span>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ==================== BAGIAN 2: TECH STACK (Icon + Progress) ==================== */}
      {skills && skills.length > 0 && (
        <ScrollReveal>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Icons.Code2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                  Tech Stack
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Alat yang saya pake sehari-hari.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {skills.map((skill, i) => {
                const tech = TECH_LIST.find((t) => t.name === skill.name);
                return (
                  <ScrollReveal key={skill.name} delay={i * 50}>
                    <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-violet-500/30 hover:bg-neutral-900/70 transition">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center overflow-hidden group-hover:scale-110 transition">
                          {tech ? (
                            <img
                              src={getTechLogo(tech.slug, tech.color)}
                              alt={skill.name}
                              className="w-5 h-5"
                              loading="lazy"
                            />
                          ) : (
                            <Icons.Code2 className="w-4 h-4 text-neutral-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate">
                            {skill.name}
                          </div>
                          <div className="text-[10px] text-neutral-500 tabular-nums">
                            <AnimatedCounter
                              value={skill.level}
                              suffix="%"
                              duration={1200}
                            />
                          </div>
                        </div>
                      </div>

                      <AnimatedProgress value={skill.level} />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </ScrollReveal>
      )}
    </section>
  );
}

// ========== EXPERIENCE PREVIEW ==========
export function ExperiencePreview({
  experiences,
}: {
  experiences: Experience[];
}) {
  if (!experiences || experiences.length === 0) return null;

  const formatDate = (d: string | null) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      <SectionHeader
        title="Pengalaman"
        subtitle="Perjalanan karir & pendidikan."
        href="/about"
      />

      <div className="relative">
        <div className="absolute left-5 top-2 bottom-2 w-px bg-neutral-800" />

        <div className="space-y-4">
          {experiences.map((exp, i) => (
            <ScrollReveal key={exp.id} delay={i * 80} direction="left">
              <div className="relative pl-14">
                <div
                  className={`absolute left-0 top-1 w-10 h-10 rounded-xl border flex items-center justify-center ${
                    exp.type === "work"
                      ? "bg-violet-500/10 border-violet-500/30 text-violet-400"
                      : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  }`}
                >
                  {exp.type === "work" ? (
                    <Icons.Briefcase className="w-4 h-4" />
                  ) : (
                    <Icons.GraduationCap className="w-4 h-4" />
                  )}
                </div>

                <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 transition">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm md:text-base font-semibold">
                      {exp.level && (
                        <span className="inline-block rounded bg-violet-500/10 text-violet-300 border border-violet-500/20 px-1.5 py-0.5 text-[10px] font-bold mr-2 align-middle">
                          {exp.level}
                        </span>
                      )}
                      {exp.title}
                    </h3>
                    <span className="text-xs text-neutral-500 whitespace-nowrap">
                      {formatDate(exp.start_date)} —{" "}
                      {exp.end_date ? formatDate(exp.end_date) : "Sekarang"}
                    </span>
                  </div>
                  <div className="text-xs md:text-sm text-neutral-400 mb-1.5">
                    {exp.company}
                    {exp.company && exp.location && " · "}
                    {exp.location}
                  </div>
                  {exp.description && (
                    <p className="text-xs md:text-sm text-neutral-500 leading-relaxed line-clamp-2">
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
  );
}

// ========== CTA SECTION ==========
export function CTASection({
  email,
  cvUrl,
}: {
  email: string | null;
  cvUrl: string | null;
}) {
  return (
    <section className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 p-8 md:p-12">
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-fuchsia-600/20 blur-3xl animate-pulse" />

          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 backdrop-blur px-3 py-1.5 text-xs text-neutral-400 mb-5">
              <Icons.Send className="w-3 h-3" />
              <span>Terbuka untuk kolaborasi</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-3 leading-tight">
              Punya project?{" "}
              <span className="text-neutral-500">Ayo ngobrol.</span>
            </h2>

            <p className="text-sm md:text-base text-neutral-400 mb-6 leading-relaxed">
              Mau bikin website, butuh partner ngoding, atau sekadar ngobrol soal
              teknologi — kirim pesan aja.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 px-5 md:px-6 py-2.5 md:py-3 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                <Icons.Mail className="w-4 h-4" />
                Hubungi Saya
                <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </Link>
              {cvUrl && (
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/60 backdrop-blur px-5 md:px-6 py-2.5 md:py-3 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
                >
                  <Icons.Download className="w-4 h-4" />
                  Download CV
                </a>
              )}
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import { TECH_LIST, getTechLogo } from "@/lib/techStack";
import ProjectViewTracker from "@/components/project/ProjectViewTracker";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("portfolio")
    .select("title, short_description, thumbnail")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!project) return { title: "Project Not Found" };

  return {
    title: project.title,
    description: project.short_description || "",
    openGraph: {
      title: project.title,
      description: project.short_description || "",
      images: project.thumbnail ? [project.thumbnail] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.short_description || "",
      images: project.thumbnail ? [project.thumbnail] : [],
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("portfolio")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!project) notFound();

  // Gallery images
  const gallery = Array.isArray(project.gallery) ? project.gallery : [];
  const techStack = Array.isArray(project.tech_stack) ? project.tech_stack : [];

  const { data: allOthers } = await supabase
  .from("portfolio")
  .select("id, title, slug, thumbnail, short_description, tech_stack, featured, year, views, demo_url, repo_url")
  .eq("status", "published")
  .neq("id", project.id)
  .limit(10);

  const related = (allOthers || [])
    .map((p) => ({
      ...p,
      shared: (p.tech_stack || []).filter((t: string) => techStack.includes(t)).length,
    }))
    .filter((p) => p.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-4xl px-6 lg:px-8 py-12 md:py-16">
      <ProjectViewTracker projectId={project.id} />
      {/* BACK */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition mb-8 group"
      >
        <Icons.ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition" />
        Kembali ke Projects
      </Link>

      {/* HEADER */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          {project.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-violet-500 text-white px-2.5 py-1 font-bold">
              <Icons.Star className="w-3 h-3" />
              Featured
            </span>
          )}
          {project.year && (
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1">
              <Icons.Calendar className="w-3 h-3" />
              {project.year}
            </span>
          )}
          {project.duration && (
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1">
              <Icons.Clock className="w-3 h-3" />
              {project.duration}
            </span>
          )}
          {project.client && (
            <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1">
              <Icons.Users className="w-3 h-3" />
              {project.client}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1">
  <Icons.Eye className="w-3 h-3" />
  <span className="tabular-nums">
    {(project.views || 0).toLocaleString("id-ID")}
  </span>
  views
</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15]">
          {project.title}
        </h1>

        {project.short_description && (
          <p className="text-base md:text-lg text-neutral-400 leading-relaxed mb-6">
            {project.short_description}
          </p>
        )}

        {/* CTA Links */}
        {(project.demo_url || project.repo_url) && (
          <div className="flex flex-wrap gap-3 pt-2">
            {project.demo_url && (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
              >
                <Icons.ExternalLink className="w-4 h-4" />
                Lihat Live Demo
                <Icons.ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
              </a>
            )}
            {project.repo_url && (
              <a
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
              >
                <Icons.Github className="w-4 h-4" />
                Lihat Repository
              </a>
            )}
          </div>
        )}
      </header>

      {/* COVER */}
      {project.thumbnail && (
        <div className="rounded-2xl overflow-hidden mb-10 bg-neutral-900 border border-neutral-800">
          <img
            src={project.thumbnail}
            alt={project.title}
            className="w-full h-auto"
          />
        </div>
      )}

      {/* TECH STACK */}
      {techStack.length > 0 && (
        <div className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Icons.Code2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400">
              Tech Stack
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech: string) => {
              const t = TECH_LIST.find((x) => x.name === tech);
              return (
                <span
                  key={tech}
                  className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs font-medium text-neutral-300 hover:border-violet-500/40 hover:text-white transition"
                >
                  {t && (
                    <img
                      src={getTechLogo(t.slug, t.color)}
                      alt=""
                      className="w-4 h-4"
                      loading="lazy"
                    />
                  )}
                  {tech}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {project.content && (
        <div
          className="prose prose-invert prose-base md:prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-code:text-violet-300 prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-code:font-mono prose-code:text-sm
            prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-xl
            prose-blockquote:border-l-violet-500 prose-blockquote:text-neutral-400 prose-blockquote:not-italic prose-blockquote:bg-neutral-900/40 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
            prose-ul:text-neutral-300 prose-ol:text-neutral-300
            prose-li:my-1
            prose-hr:border-neutral-800
            prose-img:rounded-xl prose-img:my-6
          "
          dangerouslySetInnerHTML={{ __html: project.content }}
        />
      )}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <div className="mt-12 pt-10 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Icons.LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                Gallery
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Screenshot & preview project.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((url: string, i: number) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900 aspect-[16/10] hover:border-violet-500/40 transition"
              >
                <img
                  src={url}
                  alt={`${project.title} - ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-neutral-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Icons.Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold tracking-tight">
                Project Terkait
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Project lain dengan tech stack serupa.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/projects/${r.slug}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-[16/10] bg-neutral-950 overflow-hidden">
                  {r.thumbnail ? (
                    <img
                      src={r.thumbnail}
                      alt={r.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-700">
                      <Icons.Code2 className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-violet-300 transition">
                    {r.title}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
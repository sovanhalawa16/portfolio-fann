import Link from "next/link";
import { Icons } from "@/lib/icons";
import { TECH_LIST, getTechLogo } from "@/lib/techStack";
import ProjectViewsDisplay from "./ProjectViewsDisplay";

type Props = {
  project: {
    id: number;
    title: string;
    slug: string;
    short_description: string | null;
    thumbnail: string | null;
    tech_stack: string[];
    featured: boolean;
    year: number | null;
    views?: number | null;
    demo_url: string | null;
    repo_url: string | null;
  };
};

export default function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all h-full"
    >
      {/* THUMBNAIL */}
      <div className="aspect-[16/10] bg-neutral-950 overflow-hidden relative">
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

        {project.featured && (
          <div className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-violet-500 text-white px-2 py-0.5 text-[10px] font-bold shadow-lg">
            <Icons.Star className="w-2.5 h-2.5" />
            Featured
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold line-clamp-1 leading-snug group-hover:text-violet-300 transition mb-1.5">
          {project.title}
        </h3>

        <p className="text-[11px] text-neutral-500 line-clamp-2 mb-3 min-h-[2rem] hidden sm:block">
          {project.short_description || "Lihat detail project ini."}
        </p>

        {/* META: VIEWS + YEAR */}
        <div className="flex items-center justify-between gap-2 mb-3 text-[10px] text-neutral-500">
          <ProjectViewsDisplay
            projectId={project.id}
            initialViews={project.views || 0}
          />
          {project.year && (
            <span className="text-neutral-600 tabular-nums shrink-0">
              {project.year}
            </span>
          )}
        </div>

        {/* TECH STACK */}
        {project.tech_stack && project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {project.tech_stack.slice(0, 3).map((tech, i) => {
              const t = TECH_LIST.find((x) => x.name === tech);
              return (
                <span
                  key={i}
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
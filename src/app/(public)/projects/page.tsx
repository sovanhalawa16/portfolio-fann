import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import ProjectGrid from "@/components/project/ProjectGrid";

export const metadata = {
  title: "Projects",
  description:
    "Kumpulan project dan karya yang pernah saya kerjain — dari website, aplikasi, sampai eksperimen.",
};

export const revalidate = 60;

export default async function ProjectsPage() {
  const supabase = await createClient();

  const { data: projects } = await supabase
    .from("portfolio")
    .select(
      "id, title, slug, short_description, thumbnail, tech_stack, featured, year, demo_url, repo_url"
    )
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("year", { ascending: false });

  const projectsData = projects || [];
  const featuredCount = projectsData.filter((p) => p.featured).length;
  const totalTechs = new Set(
    projectsData.flatMap((p) => p.tech_stack || [])
  ).size;

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      {/* HEADER */}
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-400 mb-5">
          <Icons.Code2 className="w-3.5 h-3.5 text-violet-400" />
          <span>Projects</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15] max-w-2xl">
          Karya & <span className="text-neutral-500">eksperimen.</span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed mb-5">
          Kumpulan project yang pernah saya kerjain — dari yang serius sampai
          yang cuma buat belajar. Beberapa open source, beberapa private.
        </p>

        {/* STATS */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Icons.Briefcase className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {projectsData.length}
            </strong>{" "}
            project
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.Star className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {featuredCount}
            </strong>{" "}
            featured
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.Layers className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {totalTechs}
            </strong>{" "}
            teknologi
          </span>
        </div>
      </div>

      {/* GRID */}
      <ProjectGrid projects={projectsData} />
    </div>
  );
}
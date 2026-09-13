import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import PublicationList from "@/components/publications/PublicationList";
import MetricsCard from "@/components/publications/MetricsCard";

export const metadata = {
  title: "Publications",
  description:
    "Kumpulan publikasi ilmiah, jurnal, dan penelitian yang pernah saya terbitkan.",
};

export const revalidate = 60;

export default async function PublicationsPage() {
  const supabase = await createClient();

  const [pubsRes, metricsRes] = await Promise.all([
    supabase
      .from("publications")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("year", { ascending: false }),
    supabase.from("publication_metrics").select("*").limit(1).maybeSingle(),
  ]);

  const publications = pubsRes.data || [];
  const metrics = metricsRes.data;

  const totalCitations = publications.reduce(
    (sum, p) => sum + (p.citations || 0),
    0
  );

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10 md:py-14">
      {/* HEADER */}
      <div className="mb-10 md:mb-12">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-400 mb-5">
          <Icons.Award className="w-3 h-3 text-violet-400" />
          <span>Publications & Research</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15] max-w-2xl">
          Publikasi & <span className="text-neutral-500">penelitian.</span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed mb-6">
          Kumpulan publikasi ilmiah saya. Beberapa open access, beberapa di-publish
          di jurnal terindeks.
        </p>

        {/* QUICK STATS */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Icons.Bookmark className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {publications.length}
            </strong>{" "}
            publikasi
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.Quote className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {totalCitations}
            </strong>{" "}
            total sitasi
          </span>
          {metrics && (
            <>
              <span className="text-neutral-700">·</span>
              <span className="inline-flex items-center gap-1.5">
                <Icons.TrendingUp className="w-3.5 h-3.5" />
                <strong className="text-neutral-300 font-semibold">
                  h-index {metrics.h_index}
                </strong>
              </span>
            </>
          )}
        </div>
      </div>

      {/* METRICS CARD */}
      {metrics && (
        <div className="mb-10">
          <MetricsCard metrics={metrics} />
        </div>
      )}

      {/* LIST */}
      {publications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-500 mb-4">
            <Icons.Award className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Belum ada publikasi</h3>
          <p className="text-sm text-neutral-400">
            Publikasi bakal muncul di sini begitu ditambah lewat admin.
          </p>
        </div>
      ) : (
        <PublicationList publications={publications} />
      )}
    </div>
  );
}
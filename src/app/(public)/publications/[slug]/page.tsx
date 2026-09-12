import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import CitationBox from "@/components/publications/CitationBox";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: pub } = await supabase
    .from("publications")
    .select("title, abstract")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!pub) return { title: "Publication Not Found" };

  return {
    title: pub.title,
    description: pub.abstract?.slice(0, 160) || "",
    openGraph: {
      title: pub.title,
      description: pub.abstract?.slice(0, 160) || "",
      type: "article",
    },
  };
}

const RANKING_LABEL: Record<string, string> = {
  sinta_1: "Sinta 1", sinta_2: "Sinta 2", sinta_3: "Sinta 3",
  sinta_4: "Sinta 4", sinta_5: "Sinta 5", sinta_6: "Sinta 6",
  scopus_q1: "Scopus Q1", scopus_q2: "Scopus Q2",
  scopus_q3: "Scopus Q3", scopus_q4: "Scopus Q4",
  wos: "Web of Science", garuda: "Garuda",
  other: "Other", none: "",
};

const RANKING_COLOR: Record<string, string> = {
  sinta_1: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  sinta_2: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  sinta_3: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  sinta_4: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  sinta_5: "bg-teal-500/15 text-teal-300 border-teal-500/30",
  sinta_6: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  scopus_q1: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  scopus_q2: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  scopus_q3: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  scopus_q4: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  wos: "bg-red-500/15 text-red-300 border-red-500/30",
  garuda: "bg-green-500/15 text-green-300 border-green-500/30",
  other: "bg-neutral-500/15 text-neutral-300 border-neutral-500/30",
};

const TYPE_LABEL: Record<string, string> = {
  journal: "Journal Article",
  conference: "Conference Paper",
  book_chapter: "Book Chapter",
  preprint: "Preprint",
  thesis: "Thesis",
  workshop: "Workshop",
};

export default async function PublicationDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: pub } = await supabase
    .from("publications")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!pub) notFound();

  const authors = pub.authors || [];
  const keywords = pub.keywords || [];
  const rankingLabel = RANKING_LABEL[pub.ranking];
  const rankingColor = RANKING_COLOR[pub.ranking] || RANKING_COLOR.other;

  // Related: share at least 1 keyword
  const { data: allOthers } = await supabase
    .from("publications")
    .select("id, title, slug, year, journal_name, keywords, authors, citations, ranking")
    .eq("status", "published")
    .neq("id", pub.id)
    .limit(20);

  const related = (allOthers || [])
    .map((p) => {
      const shared = (p.keywords || []).filter((k: string) =>
        keywords.includes(k)
      ).length;
      return { ...p, shared };
    })
    .filter((p) => p.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 3);

  return (
    <article className="mx-auto max-w-4xl px-6 lg:px-8 py-10 md:py-14">
      {/* BACK */}
      <Link
        href="/publications"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition mb-8 group"
      >
        <Icons.ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition" />
        Kembali ke Publications
      </Link>

      {/* HEADER */}
      <header className="mb-10">
        <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1 font-medium">
            {TYPE_LABEL[pub.publication_type] || pub.publication_type}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-900/60 text-neutral-400 px-2.5 py-1 font-medium">
            <Icons.Calendar className="w-3 h-3" />
            {pub.year}
          </span>
          {rankingLabel && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-bold ${rankingColor}`}>
              <Icons.Award className="w-3 h-3" />
              {rankingLabel}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 text-green-400 px-2.5 py-1 font-medium">
            <Icons.Quote className="w-3 h-3" />
            {pub.citations} sitasi
          </span>
          {pub.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 text-violet-300 px-2.5 py-1 font-bold">
              <Icons.Star className="w-3 h-3" />
              Featured
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 leading-[1.2]">
          {pub.title}
        </h1>

        {/* AUTHORS */}
        <div className="mb-6">
          <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
            Authors
          </div>
          <div className="flex flex-wrap gap-2">
            {authors.map((a: any, i: number) => (
              <div
                key={i}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                  a.is_me
                    ? "border-violet-500/40 bg-violet-500/10"
                    : "border-neutral-800 bg-neutral-900/40"
                }`}
              >
                <span
                  className={`font-medium ${
                    a.is_me ? "text-violet-300" : "text-neutral-300"
                  }`}
                >
                  {a.name}
                </span>
                {a.affiliation && (
                  <span className="text-neutral-500 text-[10px]">
                    · {a.affiliation}
                  </span>
                )}
                {a.is_me && (
                  <span className="rounded-full bg-violet-500/30 text-violet-200 px-1.5 py-0.5 text-[9px] font-bold">
                    Me
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ACTION LINKS */}
        <div className="flex flex-wrap gap-2">
          {pub.url_pdf && (
            <a
              href={pub.url_pdf}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
            >
              <Icons.FileDown className="w-4 h-4" />
              Download PDF
            </a>
          )}
          {pub.url_journal && (
            <a
              href={pub.url_journal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
            >
              <Icons.ExternalLink className="w-4 h-4" />
              Journal Page
            </a>
          )}
          {pub.url_scholar && (
            <a
              href={pub.url_scholar}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
            >
              <Icons.Award className="w-4 h-4" />
              Google Scholar
            </a>
          )}
          {pub.doi && (
            <a
              href={`https://doi.org/${pub.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-800 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-900 hover:border-neutral-700 transition"
            >
              <Icons.Globe className="w-4 h-4" />
              DOI
            </a>
          )}
        </div>
      </header>

      {/* COVER */}
      {pub.cover_image && (
        <div className="rounded-2xl overflow-hidden mb-10 bg-neutral-900 border border-neutral-800">
          <img src={pub.cover_image} alt={pub.title} className="w-full h-auto" />
        </div>
      )}

      {/* CITATION BOX */}
      <div className="mb-10">
        <CitationBox
          title={pub.title}
          authors={authors}
          journal={pub.journal_name}
          year={pub.year}
          volume={pub.volume}
          issue={pub.issue}
          pages={pub.pages}
          doi={pub.doi}
          slug={pub.slug}
        />
      </div>

      {/* PUBLICATION INFO GRID */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6 mb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Icons.Info className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold tracking-tight">
              Publication Details
            </h2>
          </div>
        </div>

        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Journal
            </dt>
            <dd className="text-sm text-neutral-300 italic">
              {pub.journal_name}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
              Tahun
            </dt>
            <dd className="text-sm text-neutral-300">{pub.year}</dd>
          </div>
          {pub.volume && (
            <div>
              <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Volume
              </dt>
              <dd className="text-sm text-neutral-300 tabular-nums">
                {pub.volume}
              </dd>
            </div>
          )}
          {pub.issue && (
            <div>
              <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Issue
              </dt>
              <dd className="text-sm text-neutral-300 tabular-nums">
                {pub.issue}
              </dd>
            </div>
          )}
          {pub.pages && (
            <div>
              <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Pages
              </dt>
              <dd className="text-sm text-neutral-300 tabular-nums">
                {pub.pages}
              </dd>
            </div>
          )}
          {pub.doi && (
            <div>
              <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                DOI
              </dt>
              <dd className="text-sm">
                <a
                  href={`https://doi.org/${pub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:text-violet-300 hover:underline break-all"
                >
                  {pub.doi}
                </a>
              </dd>
            </div>
          )}
          {pub.research_area && (
            <div>
              <dt className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1">
                Research Area
              </dt>
              <dd className="text-sm text-neutral-300">
                {pub.research_area}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* ABSTRACT */}
      {pub.abstract && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Icons.FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-bold tracking-tight">
              Abstract
            </h2>
          </div>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6">
            <p className="text-sm md:text-[15px] text-neutral-300 leading-relaxed whitespace-pre-line">
              {pub.abstract}
            </p>
          </div>
        </div>
      )}

      {/* KEYWORDS */}
      {keywords.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Icons.Bookmark className="w-4 h-4" />
            </div>
            <h2 className="text-base md:text-lg font-bold tracking-tight">
              Keywords
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1.5 text-xs font-medium"
              >
                <Icons.Sparkle className="w-3 h-3" />
                {kw}
              </span>
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
                Publikasi Terkait
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Berdasarkan keyword yang sama.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/publications/${r.slug}`}
                className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 hover:bg-neutral-900/70 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    <Icons.Award className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold line-clamp-2 leading-snug group-hover:text-violet-300 transition mb-1.5">
                      {r.title}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
                      <span className="italic">{r.journal_name}</span>
                      <span className="text-neutral-700">·</span>
                      <span className="tabular-nums">{r.year}</span>
                      {r.citations > 0 && (
                        <>
                          <span className="text-neutral-700">·</span>
                          <span className="text-green-400">
                            {r.citations} sitasi
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <Icons.ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-violet-400 shrink-0 mt-1 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
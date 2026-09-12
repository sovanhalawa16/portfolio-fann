import Link from "next/link";
import { Icons } from "@/lib/icons";

export type Publication = {
  id: number;
  title: string;
  slug: string;
  abstract: string | null;
  authors: { name: string; affiliation: string; is_me: boolean }[];
  journal_name: string;
  publication_type: string;
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  url_journal: string | null;
  url_scholar: string | null;
  url_pdf: string | null;
  ranking: string;
  keywords: string[];
  research_area: string | null;
  citations: number;
  status: string;
  featured: boolean;
  cover_image: string | null;
};

const RANKING_LABEL: Record<string, string> = {
  sinta_1: "Sinta 1", sinta_2: "Sinta 2", sinta_3: "Sinta 3",
  sinta_4: "Sinta 4", sinta_5: "Sinta 5", sinta_6: "Sinta 6",
  scopus_q1: "Scopus Q1", scopus_q2: "Scopus Q2",
  scopus_q3: "Scopus Q3", scopus_q4: "Scopus Q4",
  wos: "WoS", garuda: "Garuda", other: "Other", none: "",
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
  journal: "Journal",
  conference: "Conference",
  book_chapter: "Book Chapter",
  preprint: "Preprint",
  thesis: "Thesis",
  workshop: "Workshop",
};

export default function PublicationCard({ pub }: { pub: Publication }) {
  const rankingLabel = RANKING_LABEL[pub.ranking];
  const rankingColor = RANKING_COLOR[pub.ranking] || RANKING_COLOR.other;

  return (
    <div className="group rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 transition-all">
      <div className="p-4 md:p-5">
        {/* TOP BADGES */}
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 px-2 py-0.5 text-[10px] font-medium">
            {TYPE_LABEL[pub.publication_type] || pub.publication_type}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 text-neutral-400 px-2 py-0.5 text-[10px] font-medium">
            <Icons.Calendar className="w-2.5 h-2.5" />
            {pub.year}
          </span>
          {rankingLabel && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${rankingColor}`}>
              <Icons.Award className="w-2.5 h-2.5" />
              {rankingLabel}
            </span>
          )}
          {pub.featured && (
            <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/15 text-violet-300 px-2 py-0.5 text-[10px] font-bold">
              <Icons.Star className="w-2.5 h-2.5" />
              Featured
            </span>
          )}
          {pub.status === "under_review" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-yellow-500/30 bg-yellow-500/15 text-yellow-300 px-2 py-0.5 text-[10px] font-bold">
              Under Review
            </span>
          )}
          {pub.status === "in_press" && (
            <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 text-blue-300 px-2 py-0.5 text-[10px] font-bold">
              In Press
            </span>
          )}
        </div>

        {/* TITLE */}
        <Link href={`/publications/${pub.slug}`} className="block mb-2 group/title">
          <h3 className="text-base md:text-lg font-bold leading-snug group-hover/title:text-violet-300 transition line-clamp-2">
            {pub.title}
          </h3>
        </Link>

        {/* AUTHORS */}
        <p className="text-xs md:text-sm text-neutral-400 mb-2.5 leading-relaxed line-clamp-2">
          {pub.authors.map((a, i) => (
            <span key={i}>
              {i > 0 && ", "}
              <span className={a.is_me ? "font-bold text-violet-300" : ""}>
                {a.name}
              </span>
            </span>
          ))}
        </p>

        {/* JOURNAL INFO */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500 mb-3">
          <span className="inline-flex items-center gap-1.5 italic">
            <Icons.Bookmark className="w-3 h-3 shrink-0" />
            {pub.journal_name}
          </span>
          {(pub.volume || pub.issue || pub.pages) && (
            <>
              <span className="text-neutral-700">·</span>
              <span className="tabular-nums">
                {[pub.volume, pub.issue, pub.pages].filter(Boolean).join(", ")}
              </span>
            </>
          )}
        </div>

        {/* ABSTRACT PREVIEW */}
        {pub.abstract && (
          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mb-3">
            {pub.abstract}
          </p>
        )}

        {/* KEYWORDS */}
        {pub.keywords && pub.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {pub.keywords.slice(0, 4).map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded bg-neutral-950 border border-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-500"
              >
                {kw}
              </span>
            ))}
            {pub.keywords.length > 4 && (
              <span className="inline-flex items-center rounded bg-neutral-950 border border-neutral-800/80 px-1.5 py-0.5 text-[10px] text-neutral-600">
                +{pub.keywords.length - 4}
              </span>
            )}
          </div>
        )}

        {/* FOOTER */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-neutral-800/60">
          {/* CITATIONS */}
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 px-2.5 py-1 text-xs font-medium">
            <Icons.Quote className="w-3 h-3" />
            {pub.citations} sitasi
          </span>

          {/* LINKS */}
          <div className="flex items-center gap-1 ml-auto">
            {pub.url_pdf && (
              <a
                href={pub.url_pdf}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                title="Download PDF"
              >
                <Icons.FileDown className="w-3.5 h-3.5" />
              </a>
            )}
            {pub.url_scholar && (
              <a
                href={pub.url_scholar}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                title="Google Scholar"
              >
                <Icons.Award className="w-3.5 h-3.5" />
              </a>
            )}
            {pub.url_journal && (
              <a
                href={pub.url_journal}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-1.5 text-neutral-500 hover:text-violet-400 hover:bg-violet-500/10 transition"
                title="Journal Page"
              >
                <Icons.ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <Link
              href={`/publications/${pub.slug}`}
              className="rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition"
              title="Detail"
            >
              <Icons.ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
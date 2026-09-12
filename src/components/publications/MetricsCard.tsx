import { Icons } from "@/lib/icons";

type Props = {
  metrics: {
    total_citations: number;
    total_citations_since: number;
    citations_since_year: number;
    h_index: number;
    h_index_since: number;
    i10_index: number;
    i10_index_since: number;
    google_scholar_url: string | null;
    scopus_url: string | null;
    orcid_url: string | null;
    researchgate_url: string | null;
    sinta_url: string | null;
    semantic_scholar_url: string | null;
    research_interests: string[];
  };
};

export default function MetricsCard({ metrics }: Props) {
  const rows = [
    {
      label: "Kutipan",
      all: metrics.total_citations,
      since: metrics.total_citations_since,
    },
    {
      label: "indeks-h",
      all: metrics.h_index,
      since: metrics.h_index_since,
    },
    {
      label: "indeks-i10",
      all: metrics.i10_index,
      since: metrics.i10_index_since,
    },
  ];

  const profileLinks = [
    { label: "Google Scholar", url: metrics.google_scholar_url, primary: true },
    { label: "Scopus", url: metrics.scopus_url },
    { label: "ORCID", url: metrics.orcid_url },
    { label: "ResearchGate", url: metrics.researchgate_url },
    { label: "Sinta", url: metrics.sinta_url },
    { label: "Semantic Scholar", url: metrics.semantic_scholar_url },
  ].filter((l) => l.url && l.url.trim());

  return (
    <div className="rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/60 to-neutral-950/60 overflow-hidden">
      <div className="p-5 md:p-6">
        {/* HEADER */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Icons.TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Citation Metrics
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Data dari Google Scholar
            </p>
          </div>
        </div>

        {/* TABLE */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden mb-5">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800/60">
                <th className="text-left px-4 py-2.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider"></th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Semua
                </th>
                <th className="text-right px-4 py-2.5 text-[11px] font-medium text-neutral-500 uppercase tracking-wider">
                  Sejak {metrics.citations_since_year}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={i}
                  className={i < rows.length - 1 ? "border-b border-neutral-800/40" : ""}
                >
                  <td className="px-4 py-3 text-sm text-neutral-400">
                    {r.label}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-neutral-200">
                    {r.all}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-neutral-200">
                    {r.since}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RESEARCH INTERESTS */}
        {metrics.research_interests && metrics.research_interests.length > 0 && (
          <div className="mb-5">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
              Research Interests
            </div>
            <div className="flex flex-wrap gap-1.5">
              {metrics.research_interests.map((interest, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-1 text-xs font-medium"
                >
                  <Icons.Sparkle className="w-2.5 h-2.5" />
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE LINKS */}
        {profileLinks.length > 0 && (
          <div className="pt-4 border-t border-neutral-800/60">
            <div className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-3">
              Profile Akademik
            </div>
            <div className="flex flex-wrap gap-2">
              {profileLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    link.primary
                      ? "border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                      : "border-neutral-800 bg-neutral-900/40 text-neutral-400 hover:bg-neutral-900 hover:text-white hover:border-neutral-700"
                  }`}
                >
                  <Icons.Award className="w-3 h-3" />
                  {link.label}
                  <Icons.ArrowUpRight className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
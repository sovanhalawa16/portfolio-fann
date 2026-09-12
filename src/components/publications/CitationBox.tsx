"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";

type Author = { name: string; affiliation?: string; is_me?: boolean };

type Props = {
  title: string;
  authors: Author[];
  journal: string;
  year: number;
  volume: string | null;
  issue: string | null;
  pages: string | null;
  doi: string | null;
  slug: string;
};

type Format = "apa" | "mla" | "ieee" | "chicago" | "bibtex";

const FORMAT_LABELS: Record<Format, string> = {
  apa: "APA",
  mla: "MLA",
  ieee: "IEEE",
  chicago: "Chicago",
  bibtex: "BibTeX",
};

// Convert nama jadi format APA: "Halawa, S. P. P."
function formatAuthorAPA(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const lastName = parts[parts.length - 1];
  const initials = parts
    .slice(0, -1)
    .map((p) => `${p.charAt(0).toUpperCase()}.`)
    .join(" ");
  return `${lastName}, ${initials}`;
}

export default function CitationBox({
  title,
  authors,
  journal,
  year,
  volume,
  issue,
  pages,
  doi,
  slug,
}: Props) {
  const [format, setFormat] = useState<Format>("apa");
  const [copied, setCopied] = useState(false);

  const buildCitation = (fmt: Format): string => {
    const names = authors.map((a) => a.name);

    if (fmt === "apa") {
      const authorPart =
        names.length === 1
          ? formatAuthorAPA(names[0])
          : names.length === 2
          ? `${formatAuthorAPA(names[0])}, & ${formatAuthorAPA(names[1])}`
          : `${names
              .slice(0, -1)
              .map(formatAuthorAPA)
              .join(", ")}, & ${formatAuthorAPA(names[names.length - 1])}`;
      return `${authorPart} (${year}). ${title}. ${journal}${
        volume ? `, ${volume}` : ""
      }${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.${
        doi ? ` https://doi.org/${doi}` : ""
      }`;
    }

    if (fmt === "mla") {
      const first = names[0];
      const rest = names.slice(1);
      const authorPart =
        names.length === 1
          ? first
          : names.length === 2
          ? `${first}, and ${rest[0]}`
          : `${first}, et al.`;
      return `${authorPart}. "${title}." ${journal}${
        volume ? `, vol. ${volume}` : ""
      }${issue ? `, no. ${issue}` : ""}, ${year}${
        pages ? `, pp. ${pages}` : ""
      }.${doi ? ` doi:${doi}.` : ""}`;
    }

    if (fmt === "ieee") {
      const authorPart = names
        .map((n) => {
          const parts = n.split(/\s+/);
          if (parts.length === 1) return n;
          return `${parts[0].charAt(0)}. ${parts.slice(1).join(" ")}`;
        })
        .join(", ");
      return `${authorPart}, "${title}," ${journal}${
        volume ? `, vol. ${volume}` : ""
      }${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}, ${year}.`;
    }

    if (fmt === "chicago") {
      const authorPart = names.join(", ");
      return `${authorPart}. "${title}." ${journal}${
        volume ? ` ${volume}` : ""
      }${issue ? `, no. ${issue}` : ""} (${year})${
        pages ? `: ${pages}` : ""
      }.`;
    }

    // BibTeX
    const firstLastName = names[0].split(/\s+/).slice(-1)[0].toLowerCase();
    const citeKey = `${firstLastName}${year}${slug.split("-")[0]}`;
    const bibAuthors = names.join(" and ");
    return `@article{${citeKey},
  title = {${title}},
  author = {${bibAuthors}},
  journal = {${journal}},
  year = {${year}},${volume ? `\n  volume = {${volume.replace("Vol. ", "")}},` : ""}${issue ? `\n  number = {${issue.replace("No. ", "")}},` : ""}${pages ? `\n  pages = {${pages}},` : ""}${doi ? `\n  doi = {${doi}},` : ""}
}`;
  };

  const citation = buildCitation(format);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
      <div className="p-5 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Icons.Quote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base md:text-lg font-bold tracking-tight">
              Cite This Paper
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Copy sitasi dalam berbagai format
            </p>
          </div>
        </div>

        {/* FORMAT TABS */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {(Object.keys(FORMAT_LABELS) as Format[]).map((f) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                format === f
                  ? "bg-violet-500/15 border border-violet-500/40 text-violet-300"
                  : "border border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white"
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>

        {/* CITATION CONTENT */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-950 p-4 mb-3">
          <pre className="text-xs md:text-sm text-neutral-300 whitespace-pre-wrap font-mono leading-relaxed break-words">
            {citation}
          </pre>
        </div>

        {/* COPY BUTTON */}
        <button
          onClick={handleCopy}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
            copied
              ? "bg-green-500 text-white"
              : "bg-white text-neutral-950 hover:bg-neutral-200"
          }`}
        >
          {copied ? (
            <>
              <Icons.Check className="w-4 h-4" />
              Tercopy ke clipboard!
            </>
          ) : (
            <>
              <Icons.Copy className="w-4 h-4" />
              Copy Citation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
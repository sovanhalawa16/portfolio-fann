"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";

type Metrics = {
  id?: number;
  total_citations: number;
  total_citations_since: number;
  citations_since_year: number;
  h_index: number;
  h_index_since: number;
  i10_index: number;
  i10_index_since: number;
  google_scholar_url: string;
  scopus_url: string;
  orcid_url: string;
  researchgate_url: string;
  sinta_id: string;
  sinta_url: string;
  publons_url: string;
  semantic_scholar_url: string;
  research_interests: string[];
};

const EMPTY: Metrics = {
  total_citations: 0, total_citations_since: 0, citations_since_year: 2020,
  h_index: 0, h_index_since: 0, i10_index: 0, i10_index_since: 0,
  google_scholar_url: "", scopus_url: "", orcid_url: "", researchgate_url: "",
  sinta_id: "", sinta_url: "", publons_url: "", semantic_scholar_url: "",
  research_interests: [],
};

export default function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("publication_metrics")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setMetrics({
          id: data.id,
          total_citations: data.total_citations || 0,
          total_citations_since: data.total_citations_since || 0,
          citations_since_year: data.citations_since_year || 2020,
          h_index: data.h_index || 0,
          h_index_since: data.h_index_since || 0,
          i10_index: data.i10_index || 0,
          i10_index_since: data.i10_index_since || 0,
          google_scholar_url: data.google_scholar_url || "",
          scopus_url: data.scopus_url || "",
          orcid_url: data.orcid_url || "",
          researchgate_url: data.researchgate_url || "",
          sinta_id: data.sinta_id || "",
          sinta_url: data.sinta_url || "",
          publons_url: data.publons_url || "",
          semantic_scholar_url: data.semantic_scholar_url || "",
          research_interests: data.research_interests || [],
        });
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = createClient();
    const payload = {
      total_citations: metrics.total_citations,
      total_citations_since: metrics.total_citations_since,
      citations_since_year: metrics.citations_since_year,
      h_index: metrics.h_index,
      h_index_since: metrics.h_index_since,
      i10_index: metrics.i10_index,
      i10_index_since: metrics.i10_index_since,
      google_scholar_url: metrics.google_scholar_url || null,
      scopus_url: metrics.scopus_url || null,
      orcid_url: metrics.orcid_url || null,
      researchgate_url: metrics.researchgate_url || null,
      sinta_id: metrics.sinta_id || null,
      sinta_url: metrics.sinta_url || null,
      publons_url: metrics.publons_url || null,
      semantic_scholar_url: metrics.semantic_scholar_url || null,
      research_interests: metrics.research_interests,
      updated_at: new Date().toISOString(),
    };

    if (metrics.id) {
      const { error: updErr } = await supabase
        .from("publication_metrics")
        .update(payload)
        .eq("id", metrics.id);
      if (updErr) {
        setError(updErr.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insErr } = await supabase
        .from("publication_metrics")
        .insert(payload)
        .select()
        .single();
      if (insErr) {
        setError(insErr.message);
        setSaving(false);
        return;
      }
      if (data) setMetrics({ ...metrics, id: data.id });
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addInterest = () => {
    if (!newInterest.trim()) return;
    if (metrics.research_interests.includes(newInterest.trim())) return;
    setMetrics({
      ...metrics,
      research_interests: [...metrics.research_interests, newInterest.trim()],
    });
    setNewInterest("");
  };

  const removeInterest = (i: string) => {
    setMetrics({
      ...metrics,
      research_interests: metrics.research_interests.filter((x) => x !== i),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publication Metrics</h1>
          <p className="text-neutral-400 mt-1">
            Update manual dari Google Scholar.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : saved ? "✅ Tersimpan!" : "Simpan"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {/* PREVIEW CARD */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Icons.Award className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold">Preview (tampilan publik)</h3>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="pb-3 text-neutral-400 font-medium"></th>
                <th className="pb-3 text-right text-neutral-300 font-medium">Semua</th>
                <th className="pb-3 text-right text-neutral-300 font-medium">
                  Sejak {metrics.citations_since_year}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              <tr>
                <td className="py-3 text-neutral-400">Kutipan</td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.total_citations}
                </td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.total_citations_since}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-neutral-400">indeks-h</td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.h_index}
                </td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.h_index_since}
                </td>
              </tr>
              <tr>
                <td className="py-3 text-neutral-400">indeks-i10</td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.i10_index}
                </td>
                <td className="py-3 text-right font-bold tabular-nums">
                  {metrics.i10_index_since}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* METRICS INPUTS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h3 className="font-semibold">Metrics Numbers</h3>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1.5 font-medium">Tahun "Sejak"</label>
            <input
              type="number"
              value={metrics.citations_since_year}
              onChange={(e) => setMetrics({ ...metrics, citations_since_year: parseInt(e.target.value) || 2020 })}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "total_citations", label: "Total Kutipan (Semua)" },
            { key: "total_citations_since", label: "Kutipan (Sejak)" },
            { key: "h_index", label: "h-index (Semua)" },
            { key: "h_index_since", label: "h-index (Sejak)" },
            { key: "i10_index", label: "i10-index (Semua)" },
            { key: "i10_index_since", label: "i10-index (Sejak)" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                {f.label}
              </label>
              <input
                type="number"
                min="0"
                value={(metrics as any)[f.key]}
                onChange={(e) =>
                  setMetrics({ ...metrics, [f.key]: parseInt(e.target.value) || 0 })
                }
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* PROFILE URLS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h3 className="font-semibold">Profile URLs</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { key: "google_scholar_url", label: "Google Scholar", placeholder: "https://scholar.google.com/citations?user=..." },
            { key: "scopus_url", label: "Scopus", placeholder: "https://scopus.com/..." },
            { key: "orcid_url", label: "ORCID", placeholder: "https://orcid.org/0000-..." },
            { key: "researchgate_url", label: "ResearchGate", placeholder: "https://researchgate.net/profile/..." },
            { key: "sinta_id", label: "Sinta ID", placeholder: "12345678" },
            { key: "sinta_url", label: "Sinta URL", placeholder: "https://sinta.kemdikbud.go.id/..." },
            { key: "publons_url", label: "Publons", placeholder: "https://publons.com/..." },
            { key: "semantic_scholar_url", label: "Semantic Scholar", placeholder: "https://semanticscholar.org/..." },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-xs text-neutral-400 mb-1.5 font-medium">
                {f.label}
              </label>
              <input
                type={f.key === "sinta_id" ? "text" : "url"}
                value={(metrics as any)[f.key]}
                onChange={(e) =>
                  setMetrics({ ...metrics, [f.key]: e.target.value })
                }
                placeholder={f.placeholder}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
              />
            </div>
          ))}
        </div>
      </div>

      {/* RESEARCH INTERESTS */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
        <h3 className="font-semibold">Research Interests</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addInterest();
              }
            }}
            placeholder="Ketik + Enter (misal: Machine Learning)"
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none transition"
          />
          <button
            type="button"
            onClick={addInterest}
            disabled={!newInterest.trim()}
            className="rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
          >
            Tambah
          </button>
        </div>

        {metrics.research_interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {metrics.research_interests.map((i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-xs text-violet-300"
              >
                {i}
                <button type="button" onClick={() => removeInterest(i)}
                  className="text-violet-400 hover:text-white transition">
                  <Icons.Close className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
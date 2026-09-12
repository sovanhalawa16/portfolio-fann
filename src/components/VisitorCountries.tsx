"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type CountryStat = {
  country_code: string;
  country_name: string;
  visits: number;
};

export default function VisitorCountries() {
  const [stats, setStats] = useState<CountryStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("site_visits")
        .select("country_code, country_name")
        .limit(10000);

      if (error || !data) {
        setLoading(false);
        return;
      }

      const map = new Map<string, { name: string; visits: number }>();
      data.forEach((row) => {
        const code = row.country_code || "XX";
        const name = row.country_name || code;
        const existing = map.get(code);
        if (existing) {
          existing.visits++;
        } else {
          map.set(code, { name, visits: 1 });
        }
      });

      const sorted = Array.from(map.entries())
        .map(([code, { name, visits }]) => ({
          country_code: code,
          country_name: name,
          visits,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 6);

      setStats(sorted);
      setTotal(data.length);
      setLoading(false);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-xs text-neutral-600">
        <div className="inline-block h-4 w-4 border-2 border-neutral-800 border-t-violet-500 rounded-full animate-spin mr-2" />
        Memuat data pengunjung...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 p-8 text-center">
        <div className="text-xs text-neutral-600">
          Belum ada data pengunjung.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm md:text-base font-bold tracking-tight">
              Visitors by Country
            </h3>
            <p className="text-[10px] md:text-xs text-neutral-500 mt-0.5">
              Dari mana aja yang mampir
            </p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="text-lg md:text-xl font-bold tabular-nums leading-none">
            {total.toLocaleString("id-ID")}
          </div>
          <div className="text-[10px] text-neutral-500 mt-1">total kunjungan</div>
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {stats.map((stat) => {
          const percent = total > 0 ? (stat.visits / total) * 100 : 0;
          const hasFlag =
            stat.country_code &&
            stat.country_code.length === 2 &&
            stat.country_code !== "XX";

          return (
            <div key={stat.country_code} className="group">
              <div className="flex items-center gap-3 mb-1.5">
                {/* FLAG */}
                <div className="shrink-0 w-5 h-5 rounded overflow-hidden bg-neutral-950 border border-neutral-800 flex items-center justify-center">
                  {hasFlag ? (
                    <img
                      src={`https://flagcdn.com/w40/${stat.country_code.toLowerCase()}.png`}
                      alt={stat.country_name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-3 h-3 text-neutral-500"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  )}
                </div>

                {/* NAME */}
                <span className="flex-1 min-w-0 text-xs md:text-sm text-neutral-300 truncate">
                  {stat.country_name}
                </span>

                {/* COUNT */}
                <span className="shrink-0 text-xs md:text-sm font-semibold tabular-nums text-neutral-400">
                  {stat.visits.toLocaleString("id-ID")}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="h-1 rounded-full bg-neutral-800/60 overflow-hidden ml-8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-700 ease-out"
                  style={{ width: `${Math.max(percent, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
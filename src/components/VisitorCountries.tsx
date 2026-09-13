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
        if (existing) existing.visits++;
        else map.set(code, { name, visits: 1 });
      });

      const sorted = Array.from(map.entries())
        .map(([code, { name, visits }]) => ({
          country_code: code,
          country_name: name,
          visits,
        }))
        .sort((a, b) => b.visits - a.visits)
        .slice(0, 5);

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
      <div className="flex items-center gap-2 text-xs text-neutral-600">
        <div className="inline-block h-3 w-3 border-2 border-neutral-800 border-t-violet-500 rounded-full animate-spin" />
        Memuat...
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="text-xs text-neutral-600">
        Belum ada data pengunjung.
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-3">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 text-violet-400 shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          Visitors
        </span>
        <span className="text-[10px] text-neutral-600 tabular-nums">
          ({total.toLocaleString("id-ID")})
        </span>
      </div>

      {/* LIST */}
      <ul className="space-y-1.5">
        {stats.map((stat) => {
          const hasFlag =
            stat.country_code &&
            stat.country_code.length === 2 &&
            stat.country_code !== "XX";

          return (
            <li
              key={stat.country_code}
              className="flex items-center gap-2 text-xs"
            >
              <span className="shrink-0 w-4 h-3 rounded-sm overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                {hasFlag ? (
                  <img
                    src={`https://flagcdn.com/w40/${stat.country_code.toLowerCase()}.png`}
                    alt={stat.country_name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="w-2 h-2 text-neutral-500"
                  >
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
              </span>
              <span className="flex-1 min-w-0 text-neutral-400 truncate">
                {stat.country_name}
              </span>
              <span className="shrink-0 text-neutral-500 tabular-nums font-medium">
                {stat.visits.toLocaleString("id-ID")}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
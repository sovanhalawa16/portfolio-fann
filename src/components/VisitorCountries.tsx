"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type CountryStat = {
  country_code: string;
  country_name: string;
  visits: number;
};

// Kode negara → emoji bendera
function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2 || countryCode === "XX") {
    return "🌐";
  }
  return countryCode
    .toUpperCase()
    .replace(/./g, (char) =>
      String.fromCodePoint(127397 + char.charCodeAt(0))
    );
}

export default function VisitorCountries() {
  const [stats, setStats] = useState<CountryStat[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();

      // Ambil semua visits (limit 10K buat performa)
      const { data, error } = await supabase
        .from("site_visits")
        .select("country_code, country_name")
        .limit(10000);

      if (error || !data) {
        setLoading(false);
        return;
      }

      // Aggregate per negara
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

      // Sort by visits desc, ambil top 5
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

    // Refresh tiap 60 detik
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-xs text-neutral-600">
        Memuat data pengunjung...
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
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          🌍 Visitors by Country
        </span>
        <span className="text-[10px] text-neutral-600 tabular-nums">
          ({total.toLocaleString("id-ID")} total)
        </span>
      </div>

      <div className="space-y-1.5">
        {stats.map((stat) => (
          <div
            key={stat.country_code}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">
                {getFlagEmoji(stat.country_code)}
              </span>
              <span className="text-neutral-400 truncate">
                {stat.country_name}
              </span>
            </div>
            <span className="text-neutral-500 tabular-nums shrink-0">
              {stat.visits.toLocaleString("id-ID")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
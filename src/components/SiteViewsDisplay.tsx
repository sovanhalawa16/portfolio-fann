"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function SiteViewsDisplay() {
  const [display, setDisplay] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    const run = async () => {
      const { data } = await supabase
        .from("site_stats")
        .select("value")
        .eq("key", "total_views")
        .maybeSingle();

      const target = Number(data?.value || 0);
      setLoaded(true);

      // Animate dari 0 ke target
      if (!hasAnimated.current) {
        hasAnimated.current = true;
        const duration = 1200;
        const start = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(2, -10 * progress);
          setDisplay(Math.floor(eased * target));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      } else {
        setDisplay(target);
      }
    };

    run();
    const interval = setInterval(run, 60000); // refresh tiap 60s
    return () => clearInterval(interval);
  }, []);

  const format = (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString();

  return <>{loaded ? format(display) : "—"}</>;
}
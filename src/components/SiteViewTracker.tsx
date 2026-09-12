"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function SiteViewTracker() {
  useEffect(() => {
    const key = "site-view-counted";
    if (sessionStorage.getItem(key) === "true") return;

    const supabase = createClient();
    supabase
      .rpc("increment_site_views")
      .then(({ error }) => {
        if (!error) sessionStorage.setItem(key, "true");
      });
  }, []);

  return null;
}
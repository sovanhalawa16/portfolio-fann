"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function Footer() {
  const [authorName, setAuthorName] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchName = async () => {
      const supabase = createClient();

      const [settingsRes, profileRes] = await Promise.all([
        supabase
          .from("settings")
          .select("value")
          .eq("key", "author_name")
          .maybeSingle(),
        supabase
          .from("profile")
          .select("name")
          .limit(1)
          .maybeSingle(),
      ]);

      const name =
        profileRes.data?.name ||
        settingsRes.data?.value ||
        "Sovantri Putra Paskah Halawa";

      setAuthorName(name);
    };
    fetchName();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-800/60 mt-24">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <p className="text-center text-xs text-neutral-500">
          © {year}{" "}
          <span className="text-neutral-400 font-medium">
            {mounted && authorName
              ? authorName.toUpperCase()
              : "SOVANTRI PUTRA PASKAH HALAWA"}
          </span>
          . All rights reserved.
        </p>
      </div>
    </footer>
  );
}
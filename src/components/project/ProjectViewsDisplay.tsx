"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";

export default function ProjectViewsDisplay({
  projectId,
  initialViews = 0,
  className = "",
}: {
  projectId: number;
  initialViews?: number;
  className?: string;
}) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const supabase = createClient();
    const fetchViews = async () => {
      const { data } = await supabase
        .from("portfolio")
        .select("views")
        .eq("id", projectId)
        .maybeSingle();
      if (data?.views !== undefined && data.views !== null) {
        setViews(data.views);
      }
    };
    fetchViews();
  }, [projectId]);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <Icons.Eye className="w-3 h-3 shrink-0" />
      <span className="tabular-nums">
        {views.toLocaleString("id-ID")}
      </span>
    </span>
  );
}
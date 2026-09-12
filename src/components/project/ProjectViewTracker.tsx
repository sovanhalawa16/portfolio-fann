"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function ProjectViewTracker({ projectId }: { projectId: number }) {
  useEffect(() => {
    const key = `project-viewed-${projectId}`;
    if (sessionStorage.getItem(key) === "true") return;

    const supabase = createClient();
    supabase
      .rpc("increment_project_views", { project_id: projectId })
      .then(({ error }) => {
        if (!error) sessionStorage.setItem(key, "true");
      });
  }, [projectId]);

  return null;
}
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Props = {
  postId: number;
  initialViews: number;
};

export default function ViewCounter({ postId, initialViews }: Props) {
  const [views, setViews] = useState(initialViews);

  useEffect(() => {
    const supabase = createClient();

    // 1. Increment view +1 pas halaman dibuka (cuma sekali per session)
    const viewKey = `viewed-post-${postId}`;
    const alreadyViewed = sessionStorage.getItem(viewKey);

    const incrementView = async () => {
      if (!alreadyViewed) {
        // Update +1
        const { data } = await supabase
          .from("posts")
          .update({ views: initialViews + 1 })
          .eq("id", postId)
          .select("views")
          .single();

        if (data) setViews(data.views);
        sessionStorage.setItem(viewKey, "true");
      }
    };

    incrementView();

    // 2. Subscribe realtime - kalo ada view baru, update otomatis
    const channel = supabase
      .channel(`post-views-${postId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${postId}`,
        },
        (payload: any) => {
          if (payload.new?.views !== undefined) {
            setViews(payload.new.views);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, initialViews]);

  return (
    <span className="inline-flex items-center gap-1 text-neutral-500">
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {views.toLocaleString("id-ID")} views
    </span>
  );
}
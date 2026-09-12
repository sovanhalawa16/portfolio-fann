"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";

type Props = {
  showLabel?: boolean;
  className?: string;
};

export default function LiveVisitor({ showLabel = true, className = "" }: Props) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);

    const supabase = createClient();
    let isSubscribed = true;

    const channel = supabase.channel("online-visitors", {
      config: { presence: { key: "" } },
    });

    channel.on("presence", { event: "sync" }, () => {
      if (!isSubscribed) return;
      const state = channel.presenceState();
      const newCount = Object.keys(state).length;
      setCount((prev) => (prev !== newCount ? newCount : prev));
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED" && isSubscribed) {
        await channel.track({
          online_at: new Date().toISOString(),
        });
      }
    });

    channelRef.current = channel;

    return () => {
      isSubscribed = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Icons.Users className="w-3.5 h-3.5" />
      <span className="font-mono tabular-nums">
        {mounted ? count : "—"}
      </span>
      {showLabel && <span className="text-neutral-500">online</span>}
    </span>
  );
}
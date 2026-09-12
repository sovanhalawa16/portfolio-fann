"use client";

import { useEffect, useState } from "react";

type Media = {
  id: number;
  type: "image" | "video";
  url: string;
  caption: string | null;
};

type Props = {
  media: Media[];
  fallbackInitial: string;
};

export default function HeroMedia({ media, fallbackInitial }: Props) {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate tiap 5 detik — fade murni
  useEffect(() => {
    if (media.length <= 1) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % media.length);
    }, 5000);
    return () => clearInterval(id);
  }, [media.length]);

  const currentMedia = media[current];

  return (
    <div className="relative max-w-full">
      {/* GLOW — neutral, bukan ungu */}
      <div className="absolute inset-0 rounded-full bg-neutral-700/20 blur-2xl" />

      {/* MEDIA CIRCLE */}
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 lg:w-72 lg:h-72 rounded-full ring-4 ring-neutral-900 overflow-hidden bg-neutral-900 shadow-2xl shadow-black/40">
        {mounted && currentMedia ? (
          currentMedia.type === "video" ? (
            <video
              key={currentMedia.id}
              src={currentMedia.url}
              className="w-full h-full object-cover animate-fade-in"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              key={currentMedia.id}
              src={currentMedia.url}
              alt={currentMedia.caption || ""}
              className="w-full h-full object-cover animate-fade-in"
            />
          )
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-500 font-bold text-5xl sm:text-6xl md:text-7xl">
            {fallbackInitial}
          </div>
        )}

        {/* CAPTION */}
        {currentMedia?.caption && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[80%] rounded-full bg-black/60 backdrop-blur px-2.5 py-0.5 text-[10px] text-white/90 truncate">
            {currentMedia.caption}
          </div>
        )}
      </div>
    </div>
  );
}
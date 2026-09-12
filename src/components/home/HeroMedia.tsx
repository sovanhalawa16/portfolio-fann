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

type Slot = "front" | "middle" | "back" | "hidden";

// Konfigurasi posisi tiap slot di stack
const SLOT_STYLES: Record<
  Slot,
  {
    transform: string;
    opacity: number;
    zIndex: number;
    filter: string;
    boxShadow: string;
  }
> = {
  front: {
    transform: "translate3d(0, 0, 0) rotate(0deg) scale(1)",
    opacity: 1,
    zIndex: 30,
    filter: "brightness(1)",
    boxShadow: "0 25px 50px -12px rgba(139, 92, 246, 0.35)",
  },
  middle: {
    transform: "translate3d(10px, -10px, 0) rotate(2.5deg) scale(0.94)",
    opacity: 1,
    zIndex: 20,
    filter: "brightness(0.85)",
    boxShadow: "0 15px 30px -10px rgba(0, 0, 0, 0.5)",
  },
  back: {
    transform: "translate3d(-10px, -20px, 0) rotate(-3.5deg) scale(0.88)",
    opacity: 1,
    zIndex: 10,
    filter: "brightness(0.7)",
    boxShadow: "0 10px 20px -8px rgba(0, 0, 0, 0.4)",
  },
  hidden: {
    transform: "translate3d(-10px, -28px, 0) rotate(-3.5deg) scale(0.84)",
    opacity: 0,
    zIndex: 5,
    filter: "brightness(0.5)",
    boxShadow: "0 8px 16px -8px rgba(0, 0, 0, 0.3)",
  },
};

export default function HeroMedia({ media, fallbackInitial }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-rotate tiap 4.5 detik
  useEffect(() => {
    if (media.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % media.length);
    }, 4500);
    return () => clearInterval(id);
  }, [media.length]);

  // Fallback kalo belum mounted / gak ada media
  if (!mounted || media.length === 0) {
    return (
      <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[360px] mx-auto lg:mx-0">
        <div className="relative aspect-[4/5]">
          {/* Stack placeholder */}
          <div className="absolute inset-0 rounded-3xl bg-neutral-900 border border-neutral-800 transform translate3d(-10px, -20px, 0) rotate(-3.5deg) scale(0.88)" />
          <div className="absolute inset-0 rounded-3xl bg-neutral-900 border border-neutral-800 transform translate3d(10px, -10px, 0) rotate(2.5deg) scale(0.94)" />
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-7xl">
            {fallbackInitial}
          </div>
        </div>
      </div>
    );
  }

  // Hitung slot relatif ke currentIndex
  const getSlot = (mediaIndex: number): Slot => {
    const diff = (mediaIndex - currentIndex + media.length) % media.length;
    if (diff === 0) return "front";
    if (diff === 1) return "middle";
    if (diff === 2) return "back";
    return "hidden";
  };

  const goTo = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
  };

  return (
    <div className="relative w-full max-w-[240px] sm:max-w-[280px] lg:max-w-[360px] mx-auto lg:mx-0">
      {/* STACK CONTAINER */}
      <div className="relative aspect-[4/5]">
        {media.map((item, index) => {
          const slot = getSlot(index);
          const styles = SLOT_STYLES[slot];
          const isFront = slot === "front";

          return (
            <div
              key={item.id}
              className="absolute inset-0 rounded-3xl overflow-hidden border border-neutral-800 bg-neutral-950"
              style={{
                transform: styles.transform,
                opacity: styles.opacity,
                zIndex: styles.zIndex,
                filter: styles.filter,
                boxShadow: styles.boxShadow,
                transition:
                  "transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms cubic-bezier(0.16, 1, 0.3, 1), filter 700ms ease-out, box-shadow 700ms ease-out",
                willChange: "transform, opacity, filter",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: styles.transform,
              }}
            >
              {/* MEDIA */}
              {item.type === "video" ? (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.caption || ""}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}

              {/* DARK OVERLAY (buat non-front) */}
              <div
                className="absolute inset-0 bg-black"
                style={{
                  opacity: isFront ? 0 : 0.4,
                  transition: "opacity 700ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />

              {/* CAPTION (cuma di front) */}
              {item.caption && (
                <div
                  className="absolute bottom-3 left-3 right-3 rounded-xl bg-black/70 backdrop-blur-md px-3 py-2 text-[11px] text-white/90 truncate"
                  style={{
                    opacity: isFront ? 1 : 0,
                    transform: isFront
                      ? "translate3d(0, 0, 0)"
                      : "translate3d(0, 8px, 0)",
                    transition:
                      "opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {item.caption}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* DOTS INDICATOR */}
      {media.length > 1 && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-40">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Media ${i + 1}`}
              className={`h-1.5 rounded-full ${
                i === currentIndex
                  ? "w-6 bg-violet-400"
                  : "w-1.5 bg-neutral-700 hover:bg-neutral-500"
              }`}
              style={{
                transition:
                  "width 400ms cubic-bezier(0.16, 1, 0.3, 1), background-color 300ms ease",
                willChange: "width, background-color",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
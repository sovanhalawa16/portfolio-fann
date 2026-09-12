"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  value: number;
  className?: string;
};

export default function AnimatedProgress({ value, className = "" }: Props) {
  const [width, setWidth] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(value), 100);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  const getLevelColor = (lvl: number) => {
    if (lvl >= 80) return "bg-green-500";
    if (lvl >= 60) return "bg-yellow-500";
    if (lvl >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div ref={ref} className="h-1 rounded-full bg-neutral-800 overflow-hidden">
      <div
        className={`h-full rounded-full ${getLevelColor(value)} transition-all duration-1000 ease-out ${className}`}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const container = document.querySelector("[data-article-content]");
    if (!container) return;

    const els = Array.from(container.querySelectorAll("h2, h3"));
    const items: Heading[] = els.map((el, i) => {
      const text = el.textContent || "";
      const id =
        el.id ||
        text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
          .slice(0, 40) + `-${i}`;
      (el as HTMLElement).id = id;
      return {
        id,
        text,
        level: el.tagName === "H2" ? 2 : 3,
      };
    });

    setHeadings(items);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-100px 0px -70% 0px", threshold: 0 }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (headings.length === 0) return null;

  return (
    <nav className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-3 text-xs font-bold text-neutral-500 uppercase tracking-wider hover:text-white transition"
      >
        <span>Daftar Isi</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3.5 h-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul className="space-y-0.5 max-h-[60vh] overflow-y-auto pr-1">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 80;
                    window.scrollTo({ top: y, behavior: "smooth" });
                  }
                }}
                className={`block py-1.5 text-xs leading-snug border-l-2 transition-all ${
                  h.level === 3 ? "pl-6" : "pl-3"
                } ${
                  activeId === h.id
                    ? "border-violet-500 text-violet-300 font-medium"
                    : "border-neutral-800 text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
                }`}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
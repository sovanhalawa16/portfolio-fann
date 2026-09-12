"use client";

import { useState } from "react";
import {
  TECH_LIST,
  TECH_CATEGORIES,
  getTechLogo,
  type Tech,
  type TechCategory,
} from "@/lib/techStack";

type Props = {
  value: string[];
  onChange: (techs: string[]) => void;
};

export default function TechStackPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TechCategory | "All">("All");

  const toggleTech = (name: string) => {
    if (value.includes(name)) {
      onChange(value.filter((t) => t !== name));
    } else {
      onChange([...value, name]);
    }
  };

  const filtered = TECH_LIST.filter((tech) => {
    const matchSearch = tech.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || tech.category === activeCategory;
    return matchSearch && matchCategory;
  });

  // Group by category kalo lagi All, atau langsung list
  const grouped = filtered.reduce<Record<string, Tech[]>>((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = [];
    acc[tech.category].push(tech);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* SELECTED PREVIEW */}
      {value.length > 0 && (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-violet-300">
              Dipilih: {value.length}
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-neutral-400 hover:text-red-400 transition"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {value.map((techName) => {
              const tech = TECH_LIST.find((t) => t.name === techName);
              return (
                <span
                  key={techName}
                  className="inline-flex items-center gap-1.5 rounded-md bg-neutral-900 border border-neutral-800 px-2 py-1 text-xs"
                >
                  {tech && (
                    <img
                      src={getTechLogo(tech.slug, tech.color)}
                      alt={tech.name}
                      className="h-3.5 w-3.5"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  {techName}
                  <button
                    type="button"
                    onClick={() => toggleTech(techName)}
                    className="text-neutral-500 hover:text-red-400 transition"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari tech (misal: React)..."
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 pl-9 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* CATEGORY FILTER */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCategory("All")}
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
            activeCategory === "All"
              ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
              : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800"
          }`}
        >
          All
        </button>
        {TECH_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              activeCategory === cat
                ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800 hover:bg-neutral-800"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* TECH GRID */}
      <div className="max-h-96 overflow-y-auto rounded-lg border border-neutral-800 bg-neutral-950 p-3">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-sm text-neutral-500">
            Gak ada tech yang cocok dengan "{search}"
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([category, techs]) => (
              <div key={category}>
                <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                  {category}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {techs.map((tech) => {
                    const isSelected = value.includes(tech.name);
                    return (
                      <button
                        key={tech.name}
                        type="button"
                        onClick={() => toggleTech(tech.name)}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition ${
                          isSelected
                            ? "border-violet-500/50 bg-violet-500/10 text-violet-200"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700 hover:bg-neutral-900"
                        }`}
                      >
                        <img
                          src={getTechLogo(tech.slug, tech.color)}
                          alt={tech.name}
                          className="h-4 w-4 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.opacity = "0.3";
                          }}
                        />
                        <span className="truncate font-medium">{tech.name}</span>
                        {isSelected && (
                          <svg
                            className="ml-auto shrink-0 text-violet-400"
                            width="12"
                            height="12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <path d="M5 12l5 5L20 7" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        💡 Klik buat pilih/unpilih tech. Logo otomatis dari Simple Icons.
      </p>
    </div>
  );
}
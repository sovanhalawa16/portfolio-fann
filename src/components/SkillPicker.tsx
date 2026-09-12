"use client";

import { useState } from "react";
import {
  TECH_LIST,
  TECH_CATEGORIES,
  getTechLogo,
  type Tech,
  type TechCategory,
} from "@/lib/techStack";

export type Skill = {
  name: string;
  level: number; // 0-100
};

type Props = {
  value: Skill[];
  onChange: (skills: Skill[]) => void;
};

export default function SkillPicker({ value, onChange }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<TechCategory | "All">("All");
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  const selectedNames = value.map((s) => s.name);

  const toggleSkill = (tech: Tech) => {
    if (selectedNames.includes(tech.name)) {
      onChange(value.filter((s) => s.name !== tech.name));
    } else {
      onChange([...value, { name: tech.name, level: 80 }]);
      setEditingSkill(tech.name);
    }
  };

  const updateLevel = (name: string, level: number) => {
    onChange(
      value.map((s) => (s.name === name ? { ...s, level } : s))
    );
  };

  const removeSkill = (name: string) => {
    onChange(value.filter((s) => s.name !== name));
  };

  const getTechInfo = (name: string) => TECH_LIST.find((t) => t.name === name);

  const filtered = TECH_LIST.filter((tech) => {
    const matchSearch = tech.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      activeCategory === "All" || tech.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const grouped = filtered.reduce<Record<string, Tech[]>>((acc, tech) => {
    if (!acc[tech.category]) acc[tech.category] = [];
    acc[tech.category].push(tech);
    return acc;
  }, {});

  const getLevelColor = (level: number) => {
    if (level >= 80) return "text-green-400";
    if (level >= 60) return "text-yellow-400";
    if (level >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getLevelBar = (level: number) => {
    if (level >= 80) return "bg-green-500";
    if (level >= 60) return "bg-yellow-500";
    if (level >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      {/* SELECTED SKILLS WITH SLIDERS */}
      {value.length > 0 && (
        <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-violet-300">
              {value.length} skill dipilih
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-xs text-neutral-400 hover:text-red-400 transition"
            >
              Clear all
            </button>
          </div>

          <div className="space-y-3">
            {value.map((skill) => {
              const tech = getTechInfo(skill.name);
              return (
                <div
                  key={skill.name}
                  className="rounded-lg border border-neutral-800 bg-neutral-950 p-3"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {tech && (
                      <img
                        src={getTechLogo(tech.slug, tech.color)}
                        alt={tech.name}
                        className="h-5 w-5"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.opacity = "0.3";
                        }}
                      />
                    )}
                    <span className="text-sm font-medium flex-1">
                      {skill.name}
                    </span>
                    <span
                      className={`text-xs font-bold ${getLevelColor(
                        skill.level
                      )}`}
                    >
                      {skill.level}%
                    </span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.name)}
                      className="text-neutral-500 hover:text-red-400 transition"
                    >
                      ×
                    </button>
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${getLevelBar(skill.level)} transition-all`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>

                  {/* SLIDER */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={skill.level}
                    onChange={(e) =>
                      updateLevel(skill.name, parseInt(e.target.value))
                    }
                    className="w-full accent-violet-500 cursor-pointer"
                  />
                </div>
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
          placeholder="Cari skill (misal: React)..."
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
            Gak ada skill yang cocok dengan "{search}"
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
                    const isSelected = selectedNames.includes(tech.name);
                    return (
                      <button
                        key={tech.name}
                        type="button"
                        onClick={() => toggleSkill(tech)}
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
        💡 Klik buat pilih. Atur persentase penguasaan pake slider.
      </p>
    </div>
  );
}
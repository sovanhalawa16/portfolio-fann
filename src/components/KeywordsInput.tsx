"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";

type Props = {
  value: string[];
  onChange: (keywords: string[]) => void;
  label?: string;
  placeholder?: string;
};

export default function KeywordsInput({
  value,
  onChange,
  label = "Keywords",
  placeholder = "Ketik + Enter (misal: Next.js)",
}: Props) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = input.trim();
      if (val && !value.includes(val)) {
        onChange([...value, val]);
      }
      setInput("");
    }
  };

  const handleRemove = (keyword: string) => {
    onChange(value.filter((k) => k !== keyword));
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((kw) => (
            <span
              key={kw}
              className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300"
            >
              {kw}
              <button
                type="button"
                onClick={() => handleRemove(kw)}
                className="text-violet-400 hover:text-white transition"
              >
                <Icons.Close className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <p className="text-[10px] text-neutral-600">
        Tekan Enter atau koma buat nambah.
      </p>
    </div>
  );
}
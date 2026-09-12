"use client";

import { useState } from "react";
import { Icons } from "@/lib/icons";

export type Author = {
  name: string;
  affiliation: string;
  is_me: boolean;
};

type Props = {
  value: Author[];
  onChange: (authors: Author[]) => void;
};

export default function AuthorsInput({ value, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [newAffil, setNewAffil] = useState("");
  const [newIsMe, setNewIsMe] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onChange([
      ...value,
      {
        name: newName.trim(),
        affiliation: newAffil.trim(),
        is_me: newIsMe,
      },
    ]);
    setNewName("");
    setNewAffil("");
    setNewIsMe(false);
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newAuthors = [...value];
    [newAuthors[index - 1], newAuthors[index]] = [
      newAuthors[index],
      newAuthors[index - 1],
    ];
    onChange(newAuthors);
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const newAuthors = [...value];
    [newAuthors[index + 1], newAuthors[index]] = [
      newAuthors[index],
      newAuthors[index + 1],
    ];
    onChange(newAuthors);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* LIST AUTHORS */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((author, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-lg border p-3 transition ${
                author.is_me
                  ? "border-violet-500/40 bg-violet-500/5"
                  : "border-neutral-800 bg-neutral-900/40"
              }`}
            >
              {/* NUMBER */}
              <div className="shrink-0 w-6 h-6 rounded-md bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                {i + 1}
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-medium ${
                      author.is_me ? "text-violet-300" : "text-neutral-200"
                    }`}
                  >
                    {author.name}
                  </span>
                  {author.is_me && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 px-2 py-0.5 text-[10px] font-bold">
                      ⭐ Ini saya
                    </span>
                  )}
                </div>
                {author.affiliation && (
                  <div className="text-xs text-neutral-500 mt-0.5 truncate">
                    {author.affiliation}
                  </div>
                )}
              </div>

              {/* ACTIONS */}
              <div className="shrink-0 flex gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30"
                  title="Naikkan"
                >
                  <Icons.ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(i)}
                  disabled={i === value.length - 1}
                  className="rounded-lg p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 transition disabled:opacity-30"
                  title="Turunkan"
                >
                  <Icons.ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Hapus"
                >
                  <Icons.Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD NEW */}
      <div className="rounded-lg border border-dashed border-neutral-800 p-3 space-y-2">
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nama author"
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
          <input
            type="text"
            value={newAffil}
            onChange={(e) => setNewAffil(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Afiliasi (opsional)"
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <Icons.Plus className="w-3.5 h-3.5" />
            Tambah
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={newIsMe}
            onChange={(e) => setNewIsMe(e.target.checked)}
            className="h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-950 text-violet-500 focus:ring-violet-500/20"
          />
          <span className="text-xs text-neutral-400">
            Ini saya (nama bakal di-highlight di public)
          </span>
        </label>

        <p className="text-[10px] text-neutral-600">
          💡 Tekan Enter di kolom nama buat cepat nambah.
        </p>
      </div>
    </div>
  );
}
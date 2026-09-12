"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Tag = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  post_count?: number;
};

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const fetchTags = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: tagData } = await supabase.from("tags").select("*").order("name");

    if (tagData) {
      const tagsWithCount = await Promise.all(
        tagData.map(async (tag) => {
          const { count } = await supabase
            .from("post_tags")
            .select("*", { count: "exact", head: true })
            .eq("tag_id", tag.id);
          return { ...tag, post_count: count || 0 };
        })
      );
      setTags(tagsWithCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama tag wajib diisi!");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("tags").insert({
      name: name.trim(),
      slug: generateSlug(name),
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setName("");
    await fetchTags();
    setSaving(false);
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("tags")
      .update({ name: editingName.trim(), slug: generateSlug(editingName) })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
      return;
    }

    setEditingId(null);
    setEditingName("");
    fetchTags();
  };

  const handleDelete = async (id: number, tagName: string, postCount: number) => {
    if (postCount > 0) {
      if (
        !confirm(
          `Tag "${tagName}" dipake di ${postCount} artikel. Lanjut hapus? (relasi ke artikel bakal kehapus)`
        )
      )
        return;
    } else {
      if (!confirm(`Hapus tag "${tagName}"?`)) return;
    }

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("tags").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setTags(tags.filter((t) => t.id !== id));
    }
    setDeletingId(null);
  };

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tags</h1>
        <p className="text-neutral-400 mt-1">
          Kelola tag artikel blog lo.
        </p>
      </div>

      {/* ADD FORM */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3"
      >
        <h3 className="font-semibold">Tambah Tag Baru</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama tag (misal: React)"
            className="flex-1 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
          >
            {saving ? "Menyimpan..." : "+ Tambah"}
          </button>
        </div>

        {name && (
          <p className="text-xs text-neutral-500">
            Slug otomatis: <code className="bg-neutral-900 px-1.5 py-0.5 rounded">{generateSlug(name)}</code>
          </p>
        )}

        {error && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
            ❌ {error}
          </div>
        )}
      </form>

      {/* SEARCH */}
      {tags.length > 0 && (
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            width="16"
            height="16"
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
            placeholder="Cari tag..."
            className="w-full rounded-lg border border-neutral-800 bg-neutral-900/40 pl-10 pr-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
      )}

      {/* TAGS - CHIP GRID */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
        {loading ? (
          <div className="py-8 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : filteredTags.length === 0 ? (
          <div className="py-12 text-center">
            <div className="text-5xl mb-4">🏷️</div>
            <p className="text-sm text-neutral-400">
              {search ? "Tag gak ketemu." : "Belum ada tag."}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <div
                key={tag.id}
                className="group inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 pl-3 pr-1 py-1.5 text-sm hover:border-neutral-700 transition"
              >
                {editingId === tag.id ? (
                  <>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(tag.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      autoFocus
                      className="w-24 bg-transparent focus:outline-none text-sm"
                    />
                    <button
                      onClick={() => handleUpdate(tag.id)}
                      className="text-green-400 hover:text-green-300 text-xs px-1"
                    >
                      ✓
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-neutral-300">#{tag.name}</span>
                    <span className="text-[10px] text-neutral-500 bg-neutral-900 px-1.5 py-0.5 rounded">
                      {tag.post_count}
                    </span>
                    <div className="flex opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setEditingId(tag.id);
                          setEditingName(tag.name);
                        }}
                        className="text-neutral-500 hover:text-blue-400 px-1"
                        title="Edit"
                      >
                        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name, tag.post_count || 0)}
                        disabled={deletingId === tag.id}
                        className="text-neutral-500 hover:text-red-400 px-1 disabled:opacity-50"
                        title="Hapus"
                      >
                        {deletingId === tag.id ? (
                          <div className="h-2.5 w-2.5 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Total: {tags.length} tag • {filteredTags.length} ditampilkan
      </p>
    </div>
  );
}
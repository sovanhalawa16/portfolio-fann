"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Category = {
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

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    const supabase = createClient();

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (cats) {
      // Hitung jumlah post per kategori
      const catsWithCount = await Promise.all(
        cats.map(async (cat) => {
          const { count } = await supabase
            .from("posts")
            .select("*", { count: "exact", head: true })
            .eq("category_id", cat.id);
          return { ...cat, post_count: count || 0 };
        })
      );
      setCategories(catsWithCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama kategori wajib diisi!");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("categories").insert({
      name: name.trim(),
      slug: generateSlug(name),
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setName("");
    await fetchCategories();
    setSaving(false);
  };

  const handleUpdate = async (id: number) => {
    if (!editingName.trim()) return;

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: editingName.trim(), slug: generateSlug(editingName) })
      .eq("id", id);

    if (error) {
      alert("Gagal update: " + error.message);
      return;
    }

    setEditingId(null);
    setEditingName("");
    fetchCategories();
  };

  const handleDelete = async (id: number, name: string, postCount: number) => {
    if (postCount > 0) {
      if (
        !confirm(
          `Kategori "${name}" dipake di ${postCount} artikel. Artikel-artikel itu bakal jadi tanpa kategori. Lanjut hapus?`
        )
      )
        return;
    } else {
      if (!confirm(`Hapus kategori "${name}"?`)) return;
    }

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setCategories(categories.filter((c) => c.id !== id));
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <p className="text-neutral-400 mt-1">
          Kelola kategori artikel blog lo.
        </p>
      </div>

      {/* ADD FORM */}
      <form
        onSubmit={handleAdd}
        className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-3"
      >
        <h3 className="font-semibold">Tambah Kategori Baru</h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kategori (misal: Tutorial)"
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

      {/* LIST */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">📁</div>
            <p className="text-sm text-neutral-400">Belum ada kategori.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 p-4 hover:bg-neutral-900/40 transition"
              >
                <div className="h-9 w-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-sm shrink-0">
                  📁
                </div>

                {editingId === cat.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleUpdate(cat.id);
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      autoFocus
                      className="flex-1 rounded-lg border border-violet-500/50 bg-neutral-950 px-3 py-1.5 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="rounded-lg bg-green-500/20 text-green-400 px-3 py-1.5 text-xs font-medium hover:bg-green-500/30"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditingName("");
                      }}
                      className="rounded-lg border border-neutral-800 px-3 py-1.5 text-xs hover:bg-neutral-900"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{cat.name}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">
                        /{cat.slug} • {cat.post_count} artikel
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditingName(cat.name);
                      }}
                      className="rounded-lg p-2 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                      title="Edit"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name, cat.post_count || 0)}
                      disabled={deletingId === cat.id}
                      className="rounded-lg p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                      title="Hapus"
                    >
                      {deletingId === cat.id ? (
                        <div className="h-3.5 w-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                      ) : (
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        </svg>
                      )}
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Total: {categories.length} kategori
      </p>
    </div>
  );
}
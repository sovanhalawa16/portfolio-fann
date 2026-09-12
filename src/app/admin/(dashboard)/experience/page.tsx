"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Experience = {
  id: number;
  type: "work" | "education";
  title: string;
  company: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  sort_order: number;
};

type FormData = {
  title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  sort_order: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  company: "",
  location: "",
  start_date: "",
  end_date: "",
  description: "",
  sort_order: "0",
};

export default function ExperiencePage() {
  const [tab, setTab] = useState<"work" | "education">("work");
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);

  const fetchItems = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error: fetchError } = await supabase
      .from("experiences")
      .select("*")
      .eq("type", tab)
      .order("sort_order", { ascending: true })
      .order("start_date", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // Reset form kalo ganti tab
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }, [tab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Judul wajib diisi!");
      return;
    }

    setSaving(true);
    const supabase = createClient();

    const payload = {
      type: tab,
      title: form.title.trim(),
      company: form.company.trim() || null,
      location: form.location.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description.trim() || null,
      sort_order: parseInt(form.sort_order) || 0,
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from("experiences")
        .update(payload)
        .eq("id", editingId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("experiences")
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
    }

    setSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    await fetchItems();
  };

  const handleEdit = (item: Experience) => {
    setForm({
      title: item.title || "",
      company: item.company || "",
      location: item.location || "",
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      description: item.description || "",
      sort_order: item.sort_order?.toString() || "0",
    });
    setEditingId(item.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Hapus "${title}"?`)) return;

    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("experiences").delete().eq("id", id);

    if (error) {
      alert("Gagal hapus: " + error.message);
    } else {
      setItems(items.filter((i) => i.id !== id));
    }
    setDeletingId(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("id-ID", {
      month: "short",
      year: "numeric",
    });
  };

  const formatPeriod = (item: Experience) => {
    const start = formatDate(item.start_date);
    const end = item.end_date ? formatDate(item.end_date) : "Sekarang";
    if (!start) return end;
    return `${start} — ${end}`;
  };

  const isWork = tab === "work";

  return (
    <div className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-neutral-400 mt-1">
            Pengalaman kerja & pendidikan yang muncul di halaman About.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(EMPTY_FORM);
            }}
            className="rounded-lg bg-white text-neutral-950 px-4 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition"
          >
            + Tambah
          </button>
        )}
      </div>

      {/* TABS */}
      <div className="flex gap-2 border-b border-neutral-800">
        <button
          onClick={() => setTab("work")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
            tab === "work"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          💼 Pengalaman Kerja
        </button>
        <button
          onClick={() => setTab("education")}
          className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
            tab === "education"
              ? "border-violet-500 text-violet-300"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          🎓 Pendidikan
        </button>
      </div>

      {/* FORM */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {editingId
                ? `Edit ${isWork ? "Pengalaman" : "Pendidikan"}`
                : `Tambah ${isWork ? "Pengalaman" : "Pendidikan"} Baru`}
            </h3>
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs text-neutral-400 hover:text-white"
            >
              ✕ Batal
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                {isWork ? "Posisi / Jabatan *" : "Gelar / Jurusan *"}
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={isWork ? "Full-stack Developer" : "S1 Teknik Informatika"}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                {isWork ? "Perusahaan" : "Institusi / Universitas"}
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder={isWork ? "PT Teknologi Maju" : "Universitas Indonesia"}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Lokasi
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Jakarta, Indonesia"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Tanggal Selesai{" "}
                <span className="text-neutral-600">(kosongin kalo masih aktif)</span>
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                placeholder={
                  isWork
                    ? "Tanggung jawab, achievement, teknologi yang dipake..."
                    : "Fokus studi, prestasi, IPK..."
                }
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                Urutan (kecil duluan)
              </label>
              <input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-xs text-red-400">
              ❌ {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
            >
              {saving ? "Menyimpan..." : editingId ? "Update" : "Simpan"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-neutral-800 px-5 py-2.5 text-sm font-medium hover:bg-neutral-900 transition"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* LIST */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-neutral-500">
            <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">{isWork ? "💼" : "🎓"}</div>
            <h3 className="text-lg font-semibold mb-2">
              Belum ada {isWork ? "pengalaman kerja" : "pendidikan"}
            </h3>
            <p className="text-sm text-neutral-400 mb-6">
              Tambah {isWork ? "pengalaman" : "riwayat pendidikan"} pertama lo!
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-block rounded-lg bg-white text-neutral-950 px-4 py-2 text-sm font-semibold hover:bg-neutral-200 transition"
            >
              + Tambah
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-800/60">
            {items.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-neutral-900/60 transition group"
              >
                <div className="flex gap-4">
                  <div className="shrink-0 h-10 w-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                    {isWork ? "💼" : "🎓"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-semibold leading-tight">{item.title}</h3>
                      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleEdit(item)}
                          className="rounded-lg p-1.5 text-neutral-500 hover:text-blue-400 hover:bg-blue-500/10 transition"
                          title="Edit"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={deletingId === item.id}
                          className="rounded-lg p-1.5 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition disabled:opacity-50"
                          title="Hapus"
                        >
                          {deletingId === item.id ? (
                            <div className="h-3 w-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                          ) : (
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-sm text-neutral-400 mb-2">
                      {item.company && (
                        <span className="font-medium text-neutral-300">
                          {item.company}
                        </span>
                      )}
                      {item.company && item.location && (
                        <span className="text-neutral-600"> • </span>
                      )}
                      {item.location && <span>{item.location}</span>}
                    </div>

                    <div className="text-xs text-neutral-500 mb-2">
                      📅 {formatPeriod(item)}
                    </div>

                    {item.description && (
                      <p className="text-sm text-neutral-400 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && items.length > 0 && (
        <p className="text-xs text-neutral-500 text-center">
          Total: {items.length} {isWork ? "pengalaman" : "pendidikan"}
        </p>
      )}
    </div>
  );
}
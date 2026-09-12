"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type SettingKey = 
  | "site_title"
  | "site_description"
  | "site_keywords"
  | "author_name"
  | "contact_email"
  | "maintenance_mode"
  | "analytics_id"
  | "og_image"
  | "footer_text"
  | "online_status"
  | "online_status_text";

type Settings = Record<SettingKey, string>;

const DEFAULT_SETTINGS: Settings = {
  site_title: "",
  site_description: "",
  site_keywords: "",
  author_name: "",
  contact_email: "",
  maintenance_mode: "false",
  analytics_id: "",
  og_image: "",
  footer_text: "",
  online_status: "online",
  online_status_text: "",
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchSettings = async () => {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("settings")
        .select("key, value");

      if (fetchError) {
        setError(fetchError.message);
        setLoading(false);
        return;
      }

      const loaded: Settings = { ...DEFAULT_SETTINGS };
      (data || []).forEach((row) => {
        if (row.key in loaded) {
          loaded[row.key as SettingKey] = row.value || "";
        }
      });
      setSettings(loaded);
      setLoading(false);
    };

    fetchSettings();
  }, []);

  const handleChange = (key: SettingKey, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    const supabase = createClient();

    const payload = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("settings")
      .upsert(payload, { onConflict: "key" });

    if (upsertError) {
      setError(upsertError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 border-2 border-neutral-700 border-t-violet-500 rounded-full animate-spin" />
          <p className="mt-4 text-sm text-neutral-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  const isMaintenance = settings.maintenance_mode === "true";

  // Preview status config
const statusConfig = {
  online: { dot: "bg-green-500", label: "Online", color: "text-green-400" },
  busy: { dot: "bg-red-500", label: "Busy", color: "text-red-400" },
  away: { dot: "bg-yellow-500", label: "Away", color: "text-yellow-400" },
  offline: { dot: "bg-neutral-500", label: "Offline", color: "text-neutral-400" },
};

const statusPreview =
  statusConfig[settings.online_status as keyof typeof statusConfig] ||
  statusConfig.online;

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-neutral-400 mt-1">
            Konfigurasi global website lo.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-white text-neutral-950 px-5 py-2.5 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {saving ? "Menyimpan..." : saved ? "✅ Tersimpan!" : "Simpan"}
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
          ❌ {error}
        </div>
      )}

      {saved && (
        <div className="rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400">
          ✅ Settings berhasil disimpan!
        </div>
      )}

      <div className="space-y-6">
        {/* GENERAL */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌐</span>
            <h3 className="font-semibold">General</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Title
            </label>
            <input
              type="text"
              value={settings.site_title}
              onChange={(e) => handleChange("site_title", e.target.value)}
              placeholder="Fann — Developer & Writer"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Muncul di tab browser & hasil pencarian Google.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Site Description
            </label>
            <textarea
              value={settings.site_description}
              onChange={(e) => handleChange("site_description", e.target.value)}
              rows={3}
              placeholder="Blog pribadi dan portofolio saya. Menulis tentang kode, produk, dan kehidupan."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Muncul di preview saat di-share ke sosial media (max ~160 karakter).
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Keywords (SEO)
            </label>
            <input
              type="text"
              value={settings.site_keywords}
              onChange={(e) => handleChange("site_keywords", e.target.value)}
              placeholder="developer, writer, react, nextjs, indonesia"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Pisahkan pake koma.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Author Name
              </label>
              <input
                type="text"
                value={settings.author_name}
                onChange={(e) => handleChange("author_name", e.target.value)}
                placeholder="Fann"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange("contact_email", e.target.value)}
                placeholder="hello@example.com"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Footer Text
            </label>
            <input
              type="text"
              value={settings.footer_text}
              onChange={(e) => handleChange("footer_text", e.target.value)}
              placeholder="Dibuat dengan ❤️ dan kopi."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
          </div>
        </div>

        {/* ONLINE STATUS */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🟢</span>
            <h3 className="font-semibold">Status Online</h3>
          </div>

          <p className="text-xs text-neutral-500">
            Muncul di sidebar public, di bawah nama profile lo.
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              value={settings.online_status}
              onChange={(e) => handleChange("online_status", e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            >
              <option value="online">🟢 Online</option>
              <option value="busy">🔴 Busy</option>
              <option value="away">🟡 Away</option>
              <option value="offline">⚫ Offline</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Custom Text <span className="text-neutral-500">(opsional)</span>
            </label>
            <input
              type="text"
              value={settings.online_status_text}
              onChange={(e) =>
                handleChange("online_status_text", e.target.value)
              }
              placeholder="Misal: 1 menit yang lalu / Lagi ngopi ☕"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Kosongin aja kalo mau pake default (Online / Busy / Away / Offline).
            </p>
          </div>

          {/* PREVIEW */}
          <div className="pt-2 border-t border-neutral-800/60">
            <div className="text-xs font-medium text-neutral-500 mb-2.5">
              Preview:
            </div>
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                settings.online_status === "online"
                  ? "border-green-500/20 bg-green-500/5"
                  : settings.online_status === "busy"
                  ? "border-red-500/20 bg-red-500/5"
                  : settings.online_status === "away"
                  ? "border-yellow-500/20 bg-yellow-500/5"
                  : "border-neutral-800 bg-neutral-900/50"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${statusPreview.dot}`}
              />
              <span
                className={`text-[10px] font-medium ${statusPreview.color}`}
              >
                {settings.online_status_text?.trim() || statusPreview.label}
              </span>
            </div>
          </div>
        </div>

        {/* SEO & ANALYTICS */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📊</span>
            <h3 className="font-semibold">SEO & Analytics</h3>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              value={settings.analytics_id}
              onChange={(e) => handleChange("analytics_id", e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Kosongin kalau belum pake Google Analytics.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Default OG Image URL
            </label>
            <input
              type="url"
              value={settings.og_image}
              onChange={(e) => handleChange("og_image", e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
            />
            <p className="text-xs text-neutral-500 mt-1.5">
              Gambar default kalo ada yang share website lo ke sosmed.
            </p>
          </div>
        </div>

        {/* MAINTENANCE MODE */}
        <div
          className={`rounded-2xl border p-6 transition ${
            isMaintenance
              ? "border-yellow-500/30 bg-yellow-500/5"
              : "border-neutral-800 bg-neutral-900/40"
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🚧</span>
            <h3 className="font-semibold">Maintenance Mode</h3>
          </div>

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isMaintenance}
              onChange={(e) =>
                handleChange(
                  "maintenance_mode",
                  e.target.checked ? "true" : "false"
                )
              }
              className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-950 text-yellow-500 focus:ring-yellow-500/20"
            />
            <div>
              <div className="text-sm font-medium">
                Aktifkan Maintenance Mode
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Kalo aktif, website publik bakal nampilin halaman "Under
                Maintenance". Pengunjung gak bisa akses blog & portfolio.
                (Admin panel tetep bisa diakses).
              </p>
            </div>
          </label>

          {isMaintenance && (
            <div className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-300">
              ⚠️ Website sedang dalam mode maintenance. Pengunjung bakal
              liat halaman "Coming Soon".
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
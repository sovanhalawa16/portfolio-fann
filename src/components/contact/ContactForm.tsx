"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Icons } from "@/lib/icons";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    // Validasi
    if (!form.name.trim() || !form.email.trim() || !form.body.trim()) {
      setError("Nama, email, dan pesan wajib diisi!");
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Format email gak valid!");
      setLoading(false);
      return;
    }

    if (form.body.trim().length < 10) {
      setError("Pesan terlalu pendek. Minimal 10 karakter.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    const { error: insertError } = await supabase.from("messages").insert({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      subject: form.subject.trim() || null,
      body: form.body.trim(),
      status: "unread",
    });

    if (insertError) {
      setError("Gagal kirim pesan. Coba lagi sebentar.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setForm({ name: "", email: "", subject: "", body: "" });
    setLoading(false);

    setTimeout(() => setSuccess(false), 6000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6 space-y-4"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
          <Icons.Send className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base md:text-lg font-bold tracking-tight">
            Kirim Pesan
          </h2>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            saya bakal balas secepatnya.
          </p>
        </div>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="rounded-lg border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
          <Icons.Check className="w-4 h-4 shrink-0" />
          Pesan berhasil dikirim! saya bakal balas secepatnya.
        </div>
      )}

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <Icons.Close className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* NAMA + EMAIL */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Nama <span className="text-violet-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama kamu"
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">
            Email <span className="text-violet-400">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
            required
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>
      </div>

      {/* SUBJECT */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Bahas apa nih? (opsional)"
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
        />
      </div>

      {/* MESSAGE */}
      <div>
        <label className="block text-xs font-medium text-neutral-400 mb-1.5">
          Pesan <span className="text-violet-400">*</span>
        </label>
        <textarea
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Tulis pesan kamu di sini..."
          rows={6}
          required
          className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm placeholder:text-neutral-600 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none leading-relaxed"
        />
        <div className="flex justify-between items-center mt-1.5">
          <span className="text-[10px] text-neutral-600">
            Minimal 10 karakter
          </span>
          <span className="text-[10px] text-neutral-600 tabular-nums">
            {form.body.length} karakter
          </span>
        </div>
      </div>

      {/* SUBMIT */}
      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white text-neutral-950 px-5 py-3 text-sm font-semibold hover:bg-neutral-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="h-3.5 w-3.5 border-2 border-neutral-400/30 border-t-neutral-950 rounded-full animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Icons.Send className="w-4 h-4" />
            Kirim Pesan
          </>
        )}
      </button>

      <p className="text-[10px] text-neutral-600 text-center">
        Pesan lo aman & gak bakal disebar ke pihak lain.
      </p>
    </form>
  );
}
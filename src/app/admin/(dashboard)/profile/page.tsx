"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import ImageUploader from "@/components/ImageUploader";
import DocumentUploader from "@/components/DocumentUploader";
import SkillPicker, { type Skill } from "@/components/SkillPicker";

type SocialLinks = {
  github?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  website?: string;
};

const SOCIAL_FIELDS: { key: keyof SocialLinks; label: string; placeholder: string }[] = [
  { key: "github", label: "GitHub", placeholder: "https://github.com/username" },
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/username" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@username" },
  { key: "website", label: "Website Lain", placeholder: "https://example.com" },
];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [profileId, setProfileId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [taglines, setTaglines] = useState<string[]>([]);
  const [taglineInput, setTaglineInput] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLinks>({});
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("profile")
        .select("*")
        .order("id", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (data) {
        setProfileId(data.id);
        setName(data.name || "");
        setTaglines(data.taglines || []);
        setBio(data.bio || "");
        setPhoto(data.photo || "");
        setCvUrl(data.cv_url || "");
        setEmail(data.email || "");
        setLocation(data.location || "");
        setSocialLinks(data.social_links || {});
        setSkills(data.skills || []);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSocialChange = (key: keyof SocialLinks, value: string) => {
    setSocialLinks((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddTagline = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = taglineInput.trim();
      if (val && !taglines.includes(val)) {
        setTaglines([...taglines, val]);
      }
      setTaglineInput("");
    }
  };

  const handleRemoveTagline = (tagline: string) => {
    setTaglines(taglines.filter((t) => t !== tagline));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);

    if (!name.trim()) {
      setError("Nama wajib diisi!");
      setSaving(false);
      return;
    }

    const supabase = createClient();

    const cleanSocials: SocialLinks = {};
    Object.entries(socialLinks).forEach(([k, v]) => {
      if (v && v.trim()) cleanSocials[k as keyof SocialLinks] = v.trim();
    });

    const payload = {
      name: name.trim(),
      taglines: taglines,
      bio: bio.trim() || null,
      photo: photo || null,
      cv_url: cvUrl || null,
      email: email.trim() || null,
      location: location.trim() || null,
      social_links: cleanSocials,
      skills: skills,
      updated_at: new Date().toISOString(),
    };

    if (profileId) {
      const { error: updateError } = await supabase
        .from("profile")
        .update(payload)
        .eq("id", profileId);

      if (updateError) {
        setError(updateError.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("profile")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
        setSaving(false);
        return;
      }
      if (data) setProfileId(data.id);
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
          <p className="mt-4 text-sm text-neutral-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-neutral-400 mt-1">
            Data diri yang muncul di halaman About & Contact.
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
          ✅ Profile berhasil disimpan!
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* MAIN COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* BASIC INFO */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Info Dasar</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Nama Lengkap *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lo..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-base focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
            </div>

            {/* TAGLINES */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Tagline (bisa multiple)
              </label>
              <input
                type="text"
                value={taglineInput}
                onChange={(e) => setTaglineInput(e.target.value)}
                onKeyDown={handleAddTagline}
                placeholder="Ketik + Enter (misal: Full-stack Developer)"
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
              />
              <p className="text-xs text-neutral-500 mt-1.5">
                Tekan Enter atau koma buat nambah tagline baru.
              </p>

              {taglines.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {taglines.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-md bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 text-xs text-violet-300"
                    >
                      {t}
                      <button
                        type="button"
                        onClick={() => handleRemoveTagline(t)}
                        className="text-violet-400 hover:text-white transition"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={6}
                placeholder="Ceritain tentang diri lo..."
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition resize-none leading-relaxed"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Lokasi</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Jakarta, Indonesia"
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                />
              </div>
            </div>
          </div>

          {/* SKILLS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Skills</h3>
              <span className="text-xs text-neutral-500">
                Pilih skill + atur penguasaan
              </span>
            </div>
            <SkillPicker value={skills} onChange={setSkills} />
          </div>

          {/* SOCIAL LINKS */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4">
            <h3 className="font-semibold">Social Links</h3>
            <p className="text-xs text-neutral-500">
              Kosongin aja kalau gak punya.
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              {SOCIAL_FIELDS.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-medium mb-1.5 text-neutral-400">
                    {field.label}
                  </label>
                  <input
                    type="url"
                    value={socialLinks[field.key] || ""}
                    onChange={(e) => handleSocialChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <ImageUploader
              value={photo}
              onChange={setPhoto}
              label="Foto Profile"
            />
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6">
            <DocumentUploader
              value={cvUrl}
              onChange={setCvUrl}
              label="CV / Resume (PDF)"
            />
          </div>

          <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6">
            <h3 className="font-semibold text-violet-300 mb-3">👁️ Preview</h3>
            <div className="space-y-3">
              {photo && (
                <img
                  src={photo}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover border-2 border-violet-500/30"
                />
              )}
              <div>
                <div className="font-bold">{name || "Nama Lo"}</div>
                {taglines.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {taglines.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-300 border border-violet-500/20"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {skills.length > 0 && (
                <div className="text-xs text-neutral-500">
                  {skills.length} skill terdaftar
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
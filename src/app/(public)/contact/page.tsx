import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import ContactForm from "@/components/contact/ContactForm";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata = {
  title: "Contact",
  description:
    "Punya project atau mau ngobrol? Kirim pesan lewat form atau hubungi saya di sosial media.",
};

export const revalidate = 60;

const SOCIAL_MAP: Record<
  string,
  { label: string; Icon: (p: any) => JSX.Element }
> = {
  github: { label: "GitHub", Icon: Icons.Github },
  twitter: { label: "Twitter", Icon: Icons.Twitter },
  linkedin: { label: "LinkedIn", Icon: Icons.Linkedin },
  instagram: { label: "Instagram", Icon: Icons.Instagram },
  youtube: { label: "YouTube", Icon: Icons.Youtube },
  website: { label: "Website", Icon: Icons.Globe },
};

export default async function ContactPage() {
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profile")
    .select("name, email, location, photo, social_links")
    .limit(1)
    .maybeSingle();

  const socialLinks = profile?.social_links || {};
  const socials = Object.entries(socialLinks)
    .filter(([key, url]) => url && (url as string).trim() && SOCIAL_MAP[key])
    .map(([key, url]) => ({
      key,
      url: url as string,
      ...SOCIAL_MAP[key],
    }));

  const contactItems = [
    profile?.email && {
      icon: Icons.Mail,
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      color: "text-violet-400",
    },
    profile?.location && {
      icon: Icons.MapPin,
      label: "Lokasi",
      value: profile.location,
      href: null,
      color: "text-blue-400",
    },
  ].filter(Boolean) as {
    icon: any;
    label: string;
    value: string;
    href: string | null;
    color: string;
  }[];

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-8 py-10 md:py-14">
      {/* HEADER */}
      <ScrollReveal>
        <div className="mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1 text-xs text-neutral-400 mb-5">
            <Icons.Send className="w-3 h-3 text-violet-400" />
            <span>Contact</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 leading-tight max-w-2xl">
            Ada yang bisa <span className="text-neutral-500">saya bantu?</span>
          </h1>

          <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed">
            Mau kerja sama, punya pertanyaan, atau sekadar ngobrol soal
            teknologi? Kirim pesan lewat form atau langsung hubungi saya di
            platform favorit lo.
          </p>
        </div>
      </ScrollReveal>

      {/* MAIN GRID */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 lg:gap-8 items-start">
        {/* FORM */}
        <ScrollReveal>
          <ContactForm />
        </ScrollReveal>

        {/* SIDEBAR INFO */}
        <ScrollReveal delay={100}>
          <div className="space-y-4">
            {/* CONTACT INFO */}
            {contactItems.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
                  Info Kontak
                </h3>

                <div className="space-y-3">
                  {contactItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center ${item.color}`}
                      >
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-medium mb-0.5">
                          {item.label}
                        </div>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm text-neutral-300 hover:text-white transition break-all"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <div className="text-sm text-neutral-300 break-words">
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SOCIAL */}
            {socials.length > 0 && (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">
                  Sosial Media
                </h3>

                <div className="space-y-1">
                  {socials.map((s) => (
                    <a
                      key={s.key}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-lg px-2 py-2 -mx-2 hover:bg-neutral-900/80 transition"
                    >
                      <div className="shrink-0 w-8 h-8 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-violet-400 group-hover:border-violet-500/30 transition">
                        <s.Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm text-neutral-400 group-hover:text-white transition flex-1">
                        {s.label}
                      </span>
                      <Icons.ArrowUpRight className="w-3 h-3 text-neutral-600 group-hover:text-violet-400 transition" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* INFO BOX */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs font-medium text-green-400">
                  Biasanya balas &lt; 24 jam
                </span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Kalo urgent, langsung email aja ya. Kalo cuma ngobrol santai,
                santai aja — saya bakal balas secepatnya.
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
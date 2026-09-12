import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from "@/lib/supabase-server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// ✅ Ambil metadata dari tabel settings
export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", ["site_title", "site_description", "site_keywords", "author_name", "og_image"]);

  const settings = (data || []).reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {}
  );

  const siteTitle = settings.site_title || "Fann — Developer & Writer";
  const description =
    settings.site_description ||
    "Blog pribadi dan portofolio saya. Menulis tentang kode, produk, dan kehidupan.";
  const keywords = settings.site_keywords || "developer, writer, portfolio";
  const author = settings.author_name || "Fann";
  const ogImage = settings.og_image || "";

  return {
    title: {
      default: siteTitle,
      template: `%s`,
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    openGraph: {
      type: "website",
      locale: "id_ID",
      siteName: siteTitle,
      title: siteTitle,
      description,
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description,
      images: ogImage ? [ogImage] : [],
    },
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${inter.variable} font-sans bg-neutral-950 text-neutral-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
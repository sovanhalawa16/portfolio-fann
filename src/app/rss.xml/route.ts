import { createClient } from "@/lib/supabase-server";

export const revalidate = 3600;

export async function GET() {
  const supabase = await createClient();

  const [postsRes, settingsRes] = await Promise.all([
    supabase
      .from("posts")
      .select("title, slug, excerpt, content, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase
      .from("settings")
      .select("key, value")
      .in("key", ["site_title", "site_description", "author_name"]),
  ]);

  const settings = (settingsRes.data || []).reduce<Record<string, string>>(
    (acc, s) => ({ ...acc, [s.key]: s.value }),
    {}
  );

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const siteTitle = settings.site_title || "Fann — Developer & Writer";
  const siteDesc =
    settings.site_description || "Blog pribadi dan portofolio saya.";
  const posts = postsRes.data || [];

  const escape = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/blog/${post.slug}`;
      const desc = post.excerpt || post.content?.replace(/<[^>]*>/g, "").slice(0, 300) || "";
      return `
    <item>
      <title>${escape(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escape(desc)}</description>
      <pubDate>${new Date(post.published_at).toUTCString()}</pubDate>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escape(siteDesc)}</description>
    <language>id-ID</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
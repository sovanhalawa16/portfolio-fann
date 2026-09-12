import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import BlogGrid from "@/components/blog/BlogGrid";

export const metadata = {
  title: "Blog",
  description:
    "Catatan, tutorial, dan pemikiran seputar web development, produk, dan teknologi.",
};

export const revalidate = 60;

export default async function BlogListPage() {
  const supabase = await createClient();

  const [postsRes, categoriesRes, statsRes] = await Promise.all([
    supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, content, cover_image, published_at, views, category_id, categories(name)"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false }),
    supabase.from("categories").select("id, name, slug").order("name"),
    supabase.from("posts").select("views").eq("status", "published"),
  ]);

  const posts = (postsRes.data || []) as any[];
  const categories = (categoriesRes.data || []) as any[];
  const totalViews = (statsRes.data || []).reduce(
    (sum, p: any) => sum + (p.views || 0),
    0
  );

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-8 py-12 md:py-16">
      {/* HEADER */}
      <div className="mb-10 md:mb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/40 px-3 py-1.5 text-xs text-neutral-400 mb-5">
          <Icons.BookOpen className="w-3.5 h-3.5 text-violet-400" />
          <span>Blog</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15] max-w-2xl">
          Tulisan, catatan, dan <span className="text-neutral-500">pemikiran.</span>
        </h1>

        <p className="text-sm md:text-base text-neutral-400 max-w-2xl leading-relaxed mb-5">
          saya nulis tentang web development, produk digital, dan hal-hal yang saya
          pelajarin. Kadang panjang, kadang pendek — yang penting bermanfaat.
        </p>

        {/* STATS */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
          <span className="inline-flex items-center gap-1.5">
            <Icons.FileText className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {posts.length}
            </strong>{" "}
            artikel
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.Eye className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {totalViews.toLocaleString("id-ID")}
            </strong>{" "}
            views
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.Layers className="w-3.5 h-3.5" />
            <strong className="text-neutral-300 font-semibold">
              {categories.length}
            </strong>{" "}
            kategori
          </span>
        </div>
      </div>

      {/* GRID + FILTERS (Client) */}
      <BlogGrid posts={posts} categories={categories} />
    </div>
  );
}
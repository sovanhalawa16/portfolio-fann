import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { Icons } from "@/lib/icons";
import ShareButtons from "@/components/blog/ShareButtons";
import ReadingProgress from "@/components/blog/ReadingProgress";
import TableOfContents from "@/components/blog/TableOfContents";
import ViewCounter from "@/components/ViewCounter";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, meta_title, meta_description, cover_image")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Post Not Found" };

  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt || "",
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || "",
      images: post.cover_image ? [post.cover_image] : [],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || "",
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

function calcReadingTime(html: string): number {
  if (!html) return 1;
  const text = html.replace(/<[^>]*>/g, "");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, categories(name)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  const readingTime = calcReadingTime(post.content || "");

  // Related posts
  const { data: related } = await supabase
    .from("posts")
    .select(
      "id, title, slug, cover_image, excerpt, content, published_at, views, categories(name)"
    )
    .eq("status", "published")
    .eq("category_id", post.category_id)
    .neq("id", post.id)
    .limit(3);

  // Prev & Next
  const { data: prevPost } = await supabase
    .from("posts")
    .select("title, slug")
    .eq("status", "published")
    .lt("published_at", post.published_at)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: nextPost } = await supabase
    .from("posts")
    .select("title, slug")
    .eq("status", "published")
    .gt("published_at", post.published_at)
    .order("published_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // Profile buat author box
  const { data: profile } = await supabase
    .from("profile")
    .select("name, photo, taglines, social_links")
    .limit(1)
    .maybeSingle();

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-4xl px-6 lg:px-8 py-12 md:py-16">
        {/* BACK */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white transition mb-8 group"
        >
          <Icons.ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition" />
          Kembali ke Blog
        </Link>

        {/* HEADER */}
        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
            {post.categories?.name && (
              <span className="inline-flex items-center rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 px-2.5 py-1 font-medium">
                {post.categories.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-neutral-500">
              <Icons.Calendar className="w-3 h-3" />
              {new Date(post.published_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-neutral-700">·</span>
            <span className="inline-flex items-center gap-1 text-neutral-500">
              <Icons.Clock className="w-3 h-3" />
              {readingTime} menit baca
            </span>
            <span className="text-neutral-700">·</span>
            <ViewCounter postId={post.id} initialViews={post.views || 0} />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 leading-[1.15]">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base md:text-lg text-neutral-400 leading-relaxed mb-6">
              {post.excerpt}
            </p>
          )}

          <div className="pt-5 border-t border-neutral-800">
            <ShareButtons title={post.title} slug={post.slug} />
          </div>
        </header>

        {/* COVER */}
        {post.cover_image && (
          <div className="rounded-2xl overflow-hidden mb-10 bg-neutral-900 border border-neutral-800">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* CONTENT + TOC LAYOUT */}
        <div className="lg:grid lg:grid-cols-[1fr_240px] lg:gap-10">
          {/* MAIN CONTENT */}
          <div>
            <div
              data-article-content
              className="prose prose-invert prose-base md:prose-lg max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-neutral-300 prose-p:leading-relaxed
                prose-a:text-violet-400 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-white
                prose-code:text-violet-300 prose-code:bg-neutral-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-[''] prose-code:after:content-[''] prose-code:font-mono prose-code:text-sm
                prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800 prose-pre:rounded-xl
                prose-blockquote:border-l-violet-500 prose-blockquote:text-neutral-400 prose-blockquote:not-italic prose-blockquote:bg-neutral-900/40 prose-blockquote:py-1 prose-blockquote:rounded-r-lg
                prose-ul:text-neutral-300 prose-ol:text-neutral-300
                prose-li:my-1
                prose-hr:border-neutral-800
                prose-img:rounded-xl prose-img:my-6
              "
              dangerouslySetInnerHTML={{ __html: post.content || "" }}
            />

            {/* SHARE BOTTOM */}
            <div className="mt-12 pt-8 border-t border-neutral-800">
              <ShareButtons title={post.title} slug={post.slug} />
            </div>

            {/* AUTHOR BOX */}
            {profile && (
              <div className="mt-10 rounded-2xl border border-neutral-800 bg-neutral-900/40 p-5 md:p-6 flex gap-4 items-start">
                <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-full ring-2 ring-violet-500/20 overflow-hidden bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl">
                  {profile.photo ? (
                    <img
                      src={profile.photo}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-neutral-500 mb-0.5">
                    Ditulis oleh
                  </div>
                  <div className="font-semibold text-base md:text-lg mb-1.5">
                    {profile.name}
                  </div>
                  {profile.taglines && profile.taglines.length > 0 && (
                    <p className="text-xs md:text-sm text-neutral-500 mb-3">
                      {profile.taglines.slice(0, 3).join(" · ")}
                    </p>
                  )}
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1 text-xs font-medium text-violet-400 hover:text-violet-300 transition group"
                  >
                    Selengkapnya tentang saya
                    <Icons.ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* TOC SIDEBAR */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <TableOfContents />
            </div>
          </aside>
        </div>

        {/* PREV / NEXT */}
        {(prevPost || nextPost) && (
          <div className="mt-16 grid sm:grid-cols-2 gap-3 md:gap-4">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 hover:bg-neutral-900/70 transition text-left"
              >
                <div className="flex items-center gap-1 text-[10px] text-neutral-500 mb-2 font-medium">
                  <Icons.ArrowRight className="w-3 h-3 rotate-180" />
                  Sebelumnya
                </div>
                <div className="text-sm font-semibold group-hover:text-violet-300 transition line-clamp-2">
                  {prevPost.title}
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 hover:border-neutral-700 hover:bg-neutral-900/70 transition text-right sm:col-start-2"
              >
                <div className="flex items-center justify-end gap-1 text-[10px] text-neutral-500 mb-2 font-medium">
                  Selanjutnya
                  <Icons.ArrowRight className="w-3 h-3" />
                </div>
                <div className="text-sm font-semibold group-hover:text-violet-300 transition line-clamp-2">
                  {nextPost.title}
                </div>
              </Link>
            )}
          </div>
        )}

        {/* RELATED */}
        {related && related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Icons.Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold tracking-tight">
                  Artikel Terkait
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Bacaan lain di kategori yang sama.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all"
                >
                  <div className="aspect-[16/10] bg-neutral-950 overflow-hidden">
                    {r.cover_image ? (
                      <img
                        src={r.cover_image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-700">
                        <Icons.FileText className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <h4 className="text-xs sm:text-sm font-semibold line-clamp-2 leading-snug group-hover:text-violet-300 transition">
                      {r.title}
                    </h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </>
  );
}
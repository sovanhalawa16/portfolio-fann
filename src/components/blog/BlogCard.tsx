import Link from "next/link";
import { Icons } from "@/lib/icons";

type Props = {
  post: {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    published_at: string;
    views: number;
    content: string | null;
    categories: { name: string } | null;
  };
};

export default function BlogCard({ post }: Props) {
  const calcReadingTime = (html: string | null) => {
    if (!html) return 1;
    const text = html.replace(/<[^>]*>/g, "");
    return Math.max(1, Math.ceil(text.split(/\s+/).length / 200));
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl border border-neutral-800 bg-neutral-900/40 overflow-hidden hover:border-neutral-700 hover:bg-neutral-900/70 hover:-translate-y-0.5 transition-all"
    >
      {/* THUMBNAIL */}
      <div className="aspect-[16/10] bg-neutral-950 overflow-hidden relative">
        {post.cover_image ? (
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-700">
            <Icons.FileText className="w-8 h-8" />
          </div>
        )}

        {post.categories?.name && (
          <div className="absolute top-2 left-2 inline-flex items-center rounded-full bg-black/70 backdrop-blur px-2 py-0.5 text-[10px] font-medium text-violet-300 border border-violet-500/20">
            {post.categories.name}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 md:p-4">
        <h3 className="text-xs sm:text-sm font-semibold mb-1.5 line-clamp-2 leading-snug group-hover:text-violet-300 transition min-h-[2.2rem]">
          {post.title}
        </h3>

        <p className="text-[11px] text-neutral-500 line-clamp-2 mb-2.5 min-h-[2rem] hidden sm:block">
          {post.excerpt || "Baca selengkapnya..."}
        </p>

        <div className="flex items-center gap-2 text-[10px] text-neutral-500">
          <span className="inline-flex items-center gap-1">
            <Icons.Clock className="w-2.5 h-2.5" />
            {calcReadingTime(post.content)} min
          </span>
          <span className="text-neutral-700">·</span>
          <span className="inline-flex items-center gap-1">
            <Icons.Eye className="w-2.5 h-2.5" />
            {post.views || 0}
          </span>
        </div>
      </div>
    </Link>
  );
}
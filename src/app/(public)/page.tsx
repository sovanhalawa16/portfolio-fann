import { createClient } from "@/lib/supabase-server";
import HeroSection from "@/components/home/HeroSection";
import {
  StatsBar,
  FeaturedProjects,
  LatestPosts,
  SkillsSection,
  ExperiencePreview,
  CTASection,
} from "@/components/home/Sections";
import type { Profile, Post, Project, Experience } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const [
    profileRes,
    postsRes,
    projectsRes,
    featuredRes,
    experiencesRes,
    heroMediaRes,
    publicationsRes,
  ] = await Promise.all([
    supabase.from("profile").select("*").limit(1).maybeSingle(),
    supabase
      .from("posts")
      .select(
        "id, title, slug, excerpt, content, cover_image, published_at, views, categories(name)"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(4),
    supabase
      .from("portfolio")
      .select("*", { count: "exact" })
      .eq("status", "published"),
    supabase
      .from("portfolio")
      .select(
        "id, title, slug, short_description, thumbnail, tech_stack, demo_url, repo_url, featured, year"
      )
      .eq("status", "published")
      .eq("featured", true)
      .limit(4),
    supabase
      .from("experiences")
      .select("*")
      .order("sort_order", { ascending: true })
      .limit(4),
    supabase
      .from("hero_media")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("publications")
      .select("*", { count: "exact" })
      .eq("status", "published"),
  ]);

  const profile = (profileRes.data as Profile | null) || null;
  const posts = (postsRes.data as Post[] | null) || [];
  const totalProjects = projectsRes.count || 0;
  const totalPublications = publicationsRes.count || 0;

  const heroMedia = (heroMediaRes.data || []) as {
    id: number;
    type: "image" | "video";
    url: string;
    caption: string | null;
  }[];

  let featuredProjects = (featuredRes.data as Project[] | null) || [];
  if (featuredProjects.length < 3) {
    const { data: fallback } = await supabase
      .from("portfolio")
      .select(
        "id, title, slug, short_description, thumbnail, tech_stack, demo_url, repo_url, featured, year"
      )
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(3);
    featuredProjects = (fallback as Project[]) || [];
  }

  const experiences = (experiencesRes.data as Experience[] | null) || [];

  const { data: allPosts } = await supabase
    .from("posts")
    .select("views")
    .eq("status", "published");
  const totalViews = (allPosts || []).reduce(
    (sum, p) => sum + (p.views || 0),
    0
  );

  return (
    <>
      <HeroSection profile={profile as Profile} media={heroMedia} />

      <StatsBar
        postsCount={posts.length}
        projectsCount={totalProjects}
        publicationsCount={totalPublications}
        totalViews={totalViews}
      />

      <FeaturedProjects projects={featuredProjects} />

      <LatestPosts posts={posts} />

      <SkillsSection
        skills={profile?.skills || []}
        taglines={profile?.taglines || []}
      />

      <ExperiencePreview experiences={experiences} />

      <CTASection
        email={profile?.email || null}
        cvUrl={profile?.cv_url || null}
      />
    </>
  );
}
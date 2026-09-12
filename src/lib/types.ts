export type Profile = {
  id?: number;
  name: string;
  taglines: string[];
  bio: string | null;
  photo: string | null;
  cv_url: string | null;
  email: string | null;
  location: string | null;
  social_links: Record<string, string>;
  skills: { name: string; level: number }[];
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  published_at: string;
  views: number;
  reading_time?: number;
  categories: { name: string } | null;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  short_description: string | null;
  thumbnail: string | null;
  tech_stack: string[];
  demo_url: string | null;
  repo_url: string | null;
  featured: boolean;
  year: number | null;
};

export type Experience = {
  id: number;
  type: "work" | "education";
  level: string | null;
  title: string;
  company: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
};
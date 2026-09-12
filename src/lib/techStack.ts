// Daftar tech stack dengan logo dari Simple Icons CDN
// Logo otomatis dari https://cdn.simpleicons.org/[slug]
// Warna default hitam, kita override pake warna asli brand

export type Tech = {
  name: string;
  slug: string; // buat logo URL
  color?: string; // warna brand (hex tanpa #)
  category: TechCategory;
};

export type TechCategory =
  | "Frontend"
  | "Backend"
  | "Database"
  | "Mobile"
  | "DevOps"
  | "Design"
  | "Tools"
  | "Language"
  | "AI/ML";

export const TECH_LIST: Tech[] = [
  // ============ FRONTEND ============
  { name: "React", slug: "react", color: "61DAFB", category: "Frontend" },
  { name: "Next.js", slug: "nextdotjs", color: "FFFFFF", category: "Frontend" },
  { name: "Vue.js", slug: "vuedotjs", color: "4FC08D", category: "Frontend" },
  { name: "Nuxt.js", slug: "nuxtdotjs", color: "00DC82", category: "Frontend" },
  { name: "Angular", slug: "angular", color: "DD0031", category: "Frontend" },
  { name: "Svelte", slug: "svelte", color: "FF3E00", category: "Frontend" },
  { name: "Astro", slug: "astro", color: "FF5D01", category: "Frontend" },
  { name: "Tailwind CSS", slug: "tailwindcss", color: "06B6D4", category: "Frontend" },
  { name: "Bootstrap", slug: "bootstrap", color: "7952B3", category: "Frontend" },
  { name: "Sass", slug: "sass", color: "CC6699", category: "Frontend" },
  { name: "HTML5", slug: "html5", color: "E34F26", category: "Frontend" },
  { name: "CSS3", slug: "css3", color: "1572B6", category: "Frontend" },
  { name: "Redux", slug: "redux", color: "764ABC", category: "Frontend" },
  { name: "Vite", slug: "vite", color: "646CFF", category: "Frontend" },
  { name: "shadcn/ui", slug: "shadcnui", color: "FFFFFF", category: "Frontend" },

  // ============ BACKEND ============
  { name: "Node.js", slug: "nodedotjs", color: "5FA04E", category: "Backend" },
  { name: "Express", slug: "express", color: "FFFFFF", category: "Backend" },
  { name: "NestJS", slug: "nestjs", color: "E0234E", category: "Backend" },
  { name: "Laravel", slug: "laravel", color: "FF2D20", category: "Backend" },
  { name: "Django", slug: "django", color: "092E20", category: "Backend" },
  { name: "Flask", slug: "flask", color: "FFFFFF", category: "Backend" },
  { name: "FastAPI", slug: "fastapi", color: "009688", category: "Backend" },
  { name: "Spring Boot", slug: "springboot", color: "6DB33F", category: "Backend" },
  { name: "Ruby on Rails", slug: "rubyonrails", color: "CC0000", category: "Backend" },
  { name: "Go Fiber", slug: "go", color: "00ADD8", category: "Backend" },
  { name: "tRPC", slug: "trpc", color: "2596BE", category: "Backend" },
  { name: "GraphQL", slug: "graphql", color: "E10098", category: "Backend" },

  // ============ DATABASE ============
  { name: "Supabase", slug: "supabase", color: "3FCF8E", category: "Database" },
  { name: "PostgreSQL", slug: "postgresql", color: "4169E1", category: "Database" },
  { name: "MySQL", slug: "mysql", color: "4479A1", category: "Database" },
  { name: "MongoDB", slug: "mongodb", color: "47A248", category: "Database" },
  { name: "Redis", slug: "redis", color: "FF4438", category: "Database" },
  { name: "SQLite", slug: "sqlite", color: "003B57", category: "Database" },
  { name: "Firebase", slug: "firebase", color: "FFCA28", category: "Database" },
  { name: "Prisma", slug: "prisma", color: "2D3748", category: "Database" },
  { name: "Drizzle ORM", slug: "drizzle", color: "C5F74F", category: "Database" },
  { name: "PlanetScale", slug: "planetscale", color: "FFFFFF", category: "Database" },

  // ============ MOBILE ============
  { name: "React Native", slug: "react", color: "61DAFB", category: "Mobile" },
  { name: "Flutter", slug: "flutter", color: "02569B", category: "Mobile" },
  { name: "Expo", slug: "expo", color: "FFFFFF", category: "Mobile" },
  { name: "Swift", slug: "swift", color: "F05138", category: "Mobile" },
  { name: "Kotlin", slug: "kotlin", color: "7F52FF", category: "Mobile" },

  // ============ LANGUAGE ============
  { name: "JavaScript", slug: "javascript", color: "F7DF1E", category: "Language" },
  { name: "TypeScript", slug: "typescript", color: "3178C6", category: "Language" },
  { name: "Python", slug: "python", color: "3776AB", category: "Language" },
  { name: "Go", slug: "go", color: "00ADD8", category: "Language" },
  { name: "Rust", slug: "rust", color: "FFFFFF", category: "Language" },
  { name: "PHP", slug: "php", color: "777BB4", category: "Language" },
  { name: "Java", slug: "openjdk", color: "FFFFFF", category: "Language" },
  { name: "C++", slug: "cplusplus", color: "00599C", category: "Language" },
  { name: "C#", slug: "csharp", color: "512BD4", category: "Language" },
  { name: "Dart", slug: "dart", color: "0175C2", category: "Language" },

  // ============ DEVOPS ============
  { name: "Docker", slug: "docker", color: "2496ED", category: "DevOps" },
  { name: "Kubernetes", slug: "kubernetes", color: "326CE5", category: "DevOps" },
  { name: "Vercel", slug: "vercel", color: "FFFFFF", category: "DevOps" },
  { name: "Netlify", slug: "netlify", color: "00C7B7", category: "DevOps" },
  { name: "AWS", slug: "amazonwebservices", color: "FF9900", category: "DevOps" },
  { name: "Google Cloud", slug: "googlecloud", color: "4285F4", category: "DevOps" },
  { name: "GitHub Actions", slug: "githubactions", color: "2088FF", category: "DevOps" },
  { name: "Cloudflare", slug: "cloudflare", color: "F38020", category: "DevOps" },

  // ============ DESIGN ============
  { name: "Figma", slug: "figma", color: "F24E1E", category: "Design" },
  { name: "Adobe XD", slug: "adobexd", color: "FF61F6", category: "Design" },
  { name: "Sketch", slug: "sketch", color: "F7B500", category: "Design" },
  { name: "Framer", slug: "framer", color: "0055FF", category: "Design" },
  { name: "Canva", slug: "canva", color: "00C4CC", category: "Design" },

  // ============ TOOLS ============
  { name: "Git", slug: "git", color: "F05032", category: "Tools" },
  { name: "GitHub", slug: "github", color: "FFFFFF", category: "Tools" },
  { name: "GitLab", slug: "gitlab", color: "FC6D26", category: "Tools" },
  { name: "Postman", slug: "postman", color: "FF6C37", category: "Tools" },
  { name: "VS Code", slug: "visualstudiocode", color: "007ACC", category: "Tools" },
  { name: "Jest", slug: "jest", color: "C21325", category: "Tools" },
  { name: "Cypress", slug: "cypress", color: "69D3A7", category: "Tools" },
  { name: "Storybook", slug: "storybook", color: "FF4785", category: "Tools" },
  { name: "Notion", slug: "notion", color: "FFFFFF", category: "Tools" },

  // ============ AI/ML ============
  { name: "OpenAI", slug: "openai", color: "FFFFFF", category: "AI/ML" },
  { name: "TensorFlow", slug: "tensorflow", color: "FF6F00", category: "AI/ML" },
  { name: "PyTorch", slug: "pytorch", color: "EE4C2C", category: "AI/ML" },
  { name: "Hugging Face", slug: "huggingface", color: "FFD21E", category: "AI/ML" },
  { name: "LangChain", slug: "langchain", color: "FFFFFF", category: "AI/ML" },
];

export const TECH_CATEGORIES: TechCategory[] = [
  "Frontend",
  "Backend",
  "Database",
  "Mobile",
  "Language",
  "DevOps",
  "Design",
  "Tools",
  "AI/ML",
];

// Helper: dapetin URL logo
export function getTechLogo(slug: string, color?: string): string {
  return color
    ? `https://cdn.simpleicons.org/${slug}/${color}`
    : `https://cdn.simpleicons.org/${slug}`;
}
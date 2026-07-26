import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  expiresAt?: string;
};

export type BlogPost = BlogPostMeta & { content: string };

const VISIBLE_DIR = path.join(process.cwd(), "content", "blog", "visible");
const HIDDEN_DIR = path.join(process.cwd(), "content", "blog", "hidden");
const BLOG_TIME_ZONE = "Europe/Rome";

function getTodayIso(): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: BLOG_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export function isPostVisible(
  post: Pick<BlogPostMeta, "date" | "expiresAt">,
  todayIso = getTodayIso()
): boolean {
  return post.date <= todayIso && (!post.expiresAt || post.expiresAt >= todayIso);
}

function readMeta(dir: string, file: string): BlogPostMeta {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : undefined,
  };
}

function readPost(dir: string, slug: string): BlogPost | null {
  const filePath = path.join(dir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
    expiresAt: typeof data.expiresAt === "string" ? data.expiresAt : undefined,
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const todayIso = getTodayIso();
  const files = fs.readdirSync(VISIBLE_DIR).filter((file) => file.endsWith(".mdx"));
  return files
    .map((file) => readMeta(VISIBLE_DIR, file))
    .filter((post) => isPostVisible(post, todayIso))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const visiblePost = readPost(VISIBLE_DIR, slug);
  if (visiblePost) {
    return isPostVisible(visiblePost) ? visiblePost : null;
  }

  return readPost(HIDDEN_DIR, slug);
}

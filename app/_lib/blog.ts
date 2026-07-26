import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
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

function isPublished(date: string): boolean {
  return date <= getTodayIso();
}

function readMeta(dir: string, file: string): BlogPostMeta {
  const raw = fs.readFileSync(path.join(dir, file), "utf8");
  const { data } = matter(raw);
  return {
    slug: file.replace(/\.mdx$/, ""),
    title: data.title as string,
    description: data.description as string,
    date: data.date as string,
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
    content,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  const files = fs.readdirSync(VISIBLE_DIR).filter((file) => file.endsWith(".mdx"));
  return files
    .map((file) => readMeta(VISIBLE_DIR, file))
    .filter((post) => isPublished(post.date))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): BlogPost | null {
  const visiblePost = readPost(VISIBLE_DIR, slug);
  if (visiblePost) {
    return isPublished(visiblePost.date) ? visiblePost : null;
  }

  return readPost(HIDDEN_DIR, slug);
}

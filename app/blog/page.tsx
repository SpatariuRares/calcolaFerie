import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { BlogView } from "@components/templates/blog-view";
import { getAllPosts } from "@lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";
const PAGE_URL = `${BASE_URL}/blog`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("metadata");
  const title = t("blogTitle");
  const description = t("blogDescription");

  return {
    title,
    description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title,
      description,
      url: PAGE_URL,
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogView posts={posts} />;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { BlogPostView } from "@components/templates/blog-post-view";
import { getAllPosts, getPostBySlug } from "../../_lib/blog";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://calcolaferie.it";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return {};
  }

  const title = `${post.title} | CalcolaFerie`;
  const PAGE_URL = `${BASE_URL}/blog/${slug}`;

  return {
    title,
    description: post.description,
    alternates: { canonical: PAGE_URL },
    openGraph: {
      title,
      description: post.description,
      url: PAGE_URL,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    notFound();
  }

  return (
    <BlogPostView post={post}>
      <MDXRemote source={post.content} />
    </BlogPostView>
  );
}

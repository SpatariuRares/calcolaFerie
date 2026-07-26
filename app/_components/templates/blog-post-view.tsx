import type { ReactNode } from "react";
import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BlogPostingJsonLd } from "../atoms/json-ld";
import { PageChrome } from "../organisms/page-chrome";
import styles from "../../styles/app.module.scss";
import type { BlogPost } from "../../_lib/blog";

type BlogPostViewProps = {
  post: BlogPost;
  children: ReactNode;
};

export async function BlogPostView({ post, children }: BlogPostViewProps) {
  const [t, locale] = await Promise.all([getTranslations("blog"), getLocale()]);
  const formattedDate = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${post.date}T00:00:00`));

  return (
    <PageChrome>
      <BlogPostingJsonLd
        date={post.date}
        description={post.description}
        slug={post.slug}
        title={post.title}
      />
      <article
        aria-labelledby="blog-post-title"
        className={`${styles.privacyPage} ${styles.blogArticle}`}
      >
        <Link className={styles.backLink} href="/blog">
          {t("back")}
        </Link>
        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="blog-post-title">{post.title}</h1>
          <p className={styles.blogListDate}>{formattedDate}</p>
          <p>{post.description}</p>
        </header>

        {children}
      </article>
    </PageChrome>
  );
}

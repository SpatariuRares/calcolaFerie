"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { BlogJsonLd } from "../atoms/json-ld";
import { PageChrome } from "../organisms/page-chrome";
import styles from "../../styles/app.module.scss";
import type { BlogPostMeta } from "../../_lib/blog";

type BlogViewProps = {
  posts: BlogPostMeta[];
};

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${iso}T00:00:00`)
  );
}

export function BlogView({ posts }: BlogViewProps) {
  const t = useTranslations("blog");
  const tPrivacy = useTranslations("privacy");
  const locale = useLocale();

  return (
    <PageChrome>
      <BlogJsonLd />
      <article className={styles.privacyPage} aria-labelledby="blog-title">
        <Link className={styles.backLink} href="/">
          {tPrivacy("back")}
        </Link>
        <header className={styles.privacyHeader}>
          <p className={styles.eyebrow}>{t("eyebrow")}</p>
          <h1 id="blog-title">{t("title")}</h1>
          <p>{t("subtitle")}</p>
        </header>

        <section>
          {posts.length === 0 ? (
            <p>{t("empty")}</p>
          ) : (
            <div className={styles.blogList}>
              {posts.map((post) => (
                <Link key={post.slug} className={styles.blogListItem} href={`/blog/${post.slug}`}>
                  <p className={styles.blogListDate}>{formatDate(post.date, locale)}</p>
                  <h2 className={styles.blogListTitle}>{post.title}</h2>
                  <p className={styles.blogListDescription}>{post.description}</p>
                  <span className={styles.blogListCta} aria-hidden="true">
                    {t("readMore")} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      </article>
    </PageChrome>
  );
}

import fs from "node:fs";
import path from "node:path";
import { getRAGEngine, type RAGEngine } from "../../engine-rag/src/rag-engine.js";
import type { GeneratedBlogDraft } from "./blog-generator.js";

export type BlogVisibility = "visible" | "hidden";

export interface BlogPublishOptions {
  contentDir?: string;
  visibility?: BlogVisibility;
  ragEngine?: RAGEngine;
}

export interface PublishedBlogPost {
  filePath: string;
  relativePath: string;
  visibility: BlogVisibility;
}

export function saveBlogMDXPost(
  draft: GeneratedBlogDraft,
  options: BlogPublishOptions = {}
): PublishedBlogPost {
  const visibility = options.visibility || "visible";
  const blogRoot = options.contentDir || path.resolve(process.cwd(), "content", "blog");
  const targetDir = path.join(blogRoot, visibility);
  const filePath = path.join(targetDir, `${draft.slug}.mdx`);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(filePath, draft.mdxContent, "utf-8");

  const engine = options.ragEngine || getRAGEngine();
  engine.sync();

  return {
    filePath,
    relativePath: path.relative(process.cwd(), filePath).replace(/\\/g, "/"),
    visibility,
  };
}

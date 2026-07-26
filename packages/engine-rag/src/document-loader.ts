import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import matter from "gray-matter";
import type { RAGDocument, Frontmatter } from "./types.js";

export function computeHash(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

export function loadDocumentsFromDirectory(dirPath: string): RAGDocument[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }
  const resolvedDir = fs.realpathSync(dirPath);

  const documents: RAGDocument[] = [];

  function scanDir(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue; // Ignore hidden files like .rag-cache.json, .DS_Store
      }
      const fullPath = fs.realpathSync(path.join(currentDir, entry.name));

      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === ".md" || ext === ".mdx" || ext === ".txt" || ext === ".json") {
          try {
            const rawContent = fs.readFileSync(fullPath, "utf-8");
            const stat = fs.statSync(fullPath);
            const fileHash = computeHash(rawContent);

            let frontmatter: Frontmatter = {};
            let bodyText = rawContent;

            if (ext === ".md" || ext === ".mdx") {
              const parsed = matter(rawContent);
              frontmatter = (parsed.data || {}) as Frontmatter;
              bodyText = parsed.content || rawContent;
            } else if (ext === ".json") {
              try {
                frontmatter = JSON.parse(rawContent) as Frontmatter;
              } catch {
                frontmatter = {};
              }
            }

            const relativePath = path
              .relative(resolvedDir, fullPath)
              .replace(/\\/g, "/");

            const title =
              frontmatter.title ||
              extractH1Title(bodyText) ||
              path.basename(entry.name, ext);

            documents.push({
              id: relativePath,
              filePath: fullPath,
              relativePath,
              fileHash,
              mtimeMs: stat.mtimeMs,
              frontmatter,
              title,
              rawContent: bodyText,
            });
          } catch (err) {
            console.error(`[RAG DocumentLoader] Failed to read ${fullPath}:`, err);
          }
        }
      }
    }
  }

  scanDir(dirPath);
  return documents;
}

function extractH1Title(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

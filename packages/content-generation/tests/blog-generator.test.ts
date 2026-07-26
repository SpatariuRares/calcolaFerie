import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { RAGEngine } from "../../engine-rag/src/rag-engine.js";
import {
  generateBlogMDXDraft,
  saveBlogMDXPost,
  prepareBlogPromptContext,
} from "../src/index.js";

describe("blog-generator (content-generation)", () => {
  let tempContentDir: string;
  let tempCacheFile: string;

  beforeEach(() => {
    tempContentDir = fs.mkdtempSync(path.join(os.tmpdir(), "content-generation-test-"));
    tempCacheFile = path.join(tempContentDir, ".rag-cache.json");

    fs.mkdirSync(path.join(tempContentDir, "articoli"), { recursive: true });
    fs.mkdirSync(path.join(tempContentDir, "blog", "visible"), { recursive: true });

    fs.writeFileSync(
      path.join(tempContentDir, "articoli", "pirati-ponti-2026.md"),
      `---
title: "Guida Ponti 2026"
domain: "piratinviaggio.it"
---

# Ponti 2026

Il 2 Giugno 2026 cade di martedì. Chiedendo 1 giorno di ferie si ottiene un ponte da 4 giorni.
La leva ferie per questo ponte è 4.0x.
`
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempContentDir)) {
      fs.rmSync(tempContentDir, { recursive: true, force: true });
    }
  });

  it("prepares prompt context from RAG knowledge base", () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const { promptContext, searchResults } = prepareBlogPromptContext("2 Giugno 2026", {
      ragEngine: rag,
    });

    expect(promptContext).toContain("Nota 1:");
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].snippet).toContain("2 Giugno 2026");
  });

  it("generates structured MDX blog post draft with frontmatter and RAG insights", async () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const draft = await generateBlogMDXDraft("Ponte 2 Giugno 2026", {
      articleType: "destination_guide",
      expiresAt: "2026-06-03",
      ragEngine: rag,
      useOpenRouter: false,
    });

    expect(draft.title).toContain("Ponte 2 Giugno 2026");
    expect(draft.slug).toBe("ponte-2-giugno-2026");
    expect(draft.articleType).toBe("destination_guide");
    expect(draft.expiresAt).toBe("2026-06-03");
    expect(draft.mdxContent).toContain("---");
    expect(draft.mdxContent).toContain('expiresAt: "2026-06-03"');
    expect(draft.mdxContent).toContain("Leva Ferie");
    expect(draft.mdxContent).not.toMatch(/RAG|Fonte|fonti|Spunto/i);
    expect(draft.mdxContent).toContain("Come imposterei questo ponte");
    expect(draft.sourcesUsed.length).toBeGreaterThan(0);
  });

  it("publishes generated MDX to the selected blog visibility directory and re-syncs RAG", async () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const draft = await generateBlogMDXDraft("Strategia Ferie Milano", {
      slug: "strategia-ferie-milano",
      articleType: "patron_saint",
      ragEngine: rag,
      useOpenRouter: false,
    });

    const published = saveBlogMDXPost(draft, {
      contentDir: path.join(tempContentDir, "blog"),
      visibility: "hidden",
      ragEngine: rag,
    });

    expect(published.relativePath).toContain("content-generation-test-");
    expect(published.filePath).toContain(path.join("blog", "hidden"));
    expect(fs.existsSync(published.filePath)).toBe(true);
    const contentOnDisk = fs.readFileSync(published.filePath, "utf-8");
    expect(contentOnDisk).toContain("Strategia Ferie Milano");
    expect(rag.getStats().totalDocuments).toBe(2);
  });
});

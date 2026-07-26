import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { RAGEngine } from "../src/rag-engine.js";

describe("RAGEngine (engine-rag)", () => {
  let tempContentDir: string;
  let tempCacheFile: string;

  beforeEach(() => {
    tempContentDir = fs.mkdtempSync(path.join(os.tmpdir(), "rag-content-test-"));
    tempCacheFile = path.join(tempContentDir, ".rag-cache.json");

    // Add initial test blog post
    fs.mkdirSync(path.join(tempContentDir, "blog"), { recursive: true });
    fs.writeFileSync(
      path.join(tempContentDir, "blog", "guida-ponti-2027.mdx"),
      `---
title: "Ponti 2027: la guida strategica per pianificare le ferie"
description: "Le festività italiane del 2027 giorno per giorno"
date: "2026-07-26"
---

# Ponti 2027

Il 2027 offre diverse opportunità di ponte.
Epifania mercoledì 6 gennaio è il primo vero ponte dell'anno.
Prendendo lunedì 4 e martedì 5 si ottengono 5 giorni liberi con leva 2.5x.
`
    );
  });

  afterEach(() => {
    if (fs.existsSync(tempContentDir)) {
      fs.rmSync(tempContentDir, { recursive: true, force: true });
    }
  });

  it("automatically indexes content on initialization", () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const stats = rag.getStats();
    expect(stats.totalDocuments).toBe(1);
    expect(stats.totalChunks).toBeGreaterThan(0);
    expect(stats.documents[0].relativePath).toContain("guida-ponti-2027.mdx");
  });

  it("finds relevant chunks when querying for keywords and topics", () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const results = rag.search("Epifania gennaio leva 2.5x");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].snippet).toContain("Epifania");
    expect(results[0].matchedTerms).toContain("epifania");
  });

  it("auto-updates index when a new blog post is added to content directory", () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
      autoSyncOnInit: true,
    });

    expect(rag.getStats().totalDocuments).toBe(1);

    // Dynamically add a new blog post to content/
    fs.writeFileSync(
      path.join(tempContentDir, "blog", "nuovo-articolo-ferie-2028.md"),
      `---
title: "Ponti 2028: Anteprima Festività"
category: "blog"
---

# Ponti 2028

Nel 2028 avremo un super ponte a Pasqua e Sant'Ambrogio a Milano.
`
    );

    // Perform manual sync to verify added count
    const syncRes = rag.sync();
    expect(syncRes.added).toBe(1);
    expect(rag.getStats().totalDocuments).toBe(2);

    const searchRes = rag.search("Sant'Ambrogio Milano 2028");
    expect(searchRes.length).toBeGreaterThan(0);
    expect(searchRes[0].chunk.relativePath).toContain("nuovo-articolo-ferie-2028.md");
  });

  it("builds clean context block string for LLM prompt insertion", () => {
    const rag = new RAGEngine({
      contentDir: tempContentDir,
      cacheFilePath: tempCacheFile,
    });

    const promptContext = rag.buildPromptContext("Ponti 2027 Epifania");
    expect(promptContext).toContain("CONTESTO RAG PER LA RISPOSTA");
    expect(promptContext).toContain("guida-ponti-2027.mdx");
  });
});

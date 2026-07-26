import fs from "node:fs";
import path from "node:path";
import type {
  RAGDocument,
  RAGChunk,
  RAGSearchResult,
  RAGSearchOptions,
  RAGStats,
  RAGEngineConfig,
} from "./types.js";
import { loadDocumentsFromDirectory } from "./document-loader.js";
import { chunkDocument } from "./chunker.js";
import { VectorStore } from "./vector-store.js";

export class RAGEngine {
  private contentDir: string;
  private cacheFilePath: string;
  private maxChunkSize: number;
  private chunkOverlap: number;

  private documentsMap = new Map<string, RAGDocument>();
  private vectorStore = new VectorStore();
  private lastSyncTimestamp = 0;

  constructor(config: RAGEngineConfig = {}) {
    const rawContentDir =
      config.contentDir || path.resolve(process.cwd(), "content");
    this.contentDir = fs.existsSync(rawContentDir)
      ? fs.realpathSync(rawContentDir)
      : path.resolve(rawContentDir);
    this.cacheFilePath =
      config.cacheFilePath ||
      path.resolve(process.cwd(), ".rag-cache.json");
    this.maxChunkSize = config.maxChunkSize || 800;
    this.chunkOverlap = config.chunkOverlap || 100;

    if (config.autoSyncOnInit !== false) {
      this.sync();
    }
  }

  /**
   * Scans content/ directory and syncs all blog posts / articles into RAG index.
   * Auto-detects added, updated, and deleted files.
   */
  public sync(): {
    added: number;
    updated: number;
    deleted: number;
    totalDocuments: number;
    totalChunks: number;
    durationMs: number;
  } {
    const startTime = Date.now();
    let added = 0;
    let updated = 0;
    let deleted = 0;

    const currentDocs = loadDocumentsFromDirectory(this.contentDir);
    const newDocMap = new Map<string, RAGDocument>();
    const allChunks: RAGChunk[] = [];

    for (const doc of currentDocs) {
      newDocMap.set(doc.id, doc);
      const existing = this.documentsMap.get(doc.id);

      if (!existing) {
        added++;
      } else if (existing.fileHash !== doc.fileHash) {
        updated++;
      }
    }

    // Detect deleted docs
    for (const id of this.documentsMap.keys()) {
      if (!newDocMap.has(id)) {
        deleted++;
      }
    }

    // Re-chunk and build index if changes detected or first sync
    if (added > 0 || updated > 0 || deleted > 0 || this.lastSyncTimestamp === 0) {
      this.documentsMap = newDocMap;

      for (const doc of this.documentsMap.values()) {
        const chunks = chunkDocument(doc, {
          maxChunkSize: this.maxChunkSize,
          chunkOverlap: this.chunkOverlap,
        });
        allChunks.push(...chunks);
      }

      this.vectorStore.setChunks(allChunks);
      this.lastSyncTimestamp = Date.now();
      this.persistCacheSilently();
    }

    const durationMs = Date.now() - startTime;

    return {
      added,
      updated,
      deleted,
      totalDocuments: this.documentsMap.size,
      totalChunks: allChunks.length || this.vectorStore.getChunks().length,
      durationMs,
    };
  }

  /**
   * Perform semantic and keyword RAG search across indexed content
   */
  public search(query: string, options?: RAGSearchOptions): RAGSearchResult[] {
    // Ensure RAG is synced with latest content before searching
    this.sync();
    return this.vectorStore.search(query, options);
  }

  /**
   * Formats search results into a clean context block string for LLM prompts
   */
  public buildPromptContext(
    query: string,
    options?: RAGSearchOptions
  ): string {
    const results = this.search(query, options);

    if (results.length === 0) {
      return "Nessuna informazione rilevante trovata nel database RAG.";
    }

    const contextBlocks = results.map((res, i) => {
      const docTitle = res.chunk.frontmatter.title || res.chunk.sectionHeading;
      const fileRef = res.chunk.relativePath;
      return `[Fonte ${i + 1}: ${docTitle} (${fileRef})]\n${res.snippet}`;
    });

    return `### CONTESTO RAG PER LA RISPOSTA:\n\n${contextBlocks.join("\n\n---\n\n")}`;
  }

  /**
   * Get RAG engine statistics and indexed document summaries
   */
  public getStats(): RAGStats {
    const docs = Array.from(this.documentsMap.values()).map(doc => {
      const chunks = this.vectorStore
        .getChunks()
        .filter(c => c.docId === doc.id);
      return {
        relativePath: doc.relativePath,
        title: doc.title,
        chunkCount: chunks.length,
      };
    });

    return {
      totalDocuments: this.documentsMap.size,
      totalChunks: this.vectorStore.getChunks().length,
      contentDir: this.contentDir,
      lastSyncTimestamp: this.lastSyncTimestamp,
      documents: docs,
    };
  }

  private persistCacheSilently(): void {
    try {
      const data = {
        lastSyncTimestamp: this.lastSyncTimestamp,
        totalDocuments: this.documentsMap.size,
        totalChunks: this.vectorStore.getChunks().length,
      };
      fs.writeFileSync(this.cacheFilePath, JSON.stringify(data, null, 2));
    } catch {
      // Ignore cache write errors
    }
  }
}

/**
 * Singleton instance factory
 */
let defaultInstance: RAGEngine | null = null;

export function getRAGEngine(config?: RAGEngineConfig): RAGEngine {
  if (!defaultInstance || config) {
    defaultInstance = new RAGEngine(config);
  }
  return defaultInstance;
}

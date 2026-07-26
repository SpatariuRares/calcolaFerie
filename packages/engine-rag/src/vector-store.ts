import type { RAGChunk, RAGSearchResult, RAGSearchOptions } from "./types.js";
import { tokenize, computeTermFrequencies, cosineSimilarity } from "./tokenizer.js";

export class VectorStore {
  private chunks: RAGChunk[] = [];
  private docFrequencies: Record<string, number> = {};
  private avgChunkLength = 0;

  public setChunks(chunks: RAGChunk[]): void {
    this.chunks = chunks;
    this.rebuildIndex();
  }

  public getChunks(): RAGChunk[] {
    return this.chunks;
  }

  private rebuildIndex(): void {
    this.docFrequencies = {};
    let totalTokens = 0;

    for (const chunk of this.chunks) {
      const tf = chunk.termFrequencies || {};
      totalTokens += chunk.tokenCount;

      for (const term of Object.keys(tf)) {
        this.docFrequencies[term] = (this.docFrequencies[term] || 0) + 1;
      }
    }

    this.avgChunkLength = this.chunks.length > 0 ? totalTokens / this.chunks.length : 0;
  }

  public search(query: string, options: RAGSearchOptions = {}): RAGSearchResult[] {
    const topK = options.topK || 5;
    const minScore = options.minScore || 0.05;
    const categoryFilter = options.category;

    const queryTokens = tokenize(query);
    if (queryTokens.length === 0) {
      return [];
    }

    const queryTF = computeTermFrequencies(queryTokens);
    const N = this.chunks.length;
    const k1 = 1.2;
    const b = 0.75;

    const results: RAGSearchResult[] = [];

    for (const chunk of this.chunks) {
      if (categoryFilter && chunk.frontmatter.category !== categoryFilter) {
        continue;
      }

      const chunkTF = chunk.termFrequencies || {};
      let bm25Score = 0;
      const matchedTerms: string[] = [];

      for (const term of queryTokens) {
        const f = chunkTF[term] || 0;
        if (f > 0) {
          matchedTerms.push(term);
          const df = this.docFrequencies[term] || 1;
          const idf = Math.log((N - df + 0.5) / (df + 0.5) + 1);
          const lenRatio = this.avgChunkLength > 0 ? chunk.tokenCount / this.avgChunkLength : 1;
          const num = f * (k1 + 1);
          const denom = f + k1 * (1 - b + b * lenRatio);
          bm25Score += idf * (num / denom);
        }
      }

      // Calculate vector cosine similarity
      const vectorScore = cosineSimilarity(queryTF, chunkTF);

      // Section heading / title boost
      let headingMatchScore = 0;
      const normalizedHeading = chunk.sectionHeading.toLowerCase();
      const normalizedTitle = (chunk.frontmatter.title || "").toLowerCase();

      for (const term of queryTokens) {
        if (normalizedHeading.includes(term) || normalizedTitle.includes(term)) {
          headingMatchScore += 0.3;
        }
      }

      // Final hybrid score formula
      const score = bm25Score * 0.5 + vectorScore * 0.4 + headingMatchScore * 0.3;

      if (score >= minScore && matchedTerms.length > 0) {
        results.push({
          chunk,
          score,
          bm25Score,
          vectorScore,
          headingMatchScore,
          matchedTerms: Array.from(new Set(matchedTerms)),
          snippet: chunk.content,
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }
}

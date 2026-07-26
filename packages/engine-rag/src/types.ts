export interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  tags?: string[];
  source_url?: string;
  domain?: string;
  dataset_type?: string;
  category?: string;
  [key: string]: unknown;
}

export interface RAGDocument {
  id: string;
  filePath: string;
  relativePath: string;
  fileHash: string;
  mtimeMs: number;
  frontmatter: Frontmatter;
  title: string;
  rawContent: string;
}

export interface RAGChunk {
  id: string;
  docId: string;
  filePath: string;
  relativePath: string;
  chunkIndex: number;
  sectionHeading: string;
  content: string;
  tokenCount: number;
  frontmatter: Frontmatter;
  startLine: number;
  endLine: number;
  termFrequencies?: Record<string, number>;
}

export interface RAGSearchResult {
  chunk: RAGChunk;
  score: number;
  bm25Score: number;
  vectorScore: number;
  headingMatchScore: number;
  matchedTerms: string[];
  snippet: string;
}

export interface RAGSearchOptions {
  topK?: number;
  minScore?: number;
  category?: string;
  includeRawContent?: boolean;
}

export interface RAGStats {
  totalDocuments: number;
  totalChunks: number;
  contentDir: string;
  lastSyncTimestamp: number;
  documents: Array<{
    relativePath: string;
    title: string;
    chunkCount: number;
  }>;
}

export interface RAGEngineConfig {
  contentDir?: string;
  cacheFilePath?: string;
  maxChunkSize?: number;
  chunkOverlap?: number;
  autoSyncOnInit?: boolean;
}

import type { RAGDocument, RAGChunk } from "./types.js";
import { tokenize, computeTermFrequencies } from "./tokenizer.js";

export interface ChunkerOptions {
  maxChunkSize?: number;
  chunkOverlap?: number;
}

export function chunkDocument(
  doc: RAGDocument,
  options: ChunkerOptions = {}
): RAGChunk[] {
  const maxChunkSize = options.maxChunkSize || 800;
  const overlap = options.chunkOverlap || 100;

  const lines = doc.rawContent.split("\n");
  const chunks: RAGChunk[] = [];

  let currentSectionHeading = doc.title;
  let currentLines: string[] = [];
  let currentStartLine = 1;
  let chunkIndex = 0;

  function flushChunk(endLine: number) {
    if (currentLines.length === 0) return;

    const contentText = currentLines.join("\n").trim();
    if (contentText.length < 20) return; // Skip tiny whitespace blocks

    const tokens = tokenize(contentText);
    const termFrequencies = computeTermFrequencies(tokens);

    chunks.push({
      id: `${doc.id}#chunk-${chunkIndex}`,
      docId: doc.id,
      filePath: doc.filePath,
      relativePath: doc.relativePath,
      chunkIndex,
      sectionHeading: currentSectionHeading,
      content: contentText,
      tokenCount: tokens.length,
      frontmatter: doc.frontmatter,
      startLine: currentStartLine,
      endLine,
      termFrequencies,
    });

    chunkIndex++;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Heading detection (# or ## or ###)
    const headingMatch = line.match(/^#{1,4}\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.length > 0) {
        flushChunk(lineNumber - 1);
        currentLines = [];
      }
      currentSectionHeading = headingMatch[1].trim();
      currentStartLine = lineNumber;
      currentLines.push(line);
      continue;
    }

    currentLines.push(line);
    const currentLength = currentLines.join("\n").length;

    if (currentLength >= maxChunkSize) {
      flushChunk(lineNumber);

      // Keep overlap lines
      const overlapLines: string[] = [];
      let overlapLen = 0;
      for (let j = currentLines.length - 1; j >= 0; j--) {
        const l = currentLines[j];
        if (overlapLen + l.length > overlap) break;
        overlapLines.unshift(l);
        overlapLen += l.length;
      }

      currentLines = overlapLines;
      currentStartLine = Math.max(1, lineNumber - overlapLines.length + 1);
    }
  }

  if (currentLines.length > 0) {
    flushChunk(lines.length);
  }

  return chunks;
}

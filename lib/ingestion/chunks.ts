import type { ExtractedPage } from "./pdf";

export type HandbookChunk = {
  id: string;
  pageNumber: number;
  chunkIndex: number;
  text: string;
};

const CHUNK_SIZE = 1_800;
const CHUNK_OVERLAP = 250;

export function chunkHandbookPages(
  handbookId: string,
  pages: ExtractedPage[],
): HandbookChunk[] {
  const chunks: HandbookChunk[] = [];

  for (const page of pages) {
    const text = page.text.trim();
    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      let end = Math.min(start + CHUNK_SIZE, text.length);

      if (end < text.length) {
        const boundary = text.lastIndexOf(" ", end);
        if (boundary > start + CHUNK_SIZE * 0.65) {
          end = boundary;
        }
      }

      const content = text.slice(start, end).trim();

      if (content.length > 0) {
        chunks.push({
          id: `${handbookId}:p${page.pageNumber}:c${chunkIndex}`,
          pageNumber: page.pageNumber,
          chunkIndex,
          text: content,
        });
        chunkIndex += 1;
      }

      if (end >= text.length) break;
      start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }
  }

  return chunks;
}

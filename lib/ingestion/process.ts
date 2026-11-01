import { openai } from "@/lib/openai";
import { vector } from "@/lib/upstash";
import { chunkHandbookPages } from "./chunks";
import { extractPdfPages } from "./pdf";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_BATCH_SIZE = 64;
const VECTOR_BATCH_SIZE = 100;
const MAX_PDF_BYTES = 16 * 1024 * 1024;

export type HandbookSource = {
  id: string;
  courseId: string;
  fileUrl: string | null;
};

async function readPdfResponse(response: Response): Promise<ArrayBuffer> {
  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PDF_BYTES) {
    throw new Error("The handbook PDF exceeds the 16 MB upload limit.");
  }

  if (!response.body) {
    throw new Error("The handbook PDF response did not contain a file.");
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_PDF_BYTES) {
        await reader.cancel();
        throw new Error("The handbook PDF exceeds the 16 MB upload limit.");
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    buffer.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return buffer.buffer;
}

export async function indexHandbook(handbook: HandbookSource): Promise<string[]> {
  if (!handbook.fileUrl) {
    throw new Error("The handbook does not have an uploaded PDF.");
  }

  const fileUrl = new URL(handbook.fileUrl);
  if (
    fileUrl.protocol !== "https:" ||
    !(fileUrl.hostname === "utfs.io" || fileUrl.hostname.endsWith(".utfs.io"))
  ) {
    throw new Error("The handbook file URL is not a trusted UploadThing URL.");
  }

  const response = await fetch(fileUrl, {
    signal: AbortSignal.timeout(60_000),
  });

  if (!response.ok) {
    throw new Error(`Unable to download handbook PDF (HTTP ${response.status}).`);
  }

  const buffer = await readPdfResponse(response);
  const header = new TextDecoder().decode(buffer.slice(0, 1_024));
  if (!header.includes("%PDF-")) {
    throw new Error("The uploaded file is not a valid PDF.");
  }

  const pages = await extractPdfPages(buffer);
  const chunks = chunkHandbookPages(handbook.id, pages);

  if (chunks.length === 0) {
    throw new Error("No indexable text was extracted from the handbook.");
  }

  const vectorIds: string[] = [];

  for (
    let offset = 0;
    offset < chunks.length;
    offset += EMBEDDING_BATCH_SIZE
  ) {
    const batch = chunks.slice(offset, offset + EMBEDDING_BATCH_SIZE);
    const embeddings = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((chunk) => chunk.text),
    });

    const records = batch.map((chunk, index) => {
      const embedding = embeddings.data.find((item) => item.index === index);
      if (!embedding) {
        throw new Error("OpenAI returned an incomplete embedding batch.");
      }

      return {
        id: chunk.id,
        vector: embedding.embedding,
        metadata: {
          handbookId: handbook.id,
          courseId: handbook.courseId,
          pageNumber: chunk.pageNumber,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
        },
      };
    });

    for (
      let vectorOffset = 0;
      vectorOffset < records.length;
      vectorOffset += VECTOR_BATCH_SIZE
    ) {
      const vectorBatch = records.slice(
        vectorOffset,
        vectorOffset + VECTOR_BATCH_SIZE,
      );
      await vector.upsert(vectorBatch);
      vectorIds.push(...vectorBatch.map((record) => record.id));
    }
  }

  return vectorIds;
}

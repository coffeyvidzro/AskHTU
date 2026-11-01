import OpenAI from "openai";
import { env } from "@/env";
import { vector } from "@/lib/upstash";
import { chunkHandbookPages } from "./chunks";
import { extractPdfPages } from "./pdf";

const openai = new OpenAI({ apiKey: env.OPENAI_KEY });
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_BATCH_SIZE = 64;
const VECTOR_BATCH_SIZE = 100;

export type HandbookSource = {
  id: string;
  courseId: string;
  fileUrl: string | null;
};

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

  const contentLength = Number(response.headers.get("content-length") ?? 0);
  if (contentLength > 16 * 1024 * 1024) {
    throw new Error("The handbook PDF exceeds the 16 MB upload limit.");
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("pdf")) {
    throw new Error("The uploaded handbook is not served as a PDF.");
  }

  const buffer = await response.arrayBuffer();
  const pages = await extractPdfPages(buffer);
  const chunks = chunkHandbookPages(handbook.id, pages);

  if (chunks.length === 0) {
    throw new Error("No indexable text was extracted from the handbook.");
  }

  const vectorIds: string[] = [];

  try {
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
  } catch (error) {
    if (vectorIds.length > 0) {
      try {
        await vector.delete(vectorIds);
      } catch {
        // Preserve the original processing error.
      }
    }
    throw error;
  }
}

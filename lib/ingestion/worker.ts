import { prisma } from "@/lib/prisma";
import { vector } from "@/lib/upstash";
import { indexHandbook } from "./process";

const STALE_PROCESSING_AFTER_MS = 10 * 60 * 1000;

export async function processHandbook(handbookId: string, courseId: string) {
  const staleBefore = new Date(Date.now() - STALE_PROCESSING_AFTER_MS);
  const claimed = await prisma.handbook.updateMany({
    where: {
      id: handbookId,
      courseId,
      OR: [
        { ingestionStatus: "PENDING" },
        { ingestionStatus: "FAILED" },
        {
          ingestionStatus: "PROCESSING",
          updatedAt: { lt: staleBefore },
        },
      ],
    },
    data: {
      ingestionStatus: "PROCESSING",
      ingestionError: null,
      isActive: false,
    },
  });

  if (claimed.count === 0) {
    const handbook = await prisma.handbook.findUnique({
      where: { id: handbookId },
      select: { courseId: true, ingestionStatus: true },
    });

    if (!handbook || handbook.courseId !== courseId) {
      throw new Error("The handbook or its course could not be found.");
    }

    // A completed or currently running delivery is an idempotent no-op.
    if (
      handbook.ingestionStatus === "READY" ||
      handbook.ingestionStatus === "PROCESSING"
    ) {
      return;
    }

    throw new Error("The handbook is not eligible for ingestion.");
  }

  let indexedIds: string[] = [];

  try {
    const handbook = await prisma.handbook.findUnique({
      where: { id: handbookId },
      select: { id: true, courseId: true, fileUrl: true, vectorIds: true },
    });

    if (!handbook || handbook.courseId !== courseId) {
      throw new Error("The handbook or its course could not be found.");
    }

    indexedIds = await indexHandbook(handbook);

    const obsoleteIds = handbook.vectorIds.filter(
      (id) => !indexedIds.includes(id),
    );

    if (obsoleteIds.length > 0) {
      await vector.delete(obsoleteIds);
    }

    await prisma.handbook.update({
      where: { id: handbookId },
      data: {
        vectorIds: indexedIds,
        ingestionStatus: "READY",
        ingestionError: null,
        processedAt: new Date(),
        isActive: true,
      },
    });
  } catch (error) {
    // Deterministic vector IDs make retrying safe. Remove partial writes before
    // allowing the next delivery to retry the same handbook.
    if (indexedIds.length > 0) {
      try {
        await vector.delete(indexedIds);
      } catch {
        // Keep the original ingestion failure as the reported error.
      }
    }

    const message =
      error instanceof Error ? error.message : "Unknown handbook ingestion error.";

    await prisma.handbook.update({
      where: { id: handbookId },
      data: {
        ingestionStatus: "FAILED",
        ingestionError: message.slice(0, 1_000),
        isActive: false,
      },
    });

    throw error;
  }
}

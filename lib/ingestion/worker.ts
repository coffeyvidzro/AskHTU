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

    if (handbook.ingestionStatus === "READY") {
      return;
    }

    if (handbook.ingestionStatus === "PROCESSING") {
      throw new Error("Handbook ingestion is already running.");
    }

    throw new Error("The handbook is not eligible for ingestion.");
  }

  const handbook = await prisma.handbook.findUnique({
    where: { id: handbookId },
    select: { id: true, courseId: true, fileUrl: true, vectorIds: true },
  });

  if (!handbook || handbook.courseId !== courseId) {
    throw new Error("The handbook or its course could not be found.");
  }

  const indexedIds = await indexHandbook(handbook);
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
}

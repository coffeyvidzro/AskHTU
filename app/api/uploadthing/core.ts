import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { env } from "@/env";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { qstash } from "@/lib/upstash";

const f = createUploadthing();

export const ourFileRouter = {
  handbookUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
  })
    .input(
      z.object({
        courseId: z.string(),
        title: z.string(),
      }),
    )
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        throw new UploadThingError("You must be logged in to upload files.");
      }

      const handbook = await prisma.handbook.create({
        data: {
          title: input.title,
          courseId: input.courseId,
          isActive: false,
        },
      });

      return {
        userId: session.user.id,
        handbookId: handbook.id,
        courseId: input.courseId,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.handbook.update({
        where: { id: metadata.handbookId },
        data: { fileUrl: file.ufsUrl },
      });

      await qstash.publishJSON({
        url: `${env.NEXT_PUBLIC_BASE_URL}/api/ingest/qstash`,
        body: {
          handbookId: metadata.handbookId,
          courseId: metadata.courseId,
          fileUrl: file.ufsUrl,
        },
      });

      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

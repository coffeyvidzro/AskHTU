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
        courseId: z.string().trim().min(1),
        title: z.string().trim().min(1).max(200),
      }),
    )
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        throw new UploadThingError("You must be logged in to upload files.");
      }

      if (session.user.role !== "ADMIN") {
        throw new UploadThingError("Only administrators can upload handbooks.");
      }

      const course = await prisma.course.findUnique({
        where: { id: input.courseId },
        select: { id: true },
      });

      if (!course) {
        throw new UploadThingError("The selected course does not exist.");
      }

      const handbook = await prisma.handbook.create({
        data: {
          title: input.title,
          courseId: course.id,
          isActive: false,
        },
      });

      return {
        userId: session.user.id,
        handbookId: handbook.id,
        courseId: course.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.handbook.update({
        where: { id: metadata.handbookId },
        data: { fileUrl: file.ufsUrl },
      });

      await qstash.publishJSON({
        url: new URL("/api/ingest/qstash", env.NEXT_PUBLIC_BASE_URL).toString(),
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

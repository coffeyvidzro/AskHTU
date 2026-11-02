import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HandbookUploadForm } from "@/components/admin/handbook-upload-form";

export default async function NewHandbookPage() {
  const courses = await prisma.course.findMany({
    orderBy: [{ programme: { department: { name: "asc" } } }, { programme: { name: "asc" } }, { code: "asc" }],
    select: { id: true, code: true, title: true, programme: { select: { name: true, department: { select: { name: true } } } } },
  });

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <Link href="/handbooks" className="text-sm text-muted-foreground hover:text-foreground">← Handbooks</Link>
        <h1 className="text-3xl font-semibold tracking-tight">Add a handbook</h1>
        <p className="text-sm text-muted-foreground">Upload a course PDF and make it available to students after it has been processed.</p>
      </div>
      <HandbookUploadForm courses={courses} />
    </main>
  );
}

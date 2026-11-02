import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const statusStyles = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  READY: "bg-green-500/10 text-green-700 dark:text-green-300",
  FAILED: "bg-destructive/10 text-destructive",
};

export default async function HandbookDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const handbook = await prisma.handbook.findUnique({
    where: { id },
    select: {
      id: true, title: true, fileUrl: true, isActive: true, ingestionStatus: true,
      ingestionError: true, processedAt: true, createdAt: true, updatedAt: true,
      course: { select: { code: true, title: true, programme: { select: { name: true, department: { select: { name: true } } } } } },
    },
  });
  if (!handbook) notFound();

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 p-6 md:p-10">
      <div className="space-y-2">
        <Link href="/handbooks" className="text-sm text-muted-foreground hover:text-foreground">← Handbooks</Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">{handbook.title}</h1>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[handbook.ingestionStatus]}`}>{handbook.ingestionStatus.toLowerCase()}</span>
        </div>
        <p className="text-sm text-muted-foreground">{handbook.course.code} · {handbook.course.title}</p>
      </div>
      <section className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-2">
        <div><p className="text-xs text-muted-foreground">Programme</p><p className="text-sm font-medium">{handbook.course.programme.name}</p></div>
        <div><p className="text-xs text-muted-foreground">Department</p><p className="text-sm font-medium">{handbook.course.programme.department.name}</p></div>
        <div><p className="text-xs text-muted-foreground">Availability</p><p className="text-sm font-medium">{handbook.isActive ? "Available to students" : "Not available to students"}</p></div>
        <div><p className="text-xs text-muted-foreground">Last processed</p><p className="text-sm font-medium">{handbook.processedAt ? handbook.processedAt.toLocaleString() : "Not processed"}</p></div>
        <div><p className="text-xs text-muted-foreground">Added</p><p className="text-sm font-medium">{handbook.createdAt.toLocaleString()}</p></div>
        <div><p className="text-xs text-muted-foreground">Last updated</p><p className="text-sm font-medium">{handbook.updatedAt.toLocaleString()}</p></div>
      </section>
      {handbook.fileUrl ? (
        <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5">
          <div><h2 className="font-medium">Original PDF</h2><p className="text-sm text-muted-foreground">View the uploaded source document.</p></div>
          <a href={handbook.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">Open PDF ↗</a>
        </section>
      ) : null}
      {handbook.ingestionStatus === "FAILED" && handbook.ingestionError ? (
        <section className="space-y-2 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
          <h2 className="font-medium text-destructive">Processing failed</h2>
          <p className="text-sm text-muted-foreground">{handbook.ingestionError}</p>
        </section>
      ) : null}
    </main>
  );
}

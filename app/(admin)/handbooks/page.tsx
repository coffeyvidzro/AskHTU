import Link from "next/link";
import { prisma } from "@/lib/prisma";

const statusStyles = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  READY: "bg-green-500/10 text-green-700 dark:text-green-300",
  FAILED: "bg-destructive/10 text-destructive",
};

export default async function HandbooksPage() {
  const handbooks = await prisma.handbook.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true, title: true, ingestionStatus: true, isActive: true,
      course: { select: { code: true, title: true, programme: { select: { name: true, department: { select: { name: true } } } } } },
    },
  });

  return (
    <main className="mx-auto w-full max-w-6xl space-y-8 p-6 md:p-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">Handbooks</h1>
          <p className="text-sm text-muted-foreground">Manage course materials and monitor their processing status.</p>
        </div>
        <Link href="/handbooks/new" className="inline-flex h-10 items-center justify-center rounded-2xl bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Add handbook</Link>
      </div>
      <div className="overflow-hidden rounded-2xl border">
        {handbooks.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <h2 className="font-medium">No handbooks yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">Upload a course handbook to make its content searchable for students.</p>
            <Link href="/handbooks/new" className="mt-2 text-sm font-medium text-primary hover:underline">Add your first handbook</Link>
          </div>
        ) : (
          <div className="divide-y">
            {handbooks.map((handbook) => (
              <Link key={handbook.id} href={`/handbooks/${handbook.id}`} className="flex flex-col gap-3 p-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <p className="truncate font-medium">{handbook.title}</p>
                  <p className="text-sm text-muted-foreground">{handbook.course.code} · {handbook.course.title}</p>
                  <p className="text-xs text-muted-foreground">{handbook.course.programme.name} · {handbook.course.programme.department.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[handbook.ingestionStatus]}`}>{handbook.ingestionStatus.toLowerCase()}</span>
                  <span className="text-xs text-muted-foreground">{handbook.isActive ? "Available to students" : "Not available"}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">{handbooks.length} {handbooks.length === 1 ? "handbook" : "handbooks"}</p>
    </main>
  );
}

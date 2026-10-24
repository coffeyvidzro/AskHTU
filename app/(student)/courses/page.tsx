import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Courses" };

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    orderBy: { code: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      description: true,
      handbooks: {
        where: { status: "READY" },
        orderBy: { version: "desc" },
        take: 1,
        select: { id: true, title: true, version: true },
      },
    },
  });

  return (
    <section>
      <p className="text-sm font-semibold text-[#2d896a]">Course library</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-[#173c31]">
        Find your course.
      </h1>
      <p className="mt-4 text-base leading-8 text-[#60786d]">
        The course catalog is managed by AskHTU administrators.
      </p>
      {courses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-[#cadfd0] bg-white px-8 py-16 text-center">
          <h2 className="text-lg font-semibold text-[#214b3c]">No courses have been published yet</h2>
          <p className="mt-3 text-sm text-[#668173]">Check back after the first course is added.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-2xl border border-[#dce9df] bg-white p-7">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#258363]">{course.code}</p>
              <h2 className="mt-3 text-xl font-semibold text-[#173c31]">{course.title}</h2>
              {course.description && <p className="mt-3 text-sm leading-6 text-[#60786d]">{course.description}</p>}
              <p className="mt-6 border-t border-[#e8eee9] pt-4 text-sm text-[#648072]">
                {course.handbooks.length > 0
                  ? `Latest handbook: ${course.handbooks[0].title} (v${course.handbooks[0].version})`
                  : "No handbook is ready yet"}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser();
  const [courseCount, handbookCount] = await Promise.all([
    prisma.course.count(),
    prisma.handbook.count({ where: { status: "READY" } }),
  ]);

  return (
    <section>
      <p className="text-sm font-semibold text-[#2d896a]">Your study workspace</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold tracking-tight text-[#173c31]">
        Welcome, {user.name}.
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-8 text-[#60786d]">
        Your courses and study materials will appear here as administrators publish handbooks.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#dce9df] bg-white p-7">
          <p className="text-sm font-medium text-[#658072]">Courses in catalog</p>
          <p className="mt-4 text-4xl font-semibold text-[#173c31]">{courseCount}</p>
        </div>
        <div className="rounded-2xl border border-[#dce9df] bg-white p-7">
          <p className="text-sm font-medium text-[#658072]">Ready handbooks</p>
          <p className="mt-4 text-4xl font-semibold text-[#173c31]">{handbookCount}</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 rounded-2xl bg-[#174d42] p-8 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Explore your course library</h2>
          <p className="mt-2 text-sm leading-6 text-[#cee3d7]">
            Browse available courses and see which handbooks are ready to study.
          </p>
        </div>
        <Link href="/courses" className="shrink-0 self-start rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#174d42] hover:bg-[#eff8f1]">
          View courses
        </Link>
      </div>
    </section>
  );
}

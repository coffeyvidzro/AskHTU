import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Administration" };

export default async function AdminPage() {
  const [users, courses, handbooks, ready] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.handbook.count(),
    prisma.handbook.count({ where: { status: "READY" } }),
  ]);

  const metrics = [
    { label: "Users", value: users },
    { label: "Courses", value: courses },
    { label: "Total handbooks", value: handbooks },
    { label: "Ready handbooks", value: ready },
  ];

  return (
    <section>
      <p className="text-sm font-semibold text-[#2d896a]">Administration</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-[#173c31]">AskHTU overview</h1>
      <p className="mt-4 text-[#60786d]">
        System totals are read directly from PostgreSQL.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-[#dce9df] bg-white p-6">
            <p className="text-sm text-[#648072]">{metric.label}</p>
            <p className="mt-4 text-4xl font-semibold text-[#173c31]">{metric.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-2xl border border-dashed border-[#d6e4d9] p-7 text-sm leading-7 text-[#60786d]">
        Course management, handbook uploads, and user administration will be enabled in later PRs.
      </div>
    </section>
  );
}

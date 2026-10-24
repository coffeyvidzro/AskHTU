import type { Metadata } from "next";
import { requireRole, roles } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Lecturer workspace" };

export default async function LecturerPage() {
  const user = await requireRole([roles.lecturer, roles.admin]);
  const courseCount = await prisma.courseLecturer.count({
    where: { userId: user.id },
  });

  return (
    <section>
      <p className="text-sm font-semibold text-[#2d896a]">Lecturer workspace</p>
      <h1 className="mt-3 font-heading text-4xl font-semibold text-[#173c31]">Your teaching materials</h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[#60786d]">
        You are assigned to {courseCount} {courseCount === 1 ? "course" : "courses"}.
        Handbook upload and publishing tools will arrive in the next feature PR.
      </p>
    </section>
  );
}

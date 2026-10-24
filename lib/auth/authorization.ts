import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

export const roles = {
  student: "STUDENT",
  lecturer: "LECTURER",
  admin: "ADMIN",
} as const;

export type UserRole = (typeof roles)[keyof typeof roles];

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/log-in");
  }

  // Always authorize against the database, not a client-supplied role.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    redirect("/log-in");
  }

  return user;
}

export async function requireRole(allowed: readonly UserRole[]) {
  const user = await requireUser();

  if (!allowed.some((role) => role === user.role)) {
    notFound();
  }

  return user;
}

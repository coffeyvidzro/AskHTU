import Link from "next/link";
import { requireRole, roles } from "@/lib/auth/authorization";

export default async function LecturerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole([roles.lecturer, roles.admin]);

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <header className="border-b border-[#e0eae1] bg-white px-6 py-5 sm:px-10">
        <nav aria-label="Lecturer workspace" className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-[#174d42]">AskHTU</Link>
          <Link href="/dashboard" className="text-sm font-medium text-[#42765b] hover:underline">Student workspace</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12 sm:px-10">{children}</main>
    </div>
  );
}

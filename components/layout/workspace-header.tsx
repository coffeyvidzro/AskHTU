import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { roles } from "@/lib/auth/authorization";

export function WorkspaceHeader({
  name,
  role,
}: {
  name: string;
  role: string;
}) {
  return (
    <header className="border-b border-[#e0eae1] bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5 px-6 py-5 sm:px-10">
        <div className="flex flex-wrap items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#193f32]">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#174d42] text-lg text-white">
              A
            </span>
            AskHTU
          </Link>
          <nav aria-label="Workspace" className="flex items-center gap-5 text-sm font-medium text-[#5d776a]">
            <Link href="/dashboard" className="hover:text-[#174d42]">Dashboard</Link>
            <Link href="/courses" className="hover:text-[#174d42]">Courses</Link>
            {(role === roles.lecturer || role === roles.admin) && (
              <Link href="/lecturer" className="hover:text-[#174d42]">Lecturer</Link>
            )}
            {role === roles.admin && (
              <Link href="/admin" className="hover:text-[#174d42]">Admin</Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden max-w-[12rem] truncate text-sm text-[#5d776a] sm:inline">
            {name}
          </span>
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}

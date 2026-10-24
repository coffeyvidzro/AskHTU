import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { requireUser } from "@/lib/auth/authorization";

export default async function StudentLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#f7f9f7]">
      <WorkspaceHeader name={user.name} role={user.role} />
      <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10 sm:py-14">
        {children}
      </main>
    </div>
  );
}

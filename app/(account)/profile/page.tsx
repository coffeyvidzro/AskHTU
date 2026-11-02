import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";

async function updateAcademicProfile(formData: FormData) {
  "use server";

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const programmeId = formData.get("programmeId");
  if (typeof programmeId !== "string" || !programmeId) redirect("/profile?error=programme");

  const programme = await prisma.programme.findUnique({
    where: { id: programmeId },
    select: { id: true },
  });
  if (!programme) redirect("/profile?error=programme");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { programmeId: programme.id },
  });

  revalidatePath("/profile");
  redirect("/profile?updated=1");
}

type ProfilePageProps = {
  searchParams: Promise<{ updated?: string; error?: string }>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [user, departments, params] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        programmeId: true,
        programme: {
          select: {
            code: true,
            name: true,
            department: { select: { name: true } },
          },
        },
      },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        programmes: {
          orderBy: { name: "asc" },
          select: { id: true, code: true, name: true },
        },
      },
    }),
    searchParams,
  ]);

  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-6 py-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Academic profile</h1>
        <p className="text-sm text-muted-foreground">
          Choose your programme so AskHTU can show you the handbooks for your course of study.
          You can update this at any time.
        </p>
      </header>

      {params.updated === "1" ? (
        <p role="status" className="rounded-xl border border-border bg-muted/40 p-3 text-sm">
          Your academic profile has been updated.
        </p>
      ) : null}
      {params.error === "programme" ? (
        <p role="alert" className="rounded-xl border border-destructive/30 p-3 text-sm text-destructive">
          Select a valid programme and try again.
        </p>
      ) : null}

      <section className="space-y-4 rounded-2xl border border-border p-5">
        <div>
          <h2 className="font-medium">Programme</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your department is determined by the programme you select.
          </p>
        </div>

        {user?.programme ? (
          <div className="rounded-xl bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium">{user.programme.name} ({user.programme.code})</p>
            <p className="text-muted-foreground">{user.programme.department.name}</p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">You have not selected a programme yet.</p>
        )}

        <form action={updateAcademicProfile} className="space-y-4">
          <label htmlFor="programmeId" className="block space-y-2 text-sm font-medium">
            Select your programme
            <select
              id="programmeId"
              name="programmeId"
              required
              defaultValue={user?.programmeId ?? ""}
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>Choose a programme</option>
              {departments.map((department) => (
                <optgroup key={department.id} label={department.name}>
                  {department.programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.name} ({programme.code})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
          <Button type="submit">Save academic profile</Button>
        </form>
      </section>
    </main>
  );
}

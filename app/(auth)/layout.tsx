import Link from "next/link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold text-[#183c32]">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#174d42] text-xl text-white">
            A
          </span>
          AskHTU
        </Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-14">
          {children}
        </div>
        <p className="text-xs leading-6 text-[#769084]">
          AskHTU is an independent study companion for HTU students.
        </p>
      </div>
      <aside className="hidden flex-col justify-between bg-[#153f34] p-14 text-white lg:flex">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#a9d8b7]">Study from the source</p>
        <div>
          <h2 className="max-w-lg font-heading text-5xl font-semibold leading-[1.13] tracking-tight">
            Your course material deserves a better way to explore it.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-[#c5e0d0]">
            Find the concepts, ask questions, and return to the page that explains them.
          </p>
        </div>
        <p className="text-sm text-[#add1bb]">Ho Technical University · Ghana</p>
      </aside>
    </main>
  );
}

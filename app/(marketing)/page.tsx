import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Choose a course",
    description: "Find your course and its uploaded teaching handbook.",
  },
  {
    number: "02",
    title: "Ask what matters",
    description: "Ask questions in plain language about the selected handbook.",
  },
  {
    number: "03",
    title: "Check the source",
    description: "Follow page citations to see where an answer comes from.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f9f7]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#174d42] text-xl font-semibold text-white">
            A
          </span>
          AskHTU
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-5 text-sm font-medium">
          <a href="#how-it-works" className="hidden text-[#49635a] hover:text-[#174d42] sm:inline">
            How it works
          </a>
          <Link href="/log-in" className="text-[#174d42] hover:underline">
            Log in
          </Link>
          <Link
            href="/create-account"
            className="rounded-full bg-[#174d42] px-4 py-2.5 text-white transition hover:bg-[#10392f]"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 pb-24 pt-16 sm:px-10 md:grid-cols-[1.1fr_0.9fr] md:pt-24">
        <div>
          <span className="inline-flex rounded-full border border-[#cce3d8] bg-[#ecf5ee] px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#245e4b]">
            Made for HTU students
          </span>
          <h1 className="mt-8 max-w-2xl font-heading text-5xl font-semibold leading-[1.07] tracking-tight text-[#102c27] sm:text-6xl">
            Understand the material. <span className="text-[#2c846b]">Know the page.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#526c62]">
            Study with your course handbooks, ask questions in your own words, and
            check the source behind every answer. Your reading, made more useful.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/create-account"
              className="rounded-xl bg-[#174d42] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#10392f]"
            >
              Start studying
            </Link>
            <Link
              href="/log-in"
              className="rounded-xl border border-[#c7d7ce] px-6 py-3.5 text-sm font-semibold text-[#174d42] transition hover:border-[#174d42]"
            >
              I have an account
            </Link>
          </div>
          <p className="mt-6 text-sm text-[#6b8278]">
            Independent study tool built around uploaded course materials.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 rounded-[2.5rem] bg-[#e5f1e8] blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-[#d8e6db] bg-white p-5 shadow-[0_25px_75px_-35px_rgba(17,62,47,0.35)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[#e6eee8] pb-5">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-[#e4f2e8] text-lg text-[#176148]">
                  📖
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#173a32]">Your course workspace</p>
                  <p className="text-xs text-[#6b8278]">Handbook-focused conversations</p>
                </div>
              </div>
              <span className="rounded-full bg-[#edf7f1] px-2.5 py-1 text-xs font-medium text-[#36765c]">
                Preview
              </span>
            </div>
            <div className="mt-7 flex justify-end">
              <p className="max-w-[85%] rounded-2xl rounded-tr-sm bg-[#174d42] px-4 py-3 text-sm leading-6 text-white">
                Could you explain this concept using the handbook?
              </p>
            </div>
            <div className="mt-5 rounded-2xl rounded-tl-sm border border-[#e5eee8] bg-[#f8fbf8] p-5">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#368063]">AskHTU</p>
              <p className="mt-3 text-sm leading-7 text-[#405b50]">
                Answers will be generated from the selected handbook, with links to
                the relevant original pages so you can read further.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#dcebe0] bg-white px-3 py-2 text-xs font-semibold text-[#27604e]">
                <span aria-hidden="true">↗</span> Page citation
              </div>
            </div>
            <p className="mt-5 text-center text-xs text-[#809187]">
              Illustrative interface — not a real handbook answer
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[#e2eae3] bg-white py-20">
        <div className="mx-auto max-w-6xl px-6 sm:px-10">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2b896b]">How it works</p>
            <h2 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-[#14362e] sm:text-4xl">
              Less searching. More understanding.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="rounded-2xl border border-[#e1ebe3] bg-[#fbfdfb] p-7">
                <p className="font-mono text-sm font-semibold text-[#2b896b]">{step.number}</p>
                <h3 className="mt-7 text-xl font-semibold text-[#17392e]">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#5e776b]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-8 text-sm text-[#668176] sm:px-10">
        <span>© {new Date().getFullYear()} AskHTU</span>
        <span>Built for learning at Ho Technical University.</span>
      </footer>
    </main>
  );
}

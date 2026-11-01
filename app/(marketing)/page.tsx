import Link from "next/link";

export default function MarketingHomePage() {
  return (
    <section className="max-w-3xl space-y-6 py-16">
      <p className="text-sm font-medium text-muted-foreground">
        Built for Ho Technical University students
      </p>
      <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
        Your HTU handbooks. One AI study companion.
      </h1>
      <p className="max-w-2xl text-lg text-muted-foreground">
        Ask questions about your official course handbooks and get answers
        grounded in your study materials, with references to the original pages.
      </p>
      <Link
        href="/chat"
        className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground"
      >
        Start studying
      </Link>
    </section>
  );
}

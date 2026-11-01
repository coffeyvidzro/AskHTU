import Link from "next/link";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6">
      <header className="flex h-20 items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          AskHTU
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          <Link href="/about">About</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/login">Log in</Link>
        </nav>
      </header>

      <main className="flex-1 py-16">{children}</main>

      <footer className="flex gap-6 border-t py-6 text-sm text-muted-foreground">
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </footer>
    </div>
  );
}

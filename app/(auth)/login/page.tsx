"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsPending(true);
    setMessage("");

    const { error } = await authClient.signIn.magicLink({
      email,
      callbackURL: "/login",
    });

    setIsPending(false);
    setMessage(
      error
        ? error.message ?? "Unable to send a sign-in link. Please try again."
        : "Check your email for a sign-in link."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Sign in to AskHTU</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we’ll send you a sign-in link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="h-10 w-full rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Sending link..." : "Continue with email"}
          </button>
        </form>

        {message ? (
          <p role="status" className="text-center text-sm text-muted-foreground">
            {message}
          </p>
        ) : null}
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const isSignUp = mode === "sign-up";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    try {
      const result = isSignUp
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });

      if (result.error) {
        setError(result.error.message ?? "Unable to authenticate. Please try again.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#2d896a]">
        {isSignUp ? "Create your account" : "Welcome back"}
      </p>
      <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-[#15392e]">
        {isSignUp ? "Start studying with AskHTU." : "Log in to AskHTU."}
      </h1>
      <p className="mt-3 text-sm leading-7 text-[#647c6f]">
        {isSignUp
          ? "Create a student account to explore your course materials."
          : "Continue to your study workspace and course library."}
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {isSignUp && (
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-[#27463a]">
              Full name
            </label>
            <input
              id="name"
              autoComplete="name"
              required
              maxLength={100}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-[#d2e1d5] bg-white px-4 py-3 text-sm outline-none focus:border-[#2b896b] focus:ring-2 focus:ring-[#2b896b]/15"
              placeholder="Your name"
            />
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#27463a]">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-[#d2e1d5] bg-white px-4 py-3 text-sm outline-none focus:border-[#2b896b] focus:ring-2 focus:ring-[#2b896b]/15"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#27463a]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-[#d2e1d5] bg-white px-4 py-3 text-sm outline-none focus:border-[#2b896b] focus:ring-2 focus:ring-[#2b896b]/15"
            placeholder="At least 8 characters"
          />
        </div>
        {isSignUp && (
          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#27463a]">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="w-full rounded-xl border border-[#d2e1d5] bg-white px-4 py-3 text-sm outline-none focus:border-[#2b896b] focus:ring-2 focus:ring-[#2b896b]/15"
              placeholder="Repeat your password"
            />
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-[#174d42] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#10392f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Please wait…" : isSignUp ? "Create account" : "Log in"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#6c8578]">
        {isSignUp ? "Already have an account?" : "New to AskHTU?"}{" "}
        <Link
          href={isSignUp ? "/log-in" : "/create-account"}
          className="font-semibold text-[#1d7659] hover:underline"
        >
          {isSignUp ? "Log in" : "Create an account"}
        </Link>
      </p>
    </>
  );
}

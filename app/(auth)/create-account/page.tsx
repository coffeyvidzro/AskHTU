import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "Create account" };

export default function CreateAccountPage() {
  return <AuthForm mode="sign-up" />;
}

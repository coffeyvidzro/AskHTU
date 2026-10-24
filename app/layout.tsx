import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { geistMono, geistSans, spaceGrotesk } from "@/utils/font";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://askhtu.com"),
  title: {
    default: "AskHTU — Study with your sources",
    template: "%s | AskHTU",
  },
  description:
    "A handbook-grounded study companion for Ho Technical University students. Ask questions about your course material and verify answers against their original pages.",
  applicationName: "AskHTU",
  openGraph: {
    type: "website",
    siteName: "AskHTU",
    title: "AskHTU — Study with your sources",
    description: "Understand your course handbooks with cited answers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        geistSans.variable,
        geistMono.variable,
        spaceGrotesk.variable,
      )}
    >
      <body className="flex min-h-full flex-col bg-[#f7f9f7] text-[#19322e]">
        {children}
      </body>
    </html>
  );
}

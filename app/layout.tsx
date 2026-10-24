import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { geistMono, geistSans, spaceGrotesk } from "@/utils/font";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = {
  metadataBase: new URL("https://askhtu.com"),
  title: "AskHTU",
  description: "A RAG-based AI chatbot built for HTU students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
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
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}

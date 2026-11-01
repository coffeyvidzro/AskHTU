import { openai } from "@/lib/openai";
import type { HandbookSource } from "./retrieve";

const CHAT_MODEL = "gpt-4o-mini";

export async function generateHandbookAnswer(
  question: string,
  sources: HandbookSource[],
  history: { role: "USER" | "ASSISTANT"; content: string }[] = [],
): Promise<string> {
  const context = sources
    .map(
      (source, index) =>
        `[Source ${index + 1} | PDF page ${source.pageNumber}]\n${source.text}`,
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.1,
    messages: [
      {
        role: "system",
        content: [
          "You are AskHTU, a study assistant for Ho Technical University students.",
          "Answer the student's question using only the supplied handbook excerpts.",
          "Do not use outside knowledge or invent facts, definitions, examples, or page references.",
          "If the excerpts do not contain enough information to answer, say that the selected handbook does not provide enough information.",
          "Cite every substantive claim with the original PDF page using the exact format [Page N].",
          "When multiple pages support an answer, cite each relevant page.",
          "Use clear, student-friendly language. Do not claim to have read content that is not in the excerpts.",
        ].join(" "),
      },
      ...history.slice(-8).map((item) => ({
        role: item.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: item.content,
      })),
      {
        role: "user",
        content: `Handbook excerpts:\n\n${context}\n\nStudent question: ${question}`,
      },
    ],
  });

  return response.choices[0]?.message.content?.trim() ||
    "I couldn't generate an answer from the selected handbook.";
}

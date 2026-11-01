import { openai } from "@/lib/openai";
import { vector } from "@/lib/upstash";

const EMBEDDING_MODEL = "text-embedding-3-small";
const RETRIEVAL_LIMIT = 8;

export type HandbookSource = {
  pageNumber: number;
  text: string;
  score: number;
};

export async function retrieveHandbookContext(
  handbookId: string,
  question: string,
  history: { role: "USER" | "ASSISTANT"; content: string }[] = [],
): Promise<HandbookSource[]> {
  const embedding = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: [...history.slice(-6).map((item) => item.content), question].join("\n"),
  });

  const [query] = embedding.data;
  if (!query) {
    throw new Error("OpenAI did not return a query embedding.");
  }

  const matches = await vector.query({
    vector: query.embedding,
    topK: RETRIEVAL_LIMIT,
    filter: `handbookId = '${handbookId}'`,
    includeMetadata: true,
  });

  return matches
    .filter((match) => match.metadata && typeof match.metadata.text === "string")
    .map((match) => ({
      pageNumber: Number(match.metadata?.pageNumber),
      text: String(match.metadata?.text),
      score: match.score ?? 0,
    }))
    .filter(
      (source) =>
        Number.isInteger(source.pageNumber) &&
        source.pageNumber > 0 &&
        source.text.length > 0,
    );
}

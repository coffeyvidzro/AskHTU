import { createOpenAI } from "@ai-sdk/openai";
import type { UIMessage } from "ai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { env } from "@/env";
import { auth } from "@/lib/auth/server";

const openai = createOpenAI({
  apiKey: env.OPENAI_KEY,
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  const response = streamText({
    model: openai("gpt-4o-mini"),
    system:
      "You are AskHTU, a helpful study assistant for Ho Technical University students.",
    messages: modelMessages,
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: response.stream }),
  });
}

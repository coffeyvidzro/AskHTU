import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { generateHandbookAnswer } from "@/lib/chat/answer";
import { retrieveHandbookContext } from "@/lib/chat/retrieve";
import { prisma } from "@/lib/prisma";

const chatRequestSchema = z.object({
  handbookId: z.string().trim().min(1),
  conversationId: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).max(8_000),
});

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = new URL(req.url).searchParams;
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
        ...(searchParams.get("handbookId")
          ? { handbookId: searchParams.get("handbookId")! }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        handbook: { select: { id: true, title: true } },
        updatedAt: true,
      },
    });

    return Response.json(conversations);
  }

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    select: {
      id: true,
      title: true,
      handbook: { select: { id: true, title: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        select: { id: true, role: true, content: true, sources: true, createdAt: true },
      },
    },
  });

  if (!conversation) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  return Response.json(conversation);
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload: unknown = await req.json();
  const parsed = chatRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid chat request.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { handbookId, conversationId, message } = parsed.data;

  const handbook = await prisma.handbook.findFirst({
    where: {
      id: handbookId,
      isActive: true,
      ingestionStatus: "READY",
    },
    select: { id: true },
  });

  if (!handbook) {
    return Response.json(
      { error: "This handbook is not available for chat yet." },
      { status: 404 },
    );
  }

  const conversation = conversationId
    ? await prisma.conversation.findFirst({
        where: { id: conversationId, userId: session.user.id, handbookId },
        select: {
          id: true,
          messages: {
            take: 8,
            orderBy: { createdAt: "desc" },
            select: { role: true, content: true },
          },
        },
      })
    : null;

  if (conversationId && !conversation) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  const history = (conversation?.messages ?? [])
    .filter((item) => item.role !== "SYSTEM")
    .reverse()
    .map((item) => ({
      role: item.role === "USER" ? ("USER" as const) : ("ASSISTANT" as const),
      content: item.content,
    }));

  const sources = await retrieveHandbookContext(handbook.id, message, history);
  const answer = sources.length
    ? await generateHandbookAnswer(message, sources, history)
    : "I couldn't find relevant information for that question in the selected handbook. Try rephrasing your question or checking another handbook.";

  const sourcePages = [
    ...new Map(
      sources.map((source) => [
        source.pageNumber,
        { pageNumber: source.pageNumber },
      ]),
    ).values(),
  ].sort((a, b) => a.pageNumber - b.pageNumber);

  const savedConversation = await prisma.$transaction(async (tx) => {
    const currentConversation =
      conversation ??
      (await tx.conversation.create({
        data: {
          userId: session.user.id,
          handbookId,
          title: message.slice(0, 80),
        },
        select: { id: true },
      }));

    await tx.message.createMany({
      data: [
        {
          conversationId: currentConversation.id,
          role: "USER",
          content: message,
        },
        {
          conversationId: currentConversation.id,
          role: "ASSISTANT",
          content: answer,
          sources: sourcePages,
        },
      ],
    });

    await tx.conversation.update({
      where: { id: currentConversation.id },
      data: { updatedAt: new Date() },
    });

    return currentConversation;
  });

  return Response.json({
    conversationId: savedConversation.id,
    answer,
    sources: sourcePages,
  });
}

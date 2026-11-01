import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const paramsSchema = z.object({
  conversationId: z.string().trim().min(1),
});

const querySchema = z.object({
  messageCursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

const updateSchema = z.object({
  title: z.string().trim().min(1).max(120),
});

type RouteContext = {
  params: Promise<{ conversationId: string }>;
};

export async function GET(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return Response.json({ error: "Invalid conversation ID." }, { status: 400 });
  }

  const query = querySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams),
  );

  if (!query.success) {
    return Response.json(
      { error: "Invalid message query.", issues: query.error.flatten() },
      { status: 400 },
    );
  }

  const { conversationId } = params.data;
  const { messageCursor, limit } = query.data;

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
    select: {
      id: true,
      title: true,
      handbook: { select: { id: true, title: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!conversation) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    take: limit + 1,
    ...(messageCursor ? { cursor: { id: messageCursor }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      role: true,
      content: true,
      sources: true,
      createdAt: true,
    },
  });

  const hasMore = messages.length > limit;
  const items = messages.slice(0, limit).reverse();

  return Response.json({
    conversation,
    messages: items,
    nextMessageCursor: hasMore ? messages[limit - 1]?.id ?? null : null,
  });
}

export async function PATCH(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return Response.json({ error: "Invalid conversation ID." }, { status: 400 });
  }

  const payload: unknown = await req.json();
  const parsed = updateSchema.safeParse(payload);

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid conversation update.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await prisma.conversation.updateMany({
    where: {
      id: params.data.conversationId,
      userId: session.user.id,
    },
    data: { title: parsed.data.title },
  });

  if (updated.count === 0) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  return Response.json(
    await prisma.conversation.findUniqueOrThrow({
      where: { id: params.data.conversationId },
      select: { id: true, title: true, updatedAt: true },
    }),
  );
}

export async function DELETE(req: Request, context: RouteContext) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const params = paramsSchema.safeParse(await context.params);
  if (!params.success) {
    return Response.json({ error: "Invalid conversation ID." }, { status: 400 });
  }

  const deleted = await prisma.conversation.deleteMany({
    where: {
      id: params.data.conversationId,
      userId: session.user.id,
    },
  });

  if (deleted.count === 0) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  return new Response(null, { status: 204 });
}

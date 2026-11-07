import { z } from "zod";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/prisma";

const listQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  handbookId: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const parsed = listQuerySchema.safeParse(
    Object.fromEntries(new URL(req.url).searchParams),
  );

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid conversation query.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { cursor, handbookId, limit } = parsed.data;
  const conversations = await prisma.conversation.findMany({
    where: {
      userId: session.user.id,
      ...(handbookId ? { handbookId } : {}),
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: {
      id: true,
      title: true,
      handbook: { select: { id: true, title: true } },
      createdAt: true,
      updatedAt: true,
      _count: { select: { messages: true } },
      messages: {
        take: 1,
        orderBy: { createdAt: "desc" },
        select: { content: true, role: true, createdAt: true },
      },
    },
  });

  const hasMore = conversations.length > limit;
  const items = conversations.slice(0, limit);

  return Response.json({
    items,
    nextCursor: hasMore ? (items.at(-1)?.id ?? null) : null,
  });
}

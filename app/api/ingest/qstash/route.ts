import { z } from "zod";
import { processHandbook } from "@/lib/ingestion/worker";
import { receiver } from "@/lib/upstash";

const ingestionPayloadSchema = z.object({
  handbookId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
});

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  const signature = req.headers.get("Upstash-Signature");

  if (!signature) {
    return new Response("Missing signature", { status: 401 });
  }

  const body = await req.text();
  const isValid = await receiver.verify({ signature, body });

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload: unknown = JSON.parse(body);
  const parsed = ingestionPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response("Invalid ingestion payload", { status: 400 });
  }

  await processHandbook(parsed.data.handbookId, parsed.data.courseId);
  return Response.json({ status: "processed" });
}

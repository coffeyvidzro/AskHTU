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

  let isValid = false;
  try {
    isValid = await receiver.verify({ signature, body });
  } catch {
    return new Response("Invalid signature", { status: 401 });
  }

  if (!isValid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response("Invalid JSON payload", { status: 400 });
  }

  const parsed = ingestionPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return new Response("Invalid ingestion payload", { status: 400 });
  }

  try {
    await processHandbook(parsed.data.handbookId, parsed.data.courseId);
    return Response.json({ status: "processed" });
  } catch (error) {
    console.error("Handbook ingestion failed", {
      handbookId: parsed.data.handbookId,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return new Response("Handbook ingestion failed", { status: 500 });
  }
}

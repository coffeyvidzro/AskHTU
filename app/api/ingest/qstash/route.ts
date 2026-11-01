import { z } from "zod";
import { receiver } from "@/lib/upstash";

const ingestionPayloadSchema = z.object({
  handbookId: z.string().trim().min(1),
  courseId: z.string().trim().min(1),
  fileUrl: z.url(),
});

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

  const parsedPayload = ingestionPayloadSchema.safeParse(payload);

  if (!parsedPayload.success) {
    return new Response("Invalid ingestion payload", { status: 400 });
  }

  // The ingestion worker is not implemented yet. Keep uploaded handbooks
  // inactive until extraction, indexing, and verification have completed.
  return new Response("Handbook ingestion is not implemented yet.", {
    status: 501,
  });
}

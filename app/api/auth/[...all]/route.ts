import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/server";
import { authArcjet } from "@/lib/arcjet";

const handlers = toNextJsHandler(auth);

export async function GET(request: Request) {
  const decision = await authArcjet.protect(request);

  if (decision.isDenied()) {
    return new Response("Request blocked.", {
      status: decision.reason.isRateLimit() ? 429 : 403,
    });
  }

  if (decision.isErrored()) {
    console.error("Arcjet authentication protection failed:", decision.reason.message);
  }

  return handlers.GET(request);
}

export async function POST(request: Request) {
  const decision = await authArcjet.protect(request);

  if (decision.isDenied()) {
    return new Response("Request blocked.", {
      status: decision.reason.isRateLimit() ? 429 : 403,
    });
  }

  if (decision.isErrored()) {
    console.error("Arcjet authentication protection failed:", decision.reason.message);
  }

  return handlers.POST(request);
}

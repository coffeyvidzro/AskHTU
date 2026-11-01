import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

export async function proxy(request: NextRequest) {
  if (!getSessionCookie(request)) {
    return NextResponse.next();
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.next();
  }

  const destination = session.user.role === "ADMIN" ? "/overview" : "/chat";

  return NextResponse.redirect(new URL(destination, request.url));
}

export const config = {
  matcher: ["/"],
};

import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),

    OPENAI_KEY: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    RESEND_KEY: z.string().min(1),

    UPSTASH_REDIS_URL: z.url(),
    UPSTASH_REDIS_TOKEN: z.string().min(1),
    UPSTASH_QSTASH_TOKEN: z.string().min(1),
    UPSTASH_VECTOR_URL: z.url(),
    UPSTASH_VECTOR_TOKEN: z.string().min(1),
    QSTASH_CURRENT_SIGNING_KEY: z.string().min(1),
    QSTASH_NEXT_SIGNING_KEY: z.string().min(1),

    UPLOADTHING_TOKEN: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  emptyStringAsUndefined: true,
});

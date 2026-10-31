import { Client, Receiver } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { Index } from "@upstash/vector";
import { env } from "@/env";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_URL,
  token: env.UPSTASH_REDIS_TOKEN,
});

export const qstash = new Client({
  token: env.UPSTASH_QSTASH_TOKEN,
});

export const vector = new Index({
  url: env.UPSTASH_VECTOR_URL,
  token: env.UPSTASH_VECTOR_TOKEN,
});

export const receiver = new Receiver({
  currentSigningKey: env.QSTASH_CURRENT_SIGNING_KEY,
  nextSigningKey: env.QSTASH_NEXT_SIGNING_KEY,
});

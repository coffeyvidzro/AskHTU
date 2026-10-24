import { Client } from "@upstash/qstash";
import { Redis } from "@upstash/redis";
import { Index } from "@upstash/vector";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL,
  token: process.env.UPSTASH_REDIS_TOKEN,
});

export const qstash = new Client({
  token: process.env.UPSTASH_QSTASH_TOKEN,
});

export const vector = new Index({
  url: process.env.UPSTASH_VECTOR_URL,
  token: process.env.UPSTASH_VECTOR_TOKEN,
});

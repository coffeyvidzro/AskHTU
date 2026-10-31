import arcjet, {
  detectBot,
  detectPromptInjection,
  sensitiveInfo,
  shield,
  tokenBucket,
} from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { env } from "@/env";

export default arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
    tokenBucket({
      mode: "LIVE",
      refillRate: 30,
      interval: "1h",
      capacity: 30,
    }),
    sensitiveInfo({
      mode: "LIVE",
      deny: ["CREDIT_CARD_NUMBER"],
      backend: rampart(),
    }),
    detectPromptInjection({
      mode: "LIVE",
    }),
  ],
});

import arcjet, {
  detectBot,
  detectPromptInjection,
  sensitiveInfo,
  shield,
  tokenBucket,
} from "@arcjet/next";
import { rampart } from "@arcjet/sensitive-info-rampart";
import { env } from "@/env";

const aj = arcjet({
  key: env.ARCJET_KEY,
  characteristics: ["userId"],
  rules: [shield({ mode: "LIVE" })],
});

export const authArcjet = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: "15m",
      capacity: 5,
    }),
  );

export const chatArcjet = aj
  .withRule(
    detectBot({
      mode: "LIVE",
      allow: [],
    }),
  )
  .withRule(
    tokenBucket({
      mode: "LIVE",
      refillRate: 30,
      interval: "1h",
      capacity: 30,
    }),
  )
  .withRule(
    sensitiveInfo({
      mode: "LIVE",
      deny: ["CREDIT_CARD_NUMBER"],
      backend: rampart(),
    }),
  )
  .withRule(
    detectPromptInjection({
      mode: "LIVE",
    }),
  );

export const uploadArcjet = aj.withRule(
  tokenBucket({
    mode: "LIVE",
    refillRate: 10,
    interval: "1h",
    capacity: 10,
  }),
);

export default aj;

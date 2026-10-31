import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: [
    "@arcjet/sensitive-info-rampart",
    "@huggingface/transformers",
    "onnxruntime-node",
  ],
};

export default nextConfig;

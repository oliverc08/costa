import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing page reads the published eval score from disk at request time.
  outputFileTracingIncludes: {
    "/": ["./public/eval-results.json"],
  },
  // Transformers.js / ONNX are browser-only; keep them out of the Node server bundle.
  serverExternalPackages: ["@huggingface/transformers", "onnxruntime-node"],
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The landing page reads the published eval score from disk at request time.
  outputFileTracingIncludes: {
    "/": ["./public/eval-results.json"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      // mupdf's emscripten glue does a node-only `await import("module")`.
      // Stub it for the browser build so Turbopack can bundle the worker.
      module: { browser: "./lib/empty-shim.ts" },
    },
  },
};

export default nextConfig;

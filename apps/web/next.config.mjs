import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // How web consumes @tally/shared: its tsup-built output (dist, ESM + .d.ts),
  // the same artifact the API imports. We do not use transpilePackages because
  // the package already ships real JS and types; `pnpm dev` rebuilds it in
  // watch mode so edits propagate. One source of truth, one build.
  reactStrictMode: true,
  // Pin the file-tracing root to the monorepo so Next does not guess it from an
  // unrelated lockfile elsewhere on the machine.
  outputFileTracingRoot: resolve(here, "../.."),
};

export default nextConfig;

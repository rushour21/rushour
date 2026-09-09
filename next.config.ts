import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse (via pdfjs-dist) loads its worker as a real file at runtime.
  // Bundling it - the Turbopack/webpack default - rewrites that file's path
  // into a chunk the worker loader can never find ("Setting up fake worker
  // failed"). Marking it external keeps it as a plain node_modules require,
  // which is the fix pdf-parse's own docs specify for Next.js.
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;

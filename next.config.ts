import type { NextConfig } from "next";

// GitHub Pages preview build: static export served under /<repo-name>.
// Set by the deploy workflow; local dev/build are unaffected.
const isPages = process.env.GITHUB_PAGES === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = isPages
  ? {
      // static export cannot use Cache Components / partial prerendering
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      cacheComponents: true,
      partialPrefetching: true,
    };

export default nextConfig;

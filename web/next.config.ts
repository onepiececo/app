import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  experimental: {
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: true,
    turbopackFileSystemCacheForBuild: true,
    optimizePackageImports: ["@phosphor-icons/react"],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isProduction
    ? {
        assetPrefix: "/",
        output: "export" as const,
      }
    : {}),
};

export default nextConfig;

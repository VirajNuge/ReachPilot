import type { NextConfig } from "next";
import dns from "node:dns";
import withBundleAnalyzer from "@next/bundle-analyzer";

// Force IPv4 resolution by default to prevent native fetch from hanging on
// IPv6-enabled hosts like api.linkedin.com on Windows.
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  serverExternalPackages: [
    "puppeteer",
    "puppeteer-extra",
    "puppeteer-extra-plugin-stealth",
    "puppeteer-extra-plugin-recaptcha",
  ],
  // ── Image Optimization ────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for immutable images
  },
  // ── Webpack & Build Optimizations ────────────────────────────────────
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.output.publicPath = "/_next/";
      config.output.chunkLoadTimeout = 120000;
    }

    return config;
  },
  // ── Compression & Caching ────────────────────────────────────────────
  compress: true,
  productionBrowserSourceMaps: false, // Disable source maps in production to reduce bundle
  // ── SWR & ISR defaults ─────────────────────────────────────────────────
  onDemandEntries: {
    maxInactiveAge: 25 * 60 * 1000, // 25 minutes — prevents re-compile on revisit
    pagesBufferLength: 10,
  },
};

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(
  nextConfig
);

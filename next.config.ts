import type { NextConfig } from "next";
import dns from "node:dns";

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
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.output.publicPath = "/_next/";
      config.output.chunkLoadTimeout = 120000;
    }

    return config;
  },
};

export default nextConfig;

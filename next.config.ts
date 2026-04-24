import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

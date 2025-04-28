import type { NextConfig } from "next";
// Integrate bundle analyzer plugin
const withBundleAnalyzer: any = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);

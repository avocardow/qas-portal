import type { NextConfig } from "next";
const path = require('path');
// Integrate bundle analyzer plugin
const withBundleAnalyzer: any = require('@next/bundle-analyzer')({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  /* config options here */
  webpack(config) {
    // Alias '@' to 'src' directory
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(__dirname, 'src'),
    };
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
};

export default withBundleAnalyzer(nextConfig);

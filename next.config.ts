import type { NextConfig } from "next";
import path from "path";
// Integrate bundle analyzer plugin
import bundleAnalyzer from "@next/bundle-analyzer";
const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === 'true' });

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

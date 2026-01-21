import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to acknowledge we're using Turbopack
  turbopack: {},
  
  // Externalize pdfjs-dist for server-side usage (avoids worker issues)
  serverExternalPackages: ['pdfjs-dist', 'canvas'],
};

export default nextConfig;

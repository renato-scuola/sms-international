import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  basePath: '/sms-international',
  assetPrefix: '/sms-international',
  images: {
    unoptimized: true
  }
};

export default nextConfig;

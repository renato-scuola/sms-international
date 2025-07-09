import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: 'out',
  basePath: isProd ? '/sms-international' : '',
  assetPrefix: isProd ? '/sms-international' : '',
  images: {
    unoptimized: true
  }
};

export default nextConfig;

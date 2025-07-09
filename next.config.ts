import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // Use static export only for GitHub Pages, not for Vercel
  ...(isProd && !isVercel ? { 
    output: 'export',
    trailingSlash: true,
    skipTrailingSlashRedirect: true,
    distDir: 'out',
    basePath: '/sms-international',
    assetPrefix: '/sms-international',
  } : {}),
  images: {
    unoptimized: true
  }
};

export default nextConfig;

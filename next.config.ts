import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' && !isVercel;

const nextConfig: NextConfig = {
  // Static export only for GitHub Pages
  ...(isGitHubPages ? { 
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

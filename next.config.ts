import type { NextConfig } from "next";

// Check if we're on Vercel platform
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
// Check if we're building for GitHub Pages specifically
const isGitHubPages = process.env.GITHUB_PAGES_BUILD === 'true';

console.log('Build environment:', {
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  GITHUB_ACTIONS: process.env.GITHUB_ACTIONS,
  GITHUB_PAGES_BUILD: process.env.GITHUB_PAGES_BUILD,
  isVercel,
  isGitHubPages,
  useExport: isGitHubPages
});

const nextConfig: NextConfig = {
  // Static export ONLY for GitHub Pages, never for Vercel
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

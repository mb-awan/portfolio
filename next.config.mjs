import million from 'million/compiler';

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion'],
    webVitalsAttribution: ['FCP', 'LCP', 'CLS', 'FID', 'TTFB', 'INP'],
  },
  images: {
    deviceSizes: [390, 435, 768, 1024, 1280],
    formats: ['image/avif'],
    remotePatterns: [
      { hostname: 'cdn.discordapp.com' },
      { hostname: 'media.discordapp.net' },
      { hostname: 'dcdn.dstn.to' },
    ],
  },
  reactStrictMode: true,
  trailingSlash: false,
};

export default million.next(nextConfig);

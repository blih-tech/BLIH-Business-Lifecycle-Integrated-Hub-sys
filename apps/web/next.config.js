/** @type {import('next').NextConfig} */
/* eslint-disable no-undef -- Next.js config runs in Node; `process` is provided at runtime */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_BLIH_VERCEL: process.env.VERCEL === '1' ? '1' : '0',
  },
  // output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.figma.com',
        pathname: '/api/mcp/asset/**',
      },
    ],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thhdbpcshgfnigshhula.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    unoptimized: true,
  },
  reactStrictMode: true,
  serverExternalPackages: ['@prisma/client'],
};

module.exports = nextConfig; 
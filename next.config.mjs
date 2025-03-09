/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.resume-ai.net'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.resume-ai.net';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`, // 指向您的Go后端
      },
    ];
  },
}

export default nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.resume-ai.net'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/:path*', // 指向您的Go后端
      },
    ];
  },
}

export default nextConfig 
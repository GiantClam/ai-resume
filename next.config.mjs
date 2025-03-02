/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.example.com'], // 更新为您实际的后端域名
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.example.com/api/:path*', // 使用固定URL，不依赖环境变量
      },
    ];
  },
}

export default nextConfig 
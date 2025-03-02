/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.example.com'], // 更新为您实际的后端域名
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    // 提供一个默认值，确保在环境变量未定义时也有一个有效的URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.example.com';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
}

export default nextConfig 
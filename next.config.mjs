/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-backend-api.com'], // 如果需要使用远程图片，添加域名
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL + '/api/:path*',
      },
    ];
  },
}

export default nextConfig 
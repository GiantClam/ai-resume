/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.resume-ai.net'],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
  async rewrites() {
    // 硬编码默认值，避免任何环境变量问题
    const apiUrl = 'https://api.resume-ai.net';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`, // 指向您的Go后端
      },
    ];
  },
}

export default nextConfig 
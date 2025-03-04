// 简单的示例API端点
export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from Vercel Serverless API!',
    timestamp: new Date().toISOString()
  });
} 
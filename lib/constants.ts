// 根据环境使用不同的API基础URL
export const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    : "https://api.resume-ai.net"; 
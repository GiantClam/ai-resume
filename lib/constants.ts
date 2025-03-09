// 根据环境使用不同的API基础URL
export const API_BASE_URL = 
  typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? "http://localhost:8180" 
    : "https://api.resume-ai.net"; 
// Vercel Edge中间件
import { NextResponse } from 'next/server';

export function middleware(request) {
  // 获取请求URL
  const url = request.nextUrl;
  
  // 处理API请求
  if (url.pathname.startsWith('/api/')) {
    // 创建指向您外部API的URL
    const apiUrl = new URL(url.pathname, process.env.NEXT_PUBLIC_API_URL);
    
    // 复制所有查询参数
    url.searchParams.forEach((value, key) => {
      apiUrl.searchParams.append(key, value);
    });
    
    // 重写请求到外部API
    return NextResponse.rewrite(apiUrl);
  }
  
  // 其他请求正常处理
  return NextResponse.next();
}

// 配置哪些路径会触发中间件
export const config = {
  matcher: ['/api/:path*'],
}; 
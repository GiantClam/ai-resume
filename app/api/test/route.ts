import { NextRequest, NextResponse } from 'next/server';

// 后端API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    console.log(`尝试连接到后端: ${API_URL}/api/test`);
    
    // 转发到后端
    const response = await fetch(`${API_URL}/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // 获取响应
    const data = await response.json();
    console.log('后端响应:', data);

    // 返回响应
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('API测试失败:', error);
    return NextResponse.json(
      { 
        error: '连接后端失败', 
        details: error.message,
        apiUrl: API_URL
      },
      { status: 500 }
    );
  }
} 
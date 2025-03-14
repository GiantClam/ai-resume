import { NextRequest, NextResponse } from 'next/server';

// 后端API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    // 获取请求数据
    const requestData = await request.json();

    // 转发到后端
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // 获取响应
    const data = await response.json();

    // 返回响应
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('注册请求失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 
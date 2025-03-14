import { NextRequest, NextResponse } from 'next/server';

// 后端API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    // 获取Authorization头
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: '未授权' },
        { status: 401 }
      );
    }

    // 转发到后端
    const response = await fetch(`${API_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    // 获取响应
    const data = await response.json();

    // 返回响应
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '服务器错误，请稍后再试' },
      { status: 500 }
    );
  }
} 
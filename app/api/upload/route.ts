import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 设置为60秒，文件上传可能需要更长时间

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-api.com';
  
  try {
    // 获取表单数据
    const formData = await request.formData();
    
    // 转发到后端API
    const response = await fetch(`${apiUrl}/api/upload`, {
      method: 'POST',
      body: formData, // 直接转发FormData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`上传失败: ${errorText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('文件上传错误:', error);
    return NextResponse.json(
      { error: '文件上传失败' },
      { status: 500 }
    );
  }
} 
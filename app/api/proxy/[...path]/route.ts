import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // 默认为动态路由

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-api.com';
  const url = new URL(request.url);
  const searchParams = url.searchParams.toString();
  
  try {
    const response = await fetch(`${apiUrl}/api/${path}?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend API' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-api.com';
  
  try {
    const body = await request.json();
    const response = await fetch(`${apiUrl}/api/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from backend API' },
      { status: 500 }
    );
  }
} 
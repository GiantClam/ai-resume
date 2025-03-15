"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function TestPage() {
  const [testMessage, setTestMessage] = useState<string>("");
  const [apiUrl, setApiUrl] = useState<string>("未知");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // 尝试获取环境变量
    if (process.env.NEXT_PUBLIC_API_URL) {
      setApiUrl(process.env.NEXT_PUBLIC_API_URL);
    } else {
      setApiUrl("未设置 (默认使用 http://localhost:8080)");
    }
  }, []);

  // 测试直接调用后端API
  const testDirectApi = async () => {
    setLoading(true);
    setError("");
    setTestMessage("");
    
    try {
      const response = await fetch("http://localhost:8080/api/test");
      
      if (!response.ok) {
        throw new Error(`状态码: ${response.status}`);
      }
      
      const data = await response.json();
      setTestMessage(`直接调用成功: ${JSON.stringify(data)}`);
    } catch (err: any) {
      setError(`直接调用失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试通过Next.js API代理调用
  const testProxyApi = async () => {
    setLoading(true);
    setError("");
    setTestMessage("");
    
    try {
      const response = await fetch("/api/test");
      
      if (!response.ok) {
        throw new Error(`状态码: ${response.status}`);
      }
      
      const data = await response.json();
      setTestMessage(`通过代理调用成功: ${JSON.stringify(data)}`);
    } catch (err: any) {
      setError(`通过代理调用失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API连接测试</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl}</p>
      </div>
      
      <div className="flex gap-4 mb-4">
        <Button onClick={testDirectApi} disabled={loading}>
          直接调用后端API
        </Button>
        <Button onClick={testProxyApi} disabled={loading}>
          通过Next.js API代理调用
        </Button>
      </div>
      
      {loading && <p className="text-blue-500">请求中...</p>}
      
      {testMessage && (
        <div className="p-4 bg-green-100 text-green-800 rounded mb-4">
          {testMessage}
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded mb-4">
          {error}
        </div>
      )}
    </div>
  );
} 
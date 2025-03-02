import './globals.css';
import type { Metadata } from 'next';
import { SharedFieldsProvider } from '../lib/contexts/shared-fields-context';
import dynamic from 'next/dynamic';

// 动态导入客户端组件包装器，避免SSR问题
const ClientComponents = dynamic(() => import('./client-components'), { ssr: false });

export const metadata: Metadata = {
  title: 'AI HR Assistant',
  description: '智能人力资源助手，为您提供简历筛选、面试题生成和面试总结等智能服务',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="antialiased min-h-screen flex flex-col">
        <SharedFieldsProvider>
          <main className="flex-1">
            {children}
          </main>
          <ClientComponents />
        </SharedFieldsProvider>
      </body>
    </html>
  );
}

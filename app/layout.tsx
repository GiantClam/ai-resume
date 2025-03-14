import './globals.css';
import type { Metadata } from 'next';
import { SharedFieldsProvider } from '../lib/contexts/shared-fields-context';
import { BookmarkProvider } from '../lib/contexts/bookmark-context';
import dynamic from 'next/dynamic';
import Script from 'next/script';

// 动态导入客户端组件包装器，避免SSR问题
const ClientComponents = dynamic(() => import('./client-components'), { ssr: false });
// 动态导入导航栏组件，避免SSR问题
const Navbar = dynamic(() => import('@/components/layout/navbar'), { ssr: false });

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
      <head>
        <Script id="bookmark-test" strategy="beforeInteractive">
          {`
            // 在控制台中添加测试函数
            window.testBookmark = function() {
              console.log('测试收藏功能');
              localStorage.removeItem("bookmark-prompted");
              localStorage.removeItem("bookmark-prompted-permanent");
              localStorage.removeItem("user-confirmed-bookmarked");
              console.log('已重置所有收藏相关状态，请刷新页面');
              location.reload();
            }
          `}
        </Script>
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <SharedFieldsProvider>
          <BookmarkProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <ClientComponents />
          </BookmarkProvider>
        </SharedFieldsProvider>
      </body>
    </html>
  );
}

"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import dynamic from 'next/dynamic';
import eventBus, { EVENTS } from "@/lib/utils/event-bus";

// 使用动态导入避免循环依赖
const BookmarkPrompt = dynamic(() => import('@/components/ui/bookmark-prompt').then(mod => mod.default), {
  ssr: false,
});

interface BookmarkContextType {
  showBookmarkPrompt: () => void;
  bookmarkPromptShown: boolean;
  closeBookmarkPrompt: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkPromptOpen, setBookmarkPromptOpen] = useState(false);
  const [bookmarkPromptShown, setBookmarkPromptShown] = useState(false);

  // 检查是否已经在本地存储中设置了提示标记
  useEffect(() => {
    const hasPrompted = localStorage.getItem("bookmark-prompted");
    if (hasPrompted) {
      setBookmarkPromptShown(true);
    }
  }, []);

  // 订阅事件总线上的显示收藏提示事件
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log("[BookmarkProvider] 订阅SHOW_BOOKMARK_PROMPT事件");
    const unsubscribe = eventBus.subscribe(EVENTS.SHOW_BOOKMARK_PROMPT, () => {
      console.log("[BookmarkProvider] 收到显示收藏提示事件");
      showBookmarkPrompt();
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const showBookmarkPrompt = () => {
    if (!bookmarkPromptShown) {
      console.log("[BookmarkProvider] 打开收藏提示");
      setBookmarkPromptOpen(true);
    }
  };

  const closeBookmarkPrompt = () => {
    setBookmarkPromptOpen(false);
    setBookmarkPromptShown(true);
    localStorage.setItem("bookmark-prompted", "true");
  };

  const handleTemporaryClose = () => {
    setBookmarkPromptOpen(false);
  };

  const handlePermanentClose = () => {
    closeBookmarkPrompt();
  };

  return (
    <BookmarkContext.Provider
      value={{
        showBookmarkPrompt,
        bookmarkPromptShown,
        closeBookmarkPrompt,
      }}
    >
      {children}
      {bookmarkPromptOpen && (
        <BookmarkPrompt 
          onTemporaryClose={handleTemporaryClose} 
          onPermanentClose={handlePermanentClose} 
        />
      )}
    </BookmarkContext.Provider>
  );
}

export function useBookmark() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmark must be used within a BookmarkProvider");
  }
  return context;
} 
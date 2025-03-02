"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import dynamic from 'next/dynamic';

// 使用动态导入避免循环依赖
const BookmarkPrompt = dynamic(() => import('@/components/ui/bookmark-prompt').then(mod => mod.BookmarkPrompt), {
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

  const showBookmarkPrompt = () => {
    if (!bookmarkPromptShown) {
      setBookmarkPromptOpen(true);
    }
  };

  const closeBookmarkPrompt = () => {
    setBookmarkPromptOpen(false);
    setBookmarkPromptShown(true);
    localStorage.setItem("bookmark-prompted", "true");
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
      {bookmarkPromptOpen && <BookmarkPrompt isOpen={true} onClose={closeBookmarkPrompt} />}
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
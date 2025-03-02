"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import eventBus, { EVENTS } from "@/lib/utils/event-bus";

const BookmarkPrompt = dynamic(
  () => import("./bookmark-prompt").then(mod => mod.default),
  { ssr: false }
);

export default function BookmarkPromptContainer() {
  const [isVisible, setIsVisible] = useState(false);
  const reminderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleShowPrompt = () => {
    console.log("[BookmarkPromptContainer] 收到显示收藏提示事件");
    setIsVisible(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("[BookmarkPromptContainer] 组件已加载");
    
    const permanentlyClosed = localStorage.getItem("bookmark-prompted-permanent");
    console.log("[BookmarkPromptContainer] localStorage中bookmark-prompted-permanent值:", permanentlyClosed);
    
    if (permanentlyClosed === "true") {
      console.log("[BookmarkPromptContainer] 用户已永久关闭提示，不再显示");
      return;
    }

    console.log("[BookmarkPromptContainer] 订阅SHOW_BOOKMARK_PROMPT事件");
    const unsubscribe = eventBus.subscribe(EVENTS.SHOW_BOOKMARK_PROMPT, handleShowPrompt);

    return () => {
      unsubscribe();
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, []);

  const handleTemporaryClose = () => {
    console.log("[BookmarkPromptContainer] 暂时关闭提示，60秒后再次显示");
    setIsVisible(false);
    
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
    }
    
    reminderTimerRef.current = setTimeout(() => {
      console.log("[BookmarkPromptContainer] 60秒已到，再次显示收藏提示");
      setIsVisible(true);
    }, 60000);
  };

  const handlePermanentClose = () => {
    console.log("[BookmarkPromptContainer] 永久关闭提示");
    setIsVisible(false);
    
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
    }
    
    if (typeof window !== "undefined") {
      localStorage.setItem("bookmark-prompted-permanent", "true");
      console.log("[BookmarkPromptContainer] 已将bookmark-prompted-permanent设置为true");
    }
  };

  console.log("[BookmarkPromptContainer] 渲染，isVisible:", isVisible);
  
  return isVisible ? (
    <BookmarkPrompt 
      onTemporaryClose={handleTemporaryClose} 
      onPermanentClose={handlePermanentClose} 
    />
  ) : null;
}

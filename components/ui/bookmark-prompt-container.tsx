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
  const initRef = useRef(false);

  const handleShowPrompt = () => {
    console.log("[BookmarkPromptContainer] 收到显示收藏提示事件");
    setIsVisible(true);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (initRef.current) return; // 防止重复初始化
    initRef.current = true;

    console.log("[BookmarkPromptContainer] 组件已加载");
    
    // 即使设置了永久关闭，我们也订阅事件，以支持手动触发
    console.log("[BookmarkPromptContainer] 订阅SHOW_BOOKMARK_PROMPT事件");
    const unsubscribe = eventBus.subscribe(EVENTS.SHOW_BOOKMARK_PROMPT, handleShowPrompt);
    
    // 尝试立即显示提示（调试用）
    const shouldShowImmediately = window.location.search.includes('debug=bookmark');
    if (shouldShowImmediately) {
      console.log("[BookmarkPromptContainer] 检测到debug参数，立即显示提示");
      setTimeout(() => setIsVisible(true), 1000);
    }
    
    return () => {
      unsubscribe();
      if (reminderTimerRef.current) {
        clearTimeout(reminderTimerRef.current);
      }
    };
  }, []);

  const handleTemporaryClose = () => {
    console.log("[BookmarkPromptContainer] 暂时关闭提示，30秒后再次显示");
    setIsVisible(false);
    
    if (reminderTimerRef.current) {
      clearTimeout(reminderTimerRef.current);
    }
    
    // 减少再次显示的等待时间为30秒
    reminderTimerRef.current = setTimeout(() => {
      console.log("[BookmarkPromptContainer] 30秒已到，再次显示收藏提示");
      setIsVisible(true);
    }, 30000); // 30秒后再次提示
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

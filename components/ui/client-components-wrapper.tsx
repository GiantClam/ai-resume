"use client";

import { useEffect } from "react";
import PageDwellTimeListener from "./page-dwell-time-listener";
// BookmarkPromptContainer import removed as it's now handled by BookmarkProvider
import eventBus, { EVENTS } from "@/lib/utils/event-bus";

export default function ClientComponentsWrapper() {
  // 确保客户端组件正确初始化
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    console.log("[ClientComponentsWrapper] 已加载");
    
    // 给窗口添加全局方法用于调试
    (window as any).triggerBookmarkPrompt = () => {
      console.log("[DEBUG] 手动触发收藏提示");
      eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
      return "已触发收藏提示显示";
    };
    
    // 仅在URL包含调试参数时显示提示
    if (window.location.search.includes('show-bookmark')) {
      console.log("[ClientComponentsWrapper] 检测到调试参数，立即显示收藏提示");
      setTimeout(() => {
        eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
      }, 1000);
    }
    
    // 不再使用强制定时器
  }, []);
  
  return (
    <>
      <PageDwellTimeListener />
      {/* BookmarkPromptContainer removed to avoid duplicate prompt rendering */}
    </>
  );
}

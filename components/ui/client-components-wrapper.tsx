"use client";

import { useEffect } from "react";
import PageDwellTimeListener from "./page-dwell-time-listener";
import BookmarkPromptContainer from "./bookmark-prompt-container";
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
    
    // 如果URL包含调试参数，立即显示提示
    if (window.location.search.includes('show-bookmark')) {
      console.log("[ClientComponentsWrapper] 检测到调试参数，立即显示收藏提示");
      setTimeout(() => {
        eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
      }, 1000);
    }
    
    // 30秒后尝试强制显示提示（确保收藏功能在任何情况下都能展示）
    const forceTimer = setTimeout(() => {
      console.log("[ClientComponentsWrapper] 强制定时器触发，显示收藏提示");
      eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
    }, 30000);
    
    return () => {
      clearTimeout(forceTimer);
    };
  }, []);
  
  return (
    <>
      <PageDwellTimeListener />
      <BookmarkPromptContainer />
    </>
  );
}

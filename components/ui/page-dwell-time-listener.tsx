"use client";

import { useEffect } from "react";
import eventBus, { EVENTS } from "@/lib/utils/event-bus";
import { isBookmarked } from "@/lib/utils/bookmark-utils";

// 开发环境缩短等待时间，生产环境使用正常时间
const WAIT_TIME = process.env.NODE_ENV === 'development' ? 5000 : 60000; // 开发环境5秒，生产环境60秒

// 用于测试：添加重置localStorage的全局函数
if (typeof window !== "undefined") {
  (window as any).resetBookmarkPrompted = () => {
    localStorage.removeItem("bookmark-prompted");
    localStorage.removeItem("bookmark-prompted-permanent");
    localStorage.removeItem("user-confirmed-bookmarked");
    console.log("[DEBUG] localStorage中的bookmark相关标记已重置");
    console.log("[DEBUG] 请刷新页面以重新初始化组件");
    return `收藏提示已重置，页面刷新后将在${process.env.NODE_ENV === 'development' ? "5秒" : "60秒"}内显示提示`;
  };

  // 添加强制显示弹窗的函数（仅用于调试）
  (window as any).showBookmarkPrompt = () => {
    eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
    return "已触发显示收藏提示";
  };
}

export default function PageDwellTimeListener() {
  useEffect(() => {
    // 如果在服务器端，不执行任何操作
    if (typeof window === "undefined") return;

    console.log("[PageDwellTimeListener] 组件已加载");

    // 首先检查用户是否已确认收藏
    const userConfirmedBookmarked = localStorage.getItem("user-confirmed-bookmarked");
    if (userConfirmedBookmarked === "true") {
      console.log("[PageDwellTimeListener] 用户已确认收藏，不显示提示");
      return; // 用户已确认收藏，不显示提示
    }

    // 然后检查本地存储是否已经提示过
    const hasPrompted = localStorage.getItem("bookmark-prompted");
    if (hasPrompted === "true") {
      console.log("[PageDwellTimeListener] 已经提示过，不再显示");
      return; // 已经提示过，不再显示
    }

    // 然后检查本地存储是否永久关闭了提示
    const permanentlyClosed = localStorage.getItem("bookmark-prompted-permanent");
    console.log("[PageDwellTimeListener] localStorage中bookmark-prompted-permanent值:", permanentlyClosed);
    
    if (permanentlyClosed === "true") {
      console.log("[PageDwellTimeListener] 用户已永久关闭提示，不再显示");
      return; // 用户已永久关闭提示，不显示
    }

    let timer: NodeJS.Timeout;

    // 检查网站是否已被收藏
    const checkBookmarkStatus = async () => {
      try {
        const bookmarked = await isBookmarked();
        if (bookmarked) {
          console.log("[PageDwellTimeListener] 检测到网站已被收藏，不显示提示");
          return;
        }

        console.log(`[PageDwellTimeListener] 设置${process.env.NODE_ENV === 'development' ? "5秒(开发环境)" : "60秒"}定时器`);
        
        // 设置页面停留时间后显示收藏提示的定时器
        timer = setTimeout(() => {
          console.log(`[PageDwellTimeListener] ${process.env.NODE_ENV === 'development' ? "5秒" : "60秒"}已到，发布显示收藏提示事件`);
          eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
        }, WAIT_TIME); // 根据环境设置等待时间
      } catch (err) {
        console.error("[PageDwellTimeListener] 收藏状态检查出错", err);
      }
    };

    // 执行检查
    checkBookmarkStatus();

    // 清理函数
    return () => {
      console.log("[PageDwellTimeListener] 组件卸载，清理定时器");
      if (timer) clearTimeout(timer);
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

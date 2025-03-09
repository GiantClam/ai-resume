"use client";

import { useEffect } from "react";
import eventBus, { EVENTS } from "@/lib/utils/event-bus";
import { isBookmarked } from "@/lib/utils/bookmark-utils";

// 强制开启测试模式，缩短等待时间
const TEST_MODE = true;
const WAIT_TIME = TEST_MODE ? 5000 : 60000; // 测试模式5秒，正式模式60秒

// 用于测试：添加重置localStorage的全局函数
if (typeof window !== "undefined") {
  (window as any).resetBookmarkPrompted = () => {
    localStorage.removeItem("bookmark-prompted");
    localStorage.removeItem("bookmark-prompted-permanent");
    localStorage.removeItem("user-confirmed-bookmarked");
    console.log("[DEBUG] localStorage中的bookmark相关标记已重置");
    return `收藏提示已重置，页面刷新后将在${TEST_MODE ? "5秒" : "60秒"}内显示提示`;
  };

  // 添加强制显示弹窗的函数（始终可用）
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

    // 检查本地存储是否永久关闭了提示
    const permanentlyClosed = localStorage.getItem("bookmark-prompted-permanent");
    console.log("[PageDwellTimeListener] localStorage中bookmark-prompted-permanent值:", permanentlyClosed);
    
    if (permanentlyClosed === "true") {
      console.log("[PageDwellTimeListener] 用户已永久关闭提示，不再显示");
      // 即使标记为永久关闭，我们仍然设置一个延迟定时器来尝试显示
      // 这样可以确保用户至少有机会看到收藏提示
      setTimeout(() => {
        console.log("[PageDwellTimeListener] 尝试强制显示收藏提示");
        eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
      }, WAIT_TIME * 2); // 等待时间加倍
      return;
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

        console.log(`[PageDwellTimeListener] 设置${TEST_MODE ? "5秒(测试模式)" : "60秒"}定时器`);
        
        // 设置页面停留时间后显示收藏提示的定时器
        timer = setTimeout(() => {
          console.log(`[PageDwellTimeListener] ${TEST_MODE ? "5秒" : "60秒"}已到，发布显示收藏提示事件`);
          eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
        }, WAIT_TIME); // 根据模式设置等待时间
      } catch (err) {
        console.error("[PageDwellTimeListener] 收藏状态检查出错", err);
        // 出错时仍然显示提示
        timer = setTimeout(() => {
          console.log("[PageDwellTimeListener] 设置错误回退定时器，显示收藏提示");
          eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
        }, WAIT_TIME);
      }
    };

    // 执行检查
    checkBookmarkStatus();

    // 设置一个备用定时器，确保无论如何都会显示提示
    const backupTimer = setTimeout(() => {
      console.log("[PageDwellTimeListener] 备用定时器触发，显示收藏提示");
      eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
    }, WAIT_TIME * 3); // 三倍等待时间

    // 清理函数
    return () => {
      console.log("[PageDwellTimeListener] 组件卸载，清理定时器");
      if (timer) clearTimeout(timer);
      clearTimeout(backupTimer);
    };
  }, []);

  // 这个组件不渲染任何内容
  return null;
}

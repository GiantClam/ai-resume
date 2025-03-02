"use client";

import { useEffect } from "react";
import eventBus, { EVENTS } from "@/lib/utils/event-bus";
import { isBookmarked } from "@/lib/utils/bookmark-utils";

// 开发测试模式，设为true时将等待时间缩短为5秒
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

  // 测试模式下添加强制显示弹窗的函数
  if (TEST_MODE) {
    (window as any).showBookmarkPrompt = () => {
      eventBus.publish(EVENTS.SHOW_BOOKMARK_PROMPT);
      return "已触发显示收藏提示";
    };
  }
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
      return;
    }

    let timer: NodeJS.Timeout;

    // 检查网站是否已被收藏
    const checkBookmarkStatus = async () => {
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

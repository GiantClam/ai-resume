"use client";

type EventCallback = (...args: any[]) => void;

interface EventBus {
  events: Record<string, EventCallback[]>;
  subscribe: (event: string, callback: EventCallback) => () => void;
  publish: (event: string, ...args: any[]) => void;
}

// 创建一个简单的事件总线
const eventBus: EventBus = {
  events: {},
  
  // 订阅事件
  subscribe(event: string, callback: EventCallback) {
    if (typeof window === 'undefined') {
      console.log('[EventBus] 无法在服务器端订阅事件:', event);
      return () => {}; // 在服务器端不执行
    }
    
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    console.log(`[EventBus] 已订阅事件: ${event}, 当前订阅者数量: ${this.events[event].length}`);
    
    // 返回取消订阅的函数
    return () => {
      console.log(`[EventBus] 取消订阅事件: ${event}`);
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  },
  
  // 发布事件
  publish(event: string, ...args: any[]) {
    if (typeof window === 'undefined') {
      console.log('[EventBus] 无法在服务器端发布事件:', event);
      return; // 在服务器端不执行
    }
    
    console.log(`[EventBus] 发布事件: ${event}`);
    
    if (this.events[event]) {
      console.log(`[EventBus] 事件 ${event} 有 ${this.events[event].length} 个订阅者`);
      this.events[event].forEach(callback => {
        callback(...args);
      });
    } else {
      console.log(`[EventBus] 事件 ${event} 没有订阅者`);
    }
  }
};

// 预定义的事件名称
export const EVENTS = {
  SHOW_BOOKMARK_PROMPT: 'show-bookmark-prompt'
};

export default eventBus; 
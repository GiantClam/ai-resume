"use client";

import React, { useEffect, useState } from "react";
import { XCircle, Bookmark, HelpCircle, Star } from "lucide-react";
import { Button } from "./button";
import { setUserConfirmedBookmark, tryTriggerBookmark } from "@/lib/utils/bookmark-utils";

interface BookmarkPromptProps {
  onTemporaryClose: () => void;
  onPermanentClose: () => void;
}

export default function BookmarkPrompt({ onTemporaryClose, onPermanentClose }: BookmarkPromptProps) {
  const [shortcutKey, setShortcutKey] = useState<string>("Ctrl+D");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    setShortcutKey(isMac ? "⌘+D" : "Ctrl+D");
  }, []);

  const handleAlreadyBookmarked = () => {
    setUserConfirmedBookmark(true);
    onPermanentClose();
  };

  const handleDismiss = () => {
    onTemporaryClose();
  };

  const handleClose = () => {
    onTemporaryClose();
  };

  const toggleHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleQuickBookmark = () => {
    // 尝试触发浏览器收藏功能
    tryTriggerBookmark();
    
    // 提示用户手动操作
    alert("如果收藏对话框没有自动出现，请按" + shortcutKey + "手动添加收藏。");
  };

  return (
    <div className="fixed sm:bottom-4 sm:right-4 bottom-0 right-0 sm:max-w-sm w-full sm:w-auto p-4 sm:p-6 bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-gray-200 z-50 animate-fade-in">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <Bookmark className="h-5 w-5 mr-2 text-blue-500" />
          <h3 className="text-lg font-medium text-gray-900">收藏我们的网站</h3>
        </div>
        <button 
          onClick={handleClose} 
          className="text-gray-400 hover:text-gray-500 p-1 sm:p-0"
          aria-label="关闭"
        >
          <XCircle className="h-6 w-6 sm:h-5 sm:w-5" />
        </button>
      </div>
      <div className="mt-3">
        <button 
          onClick={handleQuickBookmark}
          className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium py-2 px-4 rounded border border-blue-200 mb-3 transition-colors"
        >
          <Star className="h-4 w-4 mr-2 fill-current" />
          点击此处快速收藏
        </button>
        
        <p className="text-sm sm:text-sm text-gray-600">
          或按键盘快捷键 <kbd className="px-2 py-1 bg-gray-100 rounded border border-gray-300 font-mono text-sm">{shortcutKey}</kbd> 将网站添加到浏览器收藏夹，以便下次快速访问！
        </p>
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>注意：由于浏览器安全限制，我们无法自动为您添加收藏，需要您手动操作。</p>
        </div>
        
        <button 
          onClick={toggleHelp}
          className="mt-2 flex items-center text-blue-500 hover:text-blue-700 text-xs"
        >
          <HelpCircle className="h-3 w-3 mr-1" />
          查看如何在不同浏览器中添加收藏
        </button>
        
        {showHelp && (
          <div className="mt-2 text-xs bg-blue-50 p-2 rounded border border-blue-100">
            <h4 className="font-semibold mb-1">如何添加收藏:</h4>
            <ul className="list-disc pl-4 space-y-1">
              <li><span className="font-medium">Chrome/Edge</span>: 按 {shortcutKey} 或点击地址栏右侧的星形图标</li>
              <li><span className="font-medium">Firefox</span>: 按 {shortcutKey} 或点击地址栏右侧的星形图标</li>
              <li><span className="font-medium">Safari</span>: 按 ⌘+D 或点击分享按钮，选择"添加书签"</li>
              <li><span className="font-medium">手机浏览器</span>: 打开菜单，寻找"添加到收藏夹"或书签图标</li>
            </ul>
          </div>
        )}
      </div>
      <div className="mt-4 flex space-x-3 w-full sm:w-auto justify-center sm:justify-start">
        <Button variant="outline" size="sm" className="py-2 px-4 text-base sm:text-sm" onClick={handleDismiss}>
          稍后再说
        </Button>
        <Button size="sm" className="py-2 px-4 text-base sm:text-sm" onClick={handleAlreadyBookmarked}>
          我已收藏
        </Button>
      </div>
    </div>
  );
}

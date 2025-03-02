"use client";

import React, { useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import { Button } from "./button";
import { setUserConfirmedBookmark } from "@/lib/utils/bookmark-utils";

interface BookmarkPromptProps {
  onTemporaryClose: () => void;
  onPermanentClose: () => void;
}

export default function BookmarkPrompt({ onTemporaryClose, onPermanentClose }: BookmarkPromptProps) {
  const [shortcutKey, setShortcutKey] = useState<string>("Ctrl+D");

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

  return (
    <div className="fixed sm:bottom-4 sm:right-4 bottom-0 right-0 sm:max-w-sm w-full sm:w-auto p-4 sm:p-6 bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-gray-200 z-50 animate-fade-in">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">收藏我们的网站</h3>
        <button 
          onClick={handleClose} 
          className="text-gray-400 hover:text-gray-500 p-1 sm:p-0"
          aria-label="关闭"
        >
          <XCircle className="h-6 w-6 sm:h-5 sm:w-5" />
        </button>
      </div>
      <div className="mt-3">
        <p className="text-sm sm:text-sm text-gray-600">
          您已在本页面停留了一段时间，希望您觉得我们的服务很有用。请按 {shortcutKey} 将我们的网站添加到收藏夹，以便下次快速访问！
        </p>
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

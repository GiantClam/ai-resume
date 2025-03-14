"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  onLogout: () => void;
}

const UserMenu = ({ user, onLogout }: UserMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button
        className="flex items-center space-x-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <div className="h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.name}
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium text-gray-700">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
          {user.name}
        </span>
      </button>

      {isMenuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
          <a
            href="#profile"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            个人资料
          </a>
          <a
            href="#settings"
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            设置
          </a>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu; 
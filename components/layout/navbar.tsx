"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";
import UserMenu from "./user-menu";

const Navbar = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState<{name: string, email: string, avatar: string} | null>(null);

  // 组件挂载时检查是否已登录
  useEffect(() => {
    // 检查localStorage中是否有token
    const token = localStorage.getItem("auth_token");
    if (token) {
      // 获取用户信息
      fetchUserProfile(token);
    }
  }, []);

  // 获取用户信息
  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
      } else {
        // Token无效，清除localStorage
        localStorage.removeItem("auth_token");
      }
    } catch (error) {
      console.error("获取用户信息失败", error);
    }
  };

  // 处理登录成功
  const handleLoginSuccess = (token: string, user: any) => {
    localStorage.setItem("auth_token", token);
    setIsLoggedIn(true);
    setUserData(user);
    setIsLoginModalOpen(false);
  };

  // 处理注册成功
  const handleRegisterSuccess = (token: string, user: any) => {
    localStorage.setItem("auth_token", token);
    setIsLoggedIn(true);
    setUserData(user);
    setIsRegisterModalOpen(false);
  };

  // 处理登出
  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsLoggedIn(false);
    setUserData(null);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <Image 
                  src="/logo.png" 
                  alt="AI HR Assistant Logo" 
                  width={40} 
                  height={40} 
                  className="h-10 w-10"
                />
              </Link>
              <Link href="/" className="ml-2 text-xl font-bold text-gray-800 dark:text-white">
                AI HR Assistant
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {isLoggedIn && userData ? (
              <UserMenu 
                user={userData}
                onLogout={handleLogout}
              />
            ) : (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  登录
                </Button>
                <Button
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  注册
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 登录对话框 */}
      {isLoginModalOpen && (
        <LoginForm 
          onClose={() => setIsLoginModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => {
            setIsLoginModalOpen(false);
            setIsRegisterModalOpen(true);
          }}
        />
      )}
      
      {/* 注册对话框 */}
      {isRegisterModalOpen && (
        <RegisterForm 
          onClose={() => setIsRegisterModalOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
          onLoginClick={() => {
            setIsRegisterModalOpen(false);
            setIsLoginModalOpen(true);
          }}
        />
      )}
    </nav>
  );
};

export default Navbar; 
package main

import (
	"fmt"
	"log"
	"os"

	"github.com/GiantClam/ai-resume/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// 加载.env文件中的环境变量
	if err := godotenv.Load(); err != nil {
		log.Println("警告: 未找到.env文件或无法加载")
	}

	// 设置Gin模式
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "release" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 使用路由模块配置路由
	r := routes.SetupRouter()

	// 确定端口
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// 启动服务器
	serverAddr := fmt.Sprintf(":%s", port)
	log.Printf("服务器启动在 http://localhost%s", serverAddr)
	if err := r.Run(serverAddr); err != nil {
		log.Fatalf("启动服务器失败: %v", err)
	}
}

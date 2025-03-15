package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"

	"github.com/GiantClam/ai-resume/services"
	"github.com/joho/godotenv"
)

// 同步代理环境变量（确保大小写变量值一致）
func syncProxyEnvVars() {
	// 检查大写环境变量是否已设置
	httpProxy := os.Getenv("HTTP_PROXY")
	httpsProxy := os.Getenv("HTTPS_PROXY")
	noProxy := os.Getenv("NO_PROXY")

	// 检查小写环境变量是否已设置
	httpProxyLower := os.Getenv("http_proxy")
	httpsProxyLower := os.Getenv("https_proxy")
	noProxyLower := os.Getenv("no_proxy")

	// 根据优先级设置环境变量
	// 优先使用大写变量值
	if httpProxy != "" && httpProxyLower == "" {
		os.Setenv("http_proxy", httpProxy)
		log.Printf("已设置 http_proxy = %s", httpProxy)
	} else if httpProxyLower != "" && httpProxy == "" {
		os.Setenv("HTTP_PROXY", httpProxyLower)
		log.Printf("已设置 HTTP_PROXY = %s", httpProxyLower)
	}

	if httpsProxy != "" && httpsProxyLower == "" {
		os.Setenv("https_proxy", httpsProxy)
		log.Printf("已设置 https_proxy = %s", httpsProxy)
	} else if httpsProxyLower != "" && httpsProxy == "" {
		os.Setenv("HTTPS_PROXY", httpsProxyLower)
		log.Printf("已设置 HTTPS_PROXY = %s", httpsProxyLower)
	}

	if noProxy != "" && noProxyLower == "" {
		os.Setenv("no_proxy", noProxy)
		log.Printf("已设置 no_proxy = %s", noProxy)
	} else if noProxyLower != "" && noProxy == "" {
		os.Setenv("NO_PROXY", noProxyLower)
		log.Printf("已设置 NO_PROXY = %s", noProxyLower)
	}
}

func main() {
	// 加载 .env 文件
	if err := godotenv.Load("../../.env"); err != nil {
		log.Fatalf("无法加载 .env 文件: %v", err)
	}

	// 同步代理环境变量
	syncProxyEnvVars()

	// 确保凭证文件路径是相对于测试程序的正确路径
	credPath := os.Getenv("GOOGLE_APPLICATION_CREDENTIALS")
	if credPath != "" {
		// 如果是相对路径，将其调整为相对于当前目录的路径
		if !filepath.IsAbs(credPath) {
			// 修正为相对于测试程序所在目录的路径
			newPath := filepath.Join("../../..", credPath)
			os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", newPath)
			log.Printf("已修正凭证文件路径: %s -> %s", credPath, newPath)
		}
	}

	// 输出环境变量
	log.Printf("GOOGLE_CLOUD_PROJECT: %s", os.Getenv("GOOGLE_CLOUD_PROJECT"))
	log.Printf("GOOGLE_CLOUD_LOCATION: %s", os.Getenv("GOOGLE_CLOUD_LOCATION"))
	log.Printf("GOOGLE_APPLICATION_CREDENTIALS: %s", os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))

	// 输出代理环境变量
	log.Printf("大写代理变量:")
	log.Printf("  HTTP_PROXY: %s", os.Getenv("HTTP_PROXY"))
	log.Printf("  HTTPS_PROXY: %s", os.Getenv("HTTPS_PROXY"))
	log.Printf("  NO_PROXY: %s", os.Getenv("NO_PROXY"))

	log.Printf("小写代理变量 (gRPC 使用):")
	log.Printf("  http_proxy: %s", os.Getenv("http_proxy"))
	log.Printf("  https_proxy: %s", os.Getenv("https_proxy"))
	log.Printf("  no_proxy: %s", os.Getenv("no_proxy"))

	// 创建 Vertex AI 客户端
	vertexClient := services.NewVertexAIClient()

	// 设置简单的测试提示
	sysInstruction := "你是一个简单的测试助手。请简短回复。"
	prompt := "请回复'连接成功'。"

	// 尝试生成内容
	log.Printf("尝试调用 Vertex AI...")
	response, err := vertexClient.GenerateContent(sysInstruction, prompt)
	if err != nil {
		log.Fatalf("Vertex AI 请求失败: %v", err)
	}

	// 输出成功信息
	fmt.Printf("\n=== 测试成功! ===\n")
	fmt.Printf("回复: %s\n", response)
	fmt.Printf("=================\n")
}

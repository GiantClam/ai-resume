package routes

import (
	"net/http"
	"os"
	"time"

	"github.com/GiantClam/ai-resume/handlers"
	"github.com/GiantClam/ai-resume/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter 配置API路由
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS配置 - 使用cors中间件允许所有源访问
	config := cors.DefaultConfig()

	// 允许特定的源或所有源
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin != "" {
		config.AllowOrigins = []string{corsOrigin}
	} else {
		// 开发环境下允许常见的本地开发源
		config.AllowOrigins = []string{
			"http://localhost:3000",
			"http://127.0.0.1:3000",
			"http://localhost:8000",
		}
	}

	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{
		"Origin",
		"Content-Type",
		"Content-Length",
		"Accept-Encoding",
		"X-CSRF-Token",
		"Authorization",
	}
	config.AllowCredentials = true
	r.Use(cors.New(config))

	// 用户认证API
	r.POST("/api/auth/register", handlers.Register)
	r.POST("/api/auth/login", handlers.Login)

	// 需要认证的API
	auth := r.Group("/api")
	auth.Use(middleware.AuthMiddleware())
	{
		auth.GET("/user/profile", handlers.GetUserProfile)
	}

	// 简历筛选API
	r.POST("/api/resume/screen", handlers.ScreenResumes)

	// 面试题目生成API
	r.POST("/api/interview/questions", handlers.GenerateInterviewQuestions)

	// 面试题目流式生成API
	r.POST("/api/interview/questions/stream", handlers.StreamGenerateInterviewQuestions)

	// 面试总结API
	r.POST("/api/interview/summary", handlers.SummarizeInterview)

	// 添加测试API端点
	r.GET("/api/test", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "测试API连接成功",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	return r
}

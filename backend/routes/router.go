package routes

import (
	"github.com/GiantClam/ai-resume/handlers"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter 配置API路由
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS配置 - 使用cors中间件允许所有源访问
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"}
	r.Use(cors.New(config))

	// 简历筛选API
	r.POST("/api/resume/screen", handlers.ScreenResumes)

	// 面试题目生成API
	r.POST("/api/interview/questions", handlers.GenerateInterviewQuestions)

	// 面试题目流式生成API
	r.POST("/api/interview/questions/stream", handlers.StreamGenerateInterviewQuestions)

	// 面试总结API
	r.POST("/api/interview/summary", handlers.SummarizeInterview)

	return r
}

package middleware

import (
	"net/http"
	"strings"

	"github.com/GiantClam/ai-resume/utils"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware 认证中间件
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// 从请求头获取Authorization
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "缺少Authorization请求头"})
			c.Abort()
			return
		}

		// 提取令牌
		parts := strings.SplitN(authHeader, " ", 2)
		if !(len(parts) == 2 && parts[0] == "Bearer") {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization格式无效"})
			c.Abort()
			return
		}

		tokenString := parts[1]

		// 解析JWT
		claims, err := utils.ParseJWT(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "无效的令牌", "details": err.Error()})
			c.Abort()
			return
		}

		// 将用户ID存入上下文
		c.Set("userId", claims.UserID)
		c.Next()
	}
}

package handlers

import (
	"net/http"

	"github.com/GiantClam/ai-resume/models"
	"github.com/GiantClam/ai-resume/utils"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Register 用户注册
func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误", "details": err.Error()})
		return
	}

	// 验证Turnstile令牌
	valid, err := utils.VerifyTurnstileToken(req.TurnstileToken, c.ClientIP())
	if err != nil || !valid {
		errorMsg := "人机验证失败"
		if err != nil {
			errorMsg = err.Error()
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": errorMsg})
		return
	}

	// 获取数据库连接
	db := utils.GetDB()

	// 检查邮箱是否已注册
	var existingUser models.User
	if result := db.Where("email = ?", req.Email).First(&existingUser); result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "该邮箱已注册"})
		return
	} else if result.Error != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库查询失败"})
		return
	}

	// 创建用户
	user := models.User{
		Email:    req.Email,
		Name:     req.Name,
		AuthType: models.AuthType(req.AuthType),
	}

	// 如果用户没有提供名字，使用邮箱前缀作为默认名称
	if user.Name == "" {
		// 查找@符号的位置并截取
		atIndex := -1
		for i, char := range req.Email {
			if char == '@' {
				atIndex = i
				break
			}
		}

		if atIndex > 0 {
			user.Name = req.Email[:atIndex]
		} else {
			user.Name = req.Email // 如果没有@符号，使用整个邮箱
		}
	}

	// 根据认证类型处理
	if user.AuthType == models.AuthTypePassword {
		// 密码认证
		user.Password = req.Password
	} else if user.AuthType == models.AuthTypeGoogle {
		// Google认证，验证令牌并获取用户信息
		googleInfo, err := utils.GetGoogleUserInfo(req.GoogleToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Google认证失败", "details": err.Error()})
			return
		}

		// 更新用户信息
		user.GoogleID = googleInfo.ID
		if user.Name == "" {
			user.Name = googleInfo.Name
		}
		user.Avatar = googleInfo.Picture
	}

	// 保存用户到数据库
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户失败", "details": err.Error()})
		return
	}

	// 生成JWT令牌
	token, err := utils.GenerateJWT(&user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败", "details": err.Error()})
		return
	}

	// 返回响应
	c.JSON(http.StatusCreated, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "请求格式错误", "details": err.Error()})
		return
	}

	// 验证Turnstile令牌
	valid, err := utils.VerifyTurnstileToken(req.TurnstileToken, c.ClientIP())
	if err != nil || !valid {
		errorMsg := "人机验证失败"
		if err != nil {
			errorMsg = err.Error()
		}
		c.JSON(http.StatusBadRequest, gin.H{"error": errorMsg})
		return
	}

	// 获取数据库连接
	db := utils.GetDB()

	// 认证逻辑
	authType := models.AuthType(req.AuthType)

	if authType == models.AuthTypePassword {
		// 密码认证
		var user models.User
		if result := db.Where("email = ? AND auth_type = ?", req.Email, authType).First(&user); result.Error != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "邮箱或密码错误"})
			return
		}

		// 验证密码
		if !user.CheckPassword(req.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "邮箱或密码错误"})
			return
		}

		// 生成JWT令牌
		token, err := utils.GenerateJWT(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败", "details": err.Error()})
			return
		}

		// 返回响应
		c.JSON(http.StatusOK, models.LoginResponse{
			Token: token,
			User:  user,
		})
	} else if authType == models.AuthTypeGoogle {
		// Google认证
		googleInfo, err := utils.GetGoogleUserInfo(req.GoogleToken)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Google认证失败", "details": err.Error()})
			return
		}

		// 查找用户
		var user models.User
		result := db.Where("email = ?", googleInfo.Email).First(&user)

		if result.Error != nil {
			if result.Error == gorm.ErrRecordNotFound {
				// 用户不存在，自动注册
				user = models.User{
					Email:    googleInfo.Email,
					Name:     googleInfo.Name,
					Avatar:   googleInfo.Picture,
					GoogleID: googleInfo.ID,
					AuthType: models.AuthTypeGoogle,
				}

				if err := db.Create(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "创建用户失败", "details": err.Error()})
					return
				}
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "数据库查询失败"})
				return
			}
		} else {
			// 用户存在，更新Google ID
			if user.GoogleID == "" {
				user.GoogleID = googleInfo.ID
				user.AuthType = models.AuthTypeGoogle
				if err := db.Save(&user).Error; err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "更新用户失败", "details": err.Error()})
					return
				}
			}
		}

		// 生成JWT令牌
		token, err := utils.GenerateJWT(&user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "生成令牌失败", "details": err.Error()})
			return
		}

		// 返回响应
		c.JSON(http.StatusOK, models.LoginResponse{
			Token: token,
			User:  user,
		})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "不支持的认证类型"})
	}
}

// GetUserProfile 获取用户个人资料
func GetUserProfile(c *gin.Context) {
	// 从上下文中获取用户ID
	userID, exists := c.Get("userId")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "未授权"})
		return
	}

	// 获取数据库连接
	db := utils.GetDB()

	// 查询用户信息
	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 返回用户信息
	c.JSON(http.StatusOK, gin.H{"user": user})
}

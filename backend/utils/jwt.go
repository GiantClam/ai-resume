package utils

import (
	"errors"
	"os"
	"time"

	"github.com/GiantClam/ai-resume/models"
	"github.com/golang-jwt/jwt/v5"
)

// JWT错误
var (
	ErrInvalidToken = errors.New("无效的令牌")
	ErrExpiredToken = errors.New("令牌已过期")
)

// Claims JWT Claims
type Claims struct {
	UserID uint `json:"userId"`
	jwt.RegisteredClaims
}

// GenerateJWT 生成JWT令牌
func GenerateJWT(user *models.User) (string, error) {
	// 获取JWT密钥
	secretKey := os.Getenv("JWT_SECRET_KEY")
	if secretKey == "" {
		secretKey = "your-secret-key-change-in-production" // 默认密钥，生产环境中应修改
	}

	// 设置过期时间为7天
	expirationTime := time.Now().Add(7 * 24 * time.Hour)

	// 创建Claims
	claims := &Claims{
		UserID: user.ID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "ai-resume",
			Subject:   user.Email,
		},
	}

	// 创建令牌
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 签名令牌
	tokenString, err := token.SignedString([]byte(secretKey))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ParseJWT 解析JWT令牌
func ParseJWT(tokenString string) (*Claims, error) {
	// 获取JWT密钥
	secretKey := os.Getenv("JWT_SECRET_KEY")
	if secretKey == "" {
		secretKey = "your-secret-key-change-in-production" // 默认密钥，生产环境中应修改
	}

	// 解析令牌
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return nil, ErrExpiredToken
		}
		return nil, ErrInvalidToken
	}

	// 验证令牌有效性
	if !token.Valid {
		return nil, ErrInvalidToken
	}

	// 类型断言
	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

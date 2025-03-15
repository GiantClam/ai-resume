package models

import (
	"time"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// 用户认证方式
type AuthType string

const (
	AuthTypePassword AuthType = "password" // 密码认证
	AuthTypeGoogle   AuthType = "google"   // Google认证
)

// User 用户模型
type User struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Email     string         `gorm:"type:varchar(255);uniqueIndex;not null" json:"email"`
	Password  string         `gorm:"size:255" json:"-"` // 不在JSON响应中返回密码
	Name      string         `gorm:"size:100" json:"name"`
	Avatar    string         `gorm:"size:255" json:"avatar"`
	AuthType  AuthType       `gorm:"size:20;default:password" json:"authType"`
	GoogleID  string         `gorm:"size:100" json:"-"`
	CreatedAt time.Time      `json:"createdAt"`
	UpdatedAt time.Time      `json:"updatedAt"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// LoginRequest 登录请求
type LoginRequest struct {
	Email          string `json:"email" binding:"required,email"`
	Password       string `json:"password" binding:"required_if=AuthType password"`
	AuthType       string `json:"authType" binding:"required,oneof=password google"`
	GoogleToken    string `json:"googleToken" binding:"required_if=AuthType google"`
	TurnstileToken string `json:"turnstileToken" binding:"required"`
}

// RegisterRequest 注册请求
type RegisterRequest struct {
	Email          string `json:"email" binding:"required,email"`
	Password       string `json:"password" binding:"required_if=AuthType password,min=8"`
	Name           string `json:"name"`
	AuthType       string `json:"authType" binding:"required,oneof=password google"`
	GoogleToken    string `json:"googleToken" binding:"required_if=AuthType google"`
	TurnstileToken string `json:"turnstileToken" binding:"required"`
}

// GoogleLoginRequest Google登录请求
type GoogleLoginRequest struct {
	Token          string `json:"token" binding:"required"`
	TurnstileToken string `json:"turnstileToken" binding:"required"`
}

// GoogleUserInfo Google用户信息
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
	Locale        string `json:"locale"`
}

// LoginResponse 登录响应
type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

// SetPassword 设置加密密码
func (u *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashedPassword)
	return nil
}

// CheckPassword 检查密码是否正确
func (u *User) CheckPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}

// BeforeCreate GORM钩子，在创建用户前加密密码
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.AuthType == AuthTypePassword && u.Password != "" {
		if err := u.SetPassword(u.Password); err != nil {
			return err
		}
	}
	return nil
}

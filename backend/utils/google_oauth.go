package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/GiantClam/ai-resume/models"
)

const googleUserInfoURL = "https://www.googleapis.com/oauth2/v2/userinfo"

// GetGoogleUserInfo 获取Google用户信息
func GetGoogleUserInfo(token string) (*models.GoogleUserInfo, error) {
	// 准备请求
	req, err := http.NewRequest("GET", googleUserInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("创建Google用户信息请求失败: %w", err)
	}

	// 添加授权头
	req.Header.Add("Authorization", "Bearer "+token)

	// 发送请求
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("获取Google用户信息失败: %w", err)
	}
	defer resp.Body.Close()

	// 检查响应状态
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google API返回非200状态码: %d", resp.StatusCode)
	}

	// 读取响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取Google用户信息响应失败: %w", err)
	}

	// 解析JSON
	var userInfo models.GoogleUserInfo
	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("解析Google用户信息失败: %w", err)
	}

	// 验证必要字段
	if userInfo.ID == "" || userInfo.Email == "" {
		return nil, errors.New("Google用户信息不完整")
	}

	return &userInfo, nil
}

// VerifyGoogleClientID 验证Google客户端ID
func VerifyGoogleClientID() error {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		return errors.New("Google客户端ID未设置")
	}
	return nil
}

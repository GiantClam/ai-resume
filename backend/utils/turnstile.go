package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const turnstileVerifyURL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

// TurnstileResponse Cloudflare Turnstile API响应
type TurnstileResponse struct {
	Success     bool      `json:"success"`
	ChallengeTS time.Time `json:"challenge_ts"`
	Hostname    string    `json:"hostname"`
	ErrorCodes  []string  `json:"error-codes"`
}

// VerifyTurnstileToken 验证Turnstile令牌
func VerifyTurnstileToken(token string, remoteIP string) (bool, error) {
	// 获取Turnstile密钥
	secretKey := os.Getenv("TURNSTILE_SECRET_KEY")
	if secretKey == "" {
		return false, errors.New("Turnstile密钥未设置")
	}

	// 准备请求参数
	data := url.Values{
		"secret":   {secretKey},
		"response": {token},
	}

	// 如果有客户端IP，添加到请求中
	if remoteIP != "" {
		data.Add("remoteip", remoteIP)
	}

	// 发送POST请求
	resp, err := http.PostForm(turnstileVerifyURL, data)
	if err != nil {
		return false, fmt.Errorf("验证Turnstile令牌失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return false, fmt.Errorf("读取Turnstile响应失败: %w", err)
	}

	var result TurnstileResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return false, fmt.Errorf("解析Turnstile响应失败: %w", err)
	}

	// 验证结果
	if !result.Success {
		errorMsg := strings.Join(result.ErrorCodes, ", ")
		return false, fmt.Errorf("Turnstile验证失败: %s", errorMsg)
	}

	return true, nil
}

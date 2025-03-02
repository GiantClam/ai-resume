package services

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

// CleanMarkdownCodeBlock 从Markdown代码块中提取纯JSON内容
func CleanMarkdownCodeBlock(content string) string {
	// 移除开始的代码块标记
	content = regexp.MustCompile("^```(json)?\\s*").ReplaceAllString(content, "")

	// 移除结束的代码块标记
	content = regexp.MustCompile("```\\s*$").ReplaceAllString(content, "")

	// 去除前后空白
	return strings.TrimSpace(content)
}

// SanitizeUTF8 清理字符串中的无效UTF-8字符
func SanitizeUTF8(s string) string {
	if utf8.ValidString(s) {
		return s
	}

	// 创建一个新的字符串构建器
	var builder strings.Builder
	builder.Grow(len(s))

	// 遍历字符串，只保留有效的UTF-8字符
	for i := 0; i < len(s); {
		r, size := utf8.DecodeRuneInString(s[i:])
		if r != utf8.RuneError || size == 1 {
			builder.WriteRune(r)
		}
		i += size
	}

	return builder.String()
}

// TryFixJsonFormat 尝试修复可能存在问题的JSON格式
func TryFixJsonFormat(jsonStr string) string {
	// 移除可能存在的非JSON前缀，如"```json"或解释文本
	jsonStartIndex := strings.Index(jsonStr, "{")
	if jsonStartIndex > 0 {
		jsonStr = jsonStr[jsonStartIndex:]
	}

	// 确保JSON结尾是正确的
	jsonEndIndex := strings.LastIndex(jsonStr, "}")
	if jsonEndIndex >= 0 && jsonEndIndex < len(jsonStr)-1 {
		jsonStr = jsonStr[:jsonEndIndex+1]
	}

	// 清理可能的单引号（JSON要求双引号）
	jsonStr = regexp.MustCompile("([{,])\\s*'([^']*)'\\s*:").ReplaceAllString(jsonStr, "$1\"$2\":")
	jsonStr = regexp.MustCompile(":\\s*'([^']*)'").ReplaceAllString(jsonStr, ":\"$1\"")

	// 修复可能缺少双引号的键名
	jsonStr = regexp.MustCompile("([{,])\\s*(\\w+)\\s*:").ReplaceAllString(jsonStr, "$1\"$2\":")

	// 移除可能存在的注释
	jsonStr = regexp.MustCompile("//.*").ReplaceAllString(jsonStr, "")
	jsonStr = regexp.MustCompile("/\\*.*?\\*/").ReplaceAllString(jsonStr, "")

	return jsonStr
}

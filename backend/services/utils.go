package services

import (
	"log"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/GiantClam/ai-resume/utils"
)

// CleanMarkdownCodeBlock 从Markdown代码块中提取纯JSON内容
func CleanMarkdownCodeBlock(content string) string {
	// 记录原始内容的长度以进行调试
	originalLength := len(content)

	// 打印前100个字符，用于调试
	previewLength := utils.Min(100, originalLength)
	log.Printf("[DEBUG] 原始内容前%d个字符: %s", previewLength, content[:previewLength])

	// 更完善的正则表达式，匹配可能出现的各种代码块格式
	// 移除开始的代码块标记，包括可能的空格和换行
	startPattern := `(?s)^[\s\n]*` + "```" + `(?:json)?[\s\n]*`
	content = regexp.MustCompile(startPattern).ReplaceAllString(content, "")

	// 移除结束的代码块标记，包括可能的空格和换行
	endPattern := `(?s)[\s\n]*` + "```" + `[\s\n]*$`
	content = regexp.MustCompile(endPattern).ReplaceAllString(content, "")

	// 去除前后空白
	content = strings.TrimSpace(content)

	// 记录清理后内容的长度
	cleanedLength := len(content)
	log.Printf("[DEBUG] CleanMarkdownCodeBlock: 原始长度=%d, 清理后长度=%d", originalLength, cleanedLength)

	// 如果清理后内容为空，记录警告
	if cleanedLength == 0 {
		log.Printf("[WARN] CleanMarkdownCodeBlock: 清理后内容为空")
		return "{}"
	}

	return content
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

package services

import (
	"fmt"
	"log"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// ConvertDocxToPdf 将Word文档转换为PDF文件
// 需要系统安装LibreOffice或其他命令行工具
func ConvertDocxToPdf(inputFile string) (string, error) {
	// 检查输入文件是否存在
	if _, err := os.Stat(inputFile); os.IsNotExist(err) {
		return "", fmt.Errorf("输入文件不存在: %s", inputFile)
	}

	// 为输出文件创建路径
	fileExt := filepath.Ext(inputFile)
	pdfFile := strings.TrimSuffix(inputFile, fileExt) + ".pdf"

	log.Printf("尝试将 %s 转换为 %s", inputFile, pdfFile)

	// 检查系统是否安装了LibreOffice
	libreOfficeCmd := exec.Command("libreoffice", "--version")
	if err := libreOfficeCmd.Run(); err == nil {
		// 使用LibreOffice转换
		cmd := exec.Command(
			"libreoffice",
			"--headless",
			"--convert-to", "pdf",
			"--outdir", filepath.Dir(inputFile),
			inputFile,
		)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("LibreOffice转换失败: %v, 输出: %s", err, string(output))
		}

		log.Printf("文件转换成功: %s", pdfFile)
		return pdfFile, nil
	}

	// 如果没有LibreOffice，尝试使用其他工具（如pandoc）
	pandocCmd := exec.Command("pandoc", "--version")
	if err := pandocCmd.Run(); err == nil {
		cmd := exec.Command(
			"pandoc",
			inputFile,
			"-o", pdfFile,
		)

		output, err := cmd.CombinedOutput()
		if err != nil {
			return "", fmt.Errorf("Pandoc转换失败: %v, 输出: %s", err, string(output))
		}

		log.Printf("文件转换成功: %s", pdfFile)
		return pdfFile, nil
	}

	return "", fmt.Errorf("无法找到文件转换工具（LibreOffice或Pandoc）")
}

// 检测MIME类型
func GetMimeType(filePath string) string {
	ext := strings.ToLower(filepath.Ext(filePath))
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".doc":
		return "application/msword"
	default:
		return "application/octet-stream"
	}
}

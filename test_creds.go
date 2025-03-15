package main

import (
	"fmt"
	"log"
	"os"
	"path/filepath"
)

func main() {
	// 获取当前工作目录
	wd, err := os.Getwd()
	if err != nil {
		log.Fatalf("无法获取工作目录: %v", err)
	}
	fmt.Printf("当前工作目录: %s\n", wd)

	// 查找凭证文件
	credPath := filepath.Join(wd, "zippy-aurora-444204-q2-a8b576f1c6e4.json")
	_, err = os.Stat(credPath)
	if os.IsNotExist(err) {
		fmt.Printf("凭证文件不存在: %s\n", credPath)
	} else if err != nil {
		fmt.Printf("检查凭证文件时出错: %v\n", err)
	} else {
		fmt.Printf("凭证文件存在: %s\n", credPath)
		// 设置为绝对路径
		os.Setenv("GOOGLE_APPLICATION_CREDENTIALS", credPath)
		fmt.Printf("已设置 GOOGLE_APPLICATION_CREDENTIALS=%s\n", credPath)
	}
}

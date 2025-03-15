#!/bin/bash

# 显示编译开始信息
echo "开始ResumeAI后端服务多平台编译..."

# 创建输出目录
mkdir -p bin


# 编译Linux版本 (amd64)
echo "==============================================="
echo "编译Linux版本 (amd64)..."
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0
go build -v -ldflags="-s -w" -o bin/resumeai-linux-amd64
echo "Linux版本编译完成。"

# 编译Windows版本 (amd64)
echo "==============================================="
echo "编译Windows版本 (amd64)..."
export GOOS=windows
export GOARCH=amd64
export CGO_ENABLED=0
go build -v -ldflags="-s -w" -o bin/resumeai-windows-amd64.exe
echo "Windows版本编译完成。"

# 编译macOS版本 (amd64)
echo "==============================================="
echo "编译macOS版本 (amd64)..."
export GOOS=darwin
export GOARCH=amd64
export CGO_ENABLED=0
go build -v -ldflags="-s -w" -o bin/resumeai-darwin-amd64
echo "macOS (amd64)版本编译完成。"

# 编译macOS版本 (arm64, M系列芯片)
echo "==============================================="
echo "编译macOS版本 (arm64, 适用于M系列芯片)..."
export GOOS=darwin
export GOARCH=arm64
export CGO_ENABLED=0
go build -v -ldflags="-s -w" -o bin/resumeai-darwin-arm64
echo "macOS (arm64)版本编译完成。"

# 回到根目录
cd ..

# 显示编译结果
echo "==============================================="
echo "所有平台编译完成。编译结果："
ls -lh bin/

# 创建Linux符号链接
ln -sf bin/resumeai-linux-amd64 resumeai
echo "创建符号链接: resumeai -> bin/resumeai-linux-amd64"

echo "==============================================="
echo "全部编译完成。"
echo "Linux版本可执行文件: resumeai" 
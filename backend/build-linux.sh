#!/bin/bash

# 显示编译开始信息
echo "开始编译ResumeAI后端服务..."
echo "目标平台: Linux (amd64)"


# 设置交叉编译环境变量
export GOOS=linux
export GOARCH=amd64
export CGO_ENABLED=0

# 显示Go版本
go version

# 编译程序
echo "正在编译..."
go build -v -o resumeai

# 检查编译结果
if [ $? -eq 0 ]; then
    echo "编译成功!"
    echo "生成的可执行文件: $(pwd)/resumeai"
    
    # 显示文件信息
    file resumeai
else
    echo "编译失败!"
    exit 1
fi

echo "编译完成。" 
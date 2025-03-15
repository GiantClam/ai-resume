#!/bin/bash

echo "编译测试程序..."
cd backend/cmd/test_vertex_ai
go build -o test_vertex_ai

echo "运行测试程序 (最多等待30秒)..."
# 使用 timeout 命令限制运行时间
# 如果系统是 macOS，需要安装 GNU coreutils
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    if command -v gtimeout >/dev/null 2>&1; then
        # 如果安装了 GNU coreutils
        gtimeout 30s ./test_vertex_ai
    else
        # 否则使用无超时控制
        echo "警告: 未安装 GNU coreutils，无法使用超时功能。"
        echo "可以通过 'brew install coreutils' 安装。"
        ./test_vertex_ai
    fi
else
    # Linux 或其他系统
    timeout 30s ./test_vertex_ai
fi

# 获取退出状态
EXIT_CODE=$?
if [ $EXIT_CODE -eq 124 ]; then
    echo -e "\n测试超时！"
    echo "这可能是由于网络连接问题，请检查您的代理设置。"
    echo "在 .env 文件中设置 HTTP_PROXY 和 HTTPS_PROXY 环境变量。"
fi

echo "测试完成" 
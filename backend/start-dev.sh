#!/bin/bash

# 加载开发环境配置
if [ -f .env ]; then
    echo "正在加载.env配置..."
    # 使用source命令导入环境变量，确保在当前shell中生效
    set -a
    source .env
    set +a
    echo "环境变量加载完成"
else
    echo "警告: .env文件不存在，使用默认配置。"
    # 设置一些开发环境的默认值
    export PORT=8080
    export GIN_MODE=debug
fi

# 验证关键环境变量
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "警告: GOOGLE_APPLICATION_CREDENTIALS 环境变量未设置"
    # 尝试设置默认值 - 先查找当前目录
    if [ -f "google-credentials.json" ]; then
        export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/google-credentials.json"
        echo "已找到并使用当前目录下的凭据文件: $GOOGLE_APPLICATION_CREDENTIALS"
    else
        echo "警告: 未找到凭据文件，Vertex AI功能可能无法正常工作"
    fi
fi

# 显示关键环境变量
echo "当前环境配置:"
echo "GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
echo "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"
echo "DB_TYPE=$DB_TYPE"
echo "PORT=$PORT"
echo "GIN_MODE=$GIN_MODE"

# 启动应用
echo "正在启动开发模式应用..."
./resumeai 
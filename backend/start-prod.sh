#!/bin/bash

# 加载生产环境配置
if [ -f .env.production ]; then
    echo "正在加载.env.production配置..."
    # 使用source命令导入环境变量，确保在当前shell中生效
    set -a
    source .env.production
    set +a
    echo "环境变量加载完成"
else
    echo "错误: .env.production文件不存在!"
    exit 1
fi

# 验证关键环境变量
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "警告: GOOGLE_APPLICATION_CREDENTIALS 环境变量未设置"
    # 尝试设置默认值
    export GOOGLE_APPLICATION_CREDENTIALS="/app/google-credentials.json"
    echo "已设置默认值: $GOOGLE_APPLICATION_CREDENTIALS"
fi

# 验证凭据文件
if [ ! -f "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
    echo "警告: 凭据文件不存在: $GOOGLE_APPLICATION_CREDENTIALS"
    # 尝试在当前目录查找
    if [ -f "google-credentials.json" ]; then
        export GOOGLE_APPLICATION_CREDENTIALS="$(pwd)/google-credentials.json"
        echo "已找到并使用当前目录下的凭据文件: $GOOGLE_APPLICATION_CREDENTIALS"
    fi
fi

# 显示关键环境变量
echo "当前环境配置:"
echo "GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
echo "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"
echo "DB_TYPE=$DB_TYPE"
echo "PORT=$PORT"

# 启动应用
echo "正在启动应用..."
./resumeai
#!/bin/bash

# Docker容器启动入口点脚本
echo "====== ResumeAI Docker 容器启动 ======"

# 确保凭据文件可读
if [ -f "/app/google-credentials.json" ]; then
    echo "✅ 检测到Google凭据文件"
    # 确保文件权限正确
    chmod 644 /app/google-credentials.json
    
    # 验证凭据文件格式
    if grep -q "type" /app/google-credentials.json && grep -q "project_id" /app/google-credentials.json; then
        echo "✅ 凭据文件格式有效"
    else
        echo "⚠️ 警告: 凭据文件格式可能无效，请检查内容"
        # 显示文件前几行（不显示私钥）
        head -n 5 /app/google-credentials.json
        
        # 检查是否包含空字节（二进制文件）
        if hexdump -C -n 20 /app/google-credentials.json | grep -q "00 00"; then
            echo "❌ 错误: 检测到空字节，文件可能是二进制格式"
            echo "请确保提供的是JSON格式的凭据文件"
        fi
    fi
else
    echo "❌ 警告: Google凭据文件不存在: /app/google-credentials.json"
    echo "Vertex AI相关功能可能无法使用"
fi

# 显示主要环境变量
echo ""
echo "环境变量配置:"
echo "GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS"
echo "GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
echo "GOOGLE_CLOUD_LOCATION=$GOOGLE_CLOUD_LOCATION"
echo "DB_TYPE=$DB_TYPE"
echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"
echo "GIN_MODE=$GIN_MODE"
echo "PORT=$PORT"
echo ""

# 使用wait-for-mysql.sh脚本等待数据库就绪
echo "正在等待数据库就绪..."
/app/wait-for-mysql.sh

# 启动应用
echo "正在启动应用..."
exec /app/resumeai 
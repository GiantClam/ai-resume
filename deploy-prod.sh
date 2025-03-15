#!/bin/bash

# 显示部署开始信息
echo "===== ResumeAI 正式环境部署 ====="
echo "本脚本将自动执行以下步骤:"
echo "1. 编译Linux优化版二进制文件"
echo "2. 检查配置文件"
echo "3. 使用Docker Compose启动应用"
echo "====================================="

# 确认继续
read -p "是否继续？ (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "部署已取消"
    exit 0
fi

# 检查必要的文件
if [ ! -f ".env.production" ]; then
    echo "错误: .env.production 文件不存在"
    if [ -f ".env.production.example" ]; then
        read -p "是否从示例文件创建? (y/n): " create_env
        if [ "$create_env" = "y" ]; then
            cp .env.production.example .env.production
            echo "已创建 .env.production, 请编辑文件设置正确的值"
            exit 1
        else
            echo "请创建 .env.production 文件后再运行此脚本"
            exit 1
        fi
    else
        echo "请创建 .env.production 文件后再运行此脚本"
        exit 1
    fi
fi

if [ ! -f "google-credentials.json" ]; then
    echo "警告: google-credentials.json 文件不存在，请确保已正确配置Google API凭证"
    read -p "是否继续？ (y/n): " continue_without_credentials
    if [ "$continue_without_credentials" != "y" ]; then
        echo "部署已取消"
        exit 0
    fi
fi

# 编译优化版二进制文件
echo "正在编译优化版二进制文件..."
./build-linux-prod.sh

if [ $? -ne 0 ]; then
    echo "编译失败，请检查错误信息"
    exit 1
fi

# 检查目录
if [ ! -d "uploads" ]; then
    echo "创建 uploads 目录..."
    mkdir -p uploads
    chmod 755 uploads
fi

if [ ! -d "logs" ]; then
    echo "创建 logs 目录..."
    mkdir -p logs
    chmod 755 logs
fi

if [ ! -d "init-db" ]; then
    echo "错误: init-db 目录不存在"
    exit 1
fi

# 检查Docker和Docker Compose
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: Docker Compose 未安装"
    exit 1
fi

# 启动应用
echo "正在使用Docker Compose启动应用..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

if [ $? -ne 0 ]; then
    echo "启动失败，请检查错误信息"
    exit 1
fi

echo "====================================="
echo "部署完成！"
echo "应用现在应该可以通过 http://localhost:8180 访问"
echo "MySQL数据库运行在 localhost:3307"
echo ""
echo "查看应用日志: docker logs resumeai"
echo "查看数据库日志: docker logs resumeai-mysql" 
#!/bin/bash

echo "启动生产环境 (前端: 3000端口, 后端: 8180端口)..."

# 方式1: 直接启动服务
# 启动后端服务
cd backend
./start-prod.sh &
BACKEND_PID=$!

# 返回项目根目录
cd ..

# 构建并启动前端
npm run build
NODE_ENV=production npm start

# 当前端关闭时，同时关闭后端
kill $BACKEND_PID

# 方式2: 使用docker-compose (取消注释以使用)
# docker-compose -f docker-compose.production.yml up 
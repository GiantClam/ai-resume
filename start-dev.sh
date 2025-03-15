#!/bin/bash

echo "启动开发环境 (前端: 3000端口, 后端: 8080端口)..."

# 启动后端服务
cd backend
./start-dev.sh &
BACKEND_PID=$!

# 返回项目根目录
cd ..

# 启动前端服务
npm run dev

# 当前端关闭时，同时关闭后端
kill $BACKEND_PID 
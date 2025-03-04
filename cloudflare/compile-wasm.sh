#!/bin/bash

# 设置环境变量
export GOOS=js
export GOARCH=wasm

# 进入后端目录
cd ../backend

# 编译为WebAssembly
go build -o ../cloudflare/main.wasm

echo "Go代码已编译为WebAssembly" 
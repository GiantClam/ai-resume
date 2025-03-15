#!/bin/bash

# 加载生产环境配置
set -a
awk -F= '!/^#/ && NF==2 {print $1"="$2}' .env.production | while read -r line; do eval "$line"; done
set +a

# 启动应用
go run main.go 
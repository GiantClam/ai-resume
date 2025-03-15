#!/bin/bash

# MySQL连接参数从环境变量中获取
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_USER=${DB_USER:-resumeai}
DB_PASSWORD=${DB_PASSWORD:-password}
DB_TYPE=${DB_TYPE:-mysql}

# 最大重试次数
MAX_RETRIES=30
# 重试间隔(秒)
RETRY_INTERVAL=2

echo "====== 等待数据库服务就绪 ======"
echo "数据库类型: $DB_TYPE"
echo "数据库主机: $DB_HOST"
echo "数据库端口: $DB_PORT"

# 如果不是MySQL则跳过等待
if [ "$DB_TYPE" != "mysql" ]; then
    echo "数据库类型不是MySQL，跳过等待"
    exec "$@"
    exit
fi

# 等待MySQL就绪
retry_count=0
until mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null
do
    retry_count=$((retry_count+1))
    if [ $retry_count -ge $MAX_RETRIES ]; then
        echo "达到最大重试次数 ($MAX_RETRIES)，无法连接到MySQL"
        echo "请检查MySQL服务是否启动，以及连接参数是否正确"
        exit 1
    fi
    
    echo "等待MySQL就绪... ($retry_count/$MAX_RETRIES)"
    sleep $RETRY_INTERVAL
done

echo "✅ MySQL数据库已就绪"
echo "=============================="

# 启动传入的命令
exec "$@" 
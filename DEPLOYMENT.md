# ResumeAI 部署指南

本文档提供了将 ResumeAI 部署到生产环境的详细说明。

## 编译二进制文件

我们提供了几种编译脚本，用于生成不同平台的可执行文件。

### 仅编译 Linux 版本

```bash
# 编译基本版本
./build-linux.sh

# 编译优化版本
./build-linux-prod.sh
```

### 编译所有平台版本

```bash
./build-all.sh
```

这将在 `bin` 目录下生成各个平台的可执行文件，并创建 `resumeai` 符号链接指向 Linux 版本。

## 部署选项

### 选项 1: 直接在 Linux 服务器上运行

1. 将编译好的二进制文件和配置文件复制到服务器：

```bash
scp resumeai .env.production google-credentials.json user@your-server:/path/to/app/
```

2. 确保MySQL数据库已安装并配置：

```bash
# 安装MySQL（如果尚未安装）
sudo apt-get update
sudo apt-get install -y mysql-server

# 启动并启用MySQL服务
sudo systemctl start mysql
sudo systemctl enable mysql

# 创建数据库和用户
sudo mysql -e "CREATE DATABASE resumeai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
sudo mysql -e "CREATE USER 'resumeai'@'localhost' IDENTIFIED BY 'your_password';"
sudo mysql -e "GRANT ALL PRIVILEGES ON resumeai.* TO 'resumeai'@'localhost';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 导入初始化SQL脚本
mysql -u resumeai -p resumeai < init-db/01-schema.sql
```

3. 在服务器上设置权限并运行：

```bash
chmod +x resumeai
./resumeai
```

### 选项 2: 使用 Docker 部署（推荐）

1. 将必要的文件复制到服务器：

```bash
scp -r resumeai .env.production Dockerfile.prod docker-compose.prod.yml wait-for-mysql.sh init-db google-credentials.json user@your-server:/path/to/app/
```

2. 创建实际的环境变量文件：

```bash
# 在服务器上
cp .env.production.example .env.production
# 然后编辑 .env.production 文件，设置适当的值
nano .env.production
```

3. 在服务器上使用 Docker Compose 启动：

```bash
docker-compose -f docker-compose.prod.yml up -d
```

这将自动启动MySQL数据库和应用程序，并创建必要的表结构。

## 配置说明

### 环境变量

确保在 `.env.production` 文件中设置了正确的配置：

- `PORT=8180`: 后端服务监听端口
- `DB_TYPE=mysql`: **必须设置为mysql**，用于指定使用MySQL数据库（默认为postgres）
- `DB_DRIVER=mysql`: 数据库驱动类型
- `DB_HOST=mysql`: 数据库主机名（Docker Compose中的服务名）
- `DB_PORT=3306`: 数据库端口
- `DB_USER=resumeai`: 数据库用户名
- `DB_PASSWORD=your_secure_password`: 数据库密码
- `DB_NAME=resumeai`: 数据库名称
- `DB_CHARSET=utf8mb4`: MySQL字符集，确保支持中文和表情符号
- `MYSQL_ROOT_PASSWORD`: MySQL root用户密码（仅Docker环境）
- `MYSQL_PASSWORD`: MySQL resumeai用户密码（必须与DB_PASSWORD相同）
- `GOOGLE_CLOUD_PROJECT`: Google Cloud 项目 ID
- `GOOGLE_CLOUD_LOCATION`: Google Cloud 区域 (如 us-central1)
- `GOOGLE_APPLICATION_CREDENTIALS`: Google 凭证文件路径
- `JWT_SECRET`: JWT签名密钥，至少32个字符长度
- `JWT_EXPIRES`: JWT令牌有效期（如 24h）

### 数据库管理

Docker环境中MySQL数据存储在名为`mysql-data`的Docker卷中，确保数据持久性。

#### 备份数据库

```bash
# Docker环境
docker exec resumeai-mysql sh -c 'exec mysqldump -u root -p"$MYSQL_ROOT_PASSWORD" resumeai' > backup.sql

# 独立安装环境
mysqldump -u resumeai -p resumeai > backup.sql
```

#### 恢复数据库

```bash
# Docker环境
cat backup.sql | docker exec -i resumeai-mysql sh -c 'exec mysql -u root -p"$MYSQL_ROOT_PASSWORD" resumeai'

# 独立安装环境
mysql -u resumeai -p resumeai < backup.sql
```

### 目录权限

确保以下目录存在并具有适当的权限：

- `uploads`: 用于存储上传的文件
- `logs`: 用于存储日志文件

```bash
mkdir -p uploads logs
chmod 755 uploads logs
```

## 健康检查

部署完成后，可以通过以下命令检查服务是否正常运行：

```bash
curl http://your-server:8180/health
```

## 故障排除

如果遇到问题，请查看日志文件获取更多信息：

```bash
# 应用程序日志
tail -f logs/app.log
# 或 Docker 部署
docker logs resumeai

# 数据库日志 (Docker 部署)
docker logs resumeai-mysql
```

### 常见问题解决方法

1. **数据库连接失败**
   
   检查 `.env.production` 文件中的数据库配置是否正确，以及MySQL是否已启动。
   特别是确保 `DB_TYPE=mysql` 已正确设置，这是从PostgreSQL切换到MySQL的关键配置。

2. **数据库表不存在**
   
   如果使用独立安装，确保已导入 `init-db/01-schema.sql` 文件。

3. **容器无法启动**
   
   检查Docker日志以获取详细错误信息：
   ```bash
   docker logs resumeai
   ```

4. **权限问题**
   
   确保 `uploads` 和 `logs` 目录具有正确的权限。 
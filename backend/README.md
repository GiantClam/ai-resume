# AI Resume 后端服务

这是一个基于Go语言和Google Cloud Vertex AI的HR助手系统后端服务，提供简历筛选、面试题生成和面试总结功能。

## 功能特点

- 支持多简历批量筛选
- 智能生成针对候选人的面试题
- 面试过程智能总结和评估
- 使用Google Cloud Vertex AI的gemini-2.0-flash-001模型
- 支持PostgreSQL和MySQL数据库

## 环境要求

- Go 1.18+
- Google Cloud 账号和相关权限
- PostgreSQL数据库 (开发环境)
- MySQL数据库 (生产环境)

## 安装与配置

1. 克隆代码库
```bash
git clone https://github.com/GiantClam/ai-resume.git
cd ai-resume/backend
```

2. 安装依赖
```bash
go mod tidy
```

3. 配置环境变量
复制模板并创建自己的环境配置文件：
```bash
# 开发环境配置
cp .env.example .env

# 生产环境配置
cp .env.example .env.production
```

然后编辑相应的配置文件，填入您的配置。

开发环境配置示例 (.env)：
```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./your-credentials.json
PORT=8080
GIN_MODE=debug

# 数据库配置 - 开发环境使用PostgreSQL
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=ai_resume
DB_SSLMODE=disable
```

生产环境配置示例 (.env.production)：
```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./your-credentials.json
PORT=8080
GIN_MODE=release

# 数据库配置 - 生产环境使用MySQL
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=ai_resume
DB_CHARSET=utf8mb4
```

4. 将您的Google Cloud服务账号凭证文件放在安全位置，并确保在配置文件中正确引用其路径。

## 启动服务

### 开发环境
```bash
./start-dev.sh
```

### 生产环境
```bash
./start-prod.sh
```

或者直接使用Docker：
```bash
docker build -t ai-resume-backend .
docker run -p 8080:8080 ai-resume-backend
```

服务将在配置的端口上运行(默认8080)。

## 数据库配置

### PostgreSQL (开发环境)
1. 安装PostgreSQL
2. 创建数据库：`CREATE DATABASE ai_resume;`
3. 在`.env`文件中配置连接信息

### MySQL (生产环境)
1. 安装MySQL 8.0+
2. 创建数据库：`CREATE DATABASE ai_resume;`
3. 在`.env.production`文件中配置连接信息

## API端点

### 简历筛选
- URL: `/api/resume/screen`
- 方法: POST
- 内容类型: multipart/form-data
- 参数:
  - resumes: 简历文件 (PDF或Word格式，支持多文件)
  - jobRequirements: 职位要求
  - industry: 行业

### 面试题生成
- URL: `/api/interview/questions`
- 方法: POST
- 内容类型: application/json
- 参数:
  - resume: 简历文件 (PDF或Word格式)
  - jobRequirements: 职位要求
  - industry: 行业

### 面试总结
- URL: `/api/interview/summary`
- 方法: POST
- 内容类型: application/json
- 参数:
  - jobRequirements: 职位要求
  - industry: 行业
  - interviewNotes: 面试记录

## 安全注意事项

### 敏感信息处理

- **不要将实际的服务账号凭证（JSON文件）提交到版本控制系统**
- **不要将包含实际配置的`.env`和`.env.production`文件提交到版本控制系统**
- 使用`.env.example`作为模板，仅包含变量名和示例值
- 在生产环境中，使用环境变量或密钥管理服务来存储敏感信息

### 本地开发

为了安全开发，请确保：
1. `.gitignore`文件已配置为排除所有敏感文件
2. 检查提交前的更改，确保没有意外包含敏感信息
3. 使用环境变量而非硬编码的密钥和配置

## 注意事项

- 在生产环境中，建议设置`GIN_MODE=release`
- 确保服务账号有足够的权限调用Vertex AI API
- 默认简历解析功能为简化版，实际项目中应使用专门的PDF和Word解析库 
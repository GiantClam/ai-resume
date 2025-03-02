# AI Resume Vercel 部署指南

本文档提供了在 Vercel 平台上部署 AI Resume 应用的详细指南。

## 架构概述

该部署架构分为两部分：

1. **前端 (Next.js)**: 部署在 Vercel 平台
2. **后端 (Go)**: 部署在 Google Cloud Run 或其他服务器

## 前端部署步骤 (Vercel)

### 1. 准备工作

确保您的项目包含以下文件：

- `vercel.json`
- 更新后的 `next.config.mjs`
- API 路由代理（如有需要）

### 2. 使用 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录 Vercel
vercel login

# 部署
vercel
```

### 3. 通过 GitHub 集成部署

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 控制台创建新项目并选择您的 GitHub 仓库
3. 配置项目设置

### 4. 配置环境变量

在 Vercel 仪表板中添加以下环境变量：

- `NEXT_PUBLIC_API_URL`: 您的后端 API URL（如 `https://api.yourdomain.com`）

## 后端部署 (Google Cloud Run)

按照 `DEPLOYMENT.md` 中的 Google Cloud Run 部署步骤部署后端。

确保设置以下环境变量：

- `CORS_ORIGIN`: 您的 Vercel 前端 URL（如 `https://your-app.vercel.app`）

## 域名配置

### 1. 添加自定义域名（可选）

1. 在 Vercel 控制台中，进入项目设置
2. 点击 "Domains" 选项卡
3. 添加您的自定义域名并按照说明进行配置

### 2. 配置 CORS

确保后端的 CORS 配置允许从 Vercel 域名访问：

```go
// 在后端的 CORS 配置中
allowedOrigins := []string{
    "https://your-app.vercel.app", 
    "https://your-custom-domain.com"
}
```

## 特殊注意事项

### 1. 服务器端函数

Vercel 的 Serverless 函数（包括 API Routes）有以下限制：

- 执行时间: 10 秒 (免费计划) 或 60 秒 (专业计划)
- 负载大小: 4.5MB (请求+响应)
- 内存使用: 1GB

针对长时间运行的操作，应通过代理路由到独立后端处理。

### 2. 图片优化

确保在 `next.config.mjs` 中正确配置 `images.domains` 以允许从后端加载图片。

### 3. 环境变量

在 Vercel 中区分生产环境和预览环境的环境变量：

- 生产环境: `Production`
- 预览环境: `Preview` (用于拉取请求)
- 开发环境: `Development` (本地开发)

## 问题排查

### 常见问题

1. **API 连接问题**：检查环境变量和重写规则配置
2. **CORS 错误**：确保后端 CORS 配置正确
3. **部署失败**：检查构建日志以获取详细错误信息

## 资源与参考

- [Vercel Next.js 文档](https://vercel.com/docs/frameworks/nextjs)
- [Next.js API Routes 文档](https://nextjs.org/docs/api-routes/introduction)
- [Vercel 环境变量](https://vercel.com/docs/projects/environment-variables) 
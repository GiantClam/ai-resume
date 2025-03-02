# 安全检查清单：上传到GitHub前的准备

为了确保不会将敏感信息上传到GitHub，请在提交代码前完成以下检查：

## 1. 服务账号凭证

- [ ] 移除或排除所有Google Cloud服务账号凭证文件 (`*.json`)
- [ ] 确保 `.gitignore` 文件包含 `*.json` 排除规则（但保留必要的JSON文件如package.json）
- [ ] 确认项目中没有硬编码的API密钥或凭证

## 2. 环境变量文件

- [ ] 确保所有 `.env` 文件不会被提交到版本控制
- [ ] 提供适当的 `.env.example` 文件作为模板
- [ ] 检查 `.gitignore` 文件包含 `.env` 排除规则

## 3. 配置文件检查

- [ ] 检查 `docker-compose.yml` 文件中不包含敏感信息
- [ ] 检查所有 `Dockerfile` 文件不包含敏感信息
- [ ] 确认没有硬编码的密码或密钥

## 4. 提交前的最终验证

执行以下命令，检查是否有敏感文件即将被提交：

```bash
# 查看即将被提交的文件
git status

# 查看暂存区中的敏感文件
git diff --cached

# 查找可能的凭证文件
find . -name "*.json" -not -path "./node_modules/*" -not -name "package*.json" -not -name "tsconfig.json"

# 查找环境文件
find . -name ".env*" -not -name ".env.example" -not -name ".env.*.example"
```

## 5. 重要敏感文件清单

请确认以下文件**不会**被提交到GitHub：

- [ ] `zippy-aurora-444204-q2-a8b576f1c6e4.json` (Google Cloud服务账号密钥)
- [ ] `.env` (根目录环境变量文件)
- [ ] `backend/.env` (后端环境变量文件)
- [ ] 任何包含"key"、"secret"、"password"、"credential"等字样的文件

## 6. 已添加的安全措施

- [x] 创建了 `.env.example` 和 `backend/.env.example` 作为模板
- [x] 更新了 `.gitignore` 文件，排除敏感文件
- [x] 在README中添加了安全注意事项
- [x] 修改了Docker配置，使用环境变量而非硬编码值

## 注意事项

- 一旦敏感信息被提交到公共仓库，即使后续删除，也可能已经被缓存或爬取
- 如果意外提交了敏感信息，请立即吊销相关凭证并生成新的凭证
- 考虑使用GitHub的密钥扫描功能，在意外提交敏感信息时接收警报 
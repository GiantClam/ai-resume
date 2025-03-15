# Vertex AI 连接问题解决指南

## 问题描述

在中国大陆访问 Google Vertex AI 服务时，可能会遇到以下错误：

```
Vertex AI错误: AI内容生成失败: rpc error: code = Unavailable desc = connection error: desc = "transport: Error while dialing: dial tcp [2404:6800:4012:8::200a]:443: i/o timeout"
```

这是由于网络连接问题导致的。

## 解决方案

### 1. 设置网络代理

在 `backend/.env` 和 `backend/.env.production` 文件中，配置您的代理服务器地址：

```
# 网络代理设置 - 用于访问 Google 服务
# 大写格式
HTTP_PROXY=http://127.0.0.1:7890
HTTPS_PROXY=http://127.0.0.1:7890
NO_PROXY=localhost,127.0.0.1

# 小写格式 (gRPC 使用)
http_proxy=http://127.0.0.1:7890
https_proxy=http://127.0.0.1:7890
no_proxy=localhost,127.0.0.1
```

请将 `http://127.0.0.1:7890` 替换为您的实际代理地址。常见的代理工具端口：

- Clash: 7890
- V2Ray: 10809
- Shadowsocks: 1080

### 2. 验证连接

运行测试脚本验证连接是否正常：

```bash
./test-vertex-ai.sh
```

如果测试成功，将显示 "测试成功!" 和 AI 的回复。

### 3. 检查凭证文件

确保 Google Cloud 凭证文件路径正确：

```
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-credentials.json
```

凭证文件必须存在且有效。可以使用以下命令测试:

```bash
go run test_creds.go
```

### 4. 常见问题

1. **超时错误**：通常是由于网络连接问题，检查代理设置。
2. **凭证错误**：确保凭证文件路径正确，且文件有效。
3. **区域设置**：确认 `GOOGLE_CLOUD_LOCATION` 设置正确（通常为 `us-central1`）。

## 其他提示

- 如果您使用的是移动网络或公共 WiFi，某些端口可能被封锁，尝试使用其他端口的代理。
- 某些代理服务质量不佳，可能导致连接不稳定，尝试使用其他代理服务。
- 确保您的代理支持 HTTP/HTTPS 和 gRPC 协议。

如需更多帮助，请联系技术支持。 
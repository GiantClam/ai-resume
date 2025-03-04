# Cloudflare Tunnel 设置指南

## 安装 cloudflared

### MacOS:
```bash
brew install cloudflare/cloudflare/cloudflared
```

### Linux:
```bash
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
dpkg -i cloudflared-linux-amd64.deb
```

## 登录和创建隧道

1. **登录到Cloudflare**:
```bash
cloudflared tunnel login
```

2. **创建隧道**:
```bash
cloudflared tunnel create ai-resume-backend
```

3. **配置隧道**:
创建配置文件 `~/.cloudflared/config.yml`:

```yaml
tunnel: <您的隧道ID>
credentials-file: /path/to/credentials/file.json

ingress:
  - hostname: api.resume-ai.net
    service: http://localhost:8180
  - service: http_status:404
```

4. **在DNS中路由到隧道**:
```bash
cloudflared tunnel route dns ai-resume-backend api.resume-ai.net
```

5. **启动隧道**:
```bash
cloudflared tunnel run
```

## 设置为系统服务 (生产环境)

### Linux (systemd):
```bash
sudo cloudflared service install
```

### Docker 部署:
```bash
docker run -d --name cloudflared \
  -v ~/.cloudflared:/etc/cloudflared \
  cloudflare/cloudflared:latest \
  tunnel run
``` 
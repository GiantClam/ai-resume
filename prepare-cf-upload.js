const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 创建临时目录
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 复制 .next/static 到 dist/_next/static
const staticDir = path.join(__dirname, '.next', 'static');
const distStaticDir = path.join(distDir, '_next', 'static');
fs.mkdirSync(path.join(distDir, '_next'), { recursive: true });
fs.cpSync(staticDir, distStaticDir, { recursive: true });

// 复制 public 目录到 dist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    fs.cpSync(srcPath, destPath, { recursive: true });
  });
}

// 创建 _routes.json 文件
const routesJson = {
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*"]
};
fs.writeFileSync(path.join(distDir, '_routes.json'), JSON.stringify(routesJson, null, 2));

// 创建 index.html 文件
fs.writeFileSync(path.join(distDir, 'index.html'), `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume AI - 重定向中...</title>
  <script>
    window.location.href = '/';
  </script>
</head>
<body>
  <p>正在重定向到首页...</p>
</body>
</html>
`);

// 创建ZIP文件
console.log('创建ZIP文件...');
execSync(`cd ${distDir} && zip -r ../dist.zip ./*`);
console.log('准备完成! 文件已保存为 dist.zip'); 
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 创建临时目录
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir);

// 复制 .next 中的所有静态资源到 dist 目录
console.log('复制Next.js静态资源...');

// 1. 复制所有 .next/static 到 dist/_next/static
const staticDir = path.join(__dirname, '.next', 'static');
const distStaticDir = path.join(distDir, '_next', 'static');
fs.mkdirSync(path.join(distDir, '_next'), { recursive: true });
fs.cpSync(staticDir, distStaticDir, { recursive: true });

// 2. 复制 .next/server/app 目录下的静态资源
const serverStaticSrcDir = path.join(__dirname, '.next', 'server');
if (fs.existsSync(serverStaticSrcDir)) {
  // 复制CSS文件
  const cssDir = path.join(distDir, '_next', 'static', 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }
  
  // 寻找并复制所有CSS文件
  const searchForCssFiles = (dir) => {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        searchForCssFiles(fullPath);
      } else if (entry.name.endsWith('.css')) {
        const destPath = path.join(cssDir, path.basename(entry.name));
        fs.copyFileSync(fullPath, destPath);
        console.log(`复制CSS文件: ${fullPath} -> ${destPath}`);
      }
    }
  };
  
  searchForCssFiles(serverStaticSrcDir);
}

// 3. 复制 public 目录到 dist
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  const files = fs.readdirSync(publicDir);
  files.forEach(file => {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    fs.cpSync(srcPath, destPath, { recursive: true });
  });
}

// 创建 _headers 文件，指定正确的MIME类型
fs.writeFileSync(path.join(distDir, '_headers'), `
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin

/_next/static/css/*
  Content-Type: text/css

/_next/static/js/*
  Content-Type: application/javascript

/_next/static/media/*
  Cache-Control: public, max-age=31536000, immutable
`);

// 创建 _routes.json 文件
const routesJson = {
  "version": 1,
  "include": ["/*"],
  "exclude": ["/api/*"]
};
fs.writeFileSync(path.join(distDir, '_routes.json'), JSON.stringify(routesJson, null, 2));

// 创建index.html文件，用于处理客户端路由
fs.writeFileSync(path.join(distDir, 'index.html'), `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume AI</title>
  <link rel="stylesheet" href="/_next/static/css/app.css" type="text/css">
  <script>
    // 基本的客户端路由初始化
    window.dataLayer = window.dataLayer || [];
    window.__NEXT_DATA__ = {
      props: { pageProps: {} },
      page: "/",
      query: {},
      buildId: "static-build",
      assetPrefix: "",
      runtimeConfig: {}
    };
  </script>
</head>
<body>
  <div id="__next">
    <h1>Resume AI 加载中...</h1>
    <p>请稍候，应用正在加载。如果页面长时间未加载，请刷新浏览器。</p>
  </div>
  <script src="/_next/static/chunks/webpack.js"></script>
  <script src="/_next/static/chunks/main.js"></script>
</body>
</html>
`);

// 为所有可能的路由创建HTML入口点文件，确保客户端路由工作
// 主要路由和子路由
const routes = ['/', '/interview', '/interview/stream'];
routes.forEach(route => {
  if (route === '/') return; // 根路由已经创建
  
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  
  // 复制index.html到每个路由
  fs.copyFileSync(path.join(distDir, 'index.html'), path.join(routeDir, 'index.html'));
});

// 创建ZIP文件
console.log('创建ZIP文件...');
execSync(`cd ${distDir} && zip -r ../dist.zip ./*`);
console.log('准备完成! 文件已保存为 dist.zip'); 
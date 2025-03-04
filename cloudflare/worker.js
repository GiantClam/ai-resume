// 从KV存储或其他地方加载WASM二进制文件
const wasmCode = '...'; // 实际部署时需要替换为WASM二进制内容

// 初始化WebAssembly
const wasmModule = new WebAssembly.Module(wasmCode);
const wasmInstance = new WebAssembly.Instance(wasmModule);
const { handle_request } = wasmInstance.exports;

// 请求处理函数
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    // 调用Go WASM导出的函数
    const result = handle_request(request);
    
    // 返回结果
    return new Response(result, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 
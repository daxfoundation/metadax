'use strict';
// X07 run 2 — download speed probe (downloads first 10 MB only; no full file)
const https = require('https');

const url = 'https://huggingface.co/Qwen/Qwen2.5-3B-Instruct-GGUF/resolve/main/qwen2.5-3b-instruct-q4_k_m.gguf';
const TARGET_BYTES = 10 * 1024 * 1024; // 10 MB
let received = 0;
const start = Date.now();

function doRequest(u) {
  const req = https.get(u, { timeout: 30000 }, (res) => {
    if (res.statusCode === 301 || res.statusCode === 302) {
      res.destroy();
      doRequest(res.headers.location);
      return;
    }
    const contentLength = parseInt(res.headers['content-length'] || '0', 10);
    console.log('HTTP status:', res.statusCode, '| total size:', (contentLength / 1024 / 1024).toFixed(0), 'MB');
    res.on('data', (chunk) => {
      received += chunk.length;
      if (received >= TARGET_BYTES) {
        const elapsed = (Date.now() - start) / 1000;
        const mbps = (received / 1024 / 1024 / elapsed).toFixed(2);
        console.log('Speed test complete');
        console.log('  bytes received:', received);
        console.log('  elapsed (s):', elapsed.toFixed(2));
        console.log('  MB/s:', mbps);
        console.log('  estimated full-file download:', ((contentLength / 1024 / 1024) / parseFloat(mbps) / 60).toFixed(1), 'min');
        req.destroy();
      }
    });
    res.on('error', (e) => console.error('stream error:', e.message));
  });
  req.on('error', (e) => console.error('request error:', e.message));
  req.on('timeout', () => { console.error('timeout'); req.destroy(); });
}

doRequest(url);

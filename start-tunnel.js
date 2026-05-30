#!/usr/bin/env node
/**
 * Single-port development server for cloud VM + local tunnel setups
 * (e.g. the starfleet.teachx.ai local_port_forward.py used with hades/vbrowser)
 *
 * Why this exists:
 *   The tunnel script on your laptop does not forward HTTP OPTIONS requests
 *   (used for CORS preflight). This causes "501 Unsupported method ('OPTIONS')"
 *   and login to fail, even though the real backend works fine.
 *
 * Solution:
 *   Everything (frontend + backend API) is exposed through ONE port.
 *   The browser sees a single origin → no CORS preflight at all for /api calls.
 *
 * Usage inside the VM:
 *   1. (Optional but recommended) npm run install:all
 *   2. node start-tunnel.js
 *   3. On your laptop, run the forward script and forward ONLY the port printed below (default 8080)
 *   4. Open the forwarded URL in your browser and log in.
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PROXY_PORT = process.env.PROXY_PORT || 8080;
const BACKEND_PORT = 9000;
const FRONTEND_PORT = 3001;

const backendDir = path.join(__dirname, 'backend');
const frontendDir = path.join(__dirname, 'frontend');

console.log('🚀 Starting PrescriptionApp in single-origin tunnel mode...\n');

function startBackend() {
  return new Promise((resolve) => {
    console.log('[1/3] Starting backend on :9000 ...');
    const be = spawn('node', ['server.js'], {
      cwd: backendDir,
      env: { ...process.env, PORT: String(BACKEND_PORT) },
      stdio: ['ignore', 'pipe', 'pipe']
    });
    be.stdout.on('data', d => process.stdout.write(`[backend] ${d}`));
    be.stderr.on('data', d => process.stderr.write(`[backend] ${d}`));
    setTimeout(() => resolve(be), 2500);
  });
}

function startFrontend() {
  return new Promise((resolve) => {
    console.log('[2/3] Starting frontend (Parcel) on :3001 ...');
    const fe = spawn('npm', ['run', 'dev'], {
      cwd: frontendDir,
      env: { ...process.env },
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });
    fe.stdout.on('data', d => process.stdout.write(`[frontend] ${d}`));
    fe.stderr.on('data', d => process.stderr.write(`[frontend] ${d}`));
    setTimeout(() => resolve(fe), 8000); // Parcel takes a while
  });
}

function startProxy() {
  console.log(`[3/3] Starting single-origin proxy on :${PROXY_PORT} ...\n`);

  const proxy = http.createServer((clientReq, clientRes) => {
    const isApi = clientReq.url.startsWith('/api') || clientReq.url === '/api';

    const targetPort = isApi ? BACKEND_PORT : FRONTEND_PORT;
    const targetHost = '127.0.0.1';

    const options = {
      hostname: targetHost,
      port: targetPort,
      path: clientReq.url,
      method: clientReq.method,
      headers: { ...clientReq.headers }
    };

    // Important: rewrite Host so the backend/frontend see the right thing
    options.headers.host = `${targetHost}:${targetPort}`;

    const proxyReq = http.request(options, (proxyRes) => {
      clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(clientRes, { end: true });
    });

    proxyReq.on('error', (err) => {
      console.error('[proxy] Error talking to target:', err.message);
      clientRes.writeHead(502);
      clientRes.end('Bad gateway - target service not ready yet');
    });

    clientReq.pipe(proxyReq, { end: true });
  });

  proxy.listen(PROXY_PORT, '0.0.0.0', () => {
    console.log('════════════════════════════════════════════════════════════');
    console.log('  ✅ Single-origin dev server ready for tunnel!');
    console.log('════════════════════════════════════════════════════════════\n');
    console.log(`  Proxy (use this with your forward script):  http://localhost:${PROXY_PORT}`);
    console.log(`  → /api/*  → backend on ${BACKEND_PORT}`);
    console.log(`  → everything else → frontend on ${FRONTEND_PORT}\n`);
    console.log('  On your laptop, run:');
    console.log('     curl -sL https://starfleet.teachx.ai/scripts/local_port_forward.py | python3');
    console.log(`  Then forward port ${PROXY_PORT} only.\n`);
    console.log('  Open the forwarded URL in your browser and log in.');
    console.log('  (Demo: doctor@example.com / doctor123)\n');
    console.log('  Press Ctrl+C to stop everything.\n');
  });

  return proxy;
}

async function main() {
  const backend = await startBackend();
  const frontend = await startFrontend();
  const proxy = startProxy();

  function shutdown() {
    console.log('\nShutting down...');
    proxy.close();
    backend.kill('SIGTERM');
    frontend.kill('SIGTERM');
    setTimeout(() => process.exit(0), 500);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch(err => {
  console.error('Failed to start tunnel mode:', err);
  process.exit(1);
});

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { assertLocalOrigin, parseJsonBody, validateRun, publicError } = require('./security');
const { createLogger } = require('./logger');
const { killTree } = require('./cli-runner');
const openai = require('./provider-openai');
const claude = require('./provider-claude');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const PORT = Number(process.env.BIBLE_BRIDGE_PORT || 43127);
const jobs = new Map();
const logger = createLogger(ROOT);

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer'
  });
  res.end(JSON.stringify(payload));
}

function statusFor(provider) {
  return provider === 'openai' ? openai.getStatus() : claude.getStatus();
}

function getProvider(provider) {
  return provider === 'openai' ? openai : provider === 'claude' ? claude : null;
}

function createJob(provider, stage) {
  const id = crypto.randomUUID();
  const job = { id, provider, stage, status: 'queued', createdAt: new Date().toISOString(), result: '', error: '', durationMs: null, child: null };
  jobs.set(id, job);
  return job;
}

function presentJob(job) {
  return {
    id: job.id,
    provider: job.provider,
    stage: job.stage,
    status: job.status,
    createdAt: job.createdAt,
    completedAt: job.completedAt || null,
    durationMs: job.durationMs,
    result: job.result,
    error: job.error
  };
}

async function startJob(res, providerName, request) {
  const provider = getProvider(providerName);
  if (!provider) return json(res, 404, { error: '지원하지 않는 Provider입니다.' });
  const cliStatus = statusFor(providerName);
  if (!cliStatus.installed) return json(res, 409, { error: `${cliStatus.label} CLI가 설치되어 있지 않습니다.`, provider: cliStatus });

  const job = createJob(providerName, request.stage);
  logger.write('job_queued', job);
  try {
    const execution = provider.start(request);
    job.child = execution.child;
    job.status = 'running';
    logger.write('job_started', job);
    execution.done.then(result => {
      if (job.status === 'cancelled') return;
      const output = providerName === 'claude' ? claude.extractResult(result.stdout) : result.stdout;
      job.status = 'completed';
      job.result = output;
      job.durationMs = result.durationMs;
      job.completedAt = new Date().toISOString();
      logger.write('job_completed', { ...job, status: 'completed' });
    }).catch(error => {
      if (job.status === 'cancelled') return;
      job.status = 'failed';
      job.error = publicError(error);
      job.completedAt = new Date().toISOString();
      logger.write('job_failed', { ...job, status: 'failed' });
    });
    return json(res, 202, presentJob(job));
  } catch (error) {
    job.status = 'failed';
    job.error = publicError(error);
    logger.write('job_failed', { ...job, status: 'failed' });
    return json(res, 500, presentJob(job));
  }
}

function serveStatic(res, pathname) {
  const requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(ROOT, '.' + requested);
  if (!filePath.startsWith(ROOT + path.sep)) return json(res, 403, { error: '허용되지 않은 경로입니다.' });
  const mime = path.extname(filePath) === '.html' ? 'text/html; charset=utf-8'
    : path.extname(filePath) === '.js' ? 'application/javascript; charset=utf-8'
    : path.extname(filePath) === '.css' ? 'text/css; charset=utf-8'
    : 'application/octet-stream';
  fs.readFile(filePath, (error, content) => {
    if (error) return json(res, error.code === 'ENOENT' ? 404 : 500, { error: '파일을 읽을 수 없습니다.' });
    res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  try {
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { status: 'ok', mode: 'subscription-bridge', apiBilling: false, host: HOST, port: PORT });
    }
    if (req.method === 'GET' && url.pathname === '/api/providers') return json(res, 200, { providers: [statusFor('openai'), statusFor('claude')] });
    if (req.method === 'GET' && /^\/api\/job\/[0-9a-f-]+$/i.test(url.pathname)) {
      const job = jobs.get(url.pathname.split('/').pop());
      return job ? json(res, 200, presentJob(job)) : json(res, 404, { error: '작업을 찾을 수 없습니다.' });
    }
    if (req.method === 'POST' && url.pathname === '/api/cancel') {
      assertLocalOrigin(req);
      const body = await parseJsonBody(req);
      const job = jobs.get(String(body.jobId || ''));
      if (!job || !['queued', 'running'].includes(job.status)) return json(res, 404, { error: '취소 가능한 작업을 찾을 수 없습니다.' });
      job.status = 'cancelled';
      job.error = '사용자가 작업을 취소했습니다. 이전 결과는 보존됩니다.';
      job.completedAt = new Date().toISOString();
      killTree(job.child);
      logger.write('job_cancelled', { ...job, status: 'cancelled' });
      return json(res, 200, presentJob(job));
    }
    const route = req.method === 'POST' && url.pathname.match(/^\/api\/(test|run)\/(openai|claude)$/);
    if (route) {
      assertLocalOrigin(req);
      const [, action, provider] = route;
      const body = await parseJsonBody(req);
      const testPrompt = '연결 테스트입니다. 한국어로 정확히 "연결 확인"만 반환하세요.';
      const request = validateRun(action === 'test' ? { provider, stage: 'test', prompt: testPrompt, timeoutSeconds: 60 } : body, provider);
      return startJob(res, provider, request);
    }
    if (req.method === 'GET' || req.method === 'HEAD') return serveStatic(res, url.pathname);
    return json(res, 404, { error: '지원하지 않는 요청입니다.' });
  } catch (error) {
    logger.write('request_rejected', { status: 'rejected' });
    return json(res, error.statusCode || 500, { error: publicError(error) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Bible Scene Local Bridge: http://${HOST}:${PORT}`);
  console.log('SUBSCRIPTION · API 과금 OFF — 외부 네트워크 바인딩을 사용하지 않습니다.');
});

function shutdown() {
  for (const job of jobs.values()) killTree(job.child);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 2000).unref();
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

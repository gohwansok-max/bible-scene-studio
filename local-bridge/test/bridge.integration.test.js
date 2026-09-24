'use strict';

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const repo = path.resolve(__dirname, '../..');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'bible-bridge-test-'));
const bin = path.join(temp, 'bin');
const port = 43129;
const baseUrl = `http://127.0.0.1:${port}`;
fs.mkdirSync(bin);

function fake(name, body) {
  const file = path.join(bin, name);
  fs.writeFileSync(file, `#!/usr/bin/env sh\n${body}\n`, { mode: 0o755 });
}
fake('codex', `if [ "$1" = "--version" ]; then echo "codex test 1.0"; exit 0; fi\ninput=$(cat)\nprintf 'codex-output api-key-present=%s prompt=%s' "\${OPENAI_API_KEY:+yes}\${CODEX_API_KEY:+yes}" "$input"`);
fake('claude', `if [ "$1" = "--version" ]; then echo "claude test 1.0"; exit 0; fi\ninput=$(cat)\nprintf '{"result":"claude-output api-key-present=%s prompt=%s"}' "\${ANTHROPIC_API_KEY:+yes}" "$input"`);

const server = spawn(process.execPath, ['local-bridge/bridge-server.js'], {
  cwd: repo,
  env: { ...process.env, PATH: `${bin}:${process.env.PATH}`, BIBLE_BRIDGE_PORT: String(port), OPENAI_API_KEY: 'must-be-stripped', ANTHROPIC_API_KEY: 'must-be-stripped' },
  stdio: ['ignore', 'pipe', 'pipe']
});

async function request(pathname, options = {}) {
  const response = await fetch(baseUrl + pathname, options);
  return { status: response.status, json: await response.json() };
}
async function waitReady() {
  for (let i = 0; i < 30; i++) {
    try { const r = await request('/api/health'); if (r.status === 200) return; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('bridge did not start');
}
async function waitJob(id) {
  for (let i = 0; i < 30; i++) {
    const r = await request('/api/job/' + id);
    if (r.json.status === 'completed') return r.json;
    if (r.json.status === 'failed') throw new Error(r.json.error);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('job timeout');
}

(async () => {
  try {
    await waitReady();
    const health = await request('/api/health');
    assert.equal(health.json.apiBilling, false);

    const providers = await request('/api/providers');
    assert.equal(providers.json.providers.find(p => p.id === 'openai').installed, true);
    assert.equal(providers.json.providers.find(p => p.id === 'claude').installed, true);

    const invalidOrigin = await request('/api/run/openai', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'http://example.com' }, body: JSON.stringify({ provider: 'openai', stage: 'research', prompt: 'x', model: 'plan-default', timeoutSeconds: 10 }) });
    assert.equal(invalidOrigin.status, 403);

    const openaiStart = await request('/api/run/openai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'openai', stage: 'research', prompt: 'safe research', model: 'plan-default', timeoutSeconds: 10 }) });
    assert.equal(openaiStart.status, 202);
    const openaiJob = await waitJob(openaiStart.json.id);
    assert.match(openaiJob.result, /codex-output api-key-present=/);
    assert.doesNotMatch(openaiJob.result, /api-key-present=yes/);

    const claudeStart = await request('/api/run/claude', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider: 'claude', stage: 'draft', prompt: 'safe draft', model: 'plan-default', timeoutSeconds: 10 }) });
    assert.equal(claudeStart.status, 202);
    const claudeJob = await waitJob(claudeStart.json.id);
    assert.match(claudeJob.result, /claude-output api-key-present=/);
    assert.doesNotMatch(claudeJob.result, /api-key-present=yes/);

    const page = await fetch('http://127.0.0.1:43127/');
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Bible Scene Studio v2\.0/);
    console.log('PASS: Bridge API, same-origin rejection, fixed CLI invocation, API-key environment sanitization, static page delivery');
  } finally {
    server.kill('SIGTERM');
    fs.rmSync(temp, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

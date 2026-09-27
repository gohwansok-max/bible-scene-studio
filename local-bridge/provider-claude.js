'use strict';

const path = require('path');
const { inspectCli, spawnCli } = require('./cli-runner');

function getStatus() {
  return {
    id: 'claude',
    label: 'Claude Pro / Claude Code',
    ...inspectCli('claude'),
    models: [{ id: 'plan-default', label: '플랜 권장 모델', available: true }]
  };
}

function start({ prompt, timeoutSeconds }) {
  // stdin에 작업 내용을 전달하고 고정된 print-mode 명령만 실행한다.
  // --bare는 OAuth(Claude Pro 로그인)를 읽지 않고 ANTHROPIC_API_KEY만 허용하므로 구독 모드에서 사용하지 않는다.
  return spawnCli({
    command: 'claude',
    args: ['-p', '--output-format', 'json'],
    input: prompt,
    timeoutSeconds,
    cwd: path.resolve(__dirname, '..')
  });
}

function extractResult(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    return String(parsed.result || parsed.structured_output || '').trim() || stdout;
  } catch {
    return stdout;
  }
}

module.exports = { getStatus, start, extractResult };

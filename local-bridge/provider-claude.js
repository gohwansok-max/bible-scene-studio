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
  return spawnCli({
    command: 'claude',
    args: ['-p', '표준 입력의 작업 내용을 수행하세요. 요청된 최종 결과만 반환하세요.', '--output-format', 'json', '--bare'],
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

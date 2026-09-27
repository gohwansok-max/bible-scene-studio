'use strict';

const path = require('path');
const { inspectCli, spawnCli } = require('./cli-runner');

function getStatus() {
  return {
    id: 'openai',
    label: 'ChatGPT / Codex',
    ...inspectCli('codex'),
    models: [{ id: 'plan-default', label: '플랜 권장 모델', available: true }]
  };
}

function start({ prompt, timeoutSeconds }) {
  // 고정된 공식 Codex 비대화형 명령만 실행한다. 브라우저는 명령·경로를 전달할 수 없다.
  return spawnCli({
    command: 'codex',
    args: ['exec', '--ephemeral', '--skip-git-repo-check', '--sandbox', 'read-only', '-'],
    input: prompt,
    timeoutSeconds,
    cwd: path.resolve(__dirname, '..')
  });
}

module.exports = { getStatus, start };

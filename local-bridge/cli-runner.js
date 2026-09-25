'use strict';

const { spawn, spawnSync } = require('child_process');
const path = require('path');
const { subscriptionEnv } = require('./security');

const MAX_OUTPUT_BYTES = 4 * 1024 * 1024;
// Windows의 npm 설치 CLI(codex.cmd 등)는 shell 없이 실행되지 않는다.
// 인자는 코드에 고정된 값만 사용하고 프롬프트는 stdin으로만 전달하므로 shell 사용 시에도 주입 경로가 없다.
const IS_WINDOWS = process.platform === 'win32';

function killTree(child) {
  if (!child || child.exitCode !== null || child.killed) return;
  if (IS_WINDOWS && child.pid) {
    spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { windowsHide: true }).on('error', () => child.kill());
  } else {
    child.kill('SIGTERM');
  }
}

function inspectCli(command) {
  const found = spawnSync(command, ['--version'], { encoding: 'utf8', timeout: 15000, env: subscriptionEnv(), shell: IS_WINDOWS, windowsHide: true });
  if (found.error || found.status !== 0) return { installed: false, version: null, authentication: '설치 안 됨' };
  const version = String(found.stdout || found.stderr || '').trim().split('\n')[0].slice(0, 160);
  return { installed: true, version, authentication: '연결 테스트 필요' };
}

function spawnCli({ command, args, input, timeoutSeconds, cwd }) {
  const startedAt = Date.now();
  const child = spawn(command, args, {
    cwd: cwd || path.resolve(__dirname, '..'),
    env: subscriptionEnv(),
    stdio: ['pipe', 'pipe', 'pipe'],
    shell: IS_WINDOWS,
    windowsHide: true
  });
  let stdout = '';
  let stderr = '';
  let ended = false;
  let timedOut = false;

  const done = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      timedOut = true;
      killTree(child);
    }, timeoutSeconds * 1000);

    const append = (target, chunk) => {
      if (target.length + chunk.length > MAX_OUTPUT_BYTES) {
        killTree(child);
        return target + '\n[출력 제한 초과로 중지됨]';
      }
      return target + chunk;
    };
    child.stdout.on('data', chunk => { stdout = append(stdout, chunk.toString()); });
    child.stderr.on('data', chunk => { stderr = append(stderr, chunk.toString()); });
    child.on('error', error => { clearTimeout(timer); reject(error); });
    child.on('close', code => {
      clearTimeout(timer);
      if (ended) return;
      ended = true;
      const durationMs = Date.now() - startedAt;
      if (timedOut) return reject(new Error(`실행 시간이 ${timeoutSeconds}초를 초과했습니다.`));
      if (code !== 0) return reject(new Error((stderr || `CLI가 종료 코드 ${code}로 종료되었습니다.`).slice(-2400)));
      resolve({ stdout: stdout.trim(), stderr: stderr.trim(), durationMs });
    });
    // CLI가 입력을 다 읽기 전에 종료(로그인 실패 등)해도 브리지가 EPIPE로 죽지 않도록 한다.
    child.stdin.on('error', () => {});
    child.stdin.end(input, 'utf8');
  });

  return { child, done };
}

module.exports = { inspectCli, spawnCli, killTree };

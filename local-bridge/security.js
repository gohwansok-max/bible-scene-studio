'use strict';

const BLOCKED_ENV = [
  'OPENAI_API_KEY', 'OPENAI_ADMIN_KEY', 'OPENAI_BASE_URL', 'CODEX_API_KEY',
  'ANTHROPIC_API_KEY', 'ANTHROPIC_BASE_URL',
  'CLAUDE_CODE_USE_BEDROCK', 'CLAUDE_CODE_USE_VERTEX'
];
const ALLOWED_ORIGINS = new Set([
  'http://127.0.0.1:43127',
  'http://localhost:43127'
]);
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MAX_PROMPT_CHARS = 220000;

function subscriptionEnv(base = process.env) {
  const env = { ...base };
  for (const key of BLOCKED_ENV) delete env[key];
  return env;
}

function assertLocalOrigin(req) {
  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    const error = new Error('로컬 브리지에는 동일 출처 요청만 허용됩니다.');
    error.statusCode = 403;
    throw error;
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        const error = new Error('요청 크기가 제한을 초과했습니다.');
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); }
      catch {
        const error = new Error('JSON 형식의 요청만 허용됩니다.');
        error.statusCode = 400;
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function validateRun(body, expectedProvider) {
  const allowedStages = new Set(['research', 'draft', 'finalize', 'test']);
  const provider = String(body.provider || expectedProvider || '');
  const stage = String(body.stage || '');
  const prompt = String(body.prompt || '');
  const model = String(body.model || 'plan-default');
  const timeoutSeconds = Number(body.timeoutSeconds || 600);

  if (provider !== expectedProvider) throw Object.assign(new Error('허용되지 않은 Provider 요청입니다.'), { statusCode: 400 });
  if (!allowedStages.has(stage)) throw Object.assign(new Error('허용되지 않은 파이프라인 단계입니다.'), { statusCode: 400 });
  if (!prompt || prompt.length > MAX_PROMPT_CHARS) throw Object.assign(new Error('프롬프트가 없거나 허용 길이를 초과했습니다.'), { statusCode: 400 });
  if (model !== 'plan-default') throw Object.assign(new Error('구독 모드에서는 CLI에서 확인된 플랜 권장 모델만 사용할 수 있습니다.'), { statusCode: 400 });
  if (!Number.isInteger(timeoutSeconds) || timeoutSeconds < 10 || timeoutSeconds > 1200) {
    throw Object.assign(new Error('실행 시간은 10초~20분 범위여야 합니다.'), { statusCode: 400 });
  }
  return { provider, stage, prompt, model, timeoutSeconds };
}

function publicError(error) {
  const raw = String(error?.message || error || '알 수 없는 오류');
  if (/rate limit|usage limit|limit reached|quota/i.test(raw)) return '구독 사용 한도에 도달했습니다. API로 자동 전환하지 않았습니다. 한도 초기화 후 다시 실행하거나 사용자가 직접 API 모드로 전환해 주세요.';
  if (/not found|ENOENT/i.test(raw)) return '필요한 공식 CLI가 설치되어 있지 않습니다.';
  if (/auth|login|sign in|unauthorized/i.test(raw)) return '공식 CLI의 구독 계정 로그인이 필요합니다.';
  return raw.replace(/(sk-[A-Za-z0-9_\-]{8,}|Bearer\s+\S+|api[_ -]?key\s*[:=]\s*\S+)/gi, '[비공개 값]');
}

module.exports = { BLOCKED_ENV, subscriptionEnv, assertLocalOrigin, parseJsonBody, validateRun, publicError };

'use strict';

const fs = require('fs');
const path = require('path');

function createLogger(rootDir) {
  const logDir = path.join(rootDir, 'workspace', 'logs');
  const logFile = path.join(logDir, 'bridge-events.jsonl');

  function write(event, fields = {}) {
    fs.mkdirSync(logDir, { recursive: true });
    const safe = {
      at: new Date().toISOString(),
      event,
      jobId: fields.jobId || undefined,
      provider: fields.provider || undefined,
      stage: fields.stage || undefined,
      durationMs: Number.isFinite(fields.durationMs) ? fields.durationMs : undefined,
      status: fields.status || undefined
    };
    fs.appendFileSync(logFile, JSON.stringify(safe) + '\n', { encoding: 'utf8', mode: 0o600 });
  }

  return { write, logFile };
}

module.exports = { createLogger };

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const match = html.match(/<script>([\s\S]*)<\/script>/i);
assert(match, 'inline application script is missing');
new vm.Script(match[1]);
assert.match(html, /Bible Scene Studio v2\.0/);
assert.match(html, /SUBSCRIPTION · API 과금 OFF/);
assert.match(html, /수동 모드 결과 반영/);
assert.match(html, /API 모드에서는 OpenAI 또는 Anthropic API 사용료가 발생할 수 있습니다/);
assert.doesNotMatch(html, /callGemini|geminiKey|geminiModel/);
assert.match(html, /127\.0\.0\.1:43127/);
console.log('PASS: UI script syntax, v2 labels, manual import, API confirmation, Gemini removal, local bridge endpoint');

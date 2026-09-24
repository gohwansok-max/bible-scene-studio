$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
Write-Host 'Bible Scene Studio v2.0 Subscription Bridge'
Write-Host 'SUBSCRIPTION | API billing OFF'

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Error 'Node.js 20+가 필요합니다. https://nodejs.org/에서 설치 후 다시 실행하세요.'
  exit 1
}

if (-not (Get-Command codex -ErrorAction SilentlyContinue)) { Write-Host '[안내] Codex CLI 미설치: 앱에서 설치 안내를 확인하세요.' }
else { Write-Host '[확인] Codex CLI 설치됨' }
if (-not (Get-Command claude -ErrorAction SilentlyContinue)) { Write-Host '[안내] Claude Code 미설치: 앱에서 설치 안내를 확인하세요.' }
else { Write-Host '[확인] Claude Code 설치됨' }

Start-Process 'http://127.0.0.1:43127/'
node .\local-bridge\bridge-server.js

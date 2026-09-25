@echo off
setlocal
cd /d "%~dp0.."

rem Subscription login helper. Opens the official browser login of each CLI.
rem This script never reads, stores or forwards passwords, cookies or tokens.
rem API billing variables are cleared for this window only, so the CLIs log in with the subscription account.
set OPENAI_API_KEY=
set CODEX_API_KEY=
set ANTHROPIC_API_KEY=
set CLAUDE_CODE_USE_BEDROCK=
set CLAUDE_CODE_USE_VERTEX=

echo ============================================
echo  Bible Scene Studio - Subscription Login
echo  ChatGPT Plus (Codex CLI) / Claude Pro (Claude Code)
echo ============================================
echo.

where codex >nul 2>nul
if errorlevel 1 (
  echo [MISSING] Codex CLI. Install:  npm install -g @openai/codex
) else (
  echo --- Codex login status ---
  call codex login status
  echo.
  echo Must show "Logged in using ChatGPT". If it says "API key" or "Not logged in", log in again.
  choice /c YN /m "Run Codex login with ChatGPT Plus account now"
  if not errorlevel 2 (
    call codex logout >nul 2>nul
    call codex login
  )
)
echo.

where claude >nul 2>nul
if errorlevel 1 (
  echo [MISSING] Claude Code. Install: see https://code.claude.com/docs/en/overview
) else (
  echo --- Claude Code login status ---
  call claude auth status --text
  echo.
  echo Must show a Claude Pro subscription login, not an Anthropic Console / API key login.
  choice /c YN /m "Run Claude login with Claude Pro account now"
  if not errorlevel 2 (
    call claude auth login --claudeai
  )
)

echo.
echo Done. Next: run local-bridge\start_subscription_mode.bat and press "Connection test" for both providers.
pause
endlocal

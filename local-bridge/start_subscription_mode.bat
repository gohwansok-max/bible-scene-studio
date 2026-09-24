@echo off
setlocal
cd /d "%~dp0.."

echo ============================================
echo  Bible Scene Studio v2.0 Subscription Bridge
echo  SUBSCRIPTION ^| API billing OFF
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 20+ is required. Install it from https://nodejs.org/
  pause
  exit /b 1
)

where codex >nul 2>nul
if errorlevel 1 (
  echo [NOTICE] Codex CLI was not found. The app will show setup guidance.
) else (
  echo [OK] Codex CLI found.
)

where claude >nul 2>nul
if errorlevel 1 (
  echo [NOTICE] Claude Code was not found. The app will show setup guidance.
) else (
  echo [OK] Claude Code found.
)

echo.
echo Starting local bridge at http://127.0.0.1:43127/
start "Bible Scene Studio" http://127.0.0.1:43127/
node local-bridge\bridge-server.js

endlocal

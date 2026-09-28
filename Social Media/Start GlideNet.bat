@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install the LTS version from https://nodejs.org/ and run this file again.
  pause
  exit /b 1
)

start "GlideNet Server" /D "%~dp0" cmd /k node server.js
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000/"
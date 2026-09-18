@echo off
title CreatorIQ - Full Stack Launcher
echo ======================================================
echo           Starting CreatorIQ Full Stack
echo ======================================================
echo 1. Starting Mock Social API (Port 9000)...
start "CreatorIQ - Mock Social API (Port 9000)" cmd /k "cd /d "%~dp0mock-api" && python main.py"

timeout /t 2 /nobreak >nul

echo 2. Starting FastAPI Backend (Port 8000)...
start "CreatorIQ - Backend API (Port 8000)" cmd /k "cd /d "%~dp0backend" && python main.py"

timeout /t 2 /nobreak >nul

echo 3. Starting React Frontend (Port 3000)...
start "CreatorIQ - Frontend (Port 3000)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ======================================================
echo All 3 services are launching in separate windows!
echo - Frontend:  http://localhost:3000
echo - Backend:   http://localhost:8000 (Docs: /docs)
echo - Mock API:  http://localhost:9000 (Docs: /docs)
echo ======================================================
pause

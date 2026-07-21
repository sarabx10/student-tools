@echo off
title Student Tools Launcher
echo ============================================
echo    Starting Student Tools...
echo ============================================
echo.

REM 1) Start MySQL (XAMPP) if it is installed
if exist "C:\xampp\mysql_start.bat" (
  echo [1/3] Starting MySQL ...
  start "MySQL" "C:\xampp\mysql_start.bat"
) else (
  echo [1/3] Could not find XAMPP MySQL - please start MySQL manually in XAMPP.
)

REM 2) Start the Backend (API + AI) in its own window
echo [2/3] Starting Backend ...
start "Student Tools - Backend" /d "%~dp0backend" cmd /k npm run dev

REM 3) Start the Frontend (website) in its own window
echo [3/3] Starting Frontend ...
start "Student Tools - Frontend" /d "%~dp0frontend" cmd /k npm run dev

REM 4) Wait a few seconds, then open the app in the browser
echo.
echo Waiting for the servers to start ...
timeout /t 8 /nobreak >nul
start "" http://localhost:5173

echo.
echo ============================================
echo  Done! Two new windows opened:
echo    - Backend  (keep it open)
echo    - Frontend (keep it open)
echo  The app should open at http://localhost:5173
echo ============================================
echo.
echo You can close THIS window now.
pause

@echo off
echo ============================================================
echo   Drought Severity Predictor - Starting All Services
echo ============================================================
echo.

echo [1/2] Starting Backend Server...
start "Backend Server" cmd /k "python backend/app.py"
timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ============================================================
echo   All Services Started!
echo ============================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause >nul

@echo off
echo ========================================
echo Restarting Drought Severity Predictor
echo ========================================
echo.

echo Stopping all Python and Node processes...
taskkill /F /IM python.exe 2>nul
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak > nul

echo.
echo Starting backend server...
start "Backend Server" cmd /k "python backend/app.py"
timeout /t 5 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Servers Restarting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Wait 10 seconds for servers to start...
echo Then open: http://localhost:3000
echo.
pause

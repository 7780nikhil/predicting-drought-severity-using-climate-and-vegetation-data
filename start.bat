@echo off
echo ========================================
echo Starting Drought Severity Predictor
echo ========================================
echo.
echo Starting backend server...
start "Backend Server" cmd /k "python backend/app.py"
timeout /t 3 /nobreak > nul

echo Starting frontend server...
start "Frontend Server" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo Application Starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to close this window...
pause > nul

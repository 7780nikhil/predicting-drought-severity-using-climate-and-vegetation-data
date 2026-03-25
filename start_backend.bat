@echo off
echo ========================================
echo Starting Backend Server
echo ========================================
echo.

echo Checking setup...
python check_backend.py

echo.
echo Starting Flask server...
echo.
python backend/app.py

pause

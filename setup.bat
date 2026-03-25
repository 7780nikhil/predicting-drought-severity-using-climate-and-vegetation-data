@echo off
echo ========================================
echo Drought Severity Predictor Setup
echo MongoDB Version
echo ========================================
echo.

echo [1/4] Installing backend dependencies...
pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo [2/4] Training machine learning model...
python train_model.py
if %errorlevel% neq 0 (
    echo ERROR: Failed to train model
    pause
    exit /b 1
)

echo.
echo [3/4] Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
cd ..

echo.
echo [4/4] Testing MongoDB connection...
python -c "from backend.models import test_connection; test_connection()"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Database: MongoDB Atlas (Cloud)
echo Collections: users, predictions
echo.
echo To start the application:
echo 1. Run backend:  python backend/app.py
echo 2. Run frontend: cd frontend ^&^& npm start
echo.
echo Or use start.bat to run both automatically
echo.
echo For MongoDB details, see MONGODB_SETUP.md
echo.
pause

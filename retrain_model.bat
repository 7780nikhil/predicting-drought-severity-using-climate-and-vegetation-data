@echo off
echo ========================================
echo Retraining Drought Prediction Model
echo ========================================
echo.

echo Removing old model file...
if exist backend\drought_model.pkl (
    del backend\drought_model.pkl
    echo Old model deleted.
) else (
    echo No old model found.
)

echo.
echo Training new advanced model...
echo.
python train_model.py

echo.
echo ========================================
echo Model retraining complete!
echo ========================================
echo.
echo The new model is ready to use.
echo Start the backend with: python backend/app.py
echo.
pause

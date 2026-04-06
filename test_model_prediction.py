#!/usr/bin/env python3
import sys
import os
import pandas as pd
import joblib

def test_model_prediction():
    """Test the model prediction functionality"""
    print("Testing model prediction...")

    # Check if model exists
    model_path = 'backend/drought_model.pkl'
    if not os.path.exists(model_path):
        print("❌ Model file not found. Retraining...")
        # Import and run training
        sys.path.append('.')
        try:
            from train_model import train_advanced_model
            train_advanced_model()
            print("✅ Model retrained successfully!")
        except Exception as e:
            print(f"❌ Failed to retrain model: {e}")
            return False

    # Load model
    try:
        model = joblib.load(model_path)
        print(f"✅ Model loaded: {type(model)}")
    except Exception as e:
        print(f"❌ Failed to load model: {e}")
        return False

    # Test prediction
    test_data = pd.DataFrame([[300, 32, 0.4]], columns=['rainfall', 'temperature', 'NDVI'])

    try:
        prediction = model.predict(test_data)[0]
        print(f"✅ Prediction successful: {prediction}")

        # Test predict_proba
        if hasattr(model, 'predict_proba'):
            try:
                proba = model.predict_proba(test_data)[0]
                confidence = float(max(proba))
                print(f"✅ Confidence calculation successful: {confidence}")
            except Exception as e:
                print(f"⚠️ Confidence calculation failed: {e}")

        return True

    except Exception as e:
        print(f"❌ Prediction failed: {e}")
        return False

if __name__ == "__main__":
    success = test_model_prediction()
    sys.exit(0 if success else 1)
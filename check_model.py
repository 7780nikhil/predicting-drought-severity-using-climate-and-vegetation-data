import joblib
import os

# Load the model
model_path = 'backend/drought_model.pkl'
if os.path.exists(model_path):
    model = joblib.load(model_path)
    print(f"Model type: {type(model)}")
    print(f"Model class name: {model.__class__.__name__}")

    # Check if it's a RandomForest
    if hasattr(model, 'n_estimators'):
        print(f"Number of estimators: {model.n_estimators}")
        print("This is a RandomForestClassifier")
        # Check the base estimators
        if hasattr(model, 'estimators_'):
            print(f"Number of base estimators: {len(model.estimators_)}")
            if len(model.estimators_) > 0:
                base_estimator = model.estimators_[0]
                print(f"Base estimator type: {type(base_estimator)}")
                print(f"Base estimator class: {base_estimator.__class__.__name__}")
                if hasattr(base_estimator, 'monotonic_cst'):
                    print("Base estimator HAS monotonic_cst attribute")
                else:
                    print("Base estimator does NOT have monotonic_cst attribute")
    else:
        print("This is NOT a RandomForestClassifier")

    # Check for monotonic_cst attribute on main model
    if hasattr(model, 'monotonic_cst'):
        print("Main model has monotonic_cst attribute")
    else:
        print("Main model does NOT have monotonic_cst attribute")

    # Try to make a prediction
    import pandas as pd
    test_data = pd.DataFrame([[300, 32, 0.4]], columns=['rainfall', 'temperature', 'NDVI'])
    try:
        pred = model.predict(test_data)
        print(f"Prediction successful: {pred}")
    except Exception as e:
        print(f"Prediction failed: {e}")

else:
    print("Model file not found")
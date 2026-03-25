import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import joblib
import os

def generate_realistic_drought_data(n_samples=2000):
    """
    Generate realistic synthetic drought data based on actual climate patterns
    
    Drought Severity Levels:
    0 = No Drought (Low severity)
    1 = Moderate Drought
    2 = Severe Drought (High severity)
    
    Based on real-world drought indicators:
    - Rainfall: Lower rainfall increases drought risk
    - Temperature: Higher temperature increases drought risk
    - NDVI: Lower vegetation index indicates drought stress
    """
    np.random.seed(42)
    
    # Generate realistic climate data
    rainfall = np.random.gamma(shape=2, scale=150, size=n_samples)  # 0-800mm range
    temperature = np.random.normal(loc=28, scale=8, size=n_samples)  # 10-45°C range
    ndvi = np.random.beta(a=2, b=2, size=n_samples)  # 0-1 range
    
    # Clip values to realistic ranges
    rainfall = np.clip(rainfall, 0, 1000)
    temperature = np.clip(temperature, 10, 45)
    ndvi = np.clip(ndvi, 0.05, 0.95)
    
    # Create labels based on realistic drought conditions
    labels = []
    
    for r, t, n in zip(rainfall, temperature, ndvi):
        # Calculate drought score (0-100)
        # Lower rainfall = higher score
        # Higher temperature = higher score  
        # Lower NDVI = higher score
        
        rainfall_score = max(0, (400 - r) / 400 * 40)  # 0-40 points
        temp_score = max(0, (t - 20) / 25 * 35)  # 0-35 points
        ndvi_score = max(0, (0.6 - n) / 0.6 * 25)  # 0-25 points
        
        drought_score = rainfall_score + temp_score + ndvi_score
        
        # Classify based on drought score
        if drought_score < 30:
            labels.append(0)  # No/Low Drought
        elif drought_score < 60:
            labels.append(1)  # Moderate Drought
        else:
            labels.append(2)  # Severe Drought
    
    # Create DataFrame
    df = pd.DataFrame({
        'rainfall': rainfall,
        'temperature': temperature,
        'NDVI': ndvi,
        'drought_severity': labels
    })
    
    return df

def train_advanced_model():
    """Train an advanced Random Forest model for drought prediction"""
    
    print("="*70)
    print("🌍 DROUGHT SEVERITY PREDICTION MODEL TRAINING")
    print("="*70)
    
    # Generate training data
    print("\n📊 Generating realistic training data...")
    df = generate_realistic_drought_data(2000)
    
    print(f"   ✓ Generated {len(df)} samples")
    print(f"   ✓ Features: Rainfall, Temperature, NDVI")
    print(f"   ✓ Classes: No Drought (0), Moderate (1), Severe (2)")
    
    # Display data distribution
    print("\n📈 Data Distribution:")
    for severity, count in df['drought_severity'].value_counts().sort_index().items():
        severity_name = {0: "No/Low Drought", 1: "Moderate Drought", 2: "Severe Drought"}[severity]
        percentage = (count / len(df)) * 100
        print(f"   {severity_name}: {count} samples ({percentage:.1f}%)")
    
    # Display feature statistics
    print("\n📊 Feature Statistics:")
    print(f"   Rainfall: {df['rainfall'].min():.1f} - {df['rainfall'].max():.1f} mm (avg: {df['rainfall'].mean():.1f})")
    print(f"   Temperature: {df['temperature'].min():.1f} - {df['temperature'].max():.1f} °C (avg: {df['temperature'].mean():.1f})")
    print(f"   NDVI: {df['NDVI'].min():.3f} - {df['NDVI'].max():.3f} (avg: {df['NDVI'].mean():.3f})")
    
    # Prepare features and labels
    X = df[['rainfall', 'temperature', 'NDVI']]
    y = df['drought_severity']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"\n🔄 Split data: {len(X_train)} training, {len(X_test)} testing samples")
    
    # Train Random Forest model with optimized parameters
    print("\n🤖 Training Random Forest Classifier...")
    print("   Parameters:")
    print("   - Trees: 200")
    print("   - Max depth: 15")
    print("   - Min samples split: 5")
    print("   - Min samples leaf: 2")
    
    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate model
    train_accuracy = model.score(X_train, y_train)
    test_accuracy = model.score(X_test, y_test)
    
    print(f"\n✅ Training Complete!")
    print(f"   Training Accuracy: {train_accuracy*100:.2f}%")
    print(f"   Testing Accuracy: {test_accuracy*100:.2f}%")
    
    # Feature importance
    feature_importance = model.feature_importances_
    features = ['Rainfall', 'Temperature', 'NDVI']
    
    print("\n🎯 Feature Importance:")
    for feat, imp in zip(features, feature_importance):
        print(f"   {feat}: {imp*100:.1f}%")
    
    # Save model
    os.makedirs('backend', exist_ok=True)
    model_path = 'backend/drought_model.pkl'
    joblib.dump(model, model_path)
    
    print(f"\n💾 Model saved to: {model_path}")
    print(f"   Model size: {os.path.getsize(model_path) / 1024:.1f} KB")
    
    # Test predictions
    print("\n🧪 Testing Sample Predictions:")
    
    test_cases = [
        {"rainfall": 600, "temperature": 25, "NDVI": 0.7, "expected": "Low"},
        {"rainfall": 300, "temperature": 32, "NDVI": 0.4, "expected": "Moderate"},
        {"rainfall": 150, "temperature": 38, "NDVI": 0.2, "expected": "High"}
    ]
    
    severity_map = {0: "Low", 1: "Moderate", 2: "High"}
    
    for i, case in enumerate(test_cases, 1):
        test_input = pd.DataFrame([[case['rainfall'], case['temperature'], case['NDVI']]], 
                                  columns=['rainfall', 'temperature', 'NDVI'])
        prediction = model.predict(test_input)[0]
        confidence = max(model.predict_proba(test_input)[0]) * 100
        
        print(f"\n   Test {i}:")
        print(f"   Input: Rainfall={case['rainfall']}mm, Temp={case['temperature']}°C, NDVI={case['NDVI']}")
        print(f"   Predicted: {severity_map[prediction]} severity (confidence: {confidence:.1f}%)")
        print(f"   Expected: {case['expected']} severity")
    
    print("\n" + "="*70)
    print("✅ MODEL TRAINING COMPLETE!")
    print("="*70)
    print("\nYou can now start the backend server:")
    print("  python backend/app.py")
    print("\n")
    
    return model

if __name__ == "__main__":
    train_advanced_model()



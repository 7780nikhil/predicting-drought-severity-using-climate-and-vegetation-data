#!/usr/bin/env python
"""
Quick test script to verify backend setup
"""

print("="*60)
print("Testing Backend Setup")
print("="*60)

# Test 1: Import modules
print("\n1. Testing imports...")
try:
    from flask import Flask
    print("   ✓ Flask imported")
except ImportError as e:
    print(f"   ✗ Flask import failed: {e}")
    exit(1)

try:
    from flask_cors import CORS
    print("   ✓ Flask-CORS imported")
except ImportError as e:
    print(f"   ✗ Flask-CORS import failed: {e}")
    exit(1)

try:
    from pymongo import MongoClient
    print("   ✓ PyMongo imported")
except ImportError as e:
    print(f"   ✗ PyMongo import failed: {e}")
    exit(1)

try:
    from dotenv import load_dotenv
    print("   ✓ python-dotenv imported")
except ImportError as e:
    print(f"   ✗ python-dotenv import failed: {e}")
    exit(1)

# Test 2: Load environment
print("\n2. Testing environment...")
try:
    load_dotenv()
    import os
    mongodb_uri = os.getenv('MONGODB_URI')
    if mongodb_uri:
        print(f"   ✓ MongoDB URI loaded")
    else:
        print("   ✗ MongoDB URI not found in .env")
except Exception as e:
    print(f"   ✗ Environment loading failed: {e}")

# Test 3: MongoDB connection
print("\n3. Testing MongoDB connection...")
try:
    from backend.models import test_connection
    if test_connection():
        print("   ✓ MongoDB connection successful")
    else:
        print("   ✗ MongoDB connection failed")
except Exception as e:
    print(f"   ✗ MongoDB test failed: {e}")

# Test 4: Import backend modules
print("\n4. Testing backend modules...")
try:
    from backend.models import User, Prediction
    print("   ✓ Models imported")
except Exception as e:
    print(f"   ✗ Models import failed: {e}")

try:
    from backend.routes import auth_bp, drought_bp, history_bp
    print("   ✓ Routes imported")
except Exception as e:
    print(f"   ✗ Routes import failed: {e}")

try:
    from backend.app import create_app
    print("   ✓ App factory imported")
except Exception as e:
    print(f"   ✗ App factory import failed: {e}")

# Test 5: Create Flask app
print("\n5. Testing Flask app creation...")
try:
    from backend.app import create_app
    app = create_app()
    print("   ✓ Flask app created successfully")
except Exception as e:
    print(f"   ✗ Flask app creation failed: {e}")

print("\n" + "="*60)
print("Backend test complete!")
print("="*60)
print("\nIf all tests passed, you can start the backend with:")
print("  python backend/app.py")
print("\n")

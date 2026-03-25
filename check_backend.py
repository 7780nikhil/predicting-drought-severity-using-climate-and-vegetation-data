#!/usr/bin/env python
"""Quick backend check"""
import sys

print("Checking backend setup...")
print("="*60)

# Check imports
print("\n1. Checking imports...")
try:
    import flask
    print("   ✓ Flask installed")
except:
    print("   ✗ Flask NOT installed")
    print("   Run: pip install Flask")
    sys.exit(1)

try:
    import flask_cors
    print("   ✓ Flask-CORS installed")
except:
    print("   ✗ Flask-CORS NOT installed")
    print("   Run: pip install Flask-CORS")
    sys.exit(1)

try:
    import pymongo
    print("   ✓ PyMongo installed")
except:
    print("   ✗ PyMongo NOT installed")
    print("   Run: pip install pymongo")
    sys.exit(1)

try:
    import dotenv
    print("   ✓ python-dotenv installed")
except:
    print("   ✗ python-dotenv NOT installed")
    print("   Run: pip install python-dotenv")
    sys.exit(1)

# Check .env file
print("\n2. Checking .env file...")
import os
if os.path.exists('.env'):
    print("   ✓ .env file exists")
    from dotenv import load_dotenv
    load_dotenv()
    mongodb_uri = os.getenv('MONGODB_URI')
    if mongodb_uri:
        print("   ✓ MongoDB URI found")
    else:
        print("   ✗ MongoDB URI not in .env")
else:
    print("   ✗ .env file NOT found")
    print("   Create .env file in root directory")

# Check MongoDB connection
print("\n3. Testing MongoDB connection...")
try:
    from pymongo import MongoClient
    from dotenv import load_dotenv
    load_dotenv()
    
    mongodb_uri = os.getenv('MONGODB_URI', 'mongodb+srv://climate:Jyothika2406@cluster0.5gzrr5p.mongodb.net/?appName=Cluster0')
    
    client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("   ✓ MongoDB connection successful!")
    client.close()
except Exception as e:
    print(f"   ✗ MongoDB connection failed: {e}")
    print("\n   Possible issues:")
    print("   - No internet connection")
    print("   - Firewall blocking MongoDB")
    print("   - Wrong connection string")

# Check model file
print("\n4. Checking ML model...")
if os.path.exists('backend/drought_model.pkl'):
    print("   ✓ Model file exists")
else:
    print("   ✗ Model file NOT found")
    print("   Run: python train_model.py")

print("\n" + "="*60)
print("Check complete!")
print("\nIf all checks passed, start backend with:")
print("  python backend/app.py")
print("="*60)

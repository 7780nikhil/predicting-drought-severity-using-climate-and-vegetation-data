#!/usr/bin/env python
"""Test MongoDB connection and operations"""

print("="*70)
print("Testing MongoDB Connection and Operations")
print("="*70)

# Test 1: Import modules
print("\n1. Testing imports...")
try:
    from pymongo import MongoClient
    from dotenv import load_dotenv
    import os
    print("   ✓ Imports successful")
except Exception as e:
    print(f"   ✗ Import failed: {e}")
    exit(1)

# Test 2: Load environment
print("\n2. Loading environment...")
load_dotenv()
mongodb_uri = os.getenv('MONGODB_URI', 'mongodb+srv://climate:Jyothika2406@cluster0.5gzrr5p.mongodb.net/?appName=Cluster0')
database_name = os.getenv('DATABASE_NAME', 'drought_predictor')
print(f"   ✓ Database: {database_name}")

# Test 3: Connect to MongoDB
print("\n3. Connecting to MongoDB...")
try:
    client = MongoClient(mongodb_uri, serverSelectionTimeoutMS=5000)
    client.admin.command('ping')
    print("   ✓ MongoDB connection successful")
except Exception as e:
    print(f"   ✗ MongoDB connection failed: {e}")
    exit(1)

# Test 4: Access database and collections
print("\n4. Accessing database and collections...")
try:
    db = client[database_name]
    users_collection = db['users']
    predictions_collection = db['predictions']
    print("   ✓ Collections accessed")
except Exception as e:
    print(f"   ✗ Collection access failed: {e}")
    exit(1)

# Test 5: Check existing data
print("\n5. Checking existing data...")
try:
    user_count = users_collection.count_documents({})
    prediction_count = predictions_collection.count_documents({})
    print(f"   ✓ Users in database: {user_count}")
    print(f"   ✓ Predictions in database: {prediction_count}")
except Exception as e:
    print(f"   ✗ Count failed: {e}")

# Test 6: List users
print("\n6. Listing users...")
try:
    users = list(users_collection.find({}, {'password': 0}).limit(5))
    if users:
        for user in users:
            print(f"   - {user['username']} (ID: {user['_id']})")
    else:
        print("   No users found")
except Exception as e:
    print(f"   ✗ User listing failed: {e}")

# Test 7: List predictions
print("\n7. Listing recent predictions...")
try:
    predictions = list(predictions_collection.find().sort('created_at', -1).limit(5))
    if predictions:
        for pred in predictions:
            print(f"   - User: {pred.get('username', 'N/A')}, Severity: {pred['result']['severity']}, Time: {pred.get('created_at', 'N/A')}")
    else:
        print("   No predictions found")
except Exception as e:
    print(f"   ✗ Prediction listing failed: {e}")

# Test 8: Test insert (if no predictions exist)
print("\n8. Testing insert operation...")
try:
    # Find a test user or use first user
    test_user = users_collection.find_one()
    if test_user:
        test_prediction = {
            'user_id': str(test_user['_id']),
            'username': test_user['username'],
            'input': {
                'rainfall': 300,
                'temperature': 32,
                'NDVI': 0.4
            },
            'result': {
                'prediction': 1,
                'severity': 'Moderate',
                'confidence': 0.85,
                'recommendation': 'Test recommendation'
            },
            'created_at': datetime.utcnow()
        }
        
        from datetime import datetime
        result = predictions_collection.insert_one(test_prediction)
        print(f"   ✓ Test prediction inserted with ID: {result.inserted_id}")
        
        # Delete the test prediction
        predictions_collection.delete_one({'_id': result.inserted_id})
        print("   ✓ Test prediction deleted")
    else:
        print("   ⚠ No users found to test with")
except Exception as e:
    print(f"   ✗ Insert test failed: {e}")
    import traceback
    traceback.print_exc()

# Test 9: Check indexes
print("\n9. Checking indexes...")
try:
    user_indexes = list(users_collection.list_indexes())
    pred_indexes = list(predictions_collection.list_indexes())
    print(f"   ✓ User collection indexes: {len(user_indexes)}")
    print(f"   ✓ Prediction collection indexes: {len(pred_indexes)}")
except Exception as e:
    print(f"   ✗ Index check failed: {e}")

print("\n" + "="*70)
print("MongoDB Test Complete!")
print("="*70)

# Summary
print("\nSummary:")
print(f"  - MongoDB: Connected ✓")
print(f"  - Database: {database_name}")
print(f"  - Users: {user_count}")
print(f"  - Predictions: {prediction_count}")
print("\nIf predictions count is 0 but you made predictions,")
print("there's an issue with saving predictions.")
print("\n")

client.close()

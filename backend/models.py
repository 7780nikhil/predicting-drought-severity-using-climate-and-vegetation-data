from pymongo import MongoClient
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGODB_URI = os.getenv('MONGODB_URI', 'mongodb+srv://climate:Jyothika2406@cluster0.5gzrr5p.mongodb.net/?appName=Cluster0')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'drought_predictor')

# In-memory storage as fallback when MongoDB is not available
in_memory_users = {}
in_memory_predictions = []
in_memory_alerts = []

# Initialize MongoDB client
try:
    import ssl
    client = MongoClient(
        MONGODB_URI, 
        serverSelectionTimeoutMS=5000,
        tls=True,
        tlsAllowInvalidCertificates=True
    )
    db = client[DATABASE_NAME]
    
    # Test connection
    client.admin.command('ping')
    
    # Collections
    users_collection = db['users']
    predictions_collection = db['predictions']
    alerts_collection = db['alerts']
    
    # Create indexes for better performance (with error handling)
    try:
        users_collection.create_index('username', unique=True)
    except Exception as e:
        print(f"Note: Username index may already exist: {e}")
    
    try:
        predictions_collection.create_index('user_id')
        predictions_collection.create_index('created_at')
        predictions_collection.create_index('region')
    except Exception as e:
        print(f"Note: Prediction indexes may already exist: {e}")
    
    try:
        alerts_collection.create_index('username')
        alerts_collection.create_index('read')
        alerts_collection.create_index('created_at')
    except Exception as e:
        print(f"Note: Alert indexes may already exist: {e}")
    
    print("✓ MongoDB connected successfully!")
    USE_MONGODB = True
        
except Exception as e:
    print(f"⚠ MongoDB connection failed: {e}")
    print("⚠ Using in-memory storage (data will not persist)")
    client = None
    db = None
    users_collection = None
    predictions_collection = None
    alerts_collection = None
    USE_MONGODB = False

class User:
    """User model for MongoDB with in-memory fallback"""
    
    @staticmethod
    def create(username, password):
        """Create a new user"""
        if USE_MONGODB:
            user_data = {
                'username': username,
                'password': generate_password_hash(password),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            result = users_collection.insert_one(user_data)
            return result.inserted_id
        else:
            # In-memory fallback
            user_id = f"user_{len(in_memory_users) + 1}"
            in_memory_users[username] = {
                '_id': user_id,
                'username': username,
                'password': generate_password_hash(password),
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow()
            }
            return user_id
    
    @staticmethod
    def find_by_username(username):
        """Find user by username"""
        if USE_MONGODB:
            return users_collection.find_one({'username': username})
        else:
            # In-memory fallback
            return in_memory_users.get(username)
    
    @staticmethod
    def verify_password(stored_password, provided_password):
        """Verify password"""
        return check_password_hash(stored_password, provided_password)
    
    @staticmethod
    def get_all():
        """Get all users (for admin purposes)"""
        if USE_MONGODB:
            return list(users_collection.find({}, {'password': 0}))
        else:
            # In-memory fallback
            return [{'username': u['username'], '_id': u['_id']} for u in in_memory_users.values()]

class Prediction:
    """Prediction model for MongoDB with in-memory fallback"""
    
    @staticmethod
    def create(user_id, username, input_data, prediction_result, region=None):
        """Save a prediction"""
        prediction_data = {
            'user_id': user_id,
            'username': username,
            'region': region or 'Not specified',
            'input': {
                'rainfall': input_data['rainfall'],
                'temperature': input_data['temperature'],
                'NDVI': input_data['NDVI']
            },
            'result': {
                'prediction': prediction_result['prediction'],
                'severity': prediction_result['severity'],
                'severity_level': prediction_result.get('severity_level', 0),
                'confidence': prediction_result.get('confidence'),
                'recommendation': prediction_result.get('recommendation')
            },
            'created_at': datetime.utcnow()
        }
        
        if USE_MONGODB:
            result = predictions_collection.insert_one(prediction_data)
            return result.inserted_id
        else:
            # In-memory fallback
            pred_id = f"pred_{len(in_memory_predictions) + 1}"
            prediction_data['_id'] = pred_id
            in_memory_predictions.append(prediction_data)
            return pred_id
    
    @staticmethod
    def find_by_user(username, limit=10):
        """Get predictions by username"""
        if USE_MONGODB:
            return list(predictions_collection.find(
                {'username': username}
            ).sort('created_at', -1).limit(limit))
        else:
            # In-memory fallback
            user_preds = [p for p in in_memory_predictions if p['username'] == username]
            user_preds.sort(key=lambda x: x['created_at'], reverse=True)
            return user_preds[:limit]
    
    @staticmethod
    def find_by_region(region, limit=50):
        """Get predictions by region"""
        if USE_MONGODB:
            return list(predictions_collection.find(
                {'region': region}
            ).sort('created_at', -1).limit(limit))
        else:
            # In-memory fallback
            region_preds = [p for p in in_memory_predictions if p['region'] == region]
            region_preds.sort(key=lambda x: x['created_at'], reverse=True)
            return region_preds[:limit]
    
    @staticmethod
    def get_all(limit=50):
        """Get all predictions"""
        if USE_MONGODB:
            return list(predictions_collection.find().sort('created_at', -1).limit(limit))
        else:
            # In-memory fallback
            sorted_preds = sorted(in_memory_predictions, key=lambda x: x['created_at'], reverse=True)
            return sorted_preds[:limit]
    
    @staticmethod
    def get_statistics(username=None, region=None):
        """Get prediction statistics"""
        if USE_MONGODB:
            match_stage = {}
            if username:
                match_stage['username'] = username
            if region:
                match_stage['region'] = region
            
            pipeline = [
                {'$match': match_stage},
                {'$group': {
                    '_id': '$result.severity',
                    'count': {'$sum': 1}
                }}
            ]
            
            results = list(predictions_collection.aggregate(pipeline))
            stats = {item['_id']: item['count'] for item in results}
        else:
            # In-memory fallback
            filtered_preds = in_memory_predictions
            if username:
                filtered_preds = [p for p in filtered_preds if p['username'] == username]
            if region:
                filtered_preds = [p for p in filtered_preds if p['region'] == region]
            
            stats = {}
            for pred in filtered_preds:
                severity = pred['result']['severity']
                stats[severity] = stats.get(severity, 0) + 1
        
        return {
            'total': sum(stats.values()),
            'no_drought': stats.get('No Drought', 0),
            'mild': stats.get('Mild', 0),
            'moderate': stats.get('Moderate', 0),
            'severe': stats.get('Severe', 0),
            'extreme': stats.get('Extreme', 0)
        }

class Alert:
    """Alert model for MongoDB with in-memory fallback"""
    
    @staticmethod
    def create(user_id, username, prediction_id, severity, message):
        """Create an alert"""
        alert_data = {
            'user_id': user_id,
            'username': username,
            'prediction_id': prediction_id,
            'severity': severity,
            'message': message,
            'read': False,
            'created_at': datetime.utcnow()
        }
        
        if USE_MONGODB:
            result = alerts_collection.insert_one(alert_data)
            return result.inserted_id
        else:
            # In-memory fallback
            alert_id = f"alert_{len(in_memory_alerts) + 1}"
            alert_data['_id'] = alert_id
            in_memory_alerts.append(alert_data)
            return alert_id
    
    @staticmethod
    def find_by_user(username, unread_only=False):
        """Get alerts for a user"""
        if USE_MONGODB:
            query = {'username': username}
            if unread_only:
                query['read'] = False
            return list(alerts_collection.find(query).sort('created_at', -1).limit(20))
        else:
            # In-memory fallback
            user_alerts = [a for a in in_memory_alerts if a['username'] == username]
            if unread_only:
                user_alerts = [a for a in user_alerts if not a['read']]
            user_alerts.sort(key=lambda x: x['created_at'], reverse=True)
            return user_alerts[:20]
    
    @staticmethod
    def mark_as_read(alert_id):
        """Mark alert as read"""
        if USE_MONGODB:
            from bson import ObjectId
            alerts_collection.update_one(
                {'_id': ObjectId(alert_id)},
                {'$set': {'read': True}}
            )
        else:
            # In-memory fallback
            for alert in in_memory_alerts:
                if alert['_id'] == alert_id:
                    alert['read'] = True
                    break
    
    @staticmethod
    def get_unread_count(username):
        """Get count of unread alerts"""
        if USE_MONGODB:
            return alerts_collection.count_documents({'username': username, 'read': False})
        else:
            # In-memory fallback
            return len([a for a in in_memory_alerts if a['username'] == username and not a['read']])

def test_connection():
    """Test MongoDB connection"""
    if USE_MONGODB:
        try:
            client.admin.command('ping')
            print("✓ MongoDB connection successful!")
            return True
        except Exception as e:
            print(f"✗ MongoDB connection failed: {e}")
            return False
    else:
        print("⚠ Using in-memory storage (MongoDB not available)")
        return False

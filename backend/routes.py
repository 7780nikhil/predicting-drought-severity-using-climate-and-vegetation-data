from flask import Blueprint, request, jsonify, send_file
import joblib
import pandas as pd
import os
from models import User, Prediction, Alert
from bson import ObjectId
from datetime import datetime, timedelta
import io
import csv

auth_bp = Blueprint('auth', __name__)
drought_bp = Blueprint('drought', __name__)
history_bp = Blueprint('history', __name__)
alerts_bp = Blueprint('alerts', __name__)
export_bp = Blueprint('export', __name__)

# Add CORS headers to all responses
@auth_bp.after_request
@drought_bp.after_request
@history_bp.after_request
@alerts_bp.after_request
@export_bp.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ============================================
# Authentication Routes
# ============================================

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user with username and hashed password.
    Stores data in MongoDB database.
    """
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        # Validation
        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400
        
        if len(username) < 3:
            return jsonify({"error": "Username must be at least 3 characters long"}), 400
        
        if len(password) < 6:
            return jsonify({"error": "Password must be at least 6 characters long"}), 400

        # Check if user exists
        if User.find_by_username(username):
            return jsonify({"error": "Username already exists"}), 400

        # Create user
        user_id = User.create(username, password)
        
        return jsonify({
            "message": "User registered successfully",
            "username": username
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({"error": f"Registration failed: {str(e)}"}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login user and validate credentials via MongoDB database.
    """
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')

        if not username or not password:
            return jsonify({"error": "Username and password are required"}), 400

        # Find user
        user = User.find_by_username(username)
        
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Verify password
        if not User.verify_password(user['password'], password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        return jsonify({
            "message": "Login successful",
            "user": username,
            "user_id": str(user['_id'])
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": f"Login failed: {str(e)}"}), 500

# ============================================
# Drought Prediction Routes
# ============================================

@drought_bp.route('/predict', methods=['POST'])
def predict():
    """
    Predict drought severity based on climate and vegetation data.
    Input JSON: { 
        "rainfall": float, 
        "temperature": float, 
        "NDVI": float, 
        "username": string,
        "region": string (optional)
    }
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Get username and region
        username = data.get('username', 'anonymous')
        region = data.get('region', 'Not specified')
        
        # Extract and validate inputs
        rainfall = data.get('rainfall')
        temperature = data.get('temperature')
        ndvi = data.get('NDVI')
        
        if rainfall is None or temperature is None or ndvi is None:
            return jsonify({"error": "Missing required fields: rainfall, temperature, NDVI"}), 400
        
        # Convert to float and validate ranges
        try:
            rainfall = float(rainfall)
            temperature = float(temperature)
            ndvi = float(ndvi)
        except ValueError:
            return jsonify({"error": "All inputs must be numeric values"}), 400
        
        # Validate ranges
        if rainfall < 0:
            return jsonify({"error": "Rainfall cannot be negative"}), 400
        if temperature < -50 or temperature > 60:
            return jsonify({"error": "Temperature must be between -50°C and 60°C"}), 400
        if ndvi < -1 or ndvi > 1:
            return jsonify({"error": "NDVI must be between -1 and 1"}), 400

        # Load the trained model
        model_path = os.path.join(os.path.dirname(__file__), 'drought_model.pkl')
        if not os.path.exists(model_path):
            return jsonify({
                "error": "Model file not found. Please train the model first by running: python train_model.py"
            }), 500

        model = joblib.load(model_path)
        
        # Prepare input for prediction
        input_data = pd.DataFrame([[rainfall, temperature, ndvi]], 
                                 columns=['rainfall', 'temperature', 'NDVI'])
        prediction = model.predict(input_data)[0]
        
        # Get prediction probability
        confidence = None
        if hasattr(model, 'predict_proba'):
            proba = model.predict_proba(input_data)[0]
            confidence = float(max(proba))

        # Enhanced severity mapping (5 levels)
        severity_map = {
            0: "No Drought",
            1: "Mild",
            2: "Moderate", 
            3: "Severe",
            4: "Extreme"
        }
        
        # Map old 3-level to new 5-level system
        if prediction == 0:
            severity_level = 0  # No Drought
        elif prediction == 1:
            # Split moderate into Mild and Moderate based on confidence
            severity_level = 1 if confidence and confidence > 0.7 else 2
        else:  # prediction == 2
            # Split high into Severe and Extreme based on confidence
            severity_level = 3 if confidence and confidence > 0.7 else 4
        
        severity = severity_map.get(severity_level, "Unknown")
        
        # Enhanced recommendations based on 5-level severity
        recommendations = {
            "No Drought": "Conditions are favorable. Continue regular monitoring of water resources and maintain standard agricultural practices.",
            "Mild": "Early signs of water stress detected. Begin water conservation measures and monitor soil moisture levels closely.",
            "Moderate": "Moderate drought conditions present. Implement water-saving irrigation techniques and consider drought-resistant crop varieties.",
            "Severe": "Severe drought conditions detected. Activate emergency water management protocols and restrict non-essential water use immediately.",
            "Extreme": "Extreme drought emergency! Critical water shortage. Implement all emergency measures, consider crop abandonment, and activate disaster response protocols."
        }
        
        # Color codes for visualization
        severity_colors = {
            "No Drought": "#28a745",  # Green
            "Mild": "#90EE90",        # Light Green
            "Moderate": "#ffc107",    # Yellow
            "Severe": "#ff6b6b",      # Orange-Red
            "Extreme": "#dc3545"      # Red
        }

        result = {
            "prediction": int(prediction),
            "severity": severity,
            "severity_level": severity_level,
            "confidence": confidence,
            "confidence_percentage": round(confidence * 100, 1) if confidence else None,
            "color": severity_colors.get(severity, "#6c757d"),
            "recommendation": recommendations.get(severity, ""),
            "region": region,
            "input": {
                "rainfall": rainfall,
                "temperature": temperature,
                "NDVI": ndvi
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Save prediction to history if user is logged in
        prediction_saved = False
        prediction_id = None
        if username and username != 'anonymous':
            try:
                user = User.find_by_username(username)
                if user:
                    print(f"Saving prediction for user: {username}, region: {region}")
                    prediction_id = Prediction.create(
                        user_id=str(user['_id']),
                        username=username,
                        input_data=result['input'],
                        prediction_result=result,
                        region=region
                    )
                    print(f"Prediction saved with ID: {prediction_id}")
                    prediction_saved = True
                    
                    # Create alert if severity is Severe or Extreme
                    if severity_level >= 3:
                        alert_message = f"High drought risk detected in {region}! Severity: {severity}. Immediate action recommended."
                        Alert.create(
                            user_id=str(user['_id']),
                            username=username,
                            prediction_id=str(prediction_id),
                            severity=severity,
                            message=alert_message
                        )
                        print(f"Alert created for {username}")
                        result['alert_created'] = True
                    
                else:
                    print(f"Warning: User {username} not found in database")
            except Exception as e:
                print(f"Error saving prediction history: {e}")
                import traceback
                traceback.print_exc()
        else:
            print(f"Skipping history save - username: {username}")
        
        result['saved_to_history'] = prediction_saved
        if prediction_id:
            result['prediction_id'] = str(prediction_id)

        return jsonify(result), 200

    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Prediction error: {str(e)}"}), 500

# ============================================
# History Routes
# ============================================

@history_bp.route('/user/<username>', methods=['GET'])
def get_user_history(username):
    """
    Get prediction history for a specific user.
    """
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Validate limit
        if limit < 1 or limit > 100:
            limit = 10
        
        predictions = Prediction.find_by_user(username, limit=limit)
        
        # Convert ObjectId to string for JSON serialization
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
            if 'user_id' in pred:
                pred['user_id'] = str(pred['user_id'])
            if 'created_at' in pred:
                pred['created_at'] = pred['created_at'].isoformat()
        
        return jsonify({
            "username": username,
            "count": len(predictions),
            "predictions": predictions
        }), 200
        
    except Exception as e:
        print(f"History error: {e}")
        return jsonify({"error": f"Failed to retrieve history: {str(e)}"}), 500

@history_bp.route('/statistics/<username>', methods=['GET'])
def get_user_statistics(username):
    """
    Get prediction statistics for a specific user.
    """
    try:
        stats = Prediction.get_statistics(username=username)
        
        return jsonify({
            "username": username,
            "statistics": stats
        }), 200
        
    except Exception as e:
        print(f"Statistics error: {e}")
        return jsonify({"error": f"Failed to retrieve statistics: {str(e)}"}), 500

@history_bp.route('/all', methods=['GET'])
def get_all_history():
    """
    Get all predictions (admin endpoint).
    """
    try:
        limit = request.args.get('limit', 50, type=int)
        
        # Validate limit
        if limit < 1 or limit > 100:
            limit = 50
        
        predictions = Prediction.get_all(limit=limit)
        
        # Convert ObjectId to string for JSON serialization
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
            if 'user_id' in pred:
                pred['user_id'] = str(pred['user_id'])
            if 'created_at' in pred:
                pred['created_at'] = pred['created_at'].isoformat()
        
        return jsonify({
            "count": len(predictions),
            "predictions": predictions
        }), 200
        
    except Exception as e:
        print(f"All history error: {e}")
        return jsonify({"error": f"Failed to retrieve history: {str(e)}"}), 500


# ============================================
# Alerts Routes
# ============================================

@alerts_bp.route('/user/<username>', methods=['GET'])
def get_user_alerts(username):
    """Get alerts for a user"""
    try:
        unread_only = request.args.get('unread_only', 'false').lower() == 'true'
        alerts = Alert.find_by_user(username, unread_only=unread_only)
        
        # Convert ObjectId to string
        for alert in alerts:
            alert['_id'] = str(alert['_id'])
            if 'user_id' in alert:
                alert['user_id'] = str(alert['user_id'])
            if 'created_at' in alert:
                alert['created_at'] = alert['created_at'].isoformat()
        
        return jsonify({
            "username": username,
            "count": len(alerts),
            "alerts": alerts
        }), 200
    except Exception as e:
        print(f"Alerts error: {e}")
        return jsonify({"error": str(e)}), 500

@alerts_bp.route('/<alert_id>/read', methods=['POST'])
def mark_alert_read(alert_id):
    """Mark an alert as read"""
    try:
        Alert.mark_as_read(alert_id)
        return jsonify({"message": "Alert marked as read"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@alerts_bp.route('/unread-count/<username>', methods=['GET'])
def get_unread_count(username):
    """Get count of unread alerts"""
    try:
        count = Alert.get_unread_count(username)
        return jsonify({"username": username, "unread_count": count}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============================================
# Export Routes
# ============================================

@export_bp.route('/csv/<username>', methods=['GET'])
def export_csv(username):
    """Export user predictions as CSV"""
    try:
        predictions = Prediction.find_by_user(username, limit=100)
        
        if not predictions:
            return jsonify({"error": "No predictions found"}), 404
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'Date', 'Region', 'Rainfall (mm)', 'Temperature (°C)', 
            'NDVI', 'Severity', 'Confidence (%)', 'Recommendation'
        ])
        
        # Write data
        for pred in predictions:
            writer.writerow([
                pred.get('created_at', '').split('T')[0] if isinstance(pred.get('created_at'), str) else str(pred.get('created_at', '')),
                pred.get('region', 'N/A'),
                pred['input']['rainfall'],
                pred['input']['temperature'],
                pred['input']['NDVI'],
                pred['result']['severity'],
                round(pred['result'].get('confidence', 0) * 100, 1) if pred['result'].get('confidence') else 'N/A',
                pred['result'].get('recommendation', '')[:100]
            ])
        
        # Prepare response
        output.seek(0)
        return send_file(
            io.BytesIO(output.getvalue().encode('utf-8')),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'drought_predictions_{username}_{datetime.now().strftime("%Y%m%d")}.csv'
        )
    except Exception as e:
        print(f"Export CSV error: {e}")
        return jsonify({"error": str(e)}), 500

@export_bp.route('/json/<username>', methods=['GET'])
def export_json(username):
    """Export user predictions as JSON"""
    try:
        predictions = Prediction.find_by_user(username, limit=100)
        
        if not predictions:
            return jsonify({"error": "No predictions found"}), 404
        
        # Convert ObjectId to string
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
            if 'user_id' in pred:
                pred['user_id'] = str(pred['user_id'])
            if 'created_at' in pred:
                pred['created_at'] = pred['created_at'].isoformat()
        
        return jsonify({
            "username": username,
            "export_date": datetime.now().isoformat(),
            "total_predictions": len(predictions),
            "predictions": predictions
        }), 200
    except Exception as e:
        print(f"Export JSON error: {e}")
        return jsonify({"error": str(e)}), 500

# ============================================
# Regional Analysis Routes
# ============================================

@drought_bp.route('/regions', methods=['GET'])
def get_regions():
    """Get list of available regions"""
    regions = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
        "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
        "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
        "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
        "Lakshadweep", "Puducherry"
    ]
    return jsonify({"regions": regions}), 200

@drought_bp.route('/region-stats/<region>', methods=['GET'])
def get_region_stats(region):
    """Get statistics for a specific region"""
    try:
        stats = Prediction.get_statistics(region=region)
        predictions = Prediction.find_by_region(region, limit=10)
        
        # Convert ObjectId to string
        for pred in predictions:
            pred['_id'] = str(pred['_id'])
            if 'created_at' in pred:
                pred['created_at'] = pred['created_at'].isoformat()
        
        return jsonify({
            "region": region,
            "statistics": stats,
            "recent_predictions": predictions
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

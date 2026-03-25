# Additional routes for alerts and export functionality
# Add these to the end of routes.py

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
                pred['result'].get('recommendation', '')[:100]  # Truncate long recommendations
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

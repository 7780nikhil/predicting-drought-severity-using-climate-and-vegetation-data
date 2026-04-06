from flask import Flask, jsonify
from flask_cors import CORS
from routes import auth_bp, drought_bp, history_bp, alerts_bp, export_bp
from models import test_connection
import os
from dotenv import load_dotenv

# Load environment variables from backend/.env explicitly
basedir = os.path.dirname(__file__)
load_dotenv(os.path.join(basedir, '.env'))

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'drought-predictor-secret-key-2024')
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'True') == 'True'
    
    # CORS Configuration - Allow all origins for development
    CORS(app, 
         resources={r"/*": {"origins": "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(drought_bp, url_prefix='/drought')
    app.register_blueprint(history_bp, url_prefix='/history')
    app.register_blueprint(alerts_bp, url_prefix='/alerts')
    app.register_blueprint(export_bp, url_prefix='/export')

    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        db_status = test_connection()
        return jsonify({
            "status": "healthy" if db_status else "unhealthy",
            "message": "Drought Severity Predictor API is running",
            "database": "connected" if db_status else "disconnected",
            "version": "1.0.0"
        }), 200 if db_status else 503

    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            "message": "Welcome to Drought Severity Predictor API",
            "version": "1.0.0",
            "endpoints": {
                "health": "/health",
                "auth": {
                    "register": "POST /auth/register",
                    "login": "POST /auth/login"
                },
                "drought": {
                    "predict": "POST /drought/predict"
                },
                "history": {
                    "user_history": "GET /history/user/<username>",
                    "statistics": "GET /history/statistics/<username>"
                }
            }
        }), 200

    # Test database connection on startup
    with app.app_context():
        print("\n" + "="*60)
        print("🌍 Drought Severity Predictor Backend")
        print("="*60)
        if test_connection():
            print("✓ MongoDB database connected successfully!")
        else:
            print("✗ Warning: MongoDB connection failed!")
        print("="*60 + "\n")

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.getenv('FLASK_PORT', 5000))
    print(f"Server running at: http://localhost:{port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"API endpoints: http://localhost:{port}/")
    print(f"CORS enabled for all origins")
    print("="*60 + "\n")
    app.run(debug=True, port=port, host='0.0.0.0')

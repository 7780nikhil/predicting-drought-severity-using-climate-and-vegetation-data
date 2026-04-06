# 🌍 Drought Severity Prediction System

A full-stack machine learning application for predicting drought severity based on climate and vegetation data. Built with Flask (Python) backend and React frontend.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.3.3-green.svg)
![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)
![ML](https://img.shields.io/badge/ML-Random%20Forest-orange.svg)
![Accuracy](https://img.shields.io/badge/Accuracy-94.5%25-success.svg)

## ✨ Features

### 🤖 Machine Learning
- **Real Random Forest Classifier** with 94.5% accuracy
- Trained on 2000 realistic drought samples
- Confidence scores for every prediction
- Feature importance: Rainfall (52.5%), Temperature (28%), NDVI (19.5%)

### 🗺️ Multi-Region Support
- 37 Indian states and union territories
- Region-specific predictions and statistics
- Regional drought tracking and analysis

### 📊 5-Level Severity System
1. **No Drought** 🟢 - Favorable conditions
2. **Mild** 🟢 - Early warning signs
3. **Moderate** 🟡 - Water conservation needed
4. **Severe** 🟠 - Emergency protocols required
5. **Extreme** 🔴 - Critical water shortage

### 🔔 Smart Features
- **Automatic Alerts** - Notifications for severe drought conditions
- **Confidence Scores** - ML model probability percentages
- **Data Export** - Download predictions as CSV or JSON
- **History Tracking** - View all past predictions with statistics
- **Visual Analytics** - Interactive charts and color-coded displays

### 🎨 Modern UI
- Clean, responsive dashboard
- Color-coded severity levels
- Real-time data visualization
- Intuitive navigation
- Professional design

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- Node.js 14 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clonehttps://github.com/7780nikhil/predicting-drought-severity-using-climate-and-vegetation-data.git

2. **Set up Backend**
```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Train the ML model
python train_model.py

# Start backend server
python backend/app.py
```

3. **Set up Frontend**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

4. **Access the Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📖 Usage

### Making a Prediction

1. **Register/Login** to your account
2. **Select a region** from the dropdown (e.g., Maharashtra)
3. **Enter climate data**:
   - Rainfall (mm): Annual rainfall amount
   - Temperature (°C): Average temperature
   - NDVI: Normalized Difference Vegetation Index (0-1)
4. **Click "Predict Drought Severity"**
5. **View results**:
   - Severity level with color coding
   - Confidence percentage
   - Detailed recommendations
   - Automatic alert (if severe)

### Example Predictions

**Severe Drought:**
```
Region: Maharashtra
Rainfall: 150 mm
Temperature: 38°C
NDVI: 0.2
Result: Severe (87.6% confidence)
```

**No Drought:**
```
Region: Kerala
Rainfall: 600 mm
Temperature: 25°C
NDVI: 0.7
Result: No Drought (98.6% confidence)
```

## 🏗️ Architecture

### Backend (Flask + Python)
- **Framework**: Flask 2.3.3
- **ML Model**: Random Forest Classifier (scikit-learn)
- **Database**: MongoDB Atlas (with in-memory fallback)
- **API**: RESTful endpoints with CORS support

### Frontend (React)
- **Framework**: React 18
- **Routing**: React Router
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern design

### Machine Learning
- **Algorithm**: Random Forest (200 trees, max depth 15)
- **Features**: Rainfall, Temperature, NDVI
- **Training Data**: 2000 synthetic samples based on real patterns
- **Accuracy**: 94.5% on test set

## 📁 Project Structure

```
├── backend/
│   ├── app.py                 # Flask application
│   ├── models.py              # Database models
│   ├── routes.py              # API endpoints
│   ├── drought_model.pkl      # Trained ML model
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── DashboardEnhanced.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── train_model.py             # Model training script
├── .env.example               # Environment variables template
├── .gitignore
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Predictions
- `POST /drought/predict` - Make drought prediction
- `GET /drought/regions` - List all regions
- `GET /drought/region-stats/<region>` - Regional statistics

### History
- `GET /history/user/<username>` - User prediction history
- `GET /history/statistics/<username>` - User statistics

### Alerts
- `GET /alerts/user/<username>` - User alerts
- `POST /alerts/<alert_id>/read` - Mark alert as read
- `GET /alerts/unread-count/<username>` - Unread alert count

### Export
- `GET /export/csv/<username>` - Export as CSV
- `GET /export/json/<username>` - Export as JSON

## 🛠️ Configuration

### Environment Variables

Create a `.env` file in the root directory (see `.env.example`):

```env
# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
DATABASE_NAME=drought_predictor

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

# Secret Key
SECRET_KEY=your-secret-key

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### MongoDB Setup

The application uses MongoDB for data persistence. If MongoDB is not available, it automatically falls back to in-memory storage.

**For production**, set up MongoDB Atlas:
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## 🧪 Testing

### Test the ML Model
```bash
python train_model.py
```

### Test Backend API
```bash
# Health check
curl http://localhost:5000/health

# Test prediction
curl -X POST http://localhost:5000/drought/predict \
  -H "Content-Type: application/json" \
  -d '{"rainfall":150,"temperature":38,"NDVI":0.2,"username":"test","region":"Maharashtra"}'
```

## 📊 Model Performance

- **Training Accuracy**: 99.81%
- **Testing Accuracy**: 94.50%
- **Features**: 3 (Rainfall, Temperature, NDVI)
- **Classes**: 3 (No Drought, Moderate, Severe)
- **Algorithm**: Random Forest with 200 estimators

### Feature Importance
- Rainfall: 52.5%
- Temperature: 28.0%
- NDVI: 19.5%

## 🎯 Use Cases

- **Agriculture**: Farmers can predict drought conditions for crop planning
- **Water Management**: Authorities can plan water resource allocation
- **Disaster Preparedness**: Early warning system for drought emergencies
- **Research**: Climate scientists can analyze drought patterns
- **Policy Making**: Government agencies can make informed decisions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.


## 🙏 Acknowledgments

- Climate data patterns based on real-world drought indicators
- UI/UX inspired by modern web applications
- Machine learning implementation using scikit-learn
- MongoDB Atlas for cloud database hosting

## 📧 Contact

For questions or support, please open an issue on GitHub.

## 🔮 Future Enhancements

- [ ] Time-series forecasting for future drought predictions
- [ ] Integration with real-time weather APIs
- [ ] Mobile application (React Native)
- [ ] Advanced visualization with maps
- [ ] Multi-language support
- [ ] PDF report generation
- [ ] Email notifications for alerts
- [ ] Admin dashboard for system monitoring

---


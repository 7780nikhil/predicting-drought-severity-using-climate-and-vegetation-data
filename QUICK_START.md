# ⚡ Quick Start Guide

Get the Drought Severity Predictor running in 5 minutes!

## 🎯 Prerequisites Check

```bash
# Check Python (need 3.8+)
python --version

# Check Node.js (need 16+)
node --version

# Check npm
npm --version
```

## 🚀 One-Command Setup (Windows)

```bash
setup.bat
```

## 🚀 Manual Setup (3 Steps)

### Step 1: Install Backend
```bash
pip install -r backend/requirements.txt
```

### Step 2: Train Model
```bash
python train_model.py
```

### Step 3: Install Frontend
```bash
cd frontend
npm install
cd ..
```

## ▶️ Start Application

### Option A: Automated (Windows)
```bash
start.bat
```

### Option B: Manual (2 Terminals)

**Terminal 1 - Backend:**
```bash
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## 🌐 Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## 🧪 Quick Test

1. Open http://localhost:3000
2. Click "Register here"
3. Create account: `testuser` / `password123`
4. Login with credentials
5. Enter test data:
   - Rainfall: `300`
   - Temperature: `32`
   - NDVI: `0.4`
6. Click "Predict Drought Severity"
7. ✅ Should see "Moderate" severity

## 📊 Test Data Samples

**Low Drought:**
```
Rainfall: 600
Temperature: 25
NDVI: 0.7
```

**Moderate Drought:**
```
Rainfall: 300
Temperature: 32
NDVI: 0.4
```

**High Drought:**
```
Rainfall: 150
Temperature: 38
NDVI: 0.2
```

## 🔧 Common Issues

### Backend won't start
```bash
pip install -r backend/requirements.txt
```

### Frontend won't start
```bash
cd frontend
rm -rf node_modules
npm install
```

### Model not found
```bash
python train_model.py
```

### Port already in use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📚 Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Follow [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing

## 🎨 Project Structure

```
├── backend/          # Flask API
├── frontend/         # React UI
├── train_model.py    # ML model training
├── setup.bat         # Setup script
└── start.bat         # Start script
```

## 💡 Tips

- Use `Ctrl+C` to stop servers
- Backend must run before frontend
- Model must be trained before predictions
- Check console for errors

---

Happy Coding! 🚀

# 🚀 Complete Setup Guide - MongoDB Version

This guide will help you set up and run the Drought Severity Predictor with MongoDB Atlas.

## 📋 Prerequisites

- ✅ Python 3.8+ installed
- ✅ Node.js 16+ and npm installed
- ✅ Internet connection (for MongoDB Atlas)
- ✅ Git (optional, for cloning)

## 🎯 Step-by-Step Setup

### Step 1: Install Backend Dependencies

Open terminal/command prompt and navigate to your project folder:

```bash
cd path/to/drought-severity-predictor
```

Install Python packages:

```bash
pip install -r backend/requirements.txt
```

**Expected output:**
```
Successfully installed Flask-2.3.3 Flask-Cors-4.0.0 pymongo-4.6.0 ...
```

### Step 2: Verify Environment Configuration

Check that `.env` file exists in the root directory with your MongoDB connection:

```bash
# View .env file (Windows)
type .env

# View .env file (Mac/Linux)
cat .env
```

**Should contain:**
```
MONGODB_URI=mongodb+srv://NIKHIL1112:Nikhil1234@climate.2jo0xag.mongodb.net/?appName=climate
FLASK_PORT=5000
```

### Step 3: Train the Machine Learning Model

```bash
python train_model.py
```

**Expected output:**
```
Generating synthetic training data...
Training Random Forest model...
Model accuracy: 85.50%
Model saved to backend/drought_model.pkl
Model training complete!
```

### Step 4: Test Backend Connection

Start the backend server:

```bash
python backend/app.py
```

**Expected output:**
```
============================================================
🌍 Drought Severity Predictor Backend
============================================================
✓ MongoDB database connected successfully!
============================================================

Server running at: http://localhost:5000
Health check: http://localhost:5000/health
```

**Test the connection:**

Open a new terminal and run:

```bash
curl http://localhost:5000/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "message": "Drought Severity Predictor API is running",
  "version": "1.0.0"
}
```

✅ If you see this, your backend is working!

### Step 5: Install Frontend Dependencies

Open a **new terminal** (keep backend running) and navigate to frontend:

```bash
cd frontend
npm install
```

**Expected output:**
```
added 1500 packages in 45s
```

### Step 6: Start Frontend

```bash
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Your browser should automatically open to `http://localhost:3000`

## ✅ Verification Checklist

### Backend Verification

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Health check returns "healthy"
- [ ] No error messages in terminal

### Frontend Verification

- [ ] Frontend compiles successfully
- [ ] Browser opens to login page
- [ ] No console errors (press F12)
- [ ] Page loads correctly

## 🧪 Test the Application

### Test 1: User Registration

1. Click "Register here" on login page
2. Enter:
   - Username: `testuser`
   - Password: `password123`
   - Confirm: `password123`
3. Click "Create Account"
4. ✅ Should see success message and redirect to login

### Test 2: User Login

1. Enter:
   - Username: `testuser`
   - Password: `password123`
2. Click "Login"
3. ✅ Should redirect to dashboard with welcome message

### Test 3: Drought Prediction

1. Enter test data:
   - Rainfall: `300`
   - Temperature: `32`
   - NDVI: `0.4`
2. Click "🔍 Predict Drought Severity"
3. ✅ Should see:
   - Severity: "Moderate" (yellow)
   - Confidence score
   - Recommendation
   - Updated chart

### Test 4: Prediction History

1. Make 2-3 predictions with different values
2. Click "📜 History" button
3. ✅ Should see:
   - List of your predictions
   - Statistics (total, low, moderate, high)
   - Pie chart distribution

### Test 5: Reset and Logout

1. Click "📊 Predictions" to go back
2. Click "🔄 Reset" button
3. ✅ Form should clear
4. Click "Sign Out"
5. ✅ Should redirect to login page

## 🎯 Sample Test Data

Try these different scenarios:

**Low Drought (Green):**
```
Rainfall: 600
Temperature: 25
NDVI: 0.7
```

**Moderate Drought (Yellow):**
```
Rainfall: 300
Temperature: 32
NDVI: 0.4
```

**High Drought (Red):**
```
Rainfall: 150
Temperature: 38
NDVI: 0.2
```

## 🔍 Verify MongoDB Data

### Option 1: Using MongoDB Atlas Web Interface

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Login with your credentials
3. Click "Browse Collections"
4. Select `drought_predictor` database
5. View collections:
   - `users` - Should see your registered user
   - `predictions` - Should see your predictions

### Option 2: Using API Endpoints

**View your history:**
```bash
curl http://localhost:5000/history/user/testuser
```

**View your statistics:**
```bash
curl http://localhost:5000/history/statistics/testuser
```

## 🐛 Common Issues and Solutions

### Issue 1: "ModuleNotFoundError: No module named 'pymongo'"

**Solution:**
```bash
pip install pymongo python-dotenv
```

### Issue 2: "MongoDB connection failed"

**Possible causes:**
- No internet connection
- Firewall blocking MongoDB Atlas
- Wrong connection string

**Solution:**
1. Check internet connection
2. Verify `.env` file has correct MongoDB URI
3. Try accessing MongoDB Atlas website

### Issue 3: "Model file not found"

**Solution:**
```bash
python train_model.py
```

### Issue 4: "Port 5000 already in use"

**Solution (Windows):**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

**Solution (Mac/Linux):**
```bash
lsof -ti:5000 | xargs kill -9
```

### Issue 5: Frontend won't start

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Issue 6: CORS Error

**Symptoms:**
- Console error: "blocked by CORS policy"
- API requests fail

**Solution:**
1. Ensure backend is running on port 5000
2. Check `.env` has `FRONTEND_URL=http://localhost:3000`
3. Restart backend server

## 📊 What's Stored in MongoDB

### After Registration:
```json
{
  "_id": "...",
  "username": "testuser",
  "password": "hashed_password",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### After Each Prediction:
```json
{
  "_id": "...",
  "username": "testuser",
  "input": {
    "rainfall": 300,
    "temperature": 32,
    "NDVI": 0.4
  },
  "result": {
    "severity": "Moderate",
    "confidence": 0.85,
    "recommendation": "..."
  },
  "created_at": "2024-01-01T12:00:00Z"
}
```

## 🎓 Next Steps

### Explore Features

1. **Make Multiple Predictions**
   - Try different input values
   - See how severity changes
   - Build up your history

2. **View Statistics**
   - Click "📜 History"
   - See your prediction distribution
   - Track your usage patterns

3. **Test Edge Cases**
   - Very low rainfall (< 100)
   - Very high temperature (> 40)
   - Different NDVI values

### Learn More

- Read [MONGODB_SETUP.md](MONGODB_SETUP.md) for MongoDB details
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API reference
- See [TESTING_GUIDE.md](TESTING_GUIDE.md) for comprehensive testing

### Customize

- Modify `frontend/src/App.css` for styling
- Update `backend/routes.py` for new features
- Enhance `train_model.py` for better predictions

## 🚀 Quick Commands Reference

### Start Everything (2 Terminals)

**Terminal 1 - Backend:**
```bash
python backend/app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Stop Everything

- Press `Ctrl+C` in both terminals

### Restart Backend

```bash
# Stop: Ctrl+C
# Start:
python backend/app.py
```

### Restart Frontend

```bash
# Stop: Ctrl+C
# Start:
npm start
```

## ✅ Success Indicators

You know everything is working when:

1. ✅ Backend shows "MongoDB database connected successfully!"
2. ✅ Frontend opens in browser without errors
3. ✅ You can register a new user
4. ✅ You can login successfully
5. ✅ Predictions return results
6. ✅ History shows your predictions
7. ✅ Statistics display correctly
8. ✅ Charts render properly

## 🎉 Congratulations!

If all tests pass, your Drought Severity Predictor is fully operational with:

- ✅ MongoDB Atlas cloud database
- ✅ User authentication
- ✅ Drought prediction with ML
- ✅ Prediction history tracking
- ✅ Statistics and visualization
- ✅ Modern responsive UI

## 📞 Need Help?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [MONGODB_SETUP.md](MONGODB_SETUP.md)
3. Read error messages carefully
4. Check both terminal outputs
5. Verify all prerequisites are installed

---

**You're all set! Start predicting drought severity! 🌍💧**

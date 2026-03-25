# 🧪 Testing Guide - Drought Severity Predictor

This guide will help you test all functionalities of the application.

## 🚀 Quick Start Testing

### Step 1: Setup (First Time Only)

Run the setup script:
```bash
setup.bat
```

Or manually:
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Train the model
python train_model.py

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Start the Application

Option A - Use the start script:
```bash
start.bat
```

Option B - Manual start (requires 2 terminals):

Terminal 1 (Backend):
```bash
python backend/app.py
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

## ✅ Test Checklist

### 1. User Registration Testing

**Test Case 1.1: Successful Registration**
- Navigate to `http://localhost:3000`
- Click "Register here"
- Enter username: `testuser1`
- Enter password: `password123`
- Confirm password: `password123`
- Click "Create Account"
- ✓ Expected: Success message and redirect to login

**Test Case 1.2: Password Mismatch**
- Try to register with different passwords
- ✓ Expected: Error message "Passwords do not match!"

**Test Case 1.3: Short Password**
- Try password less than 6 characters
- ✓ Expected: Error message about minimum length

**Test Case 1.4: Duplicate Username**
- Try to register with existing username
- ✓ Expected: Error message "User already exists"

### 2. User Login Testing

**Test Case 2.1: Successful Login**
- Enter valid username and password
- Click "Login"
- ✓ Expected: Redirect to dashboard with welcome message

**Test Case 2.2: Invalid Credentials**
- Enter wrong username or password
- ✓ Expected: Error message "Invalid credentials"

**Test Case 2.3: Empty Fields**
- Try to submit without filling fields
- ✓ Expected: Browser validation prevents submission

### 3. Drought Prediction Testing

**Test Case 3.1: Low Drought Severity**
- Login to dashboard
- Enter:
  - Rainfall: 600
  - Temperature: 25
  - NDVI: 0.7
- Click "Predict Drought Severity"
- ✓ Expected: 
  - Severity: "Low" (green)
  - Recommendation about favorable conditions
  - Confidence score displayed

**Test Case 3.2: Moderate Drought Severity**
- Enter:
  - Rainfall: 300
  - Temperature: 32
  - NDVI: 0.4
- Click "Predict Drought Severity"
- ✓ Expected:
  - Severity: "Moderate" (yellow)
  - Recommendation about water conservation

**Test Case 3.3: High Drought Severity**
- Enter:
  - Rainfall: 150
  - Temperature: 38
  - NDVI: 0.2
- Click "Predict Drought Severity"
- ✓ Expected:
  - Severity: "High" (red)
  - Recommendation about emergency protocols

**Test Case 3.4: Invalid Input - Negative Rainfall**
- Enter:
  - Rainfall: -50
  - Temperature: 30
  - NDVI: 0.5
- Click "Predict Drought Severity"
- ✓ Expected: Error message "Rainfall cannot be negative"

**Test Case 3.5: Invalid Input - Temperature Out of Range**
- Enter:
  - Rainfall: 300
  - Temperature: 100
  - NDVI: 0.5
- Click "Predict Drought Severity"
- ✓ Expected: Error message about temperature range

**Test Case 3.6: Invalid Input - NDVI Out of Range**
- Enter:
  - Rainfall: 300
  - Temperature: 30
  - NDVI: 1.5
- Click "Predict Drought Severity"
- ✓ Expected: Error message about NDVI range

### 4. Data Visualization Testing

**Test Case 4.1: Chart Updates**
- Enter any valid values
- ✓ Expected: Bar chart updates with three bars showing input values
- ✓ Expected: NDVI value scaled by 100 in chart

**Test Case 4.2: Chart Colors**
- ✓ Expected: 
  - Rainfall bar: Blue
  - Temperature bar: Red
  - NDVI bar: Green

### 5. UI/UX Testing

**Test Case 5.1: Reset Functionality**
- Enter prediction data
- Click "Reset" button
- ✓ Expected: All fields cleared, prediction result removed

**Test Case 5.2: Loading States**
- Click "Predict Drought Severity"
- ✓ Expected: Button shows "🔄 Analyzing..." during request

**Test Case 5.3: Logout**
- Click "Sign Out" button
- ✓ Expected: Redirect to login page

**Test Case 5.4: Protected Routes**
- Logout
- Try to access `http://localhost:3000/dashboard` directly
- ✓ Expected: Redirect to login page

### 6. Backend API Testing

You can test the API directly using curl or Postman:

**Test Case 6.1: Register API**
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"apitest\",\"password\":\"test123\"}"
```
✓ Expected: `{"message": "User registered successfully"}`

**Test Case 6.2: Login API**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"apitest\",\"password\":\"test123\"}"
```
✓ Expected: `{"message": "Login successful", "user": "apitest"}`

**Test Case 6.3: Prediction API**
```bash
curl -X POST http://localhost:5000/drought/predict \
  -H "Content-Type: application/json" \
  -d "{\"rainfall\":300,\"temperature\":32,\"NDVI\":0.4}"
```
✓ Expected: JSON with prediction, severity, confidence, and recommendation

### 7. Model Testing

**Test Case 7.1: Model File Exists**
```bash
dir backend\drought_model.pkl
```
✓ Expected: File exists

**Test Case 7.2: Model Training**
```bash
python train_model.py
```
✓ Expected: 
- "Generating synthetic training data..."
- "Training Random Forest model..."
- "Model accuracy: XX.XX%"
- "Model saved to backend/drought_model.pkl"

## 🐛 Common Issues and Solutions

### Issue 1: Backend won't start
**Error**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: 
```bash
pip install -r backend/requirements.txt
```

### Issue 2: Frontend won't start
**Error**: `Cannot find module 'react'`
**Solution**:
```bash
cd frontend
npm install
```

### Issue 3: Model not found
**Error**: "Model file not found. Please train the model first"
**Solution**:
```bash
python train_model.py
```

### Issue 4: Database connection error
**Error**: Database connection failed
**Solution**: 
- Check internet connection
- Verify database URL in `backend/app.py`

### Issue 5: CORS error
**Error**: "Access to XMLHttpRequest has been blocked by CORS policy"
**Solution**: 
- Ensure backend is running on port 5000
- Check CORS configuration in `backend/app.py`

### Issue 6: Port already in use
**Error**: "Address already in use"
**Solution**:
```bash
# Find and kill the process using the port
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📊 Performance Testing

### Response Time Testing
- Prediction requests should complete in < 1 second
- Login/Register should complete in < 2 seconds
- Page loads should complete in < 3 seconds

### Load Testing (Optional)
Use tools like Apache JMeter or Locust to test:
- 10 concurrent users making predictions
- 50 registration requests
- 100 login requests

## 🔒 Security Testing

### Test Case: SQL Injection
- Try entering SQL commands in username/password fields
- ✓ Expected: Inputs are sanitized, no SQL injection possible

### Test Case: XSS Prevention
- Try entering `<script>alert('XSS')</script>` in input fields
- ✓ Expected: Script tags are escaped or rejected

### Test Case: Password Security
- Check that passwords are hashed in database
- ✓ Expected: Passwords stored as hashes, not plain text

## 📝 Test Report Template

```
Test Date: ___________
Tester: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Registration | ☐ Pass ☐ Fail | |
| Login | ☐ Pass ☐ Fail | |
| Low Drought Prediction | ☐ Pass ☐ Fail | |
| Moderate Drought Prediction | ☐ Pass ☐ Fail | |
| High Drought Prediction | ☐ Pass ☐ Fail | |
| Input Validation | ☐ Pass ☐ Fail | |
| Data Visualization | ☐ Pass ☐ Fail | |
| Logout | ☐ Pass ☐ Fail | |

Overall Result: ☐ All Tests Passed ☐ Some Tests Failed

Comments:
_________________________________
_________________________________
```

## 🎯 Acceptance Criteria

The application is ready for deployment when:
- ✅ All user authentication flows work correctly
- ✅ Predictions are accurate and consistent
- ✅ All input validations are working
- ✅ UI is responsive and user-friendly
- ✅ No console errors in browser
- ✅ No server errors in backend logs
- ✅ Database operations are successful
- ✅ Charts display correctly

---

Happy Testing! 🚀

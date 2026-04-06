import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import DashboardEnhanced from './components/DashboardEnhanced';
import './App.css';

function App() {

    const [user, setUser] = useState(null);

    return (
        <Router>
            <div className="App">
                <header style={{ textAlign: 'center', backgroundColor: '#f4f4f4', padding: '1rem' }}>
                    <h1>Drought Severity Predictor</h1>
                </header>
                <main>
                    <Routes>
                        <Route 
                            path="/login" 
                            element={!user ? <Login setAuth={setUser} /> : <Navigate to="/dashboard" />} 
                        />
                        <Route 
                            path="/register" 
                            element={<Register />} 
                        />
                        <Route 
                            path="/dashboard" 
                            element={user ? <DashboardEnhanced user={user} setAuth={setUser} /> : <Navigate to="/login" />} 
                        />
                        <Route path="*" element={<Navigate to="/login" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

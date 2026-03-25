import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { username, password });
            setAuth(res.data.user);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>🔐 User Login</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                Sign in to access the drought prediction dashboard
            </p>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        placeholder="Enter your username"
                        autoComplete="username"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Enter your password"
                        autoComplete="current-password"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? '🔄 Signing in...' : '✓ Login'}
                </button>
            </form>
            {error && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '12px', 
                    backgroundColor: '#f8d7da', 
                    color: '#721c24',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                }}>
                    ⚠️ {error}
                </div>
            )}
            <p style={{ marginTop: '1.5rem', color: '#7f8c8d' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;

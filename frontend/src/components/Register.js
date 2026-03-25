import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        
        // Validate password match
        if (password !== confirmPassword) {
            setError('Passwords do not match!');
            return;
        }
        
        // Validate password strength
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/auth/register', { username, password });
            setMessage('✓ Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>📝 User Registration</h2>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
                Create an account to start predicting drought severity
            </p>
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label>Username</label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                        placeholder="Choose a username"
                        autoComplete="username"
                        minLength="3"
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="Choose a password"
                        autoComplete="new-password"
                        minLength="6"
                    />
                    <small>Minimum 6 characters</small>
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        required 
                        placeholder="Confirm your password"
                        autoComplete="new-password"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? '🔄 Creating Account...' : '✓ Create Account'}
                </button>
            </form>
            {message && (
                <div style={{ 
                    marginTop: '1rem', 
                    padding: '12px', 
                    backgroundColor: '#d4edda', 
                    color: '#155724',
                    borderRadius: '6px',
                    fontSize: '0.9rem'
                }}>
                    {message}
                </div>
            )}
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
                Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
};

export default Register;

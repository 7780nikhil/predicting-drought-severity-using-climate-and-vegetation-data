import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const navigate = useNavigate();

    const validateInputs = () => {
        let isValid = true;
        setUsernameError('');
        setPasswordError('');
        setConfirmPasswordError('');

        if (!username.trim()) {
            setUsernameError('Username is required');
            isValid = false;
        } else if (username.trim().length < 3) {
            setUsernameError('Username must be at least 3 characters');
            isValid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            isValid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password');
            isValid = false;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match');
            isValid = false;
        }

        return isValid;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/auth/register`, { 
                username: username.trim(), 
                password 
            });
            setMessage('✓ Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const getPasswordStrength = () => {
        if (!password) return { label: '', color: '', width: '0%' };
        
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const strengthLevels = ['Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60'];
        
        return {
            label: strengthLevels[strength] || 'Weak',
            color: colors[strength] || '#e74c3c',
            width: `${(strength + 1) * 20}%`
        };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-header">
                    <div className="logo-icon">💧</div>
                    <h1>Drought Predictor</h1>
                    <p className="subtitle">Join Our Climate Community</p>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-title-section">
                        <h2>Create Account</h2>
                        <p>Register to access advanced drought prediction tools</p>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">✕</span>
                            <span className="alert-text">{error}</span>
                        </div>
                    )}

                    {message && (
                        <div className="alert alert-success">
                            <span className="alert-icon">✓</span>
                            <span className="alert-text">{message}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="login-form">
                        <div className="form-group-enhanced">
                            <label htmlFor="username" className="form-label">
                                <span className="label-icon">👤</span>
                                <span>Username</span>
                            </label>
                            <input 
                                id="username"
                                type="text" 
                                value={username} 
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setUsernameError('');
                                }}
                                onBlur={() => {
                                    if (username.trim().length > 0 && username.trim().length < 3) {
                                        setUsernameError('Username must be at least 3 characters');
                                    }
                                }}
                                placeholder="Choose a username"
                                autoComplete="username"
                                className={`form-input ${usernameError ? 'input-error' : ''}`}
                            />
                            {usernameError && <div className="error-text">{usernameError}</div>}
                        </div>

                        <div className="form-group-enhanced">
                            <label htmlFor="password" className="form-label">
                                <span className="label-icon">🔒</span>
                                <span>Password</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input 
                                    id="password"
                                    type={showPassword ? 'text' : 'password'} 
                                    value={password} 
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordError('');
                                    }}
                                    onBlur={() => {
                                        if (password.length > 0 && password.length < 6) {
                                            setPasswordError('Password must be at least 6 characters');
                                        }
                                    }}
                                    placeholder="Choose a password"
                                    autoComplete="new-password"
                                    className={`form-input password-input ${passwordError ? 'input-error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {passwordError && <div className="error-text">{passwordError}</div>}
                            
                            {password && (
                                <div className="password-strength-container">
                                    <div className="strength-label">
                                        <span>Password strength:</span>
                                        <span style={{ color: passwordStrength.color, fontWeight: 600 }}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="strength-bar">
                                        <div 
                                            className="strength-fill" 
                                            style={{ 
                                                width: passwordStrength.width,
                                                backgroundColor: passwordStrength.color
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-group-enhanced">
                            <label htmlFor="confirmPassword" className="form-label">
                                <span className="label-icon">✓</span>
                                <span>Confirm Password</span>
                            </label>
                            <div className="password-input-wrapper">
                                <input 
                                    id="confirmPassword"
                                    type={showConfirmPassword ? 'text' : 'password'} 
                                    value={confirmPassword} 
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setConfirmPasswordError('');
                                    }}
                                    onBlur={() => {
                                        if (confirmPassword && password !== confirmPassword) {
                                            setConfirmPasswordError('Passwords do not match');
                                        }
                                    }}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    className={`form-input password-input ${confirmPasswordError ? 'input-error' : ''}`}
                                />
                                <button
                                    type="button"
                                    className="toggle-password-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                            {confirmPasswordError && <div className="error-text">{confirmPasswordError}</div>}
                            {password === confirmPassword && confirmPassword && (
                                <div style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#27ae60', display: 'flex', alignItems: 'center' }}>
                                    ✓ Passwords match
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="login-btn"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Creating Account...</span>
                                </>
                            ) : (
                                <>
                                    <span>Create Account</span>
                                    <span className="btn-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">Or sign up with</div>
                    <div className="social-buttons">
                        <button type="button" className="social-btn social-google" onClick={()=>alert('Google OAuth placeholder')}>
                            <span>G</span> Continue with Google
                        </button>
                        <button type="button" className="social-btn social-github" onClick={()=>alert('GitHub OAuth placeholder')}>
                            <span>🐙</span> Continue with GitHub
                        </button>
                    </div>

                    <div className="login-footer">
                        <p>
                            Already have an account? 
                            <Link to="/login" className="register-link">
                                Sign in here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="login-side-panel">
                <div className="side-content">
                    <h3>Get Started Now</h3>
                    <ul className="feature-list">
                        <li>
                            <span className="feature-icon">🚀</span>
                            <div>
                                <strong>Quick Setup</strong>
                                <p>Create your account in seconds</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">📊</span>
                            <div>
                                <strong>Instant Access</strong>
                                <p>Start predicting immediately</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">🔐</span>
                            <div>
                                <strong>Secure</strong>
                                <p>Your data is protected</p>
                            </div>
                        </li>
                        <li>
                            <span className="feature-icon">📈</span>
                            <div>
                                <strong>Track Progress</strong>
                                <p>Monitor predictions over time</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Register;

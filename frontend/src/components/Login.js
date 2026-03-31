import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [usernameError, setUsernameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const navigate = useNavigate();

    const validateInputs = () => {
        let isValid = true;
        setUsernameError('');
        setPasswordError('');

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

        return isValid;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateInputs()) {
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/auth/login', { 
                username: username.trim(), 
                password 
            });
            
            if (rememberMe) {
                localStorage.setItem('rememberedUsername', username);
            } else {
                localStorage.removeItem('rememberedUsername');
            }

            setSuccess('✓ Login successful! Redirecting...');
            setAuth(res.data.user);
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Invalid credentials. Please try again.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const remembered = localStorage.getItem('rememberedUsername');
        if (remembered) {
            setUsername(remembered);
            setRememberMe(true);
        }
    }, []);

    return (
        <div className="login-wrapper">
            <div className="login-container">
                <div className="login-header">
                    <div className="logo-icon">💧</div>
                    <h1>Drought Predictor</h1>
                    <p className="subtitle">Advanced Climate & Vegetation Analysis</p>
                </div>

                <div className="login-form-wrapper">
                    <div className="login-title-section">
                        <h2>Welcome Back</h2>
                        <p>Sign in to access the drought severity prediction dashboard</p>
                    </div>

                    <div className="premium-notice">
                        <span className="pill">🚀 Pro Tools</span>
                        <ul className="notice-list">
                            <li>Lightning-fast predictions</li>
                            <li>Predictive trends & alerts</li>
                            <li>Smart regional insights</li>
                        </ul>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">✕</span>
                            <span className="alert-text">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <span className="alert-icon">✓</span>
                            <span className="alert-text">{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="login-form">
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
                                placeholder="Enter your username"
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
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
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
                        </div>

                        <div className="form-options">
                            <label className="checkbox-label">
                                <input 
                                    type="checkbox" 
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="checkbox-input"
                                />
                                <span>Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="forgot-password-link">
                                Forgot password?
                            </Link>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="login-btn"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner"></span>
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <span className="btn-arrow">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">Or continue with</div>
                    <div className="social-buttons">
                        <button type="button" className="social-btn social-google" onClick={()=>alert('Google OAuth placeholder')}> 
                            <span>G</span> Sign in with Google
                        </button>
                        <button type="button" className="social-btn social-github" onClick={()=>alert('GitHub OAuth placeholder')}>
                            <span>🐙</span> Sign in with GitHub
                        </button>
                    </div>

                    <div className="login-footer">
                        <p>
                            Don't have an account? 
                            <Link to="/register" className="register-link">
                                Create one now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <div className="login-side-panel">
                <div className="side-content">
                    <h3>Why Choose Our Platform?</h3>
                    <ul className="feature-list">
                        <li className="feature-item">
                            <span className="feature-icon">📊</span>
                            <div>
                                <strong>Real-time Analysis</strong>
                                <p>Get instant drought predictions based on climate data</p>
                            </div>
                            <div className="feature-preview">
                                <div className="preview-title">Live prediction curve</div>
                                <div className="preview-img" style={{backgroundImage: 'linear-gradient(135deg, #3f77df, #7b55d5)'}}></div>
                                <small>Example: rainfall vs drought risk in 10s</small>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-icon">🌍</span>
                            <div>
                                <strong>Multi-Region Support</strong>
                                <p>Monitor multiple regions simultaneously</p>
                            </div>
                            <div className="feature-preview">
                                <div className="preview-title">Region comparison map</div>
                                <div className="preview-img" style={{backgroundImage: 'linear-gradient(135deg, #1da1f2, #37d9a8)'}}></div>
                                <small>Example: colored map overlays per zone</small>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-icon">🤖</span>
                            <div>
                                <strong>AI-Powered</strong>
                                <p>Advanced machine learning models for accuracy</p>
                            </div>
                            <div className="feature-preview">
                                <div className="preview-title">Model confidence chart</div>
                                <div className="preview-img" style={{backgroundImage: 'linear-gradient(135deg, #f5a623, #e84f5b)'}}></div>
                                <small>Example: model accuracy and trend scores</small>
                            </div>
                        </li>
                        <li className="feature-item">
                            <span className="feature-icon">📈</span>
                            <div>
                                <strong>Detailed Insights</strong>
                                <p>Comprehensive reports and trend analysis</p>
                            </div>
                            <div className="feature-preview">
                                <div className="preview-title">Insight dashboard snapshot</div>
                                <div className="preview-img" style={{backgroundImage: 'linear-gradient(135deg, #6a4ef4, #4db1f1)'}}></div>
                                <small>Example: charts, tables, and predictions</small>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Login;

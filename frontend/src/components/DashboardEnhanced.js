import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import API_BASE_URL from '../config';

const DashboardEnhanced = ({ user, setAuth }) => {
    const [rainfall, setRainfall] = useState('');
    const [temperature, setTemperature] = useState('');
    const [ndvi, setNdvi] = useState('');
    const [region, setRegion] = useState('');
    const [regions, setRegions] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [showAlerts, setShowAlerts] = useState(false);
    const [history, setHistory] = useState([]);
    const [historyUser, setHistoryUser] = useState(user || '');
    const [historyError, setHistoryError] = useState('');
    const [statistics, setStatistics] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            setHistoryUser(user);
        }
    }, [user]);

    useEffect(() => {
        // Fetch regions
        axios.get(`${API_BASE_URL}/drought/regions`)
            .then(res => setRegions(res.data.regions))
            .catch(err => console.error('Failed to fetch regions:', err));
        
        // Fetch unread alerts count
        fetchUnreadCount();
    }, []);

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
            fetchStatistics();
        }
    }, [showHistory, user, historyUser]);

    useEffect(() => {
        if (showAlerts) {
            fetchAlerts();
        }
    }, [showAlerts]);

    const fetchHistory = async () => {
        const targetUser = (historyUser || user || '').trim();
        if (!targetUser) {
            setHistory([]);
            setHistoryError('No user selected for history retrieval.');
            return;
        }

        try {
            setHistoryError('');
            const encodedUser = encodeURIComponent(targetUser);
            const res = await axios.get(`${API_BASE_URL}/history?username=${encodedUser}&limit=10`);
            setHistory(res.data.predictions || []);
            if (res.data.count === 0) {
                setHistoryError(`No history found for ${targetUser}. Make a prediction while logged in as this user.`);
            }
        } catch (err) {
            console.error('Failed to fetch history:', err);
            setHistoryError(err.response?.data?.error || 'Failed to load history.');
            setHistory([]);
        }
    };

    const fetchStatistics = async () => {
        const targetUser = (historyUser || user || '').trim();
        if (!targetUser) {
            setStatistics(null);
            return;
        }

        try {
            const res = await axios.get(`${API_BASE_URL}/history/statistics/${encodeURIComponent(targetUser)}`);
            setStatistics(res.data.statistics);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/alerts/user/${user}`);
            setAlerts(res.data.alerts || []);
        } catch (err) {
            console.error('Failed to fetch alerts:', err);
        }
    };

    const fetchUnreadCount = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/alerts/unread-count/${user}`);
            setUnreadCount(res.data.unread_count);
        } catch (err) {
            console.error('Failed to fetch unread count:', err);
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_BASE_URL}/drought/predict`, {
                rainfall: parseFloat(rainfall),
                temperature: parseFloat(temperature),
                NDVI: parseFloat(ndvi),
                username: user,
                region: region || 'Not specified'
            });
            setPrediction(res.data);
            setError('');
            
            // Refresh alerts if alert was created
            if (res.data.alert_created) {
                fetchUnreadCount();
            }
            if (res.data.saved_to_history) {
                if (showHistory) {
                    fetchHistory();
                    fetchStatistics();
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Prediction failed. Please check your inputs and try again.');
            setPrediction(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setAuth(null);
    };

    const handleReset = () => {
        setRainfall('');
        setTemperature('');
        setNdvi('');
        setRegion('');
        setPrediction(null);
        setError('');
    };

    const handleExportCSV = () => {
        const targetUser = (historyUser || user || '').trim();
        if (!targetUser) return;
        window.open(`${API_BASE_URL}/export/csv/${encodeURIComponent(targetUser)}`, '_blank');
    };

    const handleExportJSON = () => {
        const targetUser = (historyUser || user || '').trim();
        if (!targetUser) return;
        axios.get(`${API_BASE_URL}/export/json/${encodeURIComponent(targetUser)}`)
            .then(res => {
                const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `predictions_${targetUser}_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            })
            .catch(err => console.error('Export failed:', err));
    };

    const markAlertRead = async (alertId) => {
        try {
            await axios.post(`${API_BASE_URL}/alerts/${alertId}/read`);
            fetchAlerts();
            fetchUnreadCount();
        } catch (err) {
            console.error('Failed to mark alert as read:', err);
        }
    };

    const data = [
        { name: 'Rainfall (mm)', value: parseFloat(rainfall) || 0, fill: '#3498db' },
        { name: 'Temperature (°C)', value: parseFloat(temperature) || 0, fill: '#e74c3c' },
        { name: 'NDVI × 100', value: (parseFloat(ndvi) || 0) * 100, fill: '#2ecc71' }
    ];

    const getSeverityColor = (severity) => {
        const colors = {
            'No Drought': '#28a745',
            'Mild': '#90EE90',
            'Moderate': '#ffc107',
            'Severe': '#ff6b6b',
            'Extreme': '#dc3545',
            'Low': '#28a745',
            'High': '#dc3545'
        };
        return colors[severity] || '#6c757d';
    };

    const pieData = statistics ? [
        { name: 'No Drought', value: statistics.no_drought || 0, fill: '#28a745' },
        { name: 'Mild', value: statistics.mild || 0, fill: '#90EE90' },
        { name: 'Moderate', value: statistics.moderate || 0, fill: '#ffc107' },
        { name: 'Severe', value: statistics.severe || 0, fill: '#ff6b6b' },
        { name: 'Extreme', value: statistics.extreme || 0, fill: '#dc3545' }
    ].filter(item => item.value > 0) : [];

    return (
        <div className="dashboard-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>🌍 Drought Severity Dashboard</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Welcome, <strong>{user}</strong></span>
                    <button 
                        onClick={() => { setShowHistory(false); setShowAlerts(!showAlerts); }}
                        style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: '#e74c3c', position: 'relative' }}
                    >
                        🔔 Alerts
                        {unreadCount > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: '-5px',
                                right: '-5px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                borderRadius: '50%',
                                padding: '2px 6px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                            }}>
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => { setShowAlerts(false); setShowHistory(!showHistory); }}
                        style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: '#3498db' }}
                    >
                        {showHistory ? '📊 Predictions' : '📜 History'}
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ width: 'auto', padding: '0.5rem 1rem', backgroundColor: '#6c757d' }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            
            {showAlerts ? (
                <section>
                    <h3 style={{ marginBottom: '20px', color: '#34495e' }}>🔔 Alerts & Notifications</h3>
                    {alerts.length > 0 ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {alerts.map((alert) => (
                                <div key={alert._id} style={{
                                    backgroundColor: alert.read ? '#f8f9fa' : '#fff3cd',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    borderLeft: `5px solid ${getSeverityColor(alert.severity)}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h4 style={{ margin: '0 0 10px 0', color: getSeverityColor(alert.severity) }}>
                                            {alert.severity} Drought Alert
                                        </h4>
                                        <p style={{ margin: 0 }}>{alert.message}</p>
                                        <small style={{ color: '#7f8c8d' }}>
                                            {new Date(alert.created_at).toLocaleString()}
                                        </small>
                                    </div>
                                    {!alert.read && (
                                        <button 
                                            onClick={() => markAlertRead(alert._id)}
                                            style={{ padding: '0.5rem 1rem', backgroundColor: '#3498db' }}
                                        >
                                            Mark as Read
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>🔕</p>
                            <p>No alerts yet. You'll be notified of severe drought conditions.</p>
                        </div>
                    )}
                </section>
            ) : showHistory ? (
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '10px', marginBottom: '20px' }}>
                        <div style={{ flex: 1, minWidth: '220px' }}>
                            <h3 style={{ margin: '0 0 8px 0', color: '#34495e' }}>📜 Prediction History</h3>
                            <label style={{ display: 'block', color: '#7f8c8d', marginBottom: '6px' }}>Search history by username</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={historyUser}
                                    onChange={(e) => setHistoryUser(e.target.value)}
                                    placeholder="Enter username"
                                    style={{ width: '100%', padding: '0.65rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem' }}
                                />
                                <button onClick={fetchHistory} style={{ padding: '0.65rem 1rem', backgroundColor: '#5dade2' }}>
                                    🔍 Search
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={handleExportCSV} style={{ padding: '0.5rem 1rem', backgroundColor: '#27ae60' }}>
                                📥 Export CSV
                            </button>
                            <button onClick={handleExportJSON} style={{ padding: '0.5rem 1rem', backgroundColor: '#2980b9' }}>
                                📥 Export JSON
                            </button>
                        </div>
                    </div>
                    {historyError && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#fff3cd',
                            color: '#856404',
                            borderRadius: '8px',
                            border: '1px solid #ffeeba'
                        }}>
                            {historyError}
                        </div>
                    )}
                    
                    {statistics && statistics.total > 0 && (
                        <div style={{ marginBottom: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📊 Statistics</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#7f8c8d' }}>Total Predictions:</p>
                                        <p style={{ margin: '5px 0', fontSize: '1.5rem', fontWeight: 'bold', color: '#3498db' }}>{statistics.total}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '5px 0', color: '#28a745' }}>No Drought: {statistics.no_drought || 0}</p>
                                        <p style={{ margin: '5px 0', color: '#90EE90' }}>Mild: {statistics.mild || 0}</p>
                                        <p style={{ margin: '5px 0', color: '#ffc107' }}>Moderate: {statistics.moderate || 0}</p>
                                        <p style={{ margin: '5px 0', color: '#ff6b6b' }}>Severe: {statistics.severe || 0}</p>
                                        <p style={{ margin: '5px 0', color: '#dc3545' }}>Extreme: {statistics.extreme || 0}</p>
                                    </div>
                                </div>
                            </div>
                            <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                                <h4 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Distribution</h4>
                                <ResponsiveContainer width="100%" height={150}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={60}
                                            dataKey="value"
                                        />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                    
                    {history.length > 0 ? (
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {history.map((item, index) => (
                                <div key={item._id} style={{ 
                                    backgroundColor: '#f8f9fa', 
                                    padding: '20px', 
                                    borderRadius: '8px',
                                    borderLeft: `5px solid ${getSeverityColor(item.result.severity)}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <h4 style={{ margin: 0, color: '#2c3e50' }}>
                                            Prediction #{history.length - index}
                                            {item.region && item.region !== 'Not specified' && (
                                                <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#7f8c8d' }}>
                                                    📍 {item.region}
                                                </span>
                                            )}
                                        </h4>
                                        <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>Rainfall</p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{item.input.rainfall} mm</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>Temperature</p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{item.input.temperature} °C</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>NDVI</p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>{item.input.NDVI}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>Severity</p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold', color: getSeverityColor(item.result.severity) }}>
                                                {item.result.severity}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: '5px 0', color: '#7f8c8d', fontSize: '0.85rem' }}>Confidence</p>
                                            <p style={{ margin: '5px 0', fontWeight: 'bold' }}>
                                                {item.result.confidence ? `${(item.result.confidence * 100).toFixed(1)}%` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#7f8c8d' }}>
                            <p style={{ fontSize: '3rem', margin: '0 0 10px 0' }}>📭</p>
                            <p>No prediction history yet. Make your first prediction!</p>
                        </div>
                    )}
                </section>
            ) : (
                <>
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#34495e' }}>📊 Enter Environmental Data</h3>
                        <form className="prediction-form" onSubmit={handlePredict} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', padding: '1.5rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                            <div className="form-group">
                                <label>📍 Region</label>
                                <select 
                                    value={region} 
                                    onChange={(e) => setRegion(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem' }}
                                >
                                    <option value="">Select Region (Optional)</option>
                                    {regions.map(r => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                                <small style={{ color: '#7f8c8d' }}>Select your state/territory</small>
                            </div>
                            <div className="form-group">
                                <label>💧 Rainfall (mm)</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={rainfall} 
                                    onChange={(e) => setRainfall(e.target.value)} 
                                    required 
                                    placeholder="e.g. 150.5"
                                    min="0"
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem' }}
                                />
                                <small style={{ color: '#7f8c8d' }}>Annual rainfall</small>
                            </div>
                            <div className="form-group">
                                <label>🌡️ Temperature (°C)</label>
                                <input 
                                    type="number" 
                                    step="0.1" 
                                    value={temperature} 
                                    onChange={(e) => setTemperature(e.target.value)} 
                                    required 
                                    placeholder="e.g. 35.2"
                                    min="-50"
                                    max="60"
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem' }}
                                />
                                <small style={{ color: '#7f8c8d' }}>Average temperature</small>
                            </div>
                            <div className="form-group">
                                <label>🌱 NDVI Index</label>
                                <input 
                                    type="number" 
                                    step="0.01" 
                                    value={ndvi} 
                                    onChange={(e) => setNdvi(e.target.value)} 
                                    required 
                                    placeholder="e.g. 0.45"
                                    min="-1"
                                    max="1"
                                    style={{ width: '100%', padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '6px', fontSize: '1rem' }}
                                />
                                <small style={{ color: '#7f8c8d' }}>Vegetation index</small>
                            </div>
                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <button type="submit" disabled={loading} style={{ width: 'auto', minWidth: '200px' }}>
                                    {loading ? '🔄 Analyzing...' : '🔍 Predict Drought Severity'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={handleReset}
                                    style={{ width: 'auto', minWidth: '150px', backgroundColor: '#95a5a6' }}
                                >
                                    🔄 Reset
                                </button>
                            </div>
                        </form>

                        {prediction && (
                            <div className="result-card" style={{ 
                                borderLeft: `5px solid ${prediction.color || getSeverityColor(prediction.severity)}`,
                                backgroundColor: '#f8f9fa',
                                marginTop: '2rem',
                                padding: '2rem',
                                borderRadius: '10px'
                            }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Analysis Result</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 5px 0' }}>Severity Level</p>
                                        <p style={{ fontSize: '1.8rem', margin: 0, color: prediction.color || getSeverityColor(prediction.severity), fontWeight: 'bold' }}>
                                            {prediction.severity}
                                        </p>
                                    </div>
                                    {prediction.confidence_percentage && (
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 5px 0' }}>Confidence</p>
                                            <p style={{ fontSize: '1.8rem', margin: 0, color: '#3498db', fontWeight: 'bold' }}>
                                                {prediction.confidence_percentage}%
                                            </p>
                                        </div>
                                    )}
                                    {prediction.region && prediction.region !== 'Not specified' && (
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 5px 0' }}>Region</p>
                                            <p style={{ fontSize: '1.2rem', margin: 0, color: '#2c3e50', fontWeight: 'bold' }}>
                                                📍 {prediction.region}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {prediction.recommendation && (
                                    <div style={{ 
                                        padding: '15px', 
                                        backgroundColor: 'white', 
                                        borderRadius: '6px',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        <p style={{ margin: 0, color: '#495057', lineHeight: '1.6' }}>
                                            <strong>💡 Recommendation:</strong> {prediction.recommendation}
                                        </p>
                                    </div>
                                )}
                                {prediction.alert_created && (
                                    <div style={{ 
                                        marginTop: '15px',
                                        padding: '15px', 
                                        backgroundColor: '#fff3cd', 
                                        borderRadius: '6px',
                                        border: '1px solid #ffc107'
                                    }}>
                                        <p style={{ margin: 0, color: '#856404' }}>
                                            <strong>🔔 Alert Created:</strong> High severity detected! Check your alerts for details.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {error && (
                            <div style={{ 
                                marginTop: '1rem', 
                                padding: '15px', 
                                backgroundColor: '#f8d7da', 
                                color: '#721c24',
                                borderRadius: '6px',
                                border: '1px solid #f5c6cb'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}
                    </section>

                    <div style={{ marginTop: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#34495e' }}>📊 Environmental Data Visualization</h3>
                        <div style={{ height: '400px', backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#dee2e6" />
                                    <XAxis dataKey="name" stroke="#495057" />
                                    <YAxis stroke="#495057" />
                                    <Tooltip 
                                        contentStyle={{ 
                                            backgroundColor: 'white', 
                                            border: '1px solid #dee2e6',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="value" name="Input Value">
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p style={{ marginTop: '10px', color: '#7f8c8d', fontSize: '0.9rem' }}>
                            <small>* NDVI values are scaled by 100 for better visibility in the chart.</small>
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardEnhanced;

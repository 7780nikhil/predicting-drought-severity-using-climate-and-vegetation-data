import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const Dashboard = ({ user, setAuth }) => {
    const [rainfall, setRainfall] = useState('');
    const [temperature, setTemperature] = useState('');
    const [ndvi, setNdvi] = useState('');
    const [prediction, setPrediction] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState([]);
    const [statistics, setStatistics] = useState(null);

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
            fetchStatistics();
        }
    }, [showHistory]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/history/user/${user}?limit=10`);
            setHistory(res.data.predictions || []);
        } catch (err) {
            console.error('Failed to fetch history:', err);
        }
    };

    const fetchStatistics = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/history/statistics/${user}`);
            setStatistics(res.data.statistics);
        } catch (err) {
            console.error('Failed to fetch statistics:', err);
        }
    };

    const handlePredict = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/drought/predict', {
                rainfall: parseFloat(rainfall),
                temperature: parseFloat(temperature),
                NDVI: parseFloat(ndvi),
                username: user
            });
            setPrediction(res.data);
            setError('');
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
        setPrediction(null);
        setError('');
    };

    const data = [
        { name: 'Rainfall (mm)', value: parseFloat(rainfall) || 0, fill: '#3498db' },
        { name: 'Temperature (°C)', value: parseFloat(temperature) || 0, fill: '#e74c3c' },
        { name: 'NDVI × 100', value: (parseFloat(ndvi) || 0) * 100, fill: '#2ecc71' }
    ];

    const getSeverityColor = (severity) => {
        switch(severity) {
            case 'High': return '#dc3545';
            case 'Moderate': return '#ffc107';
            case 'Low': return '#28a745';
            default: return '#6c757d';
        }
    };

    const pieData = statistics ? [
        { name: 'Low', value: statistics.low, fill: '#28a745' },
        { name: 'Moderate', value: statistics.moderate, fill: '#ffc107' },
        { name: 'High', value: statistics.high, fill: '#dc3545' }
    ].filter(item => item.value > 0) : [];

    return (
        <div className="dashboard-container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#2c3e50' }}>🌍 Drought Severity Dashboard</h2>
                <div>
                    <span style={{ marginRight: '15px', color: '#666' }}>Welcome, <strong>{user}</strong></span>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        style={{ width: 'auto', padding: '0.5rem 1.2rem', display: 'inline-block', backgroundColor: '#3498db', marginRight: '10px' }}
                    >
                        {showHistory ? '📊 Predictions' : '📜 History'}
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{ width: 'auto', padding: '0.5rem 1.2rem', display: 'inline-block', backgroundColor: '#6c757d' }}
                    >
                        Sign Out
                    </button>
                </div>
            </header>
            
            {!showHistory ? (
                <>
                    <section style={{ marginBottom: '40px' }}>
                        <h3 style={{ marginBottom: '20px', color: '#34495e' }}>📊 Enter Environmental Data</h3>
                        <form className="prediction-form" onSubmit={handlePredict}>
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
                                />
                                <small style={{ color: '#7f8c8d' }}>Annual rainfall in millimeters</small>
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
                                />
                                <small style={{ color: '#7f8c8d' }}>Average temperature in Celsius</small>
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
                                />
                                <small style={{ color: '#7f8c8d' }}>Vegetation index (-1 to 1)</small>
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
                                borderLeft: `5px solid ${getSeverityColor(prediction.severity)}`,
                                backgroundColor: '#f8f9fa'
                            }}>
                                <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50' }}>📈 Analysis Result</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '15px' }}>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 5px 0' }}>Severity Level</p>
                                        <p style={{ fontSize: '1.8rem', margin: 0, color: getSeverityColor(prediction.severity), fontWeight: 'bold' }}>
                                            {prediction.severity}
                                        </p>
                                    </div>
                                    {prediction.confidence && (
                                        <div>
                                            <p style={{ fontSize: '0.9rem', color: '#7f8c8d', margin: '0 0 5px 0' }}>Model Confidence</p>
                                            <p style={{ fontSize: '1.8rem', margin: 0, color: '#3498db', fontWeight: 'bold' }}>
                                                {(prediction.confidence * 100).toFixed(1)}%
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
            ) : (
                <section>
                    <h3 style={{ marginBottom: '20px', color: '#34495e' }}>📜 Prediction History</h3>
                    
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
                                        <p style={{ margin: '5px 0', color: '#28a745' }}>Low: {statistics.low}</p>
                                        <p style={{ margin: '5px 0', color: '#ffc107' }}>Moderate: {statistics.moderate}</p>
                                        <p style={{ margin: '5px 0', color: '#dc3545' }}>High: {statistics.high}</p>
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
                                        </h4>
                                        <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                                            {new Date(item.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
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
            )}
        </div>
    );
};

export default Dashboard;

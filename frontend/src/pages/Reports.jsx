/* eslint-disable */
import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, Download, TrendingUp, AlertTriangle, ShieldCheck, DollarSign, Loader2 } from 'lucide-react';
import './Reports.css';

const Reports = () => {
    const [dateRange] = useState('All Time');
    const [trends, setTrends] = useState([]);
    const [savings, setSavings] = useState(0);
    const [totalClaims, setTotalClaims] = useState(0);
    const [riskRestaurants, setRiskRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const response = await api.get('/claims');
                const claims = response.data;
                setTotalClaims(claims.length);

                // 1. Calculate Trends (Fraud vs Legitimate per Month)
                const trendsMap = {};
                claims.forEach(claim => {
                    const date = new Date(claim.createdAt);
                    const month = date.toLocaleString('default', { month: 'short' });
                    if (!trendsMap[month]) trendsMap[month] = { name: month, legitimate: 0, fraud: 0 };

                    if (claim.riskScore > 75 || claim.status === 'HIGH_RISK' || claim.status === 'REJECTED') {
                        trendsMap[month].fraud += 1;
                    } else {
                        trendsMap[month].legitimate += 1;
                    }
                });
                setTrends(Object.values(trendsMap));

                // 2. Calculate Total Savings (Amount of Rejected/High Risk Claims)
                const totalSavings = claims
                    .filter(c => c.riskScore > 75 || c.status === 'HIGH_RISK' || c.status === 'REJECTED')
                    .reduce((sum, c) => sum + (c.amount || 0), 0);
                setSavings(totalSavings);

                // 3. Risk Restaurants
                const restaurantMap = {};
                claims.forEach(claim => {
                    if (claim.riskScore > 75 || claim.status === 'HIGH_RISK' || claim.status === 'REJECTED') {
                        const name = claim.restaurantName || "Unknown";
                        if (!restaurantMap[name]) restaurantMap[name] = 0;
                        restaurantMap[name]++;
                    }
                });

                const sortedRestaurants = Object.entries(restaurantMap)
                    .map(([name, count]) => ({ name, count }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5); // Top 5

                setRiskRestaurants(sortedRestaurants);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load report data:", err);
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    // Placeholder for savings projection (Distributed over 4 weeks based on total)
    const savingsData = [
        { name: 'Week 1', savings: savings * 0.2 },
        { name: 'Week 2', savings: savings * 0.4 },
        { name: 'Week 3', savings: savings * 0.7 },
        { name: 'Week 4', savings: savings },
    ];

    return (
        <div className="reports-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Analytics & Reports</h1>
                    <p className="page-subtitle">Deep dive into fraud trends and financial impact.</p>
                </div>
                <div className="header-actions">
                    <div className="date-picker-mock">
                        <Calendar size={16} />
                        <span>{dateRange}</span>
                    </div>
                    <button className="btn-secondary">
                        <Download size={16} />
                        Export Report
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="loading-state-full">
                    <Loader2 className="spin" size={48} />
                    <p>Generating Analytics...</p>
                </div>
            ) : (
                <>
                    {/* Key Metrics Row */}
                    <div className="metrics-grid">
                        <div className="metric-card glass-panel">
                            <div className="metric-icon blue">
                                <ShieldCheck size={24} />
                            </div>
                            <div className="metric-info">
                                <span className="label">Analyzed Claims</span>
                                <span className="value">{totalClaims}</span>
                                <span className="trend positive">Live Data</span>
                            </div>
                        </div>
                        <div className="metric-card glass-panel">
                            <div className="metric-icon red">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="metric-info">
                                <span className="label">High Risk Spots</span>
                                <span className="value">{riskRestaurants.length}</span>
                                <span className="trend negative">Detected</span>
                            </div>
                        </div>
                        <div className="metric-card glass-panel">
                            <div className="metric-icon green">
                                <DollarSign size={24} />
                            </div>
                            <div className="metric-info">
                                <span className="label">Total Savings</span>
                                <span className="value">₹{savings.toLocaleString()}</span>
                                <span className="trend positive">Prevented Fraud</span>
                            </div>
                        </div>
                        <div className="metric-card glass-panel">
                            <div className="metric-icon purple">
                                <TrendingUp size={24} />
                            </div>
                            <div className="metric-info">
                                <span className="label">Data Points</span>
                                <span className="value">{trends.length}</span>
                                <span className="trend">Months Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="charts-grid-detailed">
                        {/* Fraud vs Legitimate Trend */}
                        <div className="chart-card-lg glass-panel">
                            <div className="card-header">
                                <h3>Fraud vs Legitimate Claims</h3>
                            </div>
                            <div className="chart-container-lg">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="legitimate" name="Legitimate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="fraud" name="Detected Fraud" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Cumulative Savings */}
                        <div className="chart-card-lg glass-panel">
                            <div className="card-header">
                                <h3>Cumulative Savings (₹)</h3>
                            </div>
                            <div className="chart-container-lg">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={savingsData}>
                                        <defs>
                                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" stroke="#94a3b8" />
                                        <YAxis stroke="#94a3b8" />
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
                                        />
                                        <Area type="monotone" dataKey="savings" stroke="#10b981" fillOpacity={1} fill="url(#colorSavings)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* High Risk Areas Table */}
                    <div className="risk-table-section glass-panel">
                        <div className="card-header">
                            <h3>Top High-Risk Restaurants</h3>
                        </div>
                        <div className="table-wrapper">
                            <table className="risk-table">
                                <thead>
                                    <tr>
                                        <th>Restaurant Name</th>
                                        <th>Location</th>
                                        <th>High Risk Claims</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riskRestaurants.length > 0 ? (
                                        riskRestaurants.map((restaurant, index) => (
                                            <tr key={index}>
                                                <td>{restaurant.name}</td>
                                                <td><span className="text-muted">Unknown</span></td>
                                                <td className="text-danger font-bold">{restaurant.count}</td>
                                                <td><span className="badge warning">Under Watch</span></td>
                                                <td>
                                                    <button className="btn-xs">View</button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                                <ShieldCheck size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                                                No high-risk restaurants detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Reports;

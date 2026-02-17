import { useState } from 'react';
import {
    BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Calendar, Download, TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';
import './Reports.css';

const dataOverTime = [
    { name: 'Jan', fraud: 4000, legitimate: 2400 },
    { name: 'Feb', fraud: 3000, legitimate: 1398 },
    { name: 'Mar', fraud: 2000, legitimate: 9800 },
    { name: 'Apr', fraud: 2780, legitimate: 3908 },
    { name: 'May', fraud: 1890, legitimate: 4800 },
    { name: 'Jun', fraud: 2390, legitimate: 3800 },
];

const savingsData = [
    { name: 'Week 1', savings: 1200 },
    { name: 'Week 2', savings: 2100 },
    { name: 'Week 3', savings: 800 },
    { name: 'Week 4', savings: 1600 },
    { name: 'Week 5', savings: 2400 },
    { name: 'Week 6', savings: 3200 },
];

const Reports = () => {
    const [dateRange, setDateRange] = useState('Last 30 Days');

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

            {/* Key Metrics Row */}
            <div className="metrics-grid">
                <div className="metric-card glass-panel">
                    <div className="metric-icon blue">
                        <ShieldCheck size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="label">Total Claims</span>
                        <span className="value">12,450</span>
                        <span className="trend positive">+12% vs last month</span>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon red">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="label">Fraud Rate</span>
                        <span className="value">4.2%</span>
                        <span className="trend negative">-0.8% decrease</span>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon green">
                        <DollarSign size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="label">Amount Saved</span>
                        <span className="value">₹145,000</span>
                        <span className="trend positive">Total prevented fraud</span>
                    </div>
                </div>
                <div className="metric-card glass-panel">
                    <div className="metric-icon purple">
                        <TrendingUp size={24} />
                    </div>
                    <div className="metric-info">
                        <span className="label">Auto-Resolution</span>
                        <span className="value">85%</span>
                        <span className="trend">Of all claims</span>
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
                            <BarChart data={dataOverTime}>
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
                                <th>Total Claims</th>
                                <th>Fraud Rate</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Burger King #402</td>
                                <td>Connaught Place</td>
                                <td>145</td>
                                <td className="text-danger">12.5%</td>
                                <td><span className="badge warning">Under Watch</span></td>
                            </tr>
                            <tr>
                                <td>Pizza Hut #88</td>
                                <td>Indiranagar</td>
                                <td>98</td>
                                <td className="text-danger">8.2%</td>
                                <td><span className="badge success">Normal</span></td>
                            </tr>
                            <tr>
                                <td>Starbucks #12</td>
                                <td>Cyber Hub</td>
                                <td>210</td>
                                <td className="text-success">1.5%</td>
                                <td><span className="badge success">Verified</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;

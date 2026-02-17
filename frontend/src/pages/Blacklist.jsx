import { useState, useCallback } from 'react';
import { Trash2, AlertTriangle, ShieldBan, Filter } from 'lucide-react';
import { blacklistUsers } from '../services/mockData';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import './Blacklist.css';

const renderActiveShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    return (
        <g>
            <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#fff" fontSize={24} fontWeight="bold">
                {value}
            </text>
            <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#94a3b8" fontSize={12}>
                {payload.name}
            </text>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 6}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={innerRadius - 4}
                outerRadius={outerRadius + 10}
                fill={fill}
                stroke="none"
                fillOpacity={0.2}
            />
        </g>
    );
};

const COLORS = ['#F87171', '#FBBF24', '#60A5FA', '#34D399', '#A78BFA'];

const Blacklist = () => {
    const [timeFilter, setTimeFilter] = useState('All');
    const [activeIndex, setActiveIndex] = useState(0);

    const onPieEnter = useCallback((_, index) => {
        setActiveIndex(index);
    }, []);

    // Filter Logic (Mock implementation assuming dates)
    const filteredUsers = blacklistUsers.filter(user => {
        if (timeFilter === 'All') return true;
        const userDate = new Date(user.lastActiveDate);
        const today = new Date('2024-10-25'); // Utilizing fixed date for mock consistency
        const diffDays = (today - userDate) / (1000 * 60 * 60 * 24);

        if (timeFilter === 'Daily') return diffDays <= 1;
        if (timeFilter === 'Weekly') return diffDays <= 7;
        if (timeFilter === 'Monthly') return diffDays <= 30;
        return true;
    });

    // Pie Chart Data Logic
    const reasonCounts = filteredUsers.reduce((acc, user) => {
        acc[user.reason] = (acc[user.reason] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(reasonCounts).map(reason => ({
        name: reason,
        value: reasonCounts[reason]
    }));

    return (
        <div className="blacklist-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Blacklist</h1>
                    <p className="page-subtitle">Manage users flagged for frequent abuse and policy violations.</p>
                </div>
                <div className="filter-actions">
                    <div className="filter-group">
                        <Filter size={16} />
                        <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                            <option value="All">All Time</option>
                            <option value="Daily">Last 24 Hours</option>
                            <option value="Weekly">Last 7 Days</option>
                            <option value="Monthly">Last 30 Days</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="blacklist-content-grid">
                <div className="chart-section glass-panel">
                    <h3>Fraud Reason Distribution</h3>
                    <div className="chart-container-wrapper">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <PieChart>
                                    <Pie
                                        activeIndex={activeIndex}
                                        activeShape={renderActiveShape}
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={90}
                                        dataKey="value"
                                        onMouseEnter={onPieEnter}
                                        paddingAngle={4}
                                        stroke="none"
                                    >
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="no-data-chart">No data for selected period</div>
                        )}

                        <div className="chart-legend">
                            {chartData.map((entry, index) => (
                                <div key={index} className="legend-item">
                                    <span className="dot" style={{ background: COLORS[index % COLORS.length] }}></span>
                                    <span className="name">{entry.name}</span>
                                    <span className="val">({entry.value})</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="list-section">
                    <div className="blacklist-grid-compact">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div key={user.id} className="blacklist-card-compact glass-panel">
                                    <div className="card-left">
                                        <div className="user-avatar-danger-sm">
                                            <ShieldBan size={18} />
                                        </div>
                                        <div className="user-info-sm">
                                            <h3>{user.name}</h3>
                                            <div className="meta-row-sm">
                                                <span className="user-id">{user.id}</span>
                                                <span className="activity-dot"></span>
                                                <span className="last-active">{user.lastActive}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-right">
                                        <div className="reason-pill">
                                            <AlertTriangle size={12} />
                                            {user.reason}
                                        </div>
                                        <div className="stats-mini">
                                            <span className="danger">{user.totalFraud} Claims</span>
                                        </div>
                                        <button className="icon-btn-danger">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No users found for this period.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blacklist;

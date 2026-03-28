/* eslint-disable */
import { useState, useEffect, useCallback } from 'react';
import { Trash2, AlertTriangle, ShieldBan, Filter, UserPlus } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from 'recharts';
import api from '../services/api';
import './Blacklist.css';

// ... (keep renderActiveShape and COLORS as is)
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
    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const [newUsername, setNewUsername] = useState('');
    const [newReason, setNewReason] = useState('Abuse');
    const fetchBlacklist = async () => {
        try {
            const response = await api.get('/blacklist');
            setBlacklist(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch blacklist:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        fetchBlacklist();
    }, []);


    const handleAddToBlacklist = async (e) => {
        e.preventDefault();
        try {
            await api.post('/blacklist', { username: newUsername, reason: newReason });
            setNewUsername('');
            fetchBlacklist();
        } catch (err) {
            alert("Failed to add user: " + (err.response?.data || err.message));
        }
    };

    const handleRemove = async (id) => {
        if (!window.confirm("Are you sure you want to remove this user from the blacklist?")) return;
        try {
            await api.delete(`/blacklist/${id}`);
            fetchBlacklist();
        } catch (err) {
            console.error("Failed to remove user:", err);
        }
    };

    const onPieEnter = useCallback((_, index) => {
        setActiveIndex(index);
    }, []);

    // Pie Chart Data Logic
    const reasonCounts = blacklist.reduce((acc, user) => {
        acc[user.reason] = (acc[user.reason] || 0) + 1;
        return acc;
    }, {});

    const chartData = Object.keys(reasonCounts).map(reason => ({
        name: reason,
        value: reasonCounts[reason]
    }));

    if (loading) return <div className="loading-state">Loading blacklist...</div>;

    return (
        <div className="blacklist-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">User Blacklist</h1>
                    <p className="page-subtitle">Manage users flagged for frequent abuse and policy violations.</p>
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
                            <div className="no-data-chart">No data available</div>
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
                    {/* Simple Add Form */}
                    <div className="add-blacklist-form glass-panel" style={{ marginBottom: '20px', padding: '15px' }}>
                        <h4>Add User to Blacklist</h4>
                        <form onSubmit={handleAddToBlacklist} style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <input
                                type="text"
                                placeholder="Username"
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                required
                                style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                            />
                            <select
                                value={newReason}
                                onChange={e => setNewReason(e.target.value)}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: 'white' }}
                            >
                                <option value="Abuse">Abuse</option>
                                <option value="Fraud">Fraud</option>
                                <option value="Policy Violation">Policy Violation</option>
                                <option value="Other">Other</option>
                            </select>
                            <button type="submit" className="btn-primary" style={{ padding: '8px 16px' }}>
                                <UserPlus size={16} /> Add
                            </button>
                        </form>
                    </div>

                    <div className="blacklist-grid-compact">
                        {blacklist.length > 0 ? (
                            blacklist.map(user => (
                                <div key={user.id} className="blacklist-card-compact glass-panel">
                                    <div className="card-left">
                                        <div className="user-avatar-danger-sm">
                                            <ShieldBan size={18} />
                                        </div>
                                        <div className="user-info-sm">
                                            <h3>{user.username}</h3>
                                            <div className="meta-row-sm">
                                                <span className="user-id">ID: {user.id}</span>
                                                <span className="activity-dot"></span>
                                                <span className="last-active">{new Date(user.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-right">
                                        <div className="reason-pill">
                                            <AlertTriangle size={12} />
                                            {user.reason}
                                        </div>
                                        <button className="icon-btn-danger" onClick={() => handleRemove(user.id)}>
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">No blacklisted users.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Blacklist;

/* eslint-disable */
import { useState, useEffect } from 'react';
import { Users, Shield, Plus, Trash2, Edit2, X, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import './UserManagement.css';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'ANALYST', 'USER'];

const ROLE_INFO = {
    SUPER_ADMIN: { label: 'Super Admin', color: '#a855f7', desc: 'Full access to everything', icon: '👑' },
    ADMIN: { label: 'Admin', color: '#ef4444', desc: 'Manage users, settings, blacklist', icon: '🛡️' },
    ANALYST: { label: 'Analyst', color: '#3b82f6', desc: 'Review claims, view audit logs', icon: '🔍' },
    USER: { label: 'User', color: '#10b981', desc: 'Submit claims only', icon: '👤' },
};

const TRUST_BADGES = {
    PLATINUM: { color: '#a8a2ff', bg: 'rgba(168,162,255,0.15)', icon: '💎' },
    GOLD: { color: '#ffd700', bg: 'rgba(255,215,0,0.15)', icon: '🥇' },
    SILVER: { color: '#c0c0c0', bg: 'rgba(192,192,192,0.15)', icon: '🥈' },
    BRONZE: { color: '#cd7f32', bg: 'rgba(205,127,50,0.15)', icon: '🥉' },
    NEW: { color: '#64748b', bg: 'rgba(100,116,139,0.15)', icon: '🆕' },
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [error, setError] = useState('');

    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'USER', email: '' });

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const createUser = async () => {
        setError('');
        if (!newUser.username || !newUser.password) {
            setError('Username and password are required');
            return;
        }
        try {
            await api.post('/users', newUser);
            setShowCreateModal(false);
            setNewUser({ username: '', password: '', role: 'USER', email: '' });
            fetchUsers();
        } catch (err) {
            setError(err.response?.data || 'Failed to create user');
        }
    };

    const updateRole = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}/role`, { role: newRole });
            fetchUsers();
            setEditingUser(null);
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const deleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    return (
        <div className="user-management-page">
            <div className="page-header">
                <div className="header-info">
                    <h1><Users size={28} /> User Management</h1>
                    <p>Manage users, roles, and permissions (RBAC)</p>
                </div>
                <button className="create-user-btn" onClick={() => setShowCreateModal(true)}>
                    <Plus size={16} /> Create User
                </button>
            </div>

            {/* RBAC Permissions Matrix */}
            <div className="rbac-matrix glass-panel">
                <h3><Shield size={18} /> Role Permissions Matrix</h3>
                <div className="matrix-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Permission</th>
                                <th>Super Admin</th>
                                <th>Admin</th>
                                <th>Analyst</th>
                                <th>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Submit Claims</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
                            <tr><td>View All Claims</td><td>✅</td><td>✅</td><td>✅</td><td>—</td></tr>
                            <tr><td>Approve/Reject Claims</td><td>✅</td><td>✅</td><td>✅</td><td>—</td></tr>
                            <tr><td>View Audit Logs</td><td>✅</td><td>✅</td><td>✅</td><td>—</td></tr>
                            <tr><td>Manage Blacklist</td><td>✅</td><td>✅</td><td>✅</td><td>—</td></tr>
                            <tr><td>Manage Settings</td><td>✅</td><td>✅</td><td>—</td><td>—</td></tr>
                            <tr><td>Manage Users</td><td>✅</td><td>✅</td><td>—</td><td>—</td></tr>
                            <tr><td>Delete Users</td><td>✅</td><td>—</td><td>—</td><td>—</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Users List */}
            {loading ? (
                <div className="loading-state"><div className="spinner"></div><p>Loading users...</p></div>
            ) : (
                <div className="users-grid">
                    {users.map(user => {
                        const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.USER;
                        const trustInfo = TRUST_BADGES[user.trustLevel] || TRUST_BADGES.NEW;

                        return (
                            <div key={user.id} className="user-card glass-panel">
                                <div className="user-card-header">
                                    <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleInfo.color}, ${roleInfo.color}80)` }}>
                                        <span>{roleInfo.icon}</span>
                                    </div>
                                    <div className="user-info">
                                        <div className="username">{user.username}</div>
                                        <span className="role-badge" style={{
                                            background: `${roleInfo.color}20`,
                                            color: roleInfo.color,
                                            border: `1px solid ${roleInfo.color}40`
                                        }}>
                                            {roleInfo.label}
                                        </span>
                                    </div>
                                    <div className="user-actions">
                                        {editingUser === user.id ? (
                                            <div className="role-selector">
                                                {ROLES.map(role => (
                                                    <button
                                                        key={role}
                                                        className={`role-option ${user.role === role ? 'active' : ''}`}
                                                        style={{ borderColor: ROLE_INFO[role].color }}
                                                        onClick={() => updateRole(user.id, role)}
                                                    >
                                                        {ROLE_INFO[role].icon} {ROLE_INFO[role].label}
                                                    </button>
                                                ))}
                                                <button className="cancel-btn" onClick={() => setEditingUser(null)}>
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <button className="icon-btn edit" onClick={() => setEditingUser(user.id)} title="Change Role">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button className="icon-btn delete" onClick={() => deleteUser(user.id)} title="Delete User">
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="user-card-footer">
                                    <span className="trust-level" style={{ background: trustInfo.bg, color: trustInfo.color }}>
                                        {trustInfo.icon} {user.trustLevel || 'NEW'}
                                    </span>
                                    {user.email && <span className="user-email">{user.email}</span>}
                                    <span className="user-id">ID: {user.id}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2><Plus size={20} /> Create New User</h2>
                            <button className="close-btn" onClick={() => setShowCreateModal(false)}><X size={20} /></button>
                        </div>
                        {error && (
                            <div className="error-message">
                                <AlertTriangle size={16} /> {error}
                            </div>
                        )}
                        <div className="form-group">
                            <label>Username / Email</label>
                            <input
                                type="text"
                                placeholder="user@example.com"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="user@example.com"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label>Role</label>
                            <div className="role-picker">
                                {ROLES.map(role => (
                                    <button
                                        key={role}
                                        className={`role-pick-btn ${newUser.role === role ? 'active' : ''}`}
                                        onClick={() => setNewUser({ ...newUser, role })}
                                        style={{
                                            borderColor: newUser.role === role ? ROLE_INFO[role].color : 'transparent',
                                            background: newUser.role === role ? `${ROLE_INFO[role].color}20` : ''
                                        }}
                                    >
                                        <span className="role-icon">{ROLE_INFO[role].icon}</span>
                                        <span className="role-name">{ROLE_INFO[role].label}</span>
                                        <span className="role-desc">{ROLE_INFO[role].desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button className="submit-btn" onClick={createUser}>
                            Create User
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

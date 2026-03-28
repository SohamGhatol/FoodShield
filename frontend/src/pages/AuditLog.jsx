/* eslint-disable */
import { useState, useEffect } from 'react';
import { ClipboardList, Filter, FileText, ShieldBan, CheckCircle, XCircle, UserX, Download, Search } from 'lucide-react';
import api from '../services/api';
import './AuditLog.css';

const ACTION_TYPES = [
    { value: '', label: 'All Actions' },
    { value: 'CLAIM_CREATED', label: 'Claim Created' },
    { value: 'STATUS_CHANGED', label: 'Status Changed' },
    { value: 'FRAUD_ANALYZED', label: 'Fraud Analyzed' },
    { value: 'DUPLICATE_IMAGE', label: 'Duplicate Image' },
    { value: 'USER_BLACKLISTED', label: 'User Blacklisted' },
    { value: 'USER_UNBLACKLISTED', label: 'User Unblacklisted' },
    { value: 'AUTO_BLACKLISTED', label: 'Auto Blacklisted' },
    { value: 'USER_CREATED', label: 'User Created' },
    { value: 'ROLE_CHANGED', label: 'Role Changed' },
    { value: 'USER_DELETED', label: 'User Deleted' },
];

const getActionIcon = (action) => {
    switch (action) {
        case 'CLAIM_CREATED': return <FileText size={16} />;
        case 'STATUS_CHANGED': return <CheckCircle size={16} />;
        case 'FRAUD_ANALYZED': return <ClipboardList size={16} />;
        case 'USER_BLACKLISTED': return <ShieldBan size={16} />;
        case 'USER_UNBLACKLISTED': return <UserX size={16} />;
        case 'AUTO_BLACKLISTED': return <ShieldBan size={16} />;
        default: return <ClipboardList size={16} />;
    }
};

const getActionColor = (action) => {
    switch (action) {
        case 'CLAIM_CREATED': return '#3b82f6';
        case 'STATUS_CHANGED': return '#10b981';
        case 'FRAUD_ANALYZED': return '#8b5cf6';
        case 'DUPLICATE_IMAGE': return '#f97316';
        case 'USER_BLACKLISTED': return '#ef4444';
        case 'USER_UNBLACKLISTED': return '#f59e0b';
        case 'AUTO_BLACKLISTED': return '#dc2626';
        case 'USER_CREATED': return '#06b6d4';
        case 'ROLE_CHANGED': return '#a855f7';
        case 'USER_DELETED': return '#be123c';
        default: return '#6b7280';
    }
};

const formatAction = (log) => {
    switch (log.action) {
        case 'CLAIM_CREATED':
            return `Created Claim #${log.targetEntityId}`;
        case 'STATUS_CHANGED':
            return `Changed Claim #${log.targetEntityId} from ${log.oldValue || '—'} → ${log.newValue || '—'}`;
        case 'FRAUD_ANALYZED':
            return `Fraud analysis completed for Claim #${log.targetEntityId}: ${log.oldValue || ''} → ${log.newValue || ''}`;
        case 'DUPLICATE_IMAGE':
            return `Duplicate image detected in Claim #${log.targetEntityId} → ${log.newValue}`;
        case 'USER_BLACKLISTED':
            return `Blacklisted user: ${log.newValue}`;
        case 'USER_UNBLACKLISTED':
            return `Removed ${log.oldValue} from blacklist`;
        case 'AUTO_BLACKLISTED':
            return `System auto-blacklisted user: ${log.newValue}`;
        case 'USER_CREATED':
            return `Created user: ${log.newValue}`;
        case 'ROLE_CHANGED':
            return `Changed role from ${log.oldValue} → ${log.newValue}`;
        case 'USER_DELETED':
            return `Deleted user: ${log.oldValue}`;
        default:
            return log.action.replace(/_/g, ' ');
    }
};

const AuditLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterAction, setFilterAction] = useState('');
    const [filterUser, setFilterUser] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [filterAction]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            let url = '/audit-logs';
            const params = new URLSearchParams();
            if (filterAction) params.append('action', filterAction);
            if (filterUser) params.append('user', filterUser);
            if (params.toString()) url += `?${params.toString()}`;
            const response = await api.get(url);
            setLogs(response.data);
        } catch (err) {
            console.error('Failed to fetch audit logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUserSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const exportCSV = () => {
        const headers = ['ID', 'Timestamp', 'Action', 'Performed By', 'Entity', 'Entity ID', 'Old Value', 'New Value', 'Details'];
        const rows = logs.map(log => [
            log.id,
            new Date(log.timestamp).toLocaleString(),
            log.action,
            log.performedBy,
            log.targetEntity,
            log.targetEntityId,
            log.oldValue || '',
            log.newValue || '',
            log.details || ''
        ]);
        const csvContent = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="audit-log-page">
            <div className="page-header">
                <div className="header-info">
                    <h1><ClipboardList size={28} /> Audit Log</h1>
                    <p>Track every action performed on the platform</p>
                </div>
                <button className="export-btn" onClick={exportCSV}>
                    <Download size={16} /> Export CSV
                </button>
            </div>

            <div className="filters-bar glass-panel">
                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        {ACTION_TYPES.map(type => (
                            <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                    </select>
                </div>
                <form className="filter-group" onSubmit={handleUserSearch}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by user..."
                        value={filterUser}
                        onChange={(e) => setFilterUser(e.target.value)}
                    />
                    <button type="submit" className="search-btn">Search</button>
                </form>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading audit logs...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="empty-state glass-panel">
                    <ClipboardList size={48} />
                    <h3>No audit logs found</h3>
                    <p>Audit events will appear here as actions are performed on the platform.</p>
                </div>
            ) : (
                <div className="timeline-container">
                    {logs.map((log, index) => (
                        <div key={log.id} className="timeline-item" style={{ animationDelay: `${index * 0.05}s` }}>
                            <div className="timeline-marker" style={{ backgroundColor: getActionColor(log.action) }}>
                                {getActionIcon(log.action)}
                            </div>
                            <div className="timeline-content glass-panel">
                                <div className="timeline-header">
                                    <span className="action-badge" style={{
                                        backgroundColor: `${getActionColor(log.action)}20`,
                                        color: getActionColor(log.action),
                                        borderColor: `${getActionColor(log.action)}40`
                                    }}>
                                        {log.action.replace(/_/g, ' ')}
                                    </span>
                                    <span className="timestamp">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="action-description">{formatAction(log)}</p>
                                <div className="timeline-footer">
                                    <span className="performed-by">by <strong>{log.performedBy}</strong></span>
                                    {log.details && (
                                        <span className="details-text">{log.details}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AuditLog;

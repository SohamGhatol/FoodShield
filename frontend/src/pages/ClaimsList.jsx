/* eslint-disable */
import { useState, useEffect } from 'react';
import api from '../services/api';
import RecentClaimsTable from '../components/dashboard/RecentClaimsTable';
import './ClaimsList.css';
import { Filter, ChevronDown, Download, Loader2 } from 'lucide-react';

const ClaimsList = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [filterStatus, setFilterStatus] = useState('All');
    const [filterScore, setFilterScore] = useState('Any');
    const [sortBy, setSortBy] = useState('newest'); // New State for Sorting

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const response = await api.get('/claims');
            setClaims(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch claims:", err);
            // Fallback to empty list or mock data if needed, but error state is better
            setError("Failed to load claims. Please try again later.");
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        fetchClaims();
    }, []);

    const filteredClaims = claims.filter(claim => {
        const matchesStatus = filterStatus === 'All' || claim.status === filterStatus;
        let matchesScore = true;

        if (filterScore === 'High') matchesScore = claim.riskScore > 70;
        if (filterScore === 'Medium') matchesScore = claim.riskScore >= 40 && claim.riskScore <= 70;
        if (filterScore === 'Low') matchesScore = claim.riskScore < 40;

        return matchesStatus && matchesScore;
    });

    // Sorting Logic
    const sortedClaims = [...filteredClaims].sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return new Date(b.createdAt) - new Date(a.createdAt);
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'risk-desc':
                return b.riskScore - a.riskScore;
            case 'risk-asc':
                return a.riskScore - b.riskScore;
            case 'status': {
                const statusOrder = { 'HIGH_RISK': 3, 'REVIEW': 2, 'SAFE': 1, 'REJECTED': 0 };
                return (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0);
            }
            default:
                return 0;
        }
    });

    const handleExportCSV = () => {
        const headers = ['ID', 'Restaurant', 'Claimant', 'Amount', 'Status', 'Risk Score', 'Decision Mode', 'Created At'];
        const rows = sortedClaims.map(c => [
            c.id,
            c.restaurantName ?? '',
            c.claimantName ?? '',
            c.amount ?? '',
            c.status ?? '',
            c.riskScore ?? '',
            c.decisionMode ?? '',
            c.createdAt ?? '',
        ]);
        const csvContent = [headers, ...rows]
            .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
            .join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'claims_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            await api.put(`/claims/${id}/status`, { status: newStatus });
            // Optimistic update or refetch
            setClaims(claims.map(claim =>
                claim.id === id ? { ...claim, status: newStatus } : claim
            ));
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status. Please try again.");
        }
    };

    return (
        <div className="claims-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Claims Management</h1>
                    <p className="page-subtitle">Review and analyze incoming refund requests.</p>
                </div>
                <div className="header-actions">
                    <button className="action-button secondary" onClick={handleExportCSV}>
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="filters-bar glass-panel">
                <div className="filter-group">
                    <label>Status:</label>
                    <div className="select-wrapper">
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="All">All Claims</option>
                            <option value="HIGH_RISK">High Risk</option>
                            <option value="REVIEW">Manual Review</option>
                            <option value="SAFE">Safe</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Risk Score:</label>
                    <div className="select-wrapper">
                        <select value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
                            <option value="Any">Any Score</option>
                            <option value="High">High (&gt;70)</option>
                            <option value="Medium">Medium (40-70)</option>
                            <option value="Low">Low (&lt;40)</option>
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                    </div>
                </div>

                <div className="filter-group">
                    <label>Sort By:</label>
                    <div className="select-wrapper">
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="risk-desc">Risk: High to Low</option>
                            <option value="risk-asc">Risk: Low to High</option>
                            <option value="status">Status Priority</option>
                        </select>
                        <ChevronDown size={16} className="select-icon" />
                    </div>
                </div>

                <div className="filter-group ml-auto">
                    <button className="icon-btn">
                        <Filter size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => { setFilterStatus('All'); setFilterScore('Any'); setSortBy('newest'); }}>
                        Clear
                    </button>
                </div>
            </div>

            <div className="claims-list-container">
                {loading ? (
                    <div className="loading-state">
                        <Loader2 className="spin" size={32} />
                        <p>Loading claims...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={fetchClaims} className="action-button">Retry</button>
                    </div>
                ) : (
                    <RecentClaimsTable claims={sortedClaims} onUpdateStatus={handleUpdateStatus} />
                )}
            </div>
        </div>
    );
};

export default ClaimsList;

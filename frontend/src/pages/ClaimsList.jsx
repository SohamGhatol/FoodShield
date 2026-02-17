import { useState } from 'react';
import { recentClaims } from '../services/mockData';
import RecentClaimsTable from '../components/dashboard/RecentClaimsTable';
import './ClaimsList.css';
import { Filter, ChevronDown, Download } from 'lucide-react';

const ClaimsList = () => {
    // Mocking a larger dataset by duplicating
    const allClaims = [...recentClaims, ...recentClaims, ...recentClaims].map((claim, i) => ({
        ...claim,
        id: `CLM-2024-00${i + 4}`
    }));

    const [filterStatus, setFilterStatus] = useState('All');
    const [filterScore, setFilterScore] = useState('Any');

    const filteredClaims = allClaims.filter(claim => {
        const matchesStatus = filterStatus === 'All' || claim.status === filterStatus;
        let matchesScore = true;

        if (filterScore === 'High') matchesScore = claim.riskScore > 70;
        if (filterScore === 'Medium') matchesScore = claim.riskScore >= 40 && claim.riskScore <= 70;
        if (filterScore === 'Low') matchesScore = claim.riskScore < 40;

        return matchesStatus && matchesScore;
    });

    return (
        <div className="claims-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Claims Management</h1>
                    <p className="page-subtitle">Review and analyze incoming refund requests.</p>
                </div>
                <div className="header-actions">
                    <button className="action-button secondary">
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
                            <option value="High Risk">High Risk</option>
                            <option value="Review">Manual Review</option>
                            <option value="Safe">Safe</option>
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

                <div className="filter-group ml-auto">
                    <button className="icon-btn">
                        <Filter size={20} />
                    </button>
                    <button className="icon-btn" onClick={() => { setFilterStatus('All'); setFilterScore('Any'); }}>
                        Clear
                    </button>
                </div>
            </div>

            <div className="claims-list-container">
                <RecentClaimsTable claims={filteredClaims} />
            </div>
        </div>
    );
};

export default ClaimsList;

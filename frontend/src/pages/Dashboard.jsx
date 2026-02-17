import { useState, useEffect } from 'react';
import { Play, Plus } from 'lucide-react';
import { statsData, fraudTrendData, recentClaims as initialClaims, blacklistUsers } from '../services/mockData';
import StatCard from '../components/dashboard/StatCard';
import FraudTrendChart from '../components/dashboard/FraudTrendChart';
import RecentClaimsTable from '../components/dashboard/RecentClaimsTable';
import RequestSummary from '../components/dashboard/RequestSummary';
import './Dashboard.css';

const Dashboard = () => {
    const [claims, setClaims] = useState(initialClaims);
    const [isSimulating, setIsSimulating] = useState(false);

    const simulateNewClaim = () => {
        setIsSimulating(true);
        const newClaimId = `CLM-2024-${Math.floor(Math.random() * 1000)}`;

        // Randomly decide if this is a blacklist user (30% chance)
        const isBlacklisted = Math.random() < 0.3;
        const blacklistedUser = blacklistUsers[Math.floor(Math.random() * blacklistUsers.length)];

        // 1. Add "Analyzing" Claim
        const pendingClaim = {
            id: newClaimId,
            user: isBlacklisted ? blacklistedUser.name : 'Anonymous User',
            amount: '...',
            restaurant: 'Processing...',
            date: 'Just now',
            riskScore: 0,
            status: 'Analyzing', // Custom status for demo
            image: 'https://placehold.co/100?text=Analyzing'
        };

        setClaims(prev => [pendingClaim, ...prev]);

        // 2. Simulate AI Processing Delay (3 seconds)
        setTimeout(() => {
            const isFraud = isBlacklisted || Math.random() > 0.5;

            const finalClaim = {
                ...pendingClaim,
                user: isBlacklisted ? blacklistedUser.name : (isFraud ? 'Suspicious Actor' : 'Verified Customer'),
                amount: `₹${Math.floor(Math.random() * 2000) + 100}`,
                restaurant: isFraud ? 'Burger King' : 'Starbucks',
                riskScore: isFraud ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 20),
                status: isFraud ? 'High Risk' : 'Safe',
                decisionMode: isFraud ? 'Automated' : 'Manual', // Auto-reject fraud, manual for others
                image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500&q=60',
                userStats: isBlacklisted ? { nature: 'Serial Abuser', totalClaims: 15, rejected: 12 } : null,
                fraudAnalysis: isBlacklisted ? `User match found in Blacklist: ${blacklistedUser.reason}` : null
            };

            setClaims(prev => prev.map(c => c.id === newClaimId ? finalClaim : c));
            setIsSimulating(false);
        }, 3000);
    };

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Dashboard Overview</h1>
                    <p className="page-subtitle">Welcome back, Admin. Here's what's happening today.</p>
                </div>
                <button
                    className="action-btn-lg approve"
                    onClick={simulateNewClaim}
                    disabled={isSimulating}
                    style={{ gap: '0.5rem' }}
                >
                    {isSimulating ? <Play size={18} className="spin" /> : <Plus size={18} />}
                    {isSimulating ? 'Processing...' : 'Simulate New Claim'}
                </button>
            </div>

            <div className="stats-grid">
                {statsData.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="content-grid">
                <div className="main-chart">
                    <FraudTrendChart data={fraudTrendData} />
                </div>
                <div className="recent-activity">
                    <RequestSummary />
                </div>
            </div>

            <div className="table-section-split">
                <div className="table-block">
                    <div className="section-header">
                        <h3>⚠️ Manual Review Queue</h3>
                        <span className="badge warning">Action Required</span>
                    </div>
                    <RecentClaimsTable claims={claims.filter(c => c.decisionMode === 'Manual')} />
                </div>

                <div className="table-block">
                    <div className="section-header">
                        <h3>🤖 Automated Decisions</h3>
                        <span className="badge primary">AI Processed</span>
                    </div>
                    <RecentClaimsTable claims={claims.filter(c => c.decisionMode === 'Automated')} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

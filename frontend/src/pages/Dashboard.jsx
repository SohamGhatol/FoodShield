/* eslint-disable */
import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import api from '../services/api';
import { fraudTrendData } from '../services/mockData';
import StatCard from '../components/dashboard/StatCard';
import FraudTrendChart from '../components/dashboard/FraudTrendChart';
import RecentClaimsTable from '../components/dashboard/RecentClaimsTable';
import RequestSummary from '../components/dashboard/RequestSummary';
import SubmitClaimModal from '../components/dashboard/SubmitClaimModal';
import './Dashboard.css';

const Dashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Total Claims', value: '...', change: '', trend: 'neutral' },
        { label: 'Fraud Detected', value: '...', change: '', trend: 'neutral' },
        { label: 'Pending Review', value: '...', change: '', trend: 'neutral' },
        { label: 'Est. Savings', value: '...', change: '', trend: 'neutral' },
    ]);
    const [summaryStats, setSummaryStats] = useState(null);
    const [claims, setClaims] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchDashboardData = async () => {
        try {
            // Fetch real stats from backend
            const [statsRes, claimsRes] = await Promise.all([
                api.get('/dashboard/stats'),
                api.get('/claims'),
            ]);

            const s = statsRes.data;
            setSummaryStats(s);

            setStats([
                {
                    label: 'Total Claims',
                    value: s.total_claims?.toString() ?? '0',
                    change: '',
                    trend: 'neutral',
                },
                {
                    label: 'Fraud Detected',
                    value: s.auto_rejected?.toString() ?? '0',
                    change: '',
                    trend: s.auto_rejected > 0 ? 'up' : 'neutral',
                },
                {
                    label: 'Pending Review',
                    value: s.pending_reviews?.toString() ?? '0',
                    change: '',
                    trend: s.pending_reviews > 0 ? 'up' : 'neutral',
                },
                {
                    label: 'Est. Savings',
                    value: `$${(s.total_savings ?? 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`,
                    change: '',
                    trend: 'up',
                },
            ]);

            setClaims(claimsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        fetchDashboardData();
    }, []);


    const handleClaimSubmitted = async () => {
        fetchDashboardData();
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
                    onClick={() => setIsModalOpen(true)}
                    style={{ gap: '0.5rem' }}
                >
                    <Plus size={18} />
                    File New Claim
                </button>
            </div>

            <SubmitClaimModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onClaimSubmitted={handleClaimSubmitted}
            />

            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <StatCard key={index} {...stat} />
                ))}
            </div>

            <div className="content-grid">
                <div className="main-chart">
                    <FraudTrendChart data={fraudTrendData} />
                </div>
                <div className="recent-activity">
                    <RequestSummary stats={summaryStats} />
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

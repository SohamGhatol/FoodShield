import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertOctagon, User, MapPin, Calendar, Smartphone } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import AutomationFlow from '../components/claims/AutomationFlow';
import { recentClaims } from '../services/mockData';
import './ClaimDetail.css';

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // In a real app, fetch claim by ID. For now, find in mock data or default
    const claim = recentClaims.find(c => c.id === id) || {
        ...recentClaims[0],
        id: id || recentClaims[0].id,
        riskScore: 82,
        status: 'High Risk',
        aiScore: 95,
        metaScore: 60,
        behaviorScore: 45,
        deviceScore: 20
    };

    return (
        <div className="claim-detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>



            // ... (inside ClaimDetail component)
            <div className="claim-header glass-panel">
                <div className="header-left">
                    <h1 className="claim-id">{claim.id}</h1>
                    <StatusBadge status={claim.status} />
                    <span className="claim-date">Submitted on Oct 24, 2024 at 14:30</span>
                </div>
                <div className="header-right">
                    {claim.decisionMode === 'Automated' ? (
                        <div className="automated-decision-label">
                            <span className="icon">🤖</span>
                            <span>Automated Decision Applied</span>
                        </div>
                    ) : (
                        <>
                            <button className="action-btn-lg reject">
                                <X size={18} />
                                Reject Claim
                            </button>
                            <button className="action-btn-lg approve">
                                <Check size={18} />
                                Approve Refund
                            </button>
                        </>
                    )}
                </div>
            </div>

            <AutomationFlow claim={claim} />

            <div className="claim-grid">
                <div className="left-column">
                    <div className="image-analysis glass-panel">
                        <h3>Image Analysis</h3>
                        <div className="main-image-container">
                            <img src={claim.image} alt="Evidence" className="evidence-image" />
                            <div className="ela-toggle">
                                <input type="checkbox" id="ela-mode" />
                                <label htmlFor="ela-mode">Show ELA Analysis</label>
                            </div>
                        </div>
                        <div className="analysis-metrics">
                            <div className="metric-item danger">
                                <span className="label">AI Probability</span>
                                <span className="value">{claim.aiScore}%</span>
                            </div>
                            <div className="metric-item warning">
                                <span className="label">Metadata Risk</span>
                                <span className="value">{claim.metaScore}%</span>
                            </div>
                            <div className="metric-item success">
                                <span className="label">Device Trust</span>
                                <span className="value">High</span>
                            </div>
                        </div>
                    </div>

                    <div className="metadata-panel glass-panel">
                        <h3>Metadata & EXIF</h3>
                        <div className="meta-grid">
                            <div className="meta-row">
                                <span className="key">Device Model</span>
                                <span className="val">iPhone 14 Pro</span>
                            </div>
                            <div className="meta-row">
                                <span className="key">Software</span>
                                <span className="val">Adobe Photoshop 24.0</span>
                            </div>
                            <div className="meta-row">
                                <span className="key">Orig. Date</span>
                                <span className="val">2023:08:12 10:22:15</span>
                            </div>
                            <div className="meta-row error">
                                <AlertOctagon size={14} />
                                <span>Date Mismatch Detected (Uploaded today)</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="right-column">
                    <div className="score-card glass-panel">
                        <h3>Fraud Score</h3>
                        <div className="score-circle-container">
                            <div className={`score-circle ${claim.riskScore > 70 ? 'danger' : 'warning'}`}>
                                <span className="score-num">{claim.riskScore}</span>
                                <span className="score-label">/ 100</span>
                            </div>
                        </div>
                        <div className="score-breakdown">
                            <div className="breakdown-item">
                                <span>AI Model</span>
                                <span className="val danger">+28.5</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Image Forensics</span>
                                <span className="val warning">+15.0</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Behavioral</span>
                                <span className="val">+9.0</span>
                            </div>
                        </div>
                        {claim.fraudAnalysis && (
                            <div className="fraud-summary">
                                <h4>AI Behavior Analysis</h4>
                                <p>{claim.fraudAnalysis}</p>
                            </div>
                        )}
                    </div>

                    <div className="user-profile-panel glass-panel">
                        <h3>User Profile</h3>
                        <div className="user-header">
                            <div className="avatar-lg"><User size={24} /></div>
                            <div>
                                <div className="user-name">{claim.user}</div>
                                <div className="user-id">ID: USR-88219</div>
                                {claim.userStats && (
                                    <div className={`user-nature-badge ${claim.userStats.nature === 'Serial Abuser' ? 'danger' : 'success'}`}>
                                        {claim.userStats.nature}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="user-stats">
                            <div className="stat">
                                <Smartphone size={16} />
                                <span>3 Devices</span>
                            </div>
                            <div className="stat">
                                <MapPin size={16} />
                                <span>Mumbai, IN</span>
                            </div>
                            <div className="stat">
                                <Calendar size={16} />
                                <span>Member since 2022</span>
                            </div>
                        </div>

                        <div className="history-list">
                            <h4>Recent History</h4>
                            <div className="history-item">
                                <span className="red">Refund #9921</span>
                                <span className="date">2 days ago</span>
                            </div>
                            <div className="history-item">
                                <span className="red">Refund #9100</span>
                                <span className="date">1 week ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClaimDetail;

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, X, AlertOctagon, User, MapPin, Calendar, Smartphone, Loader2, Clock, Shield } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import AutomationFlow from '../components/claims/AutomationFlow';
import api from '../services/api';
import './ClaimDetail.css';

const getTrustBadge = (level) => {
    const colors = {
        PLATINUM: { bg: 'rgba(168,162,255,0.15)', color: '#a8a2ff', label: '💎 Platinum' },
        GOLD: { bg: 'rgba(255,215,0,0.15)', color: '#ffd700', label: '🥇 Gold' },
        SILVER: { bg: 'rgba(192,192,192,0.15)', color: '#c0c0c0', label: '🥈 Silver' },
        BRONZE: { bg: 'rgba(205,127,50,0.15)', color: '#cd7f32', label: '🥉 Bronze' },
        NEW: { bg: 'rgba(100,116,139,0.15)', color: '#64748b', label: '🆕 New' },
    };
    return colors[level] || colors.NEW;
};

const ClaimDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [activityLogs, setActivityLogs] = useState([]);

    useEffect(() => {
        const fetchClaim = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/claims/${id}`);
                // Merge with default values for fields not yet in DB to prevent UI breaking
                setClaim({
                    ...response.data,
                    riskScore: response.data.riskScore || 0,
                    status: response.data.status || 'Pending',
                    // Map nested FraudAnalysis if available
                    aiScore: response.data.fraudAnalysis ? response.data.fraudAnalysis.aiScore : 0,
                    metaScore: response.data.fraudAnalysis ? response.data.fraudAnalysis.metadataScore : 0,
                    behaviorScore: response.data.fraudAnalysis ? response.data.fraudAnalysis.findingScore : 0,
                    explanation: response.data.fraudAnalysis ? response.data.fraudAnalysis.explanation : null,
                    customerBehaviorAnalysis: response.data.fraudAnalysis ? response.data.fraudAnalysis.customerBehaviorAnalysis : null,
                    duplicateImageDetected: response.data.fraudAnalysis ? response.data.fraudAnalysis.duplicateImageDetected : false,
                    duplicateClaimId: response.data.fraudAnalysis ? response.data.fraudAnalysis.duplicateClaimId : null
                });
                setLoading(false);
            } catch (err) {
                console.error("Failed to fetch claim:", err);
                setError("Claim not found.");
                setLoading(false);
            }
        };

        const fetchActivityLogs = async () => {
            try {
                const response = await api.get(`/audit-logs?entity=Claim&entityId=${id}`);
                setActivityLogs(response.data);
            } catch (err) {
                console.error("Failed to fetch activity logs:", err);
            }
        };

        if (id) {
            fetchClaim();
            fetchActivityLogs();
        }
    }, [id]);

    if (loading) return <div className="loading-state"><div className="spinner"></div><p>Loading claim details...</p></div>;
    if (error || !claim) return <div className="error-state"><p>{error || "Claim not found"}</p><button onClick={() => navigate('/claims')} className="back-btn">Back to Claims</button></div>;

    const trustBadge = claim.user?.trustLevel ? getTrustBadge(claim.user.trustLevel) : null;

    return (
        <div className="claim-detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                <ArrowLeft size={18} />
                Back
            </button>


            <div className="claim-header glass-panel">
                <div className="header-left">
                    <h1 className="claim-id">{claim.id}</h1>
                    <StatusBadge status={claim.status} />
                    <span className="claim-date">Submitted on {new Date(claim.createdAt).toLocaleString()}</span>
                </div>
                <div className="header-right">
                    {!['REVIEW', 'ANALYZING'].includes(claim.status) ? (
                        <div className="automated-decision-label">
                            <span className="icon">🤖</span>
                            <span>
                                {claim.status === 'SAFE' ? '✓ Approved' :
                                    claim.status === 'REJECTED' ? '✗ Rejected' :
                                        claim.status === 'HIGH_RISK' ? '⚠ High Risk — Auto Rejected' :
                                            'Decision Applied'}
                            </span>
                        </div>
                    ) : (
                        <>
                            <button
                                className="action-btn-lg reject"
                                disabled={actionLoading}
                                onClick={async () => {
                                    setActionLoading(true);
                                    try {
                                        await api.put(`/claims/${claim.id}/status`, { status: 'REJECTED' });
                                        setClaim(prev => ({ ...prev, status: 'REJECTED', decisionMode: 'Automated' }));
                                    } catch { alert('Failed to reject claim.'); }
                                    finally { setActionLoading(false); }
                                }}
                            >
                                {actionLoading ? <Loader2 size={18} className="spin" /> : <X size={18} />}
                                Reject Claim
                            </button>
                            <button
                                className="action-btn-lg approve"
                                disabled={actionLoading}
                                onClick={async () => {
                                    setActionLoading(true);
                                    try {
                                        await api.put(`/claims/${claim.id}/status`, { status: 'SAFE' });
                                        setClaim(prev => ({ ...prev, status: 'SAFE', decisionMode: 'Automated' }));
                                    } catch { alert('Failed to approve claim.'); }
                                    finally { setActionLoading(false); }
                                }}
                            >
                                {actionLoading ? <Loader2 size={18} className="spin" /> : <Check size={18} />}
                                Approve Refund
                            </button>
                        </>
                    )}
                </div>
            </div>

            <AutomationFlow claim={claim} />

            {claim.duplicateImageDetected && (
                <div className="duplicate-alert glass-panel" style={{
                    background: 'rgba(249, 115, 22, 0.1)',
                    border: '1px solid rgba(249, 115, 22, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    color: '#fb923c'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                    <div>
                        <strong>Duplicate Image Detected!</strong>
                        <p style={{ fontSize: '0.85rem', margin: '4px 0 0', color: '#fdba74' }}>
                            This image matches a previously submitted claim #{claim.duplicateClaimId}. This may indicate fraudulent re-use of evidence.
                        </p>
                    </div>
                </div>
            )}

            <div className="claim-grid">
                <div className="left-column">
                    <div className="image-analysis glass-panel">
                        <h3>Image Analysis</h3>
                        {claim.imageUrl ? claim.imageUrl.split(',').map((url, index) => (
                            <div key={index} className="main-image-container" style={{ marginBottom: index < claim.imageUrl.split(',').length - 1 ? '15px' : '0' }}>
                                <img src={`/api/images/${url.replace(/\\/g, '/').split('/').pop()}`} alt={`Evidence ${index + 1}`} className="evidence-image"
                                    onError={(e) => { 
                                        e.target.onerror = null; 
                                        e.target.src = 'https://placehold.co/600x400/png?text=Image+Missing'; 
                                    }} />
                                {index === 0 && (
                                    <div className="ela-toggle">
                                        <input type="checkbox" id={`ela-mode-${index}`} />
                                        <label htmlFor={`ela-mode-${index}`}>Show ELA Analysis</label>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="main-image-container">
                                <img src="https://placehold.co/600x400/png?text=No+Image+Provided" alt="No Evidence" className="evidence-image" />
                            </div>
                        )}
                        <div className="analysis-metrics">
                            <div className={`metric-item ${claim.explanation && claim.explanation.includes("Not Food") ? 'danger' : 'success'}`}>
                                <span className="label">Food Verification</span>
                                <span className="value">
                                    {claim.explanation && claim.explanation.includes("Not Food") ? 'FAILED' : 'PASSED'}
                                </span>
                            </div>
                            <div className="metric-item danger">
                                <span className="label">AI Probability</span>
                                <span className="value">{claim.aiScore}%</span>
                            </div>
                            <div className="metric-item warning">
                                <span className="label">Metadata Risk</span>
                                <span className="value">{claim.metaScore}%</span>
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

                    {/* Activity Timeline */}
                    {activityLogs.length > 0 && (
                        <div className="activity-timeline glass-panel">
                            <h3><Clock size={18} /> Activity Timeline</h3>
                            <div className="timeline-mini">
                                {activityLogs.map((log) => (
                                    <div key={log.id} className="timeline-mini-item">
                                        <div className="timeline-mini-dot" />
                                        <div className="timeline-mini-content">
                                            <div className="timeline-mini-header">
                                                <span className="timeline-mini-action">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                                <span className="timeline-mini-time">
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="timeline-mini-detail">
                                                {log.oldValue && log.newValue
                                                    ? `${log.oldValue} → ${log.newValue}`
                                                    : log.details || ''}
                                            </p>
                                            <span className="timeline-mini-user">by {log.performedBy}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                                <span className={`val ${claim.aiScore > 50 ? 'danger' : ''}`}>+{(claim.aiScore * 0.6).toFixed(1)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Image Forensics</span>
                                <span className={`val ${claim.metaScore > 50 ? 'warning' : ''}`}>+{(claim.metaScore * 0.2).toFixed(1)}</span>
                            </div>
                            <div className="breakdown-item">
                                <span>Behavioral</span>
                                <span className="val">+{(claim.behaviorScore * 0.2).toFixed(1)}</span>
                            </div>
                        </div>
                        {claim.explanation && (
                            <div className="fraud-summary">
                                <h4>AI Behavior Analysis</h4>
                                <p>{claim.explanation}</p>
                            </div>
                        )}
                    </div>

                    {claim.complaint && (
                        <div className="complaint-panel glass-panel">
                            <h3>User's Complaint</h3>
                            <div className="complaint-content">
                                <p>{claim.complaint}</p>
                            </div>
                        </div>
                    )}

                    <div className="user-profile-panel glass-panel">
                        <h3>User Profile</h3>
                        <div className="user-header">
                            <div className="avatar-lg"><User size={24} /></div>
                            <div>
                                <div className="user-name">{claim.claimantName || claim.user?.username || 'Unknown User'}</div>
                                <div className="user-id">ID: USR-{claim.user?.id || '???'}</div>
                                {trustBadge && (
                                    <div className="trust-badge" style={{
                                        background: trustBadge.bg,
                                        color: trustBadge.color,
                                        border: `1px solid ${trustBadge.color}30`,
                                        padding: '3px 10px',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        marginTop: '4px',
                                        display: 'inline-block'
                                    }}>
                                        {trustBadge.label}
                                    </div>
                                )}
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

                    {claim.customerBehaviorAnalysis && (
                        <div className="behavior-analysis-panel glass-panel">
                            <h3>Customer Behaviour Analysis</h3>
                            <div className={`behavior-content ${claim.customerBehaviorAnalysis.startsWith('Negative') ? 'danger' : 'success'}`}>
                                <p>{claim.customerBehaviorAnalysis}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimDetail;


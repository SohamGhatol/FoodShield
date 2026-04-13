import { Link } from 'react-router-dom';
import { Eye, Check, X } from 'lucide-react';
import './RecentClaimsTable.css';

import StatusBadge from '../common/StatusBadge';

const RecentClaimsTable = ({ claims, onUpdateStatus }) => {
    const userStr = localStorage.getItem('user');
    const userObj = userStr ? JSON.parse(userStr) : null;

    return (
        <div className="recent-claims glass-panel">
            <div className="section-header">
                <h3 className="section-title">Recent Claims</h3>
                <Link to="/claims" className="view-all">View All</Link>
            </div>

            <div className="table-container">
                <table className="claims-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Restaurant</th>
                            <th>Amount</th>
                            <th>Risk Score</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {claims.map((claim) => (
                            <tr key={claim.id}>
                                <td className="claim-id">{claim.id}</td>
                                <td>
                                    <div className="user-info">
                                        <div className="user-avatar">
                                            {(claim.claimantName || claim.user?.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                        <span>{claim.claimantName || claim.user?.username || 'Unknown User'}</span>
                                    </div>
                                </td>
                                <td>{claim.restaurantName || claim.restaurant}</td>
                                <td className="amount">{claim.amount}</td>
                                <td>
                                    <div className="risk-score">
                                        <div
                                            className="score-bar"
                                            style={{
                                                width: `${claim.riskScore}%`,
                                                backgroundColor: claim.riskScore > 70 ? 'var(--color-danger)' : claim.riskScore > 40 ? 'var(--color-warning)' : 'var(--color-success)'
                                            }}
                                        ></div>
                                        <span>{claim.riskScore}</span>
                                    </div>
                                </td>
                                <td><StatusBadge status={claim.status} /></td>
                                <td>
                                    <div className="action-buttons">
                                        {['SAFE', 'REJECTED', 'HIGH_RISK'].includes(claim.status) ? (
                                            <span className="status-final-label">
                                                {claim.status === 'SAFE' ? '✓ Approved' : '✗ Rejected'}
                                            </span>
                                        ) : (
                                            userObj && ['SUPER_ADMIN', 'ADMIN', 'ANALYST'].includes(userObj.role) && (
                                            <>
                                                <button
                                                    className="action-btn success"
                                                    title="Approve"
                                                    onClick={() => onUpdateStatus && onUpdateStatus(claim.id, 'SAFE')}
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    className="action-btn danger"
                                                    title="Reject"
                                                    onClick={() => onUpdateStatus && onUpdateStatus(claim.id, 'REJECTED')}
                                                >
                                                    <X size={18} />
                                                </button>
                                            </>
                                            )
                                        )}
                                        <Link to={`/claims/${claim.id}`} className="action-btn">
                                            <Eye size={18} />
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentClaimsTable;

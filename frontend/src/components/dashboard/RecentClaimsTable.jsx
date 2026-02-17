import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';
import './RecentClaimsTable.css';

import StatusBadge from '../common/StatusBadge';

const RecentClaimsTable = ({ claims }) => {
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
                                        <div className="user-avatar">{claim.user.charAt(0)}</div>
                                        <span>{claim.user}</span>
                                    </div>
                                </td>
                                <td>{claim.restaurant}</td>
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
                                    <Link to={`/claims/${claim.id}`} className="action-btn">
                                        <Eye size={18} />
                                    </Link>
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

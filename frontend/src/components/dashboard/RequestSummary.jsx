import { CheckCircle, XCircle, Clock, ShieldCheck } from 'lucide-react';
import './RequestSummary.css';

const RequestSummary = () => {
    return (
        <div className="request-summary glass-panel">
            <div className="summary-header">
                <ShieldCheck size={20} className="icon-primary" />
                <h3>System Activity Summary</h3>
            </div>

            <div className="summary-grid">
                <div className="summary-card total">
                    <div className="value">142</div>
                    <div className="label">Total Requests</div>
                </div>

                <div className="summary-list">
                    <div className="summary-item success">
                        <div className="icon-box"><CheckCircle size={16} /></div>
                        <div className="info">
                            <span className="count">89</span>
                            <span className="desc">Auto-Approved (Refund)</span>
                        </div>
                    </div>

                    <div className="summary-item danger">
                        <div className="icon-box"><XCircle size={16} /></div>
                        <div className="info">
                            <span className="count">32</span>
                            <span className="desc">Auto-Rejected (AI Detected)</span>
                        </div>
                    </div>

                    <div className="summary-item warning">
                        <div className="icon-box"><Clock size={16} /></div>
                        <div className="info">
                            <span className="count">21</span>
                            <span className="desc">Pending Manual Review</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="automation-status">
                <span className="dot pulse"></span>
                <span>Automation Engine Active</span>
            </div>
        </div>
    );
};

export default RequestSummary;

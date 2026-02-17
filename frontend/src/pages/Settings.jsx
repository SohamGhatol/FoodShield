import { Save, Bell, Shield, Users, Database } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage system configuration and preferences.</p>
            </div>

            <div className="settings-grid">
                <div className="settings-card glass-panel">
                    <div className="card-header">
                        <Shield size={20} className="icon-primary" />
                        <h3>Fraud Detection Thresholds</h3>
                    </div>
                    <div className="card-content">
                        <div className="control-group">
                            <label>Auto-Reject Score Threshold</label>
                            <div className="range-wrapper">
                                <input type="range" min="0" max="100" defaultValue="80" />
                                <span className="value">80</span>
                            </div>
                            <p className="help-text">Claims with score above this will be auto-rejected.</p>
                        </div>

                        <div className="control-group">
                            <label>Manual Review Range</label>
                            <div className="range-inputs">
                                <input type="number" defaultValue="40" />
                                <span>to</span>
                                <input type="number" defaultValue="79" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="settings-card glass-panel">
                    <div className="card-header">
                        <Bell size={20} className="icon-primary" />
                        <h3>Notifications</h3>
                    </div>
                    <div className="card-content">
                        <div className="switch-row">
                            <div className="switch-label">
                                <span className="title">Email Alerts</span>
                                <span className="desc">Receive emails for high-risk claims</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="switch-row">
                            <div className="switch-label">
                                <span className="title">Slack Integration</span>
                                <span className="desc">Post alerts to #fraud-alerts</span>
                            </div>
                            <label className="switch">
                                <input type="checkbox" />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="settings-card glass-panel">
                    <div className="card-header">
                        <Database size={20} className="icon-primary" />
                        <h3>Data Retention</h3>
                    </div>
                    <div className="card-content">
                        <div className="control-group">
                            <label>Keep Images For</label>
                            <select defaultValue="30">
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>
                        <div className="control-group">
                            <label>Anonymize User Data After</label>
                            <select defaultValue="180">
                                <option value="90">3 Months</option>
                                <option value="180">6 Months</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-bar">
                <button className="btn-primary" onClick={() => alert('Settings saved successfully!')}>
                    <Save size={18} />
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default Settings;

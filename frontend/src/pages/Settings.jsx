/* eslint-disable */
import { useState, useEffect } from 'react';
import { Save, Bell, Shield, Users, Database } from 'lucide-react';
import api from '../services/api';
import './Settings.css';

const Settings = () => {
    const [config, setConfig] = useState({
        autoRejectScore: 80,
        manualReviewStart: 40,
        manualReviewEnd: 79,
        dataRetentionDays: 30,
        emailAlertsEnabled: true,
        slackIntegrationEnabled: false
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            setConfig(response.data);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch settings:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        fetchSettings();
    }, []);

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.put('/settings', config);
            setSaving(false);
            alert('Settings saved successfully!');
        } catch (err) {
            console.error("Failed to save settings:", err);
            setSaving(false);
            alert('Failed to save settings.');
        }
    };

    if (loading) return <div className="loading-state">Loading settings...</div>;

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
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={config.autoRejectScore}
                                    onChange={(e) => handleChange('autoRejectScore', parseInt(e.target.value))}
                                />
                                <span className="value">{config.autoRejectScore}</span>
                            </div>
                            <p className="help-text">Claims with score above this will be auto-rejected.</p>
                        </div>

                        <div className="control-group">
                            <label>Manual Review Range</label>
                            <div className="range-inputs">
                                <input
                                    type="number"
                                    value={config.manualReviewStart}
                                    onChange={(e) => handleChange('manualReviewStart', parseInt(e.target.value))}
                                />
                                <span>to</span>
                                <input
                                    type="number"
                                    value={config.manualReviewEnd}
                                    onChange={(e) => handleChange('manualReviewEnd', parseInt(e.target.value))}
                                />
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
                                <input
                                    type="checkbox"
                                    checked={config.emailAlertsEnabled}
                                    onChange={(e) => handleChange('emailAlertsEnabled', e.target.checked)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>

                        <div className="switch-row">
                            <div className="switch-label">
                                <span className="title">Slack Integration</span>
                                <span className="desc">Post alerts to #fraud-alerts</span>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={config.slackIntegrationEnabled}
                                    onChange={(e) => handleChange('slackIntegrationEnabled', e.target.checked)}
                                />
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
                            <label>Keep Images For (Days)</label>
                            <select
                                value={config.dataRetentionDays}
                                onChange={(e) => handleChange('dataRetentionDays', parseInt(e.target.value))}
                            >
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="90">90 Days</option>
                                <option value="365">1 Year</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div className="action-bar">
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
};

export default Settings;

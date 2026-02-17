import { Upload, Cpu, ShieldAlert, Ban, CheckCircle } from 'lucide-react';
import './AutomationFlow.css';

const AutomationFlow = ({ claim }) => {
    const steps = [
        { icon: Upload, label: 'Evidence Upload', status: 'completed', time: '14:30:05' },
        { icon: Cpu, label: 'AI Forensics', status: 'completed', time: '14:30:08' },
        { icon: ShieldAlert, label: 'Risk Scoring', status: 'completed', time: '14:30:09' },
        {
            icon: claim.status === 'Safe' ? CheckCircle : Ban,
            label: claim.status === 'Safe' ? 'Auto-Approve' : 'Auto-Reject',
            status: 'active',
            time: '14:30:10',
            isDecision: true
        }
    ];

    return (
        <div className="automation-flow glass-panel">
            <h3 className="flow-title">Automated Verification Pipeline</h3>
            <div className="steps-container">
                {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                        <div key={index} className={`flow-step ${step.status} ${step.isDecision ? 'decision' : ''}`}>
                            <div className="step-icon">
                                <Icon size={20} />
                            </div>
                            <div className="step-info">
                                <span className="step-label">{step.label}</span>
                                <span className="step-time">{step.time}</span>
                            </div>
                            {index < steps.length - 1 && <div className="step-connector"></div>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default AutomationFlow;

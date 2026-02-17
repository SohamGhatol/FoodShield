import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
        switch (status) {
            case 'High Risk':
                return { color: 'var(--color-danger)', icon: AlertTriangle, bg: 'rgba(239, 68, 68, 0.1)' };
            case 'Safe':
                return { color: 'var(--color-success)', icon: CheckCircle, bg: 'rgba(16, 185, 129, 0.1)' };
            case 'Review':
                return { color: 'var(--color-warning)', icon: Clock, bg: 'rgba(245, 158, 11, 0.1)' };
            case 'Analyzing':
                return { color: 'var(--color-primary)', icon: Clock, bg: 'rgba(99, 102, 241, 0.1)' };
            default:
                return { color: 'var(--color-text-muted)', icon: Clock, bg: 'rgba(255, 255, 255, 0.05)' };
        }
    };

    const config = getStatusConfig(status);
    const Icon = config.icon;

    return (
        <span className="status-badge" style={{ color: config.color, backgroundColor: config.bg }}>
            <Icon size={14} />
            {status}
        </span>
    );
};

export default StatusBadge;

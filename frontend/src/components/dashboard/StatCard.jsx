import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ label, value, change, trend }) => {
    const isUp = trend === 'up';

    return (
        <div className="stat-card glass-panel">
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            <div className={`stat-change ${isUp ? 'positive' : 'negative'}`}>
                {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span>{change} from last week</span>
            </div>
        </div>
    );
};

export default StatCard;

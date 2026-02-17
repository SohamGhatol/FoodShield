import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Lock, Zap, CheckCircle } from 'lucide-react';
import './Landing.css';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <nav className="landing-nav">
                <div className="logo">
                    <ShieldCheck size={32} className="logo-icon" />
                    <span>FoodShield</span>
                </div>
                <div className="nav-links">
                    <button className="login-btn-outline" onClick={() => navigate('/login')}>
                        Admin Portal
                    </button>
                </div>
            </nav>

            <main className="hero-section">
                <div className="hero-content">
                    <div className="badge">
                        <span className="badge-dot"></span>
                        AI-Powered Security
                    </div>
                    <h1>
                        Stop Refund Fraud <br />
                        <span className="highlight">Before It Happens</span>
                    </h1>
                    <p className="hero-desc">
                        FoodShield uses advanced computer vision and metadata forensics to detect
                        fake food complaints, saving platforms millions in revenue.
                    </p>

                    <div className="cta-group">
                        <button className="primary-cta" onClick={() => navigate('/login')}>
                            Get Started <ArrowRight size={20} />
                        </button>
                        <button className="secondary-cta">
                            View Demo
                        </button>
                    </div>

                    <div className="stats-row">
                        <div className="stat-pill">
                            <Zap size={16} className="stat-icon" />
                            <span>99.8% Accuracy</span>
                        </div>
                        <div className="stat-pill">
                            <Lock size={16} className="stat-icon" />
                            <span>Enterprise Secure</span>
                        </div>
                        <div className="stat-pill">
                            <CheckCircle size={16} className="stat-icon" />
                            <span>Instant Analysis</span>
                        </div>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="glass-card visual-card">
                        <div className="scan-line"></div>
                        <div className="card-header">
                            <div className="dot red"></div>
                            <div className="dot yellow"></div>
                            <div className="dot green"></div>
                        </div>
                        <div className="analysis-mock">
                            <div className="mock-row">
                                <span>Analysis Status</span>
                                <span className="status-ok">Processing...</span>
                            </div>
                            <div className="mock-graph">
                                <div className="bar" style={{ height: '40%' }}></div>
                                <div className="bar" style={{ height: '70%' }}></div>
                                <div className="bar active" style={{ height: '55%' }}></div>
                                <div className="bar" style={{ height: '30%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Landing;

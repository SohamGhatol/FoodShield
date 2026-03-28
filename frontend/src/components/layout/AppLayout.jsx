import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Files,
    ShieldAlert,
    Settings,
    LogOut,
    User,
    Search,
    Bell,
    TrendingUp,
    ClipboardList,
    Users
} from 'lucide-react';
import './AppLayout.css';

const Sidebar = () => {
    const navigate = useNavigate();
    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-header">
                <div className="logo-container">
                    <ShieldAlert className="logo-icon" size={28} />
                    <span className="logo-text">FoodShield</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </NavLink>
                <NavLink to="/claims" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Files size={20} />
                    <span>Claims</span>
                </NavLink>
                <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </NavLink>
                <NavLink to="/blacklist" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ShieldAlert size={20} />
                    <span>Blacklist</span>
                </NavLink>
                <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <TrendingUp size={20} />
                    <span>Reports</span>
                </NavLink>
                <NavLink to="/audit-log" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <ClipboardList size={20} />
                    <span>Audit Log</span>
                </NavLink>
                <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <Users size={20} />
                    <span>Users</span>
                </NavLink>
            </nav>

            <div className="sidebar-footer">
                <div className="nav-item logout-btn" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
};
// ... Header and AppLayout export remains same, just update Sidebar NavLinks
const Header = () => {
    return (
        <header className="header glass-panel">
            <div className="search-bar">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search claims, users, or IDs..." />
            </div>

            <div className="header-actions">
                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-dot"></span>
                </button>
                <div className="user-profile">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <span className="username">Admin</span>
                </div>
            </div>
        </header>
    );
};

// Main Layout Component
export default function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <Header />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
}



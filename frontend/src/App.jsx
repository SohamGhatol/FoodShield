import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ClaimsList from './pages/ClaimsList';
import ClaimDetail from './pages/ClaimDetail';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Blacklist from './pages/Blacklist';
import Reports from './pages/Reports';
import AuditLog from './pages/AuditLog';
import UserManagement from './pages/UserManagement';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="claims" element={<ClaimsList />} />
              <Route path="claims/:id" element={<ClaimDetail />} />
              <Route path="settings" element={<Settings />} />
              <Route path="blacklist" element={<Blacklist />} />
              <Route path="reports" element={<Reports />} />
              <Route path="audit-log" element={<AuditLog />} />
              <Route path="users" element={<UserManagement />} />
              {/* Fallback for unknown admin routes */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AppLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HubLanding from './pages/HubLanding';
import LoginPage from './pages/LoginPage';
import StudentPortal from './pages/StudentPortal';
import AdminPortal from './pages/AdminPortal';
import NgoPortal from './pages/NgoPortal';

// Secure Origin Redirector - used if custom isolated origins are configured via env vars
const SecureOriginRedirect = ({ targetOrigin, label }) => {
  React.useEffect(() => {
    window.location.href = targetOrigin;
  }, [targetOrigin]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh', 
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#475569',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        padding: '2rem',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        textAlign: 'center',
        maxWidth: '420px'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
          Redirecting to {label}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Connecting to dedicated origin at <code>{targetOrigin}</code>.
        </p>
        <a 
          href={targetOrigin} 
          style={{ 
            display: 'inline-block',
            padding: '0.5rem 1rem', 
            borderRadius: '6px', 
            backgroundColor: '#0f766e', 
            color: '#fff', 
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: 600
          }}
        >
          Click here if not redirected
        </a>
      </div>
    </div>
  );
};

function App() {
  const studentOrigin = import.meta.env.VITE_STUDENT_PORTAL_URL;
  const adminOrigin = import.meta.env.VITE_ADMIN_PORTAL_URL;
  const ngoOrigin = import.meta.env.VITE_NGO_PORTAL_URL;

  return (
    <Routes>
      <Route path="/" element={<HubLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route 
        path="/student" 
        element={studentOrigin ? <SecureOriginRedirect targetOrigin={studentOrigin} label="Student Portal" /> : <StudentPortal />} 
      />
      <Route 
        path="/admin" 
        element={adminOrigin ? <SecureOriginRedirect targetOrigin={adminOrigin} label="Mess Admin Portal" /> : <AdminPortal />} 
      />
      <Route 
        path="/ngo" 
        element={ngoOrigin ? <SecureOriginRedirect targetOrigin={ngoOrigin} label="NGO Food Rescue Portal" /> : <NgoPortal />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

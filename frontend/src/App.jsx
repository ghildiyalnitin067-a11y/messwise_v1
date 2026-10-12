import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HubLanding from './pages/HubLanding';
import LoginPage from './pages/LoginPage';

// Secure Origin Redirector - ensures separate client origins & prevents bundle leakage
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
          Redirecting to Isolated {label}
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
          Connecting to dedicated origin at <code>{targetOrigin}</code> for zero-trust client isolation.
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
  return (
    <Routes>
      <Route path="/" element={<HubLanding />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/student" element={<SecureOriginRedirect targetOrigin="http://localhost:3001" label="Student Portal" />} />
      <Route path="/admin" element={<SecureOriginRedirect targetOrigin="http://localhost:3002" label="Mess Admin Portal" />} />
      <Route path="/ngo" element={<SecureOriginRedirect targetOrigin="http://localhost:3003" label="NGO Food Rescue Portal" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

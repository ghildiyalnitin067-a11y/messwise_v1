import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useMesswise } from '../context/MesswiseContext';

const UnifiedLoginModal = ({ isOpen, onClose }) => {
  const { handleLogin, userRole } = useMesswise();
  const [role, setRole] = useState(userRole || 'student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [studentForm, setStudentForm] = useState({ enrollment_no: '', father_name: '' });
  const [adminForm, setAdminForm] = useState({ username: '', password: '' });
  const [ngoForm, setNgoForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (role === 'student') {
      if (!studentForm.enrollment_no.trim()) errs.enrollment_no = 'Enrollment number is required.';
      if (!studentForm.father_name.trim()) errs.father_name = 'Verification details are required.';
    } else if (role === 'admin') {
      if (!adminForm.username.trim()) errs.username = 'Admin ID is required.';
      if (!adminForm.password) errs.password = 'Password is required.';
    } else if (role === 'ngo') {
      if (!ngoForm.email.trim()) errs.email = 'Registered NGO email is required.';
      else if (!/\S+@\S+\.\S+/.test(ngoForm.email)) errs.email = 'Please enter a valid email address.';
      if (!ngoForm.password) errs.password = 'Password is required.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      let credentials = {};
      if (role === 'student') credentials = studentForm;
      else if (role === 'admin') credentials = adminForm;
      else if (role === 'ngo') credentials = ngoForm;

      await handleLogin(role, credentials);
      if (role === 'student') {
        window.location.href = 'http://localhost:3001';
      } else if (role === 'admin') {
        window.location.href = 'http://localhost:3002';
      } else if (role === 'ngo') {
        window.location.href = 'http://localhost:3003';
      }
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.detail || err?.message || 'Authentication failed. Please verify your credentials.';
      setError(typeof msg === 'string' ? msg : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    if (role === 'student') {
      setStudentForm({ enrollment_no: '2022CSB042', father_name: 'Ramesh Sharma' });
    } else if (role === 'admin') {
      setAdminForm({ username: 'admin', password: 'Admin@123' });
    } else if (role === 'ngo') {
      setNgoForm({ email: 'helpinghands@ngo.org', password: 'Ngo@123' });
    }
    setFieldErrors({});
    setError(null);
  };

  const getRoleCopy = () => {
    if (role === 'student') {
      return {
        portalName: 'Student Portal',
        subtitle: 'Sign in to your student account to continue.',
        intro: 'Plan meals responsibly, eliminate cafeteria waste, and track campus sustainability.',
        demoLabel: 'Use demo account (Nitin Sharma)'
      };
    }
    if (role === 'admin') {
      return {
        portalName: 'Mess Admin Portal',
        subtitle: 'Sign in to manage kitchen operations and campus meal services.',
        intro: 'Turnout demand predictions, kitchen batch tracking, and surplus redistribution.',
        demoLabel: 'Use demo account (Rajesh Kumar)'
      };
    }
    return {
      portalName: 'NGO Partner Portal',
      subtitle: 'Sign in to manage surplus food pickups and redistribution.',
      intro: 'Connecting verified organizations directly to campus dining halls for food rescue.',
      demoLabel: 'Use demo account (Helping Hands NGO)'
    };
  };

  const copy = getRoleCopy();

  return (
    <div 
      className="auth-modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(17, 24, 39, 0.4)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1.25rem',
        overflowY: 'auto'
      }}
    >
      <div 
        className="auth-layout-container" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '880px',
          backgroundColor: '#F7F8F6',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E8E3',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'row',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: '#FFFFFF',
            border: '1px solid #E5E8E3',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            color: '#6B7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
        >
          <X size={16} />
        </button>

        {/* LEFT COLUMN: Brand & Product Introduction */}
        <div 
          className="auth-sidebar"
          style={{
            flex: '1 1 42%',
            backgroundColor: '#123B2A',
            color: '#FFFFFF',
            padding: '2.5rem 2.25rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
              <img 
                src="/favicon.png" 
                alt="MessWise Logo" 
                style={{ width: '36px', height: '36px', objectFit: 'contain' }} 
              />
              <div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                  MessWise
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 500 }}>
                  {copy.portalName}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.35, marginBottom: '0.75rem' }}>
              Smart campus food management
            </div>

            <p style={{ fontSize: '0.875rem', color: '#D1D5DB', lineHeight: 1.55, margin: '0 0 2rem 0' }}>
              {copy.intro}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#E5E7EB' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Reduce food waste across campus dining halls</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#E5E7EB' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Predict meal demand and optimize kitchen production</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#E5E7EB' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Redistribute surplus to verified community shelters</span>
              </div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: '#9CA3AF', borderTop: '1px solid rgba(255,255,255,0.12)', paddingTop: '1.25rem', marginTop: '2rem' }}>
            MessWise Campus Platform • Version 1.0
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication Card */}
        <div 
          className="auth-card-wrapper"
          style={{
            flex: '1 1 58%',
            padding: '2.5rem 2.5rem 2rem',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          {/* Subtle Segmented Portal Switcher */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 500, marginBottom: '0.4rem' }}>
              Sign in as:
            </div>
            <div style={{
              display: 'inline-flex',
              backgroundColor: '#F3F4F6',
              padding: '3px',
              borderRadius: '8px',
              border: '1px solid #E5E8E3'
            }}>
              <button
                type="button"
                onClick={() => { setRole('student'); setError(null); setFieldErrors({}); }}
                style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: role === 'student' ? '#FFFFFF' : 'transparent',
                  color: role === 'student' ? '#123B2A' : '#6B7280',
                  fontWeight: role === 'student' ? 600 : 500,
                  fontSize: '0.8rem',
                  boxShadow: role === 'student' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setError(null); setFieldErrors({}); }}
                style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: role === 'admin' ? '#FFFFFF' : 'transparent',
                  color: role === 'admin' ? '#123B2A' : '#6B7280',
                  fontWeight: role === 'admin' ? 600 : 500,
                  fontSize: '0.8rem',
                  boxShadow: role === 'admin' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => { setRole('ngo'); setError(null); setFieldErrors({}); }}
                style={{
                  padding: '4px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: role === 'ngo' ? '#FFFFFF' : 'transparent',
                  color: role === 'ngo' ? '#123B2A' : '#6B7280',
                  fontWeight: role === 'ngo' ? 600 : 500,
                  fontSize: '0.8rem',
                  boxShadow: role === 'ngo' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                NGO
              </button>
            </div>
          </div>

          {/* Card Header */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.02em'
            }}>
              Welcome back
            </h1>
            <p style={{
              fontSize: '0.9rem',
              color: '#4B5563',
              margin: 0,
              lineHeight: 1.45
            }}>
              {copy.subtitle}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              fontSize: '0.85rem',
              color: '#991B1B'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {/* Student Form */}
            {role === 'student' && (
              <>
                <div>
                  <label 
                    htmlFor="unified-student-enrollment"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Enrollment / Roll Number
                  </label>
                  <input
                    id="unified-student-enrollment"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="e.g. 2022CSB042"
                    value={studentForm.enrollment_no}
                    onChange={(e) => {
                      setStudentForm({ ...studentForm, enrollment_no: e.target.value });
                      if (fieldErrors.enrollment_no) setFieldErrors({ ...fieldErrors, enrollment_no: null });
                    }}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${fieldErrors.enrollment_no ? '#DC2626' : '#D8DED9'}`,
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.935rem',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#123B2A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors.enrollment_no ? '#DC2626' : '#D8DED9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {fieldErrors.enrollment_no && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.enrollment_no}
                    </span>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="unified-student-father"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Father's Name (Verification)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="unified-student-father"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="e.g. Ramesh Sharma"
                      value={studentForm.father_name}
                      onChange={(e) => {
                        setStudentForm({ ...studentForm, father_name: e.target.value });
                        if (fieldErrors.father_name) setFieldErrors({ ...fieldErrors, father_name: null });
                      }}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 2.75rem 0 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${fieldErrors.father_name ? '#DC2626' : '#D8DED9'}`,
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.935rem',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#123B2A';
                        e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldErrors.father_name ? '#DC2626' : '#D8DED9';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide verification details' : 'Show verification details'}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.father_name && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.father_name}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Admin Form */}
            {role === 'admin' && (
              <>
                <div>
                  <label 
                    htmlFor="unified-admin-username"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Admin ID / Username
                  </label>
                  <input
                    id="unified-admin-username"
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="e.g. admin"
                    value={adminForm.username}
                    onChange={(e) => {
                      setAdminForm({ ...adminForm, username: e.target.value });
                      if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: null });
                    }}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${fieldErrors.username ? '#DC2626' : '#D8DED9'}`,
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.935rem',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#123B2A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors.username ? '#DC2626' : '#D8DED9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {fieldErrors.username && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.username}
                    </span>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="unified-admin-password"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="unified-admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={adminForm.password}
                      onChange={(e) => {
                        setAdminForm({ ...adminForm, password: e.target.value });
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                      }}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 2.75rem 0 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${fieldErrors.password ? '#DC2626' : '#D8DED9'}`,
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.935rem',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#123B2A';
                        e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldErrors.password ? '#DC2626' : '#D8DED9';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* NGO Form */}
            {role === 'ngo' && (
              <>
                <div>
                  <label 
                    htmlFor="unified-ngo-email"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Registered Email
                  </label>
                  <input
                    id="unified-ngo-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="e.g. helpinghands@ngo.org"
                    value={ngoForm.email}
                    onChange={(e) => {
                      setNgoForm({ ...ngoForm, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
                    }}
                    style={{
                      width: '100%',
                      height: '46px',
                      padding: '0 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${fieldErrors.email ? '#DC2626' : '#D8DED9'}`,
                      backgroundColor: '#FFFFFF',
                      fontSize: '0.935rem',
                      color: '#111827',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#123B2A';
                      e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = fieldErrors.email ? '#DC2626' : '#D8DED9';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  {fieldErrors.email && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div>
                  <label 
                    htmlFor="unified-ngo-password"
                    style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#374151', marginBottom: '0.35rem' }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="unified-ngo-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      value={ngoForm.password}
                      onChange={(e) => {
                        setNgoForm({ ...ngoForm, password: e.target.value });
                        if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
                      }}
                      style={{
                        width: '100%',
                        height: '46px',
                        padding: '0 2.75rem 0 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${fieldErrors.password ? '#DC2626' : '#D8DED9'}`,
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.935rem',
                        color: '#111827',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#123B2A';
                        e.target.style.boxShadow = '0 0 0 3px rgba(18, 59, 42, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = fieldErrors.password ? '#DC2626' : '#D8DED9';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#6B7280',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#DC2626', marginTop: '0.25rem' }}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Remember Me & Forgot Password */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', color: '#4B5563' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#123B2A', width: '16px', height: '16px', borderRadius: '4px' }}
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => alert('Please contact the system administrator to reset credentials.')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.82rem',
                  color: '#123B2A',
                  cursor: 'pointer',
                  fontWeight: 500,
                  textDecoration: 'underline'
                }}
              >
                Forgot credentials?
              </button>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                height: '46px',
                backgroundColor: '#123B2A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.25rem',
                opacity: loading ? 0.75 : 1,
                transition: 'background-color 0.15s ease'
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#0E2E20'; }}
              onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#123B2A'; }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Secondary Subtle Demo Account Helper */}
          <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={handleUseDemo}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.25rem 0.5rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              <Sparkles size={13} />
              <span>{copy.demoLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLoginModal;

import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { authApi } from '../api/client';

const StudentLogin = ({ isOpen, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [form, setForm] = useState({ 
    enrollment_no: '', 
    father_name: '' 
  });
  const [fieldErrors, setFieldErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!form.enrollment_no.trim()) {
      errs.enrollment_no = 'Enrollment number is required.';
    }
    if (!form.father_name.trim()) {
      errs.father_name = 'Verification details are required.';
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
      const res = await authApi.loginStudent(form.enrollment_no.trim(), form.father_name.trim());
      if (res?.access_token) {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
        onClose();
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.detail || err?.message || 'Invalid enrollment number or verification details.';
      setError(typeof msg === 'string' ? msg : 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setForm({ enrollment_no: '2022CSB042', father_name: 'Ramesh Sharma' });
    setFieldErrors({});
    setError(null);
  };

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
            {/* MessWise Logo & Title */}
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
                  Student Portal
                </div>
              </div>
            </div>

            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', lineHeight: 1.35, marginBottom: '0.75rem' }}>
              Smart campus food management
            </div>

            <p style={{ fontSize: '0.875rem', color: '#D1D5DB', lineHeight: 1.55, margin: '0 0 2rem 0' }}>
              Empowering students to plan meals responsibly, eliminate cafeteria waste, and track campus sustainability.
            </p>

            {/* Core Value Props */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#E5E7EB' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Instant meal booking & QR dining passes</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#E5E7EB' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Daily hostel menus and nutritional ratings</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.65rem', fontSize: '0.85rem', color: '#34D399' }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>Personal carbon footprint & eco scoreboard</span>
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
          {/* Subtle Portal Selector */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: '#eff6ff',
              color: '#1e40af',
              fontWeight: 700,
              fontSize: '0.78rem',
              border: '1px solid #bfdbfe'
            }}>
              Student Dining Portal
            </span>
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
              Sign in to your student account to continue.
            </p>
          </div>

          {/* Form Error Banner */}
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
            {/* Enrollment / Roll Number */}
            <div>
              <label 
                htmlFor="student-enrollment"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '0.35rem'
                }}
              >
                Enrollment / Roll Number
              </label>
              <input
                id="student-enrollment"
                type="text"
                autoComplete="username"
                required
                placeholder="e.g. 2022CSB042"
                value={form.enrollment_no}
                onChange={(e) => {
                  setForm({ ...form, enrollment_no: e.target.value });
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
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
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

            {/* Father's Name / Verification */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label 
                  htmlFor="student-father-name"
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: '#374151'
                  }}
                >
                  Father's Name (Verification)
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="student-father-name"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  placeholder="e.g. Ramesh Sharma"
                  value={form.father_name}
                  onChange={(e) => {
                    setForm({ ...form, father_name: e.target.value });
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
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
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

            {/* Remember Me & Forgot Link */}
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
                onClick={() => alert('Please contact your hostel warden or mess administrator to update registered credentials.')}
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
              <span>Use demo account (Nitin Sharma)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;

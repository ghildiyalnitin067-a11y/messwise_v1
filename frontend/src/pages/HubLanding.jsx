import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Utensils, 
  ChefHat, 
  HeartHandshake, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  CheckCircle2,
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';
import { useMesswise } from '../context/MesswiseContext';
import LoginModal from '../components/LoginModal';

const HubLanding = () => {
  const { adminStats, refreshData } = useMesswise();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-canvas)', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Enterprise SaaS Navbar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--brand-900)',
              color: '#ffffff',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Utensils size={20} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--brand-900)', lineHeight: 1.1 }}>
                MessWise
              </h1>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Campus Food Demand & Redistribution Management System
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> FSSAI Compliance Verified
            </span>
            <button
              onClick={() => setShowLogin(true)}
              className="btn btn-primary btn-sm"
            >
              <Lock size={13} /> Portal Sign In
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section style={{
          backgroundColor: 'var(--brand-900)',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
          border: '1px solid var(--brand-950)',
          boxShadow: 'var(--shadow-md)',
          marginBottom: '2rem',
        }}>
          <div style={{ maxWidth: '720px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              padding: '0.25rem 0.65rem',
              borderRadius: 'var(--radius-xs)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#dcfce7',
              marginBottom: '1rem',
              letterSpacing: '0.04em'
            }}>
              <Leaf size={13} /> CAMPUS FOOD WASTE REDUCTION PLATFORM
            </div>
            
            <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.25, color: '#ffffff', marginBottom: '0.75rem' }}>
              Demand Calibration & Food Rescue Operations
            </h2>
            
            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              MessWise interconnects hostel dining boarders, central kitchen supervisors, and accredited NGO networks to accurately forecast attendance, reduce safety buffer waste, and streamline surplus redistribution.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href={import.meta.env.VITE_STUDENT_PORTAL_URL || '/student'} className="btn btn-warm">
                <Utensils size={15} /> Student Meal RSVPs
              </a>
              <a href={import.meta.env.VITE_ADMIN_PORTAL_URL || '/admin'} className="btn btn-secondary">
                <ChefHat size={15} /> Mess Operations Hub
              </a>
              <a href={import.meta.env.VITE_NGO_PORTAL_URL || '/ngo'} className="btn btn-secondary">
                <HeartHandshake size={15} /> NGO Rescue Feed
              </a>
            </div>
          </div>
        </section>

        {/* Live Ecosystem Summary Strip */}
        <div className="kpi-strip" style={{ marginBottom: '2rem' }}>
          <div className="kpi-card">
            <div>
              <div className="kpi-label">Meals Cooked Today</div>
              <div className="kpi-value">{adminStats?.today_stats?.prepared || 842}</div>
              <div className="kpi-meta">Across Aryabhatta dining halls</div>
            </div>
            <div className="kpi-icon brand">
              <ChefHat size={18} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">Student RSVPs</div>
              <div className="kpi-value">{adminStats?.active_rsvps || 598}</div>
              <div className="kpi-meta">92% attendance accuracy</div>
            </div>
            <div className="kpi-icon brand">
              <CheckCircle2 size={18} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">Surplus Diverted</div>
              <div className="kpi-value">65 Meals</div>
              <div className="kpi-meta">Hot holding monitored</div>
            </div>
            <div className="kpi-icon warm">
              <Sparkles size={18} />
            </div>
          </div>

          <div className="kpi-card">
            <div>
              <div className="kpi-label">CO₂ Offset</div>
              <div className="kpi-value">648 kg</div>
              <div className="kpi-meta">Environmental impact</div>
            </div>
            <div className="kpi-icon brand">
              <Leaf size={18} />
            </div>
          </div>
        </div>

        {/* Workspace Gateway Grid */}
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} /> Access Role Workspaces
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          
          {/* Card 1: Student Portal */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
            <div className="panel-body">
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'var(--brand-50)',
                color: 'var(--brand-900)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--brand-100)'
              }}>
                <Utensils size={20} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Student Dining Portal
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                Confirm or cancel daily meal attendance, review weekly schedules, generate QR digital tokens, and monitor personal eco scores.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <li>• 1-Click meal opt-in & opt-out</li>
                <li>• Chef quality & portion feedback</li>
                <li>• Real-time digital pass verification</li>
              </ul>
            </div>
            <div className="panel-header" style={{ backgroundColor: 'var(--bg-canvas-subtle)' }}>
              <a href={import.meta.env.VITE_STUDENT_PORTAL_URL || '/student'} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Enter Student Portal <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 2: Admin Portal */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
            <div className="panel-body">
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'var(--accent-warm-subtle)',
                color: 'var(--accent-warm)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--accent-warm-border)'
              }}>
                <ChefHat size={20} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                Mess Operations Hub
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                Calibrate daily batch quantities against forecast models, log plate waste, broadcast edible surplus, and verify NGO 4-digit OTP collections.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <li>• Demand forecasting models</li>
                <li>• Daily production & leftover tracking</li>
                <li>• OTP-verified surplus handover</li>
              </ul>
            </div>
            <div className="panel-header" style={{ backgroundColor: 'var(--bg-canvas-subtle)' }}>
              <a href={import.meta.env.VITE_ADMIN_PORTAL_URL || '/admin'} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Enter Operations Hub <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Card 3: NGO Portal */}
          <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginBottom: 0 }}>
            <div className="panel-body">
              <div style={{
                width: '38px',
                height: '38px',
                backgroundColor: 'var(--bg-canvas-subtle)',
                color: 'var(--text-primary)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <HeartHandshake size={20} />
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                NGO Food Rescue Network
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
                Monitor live surplus notifications, dispatch rescue vehicles to campus loading bays, and submit shelter distribution logs.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                <li>• Real-time edible food surplus feed</li>
                <li>• Instant driver claim assignment</li>
                <li>• Verified community shelter proofs</li>
              </ul>
            </div>
            <div className="panel-header" style={{ backgroundColor: 'var(--bg-canvas-subtle)' }}>
              <a href={import.meta.env.VITE_NGO_PORTAL_URL || '/ngo'} className="btn btn-primary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                Enter NGO Portal <ArrowRight size={14} />
              </a>
            </div>
          </div>

        </div>

      </div>

      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onLoginSuccess={() => refreshData()}
      />
    </div>
  );
};

export default HubLanding;

import React from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  LogOut,
  Bike
} from 'lucide-react';
import { authApi } from '../api/client';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <aside className="portal-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <ChefHat size={18} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h2>MessWise</h2>
          <span className="brand-badge">Supervisor Hub</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Operations</div>
        
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <div className="nav-label">
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'greenroute' ? 'active' : ''}`}
          onClick={() => onTabChange('greenroute')}
        >
          <div className="nav-label">
            <Bike size={16} />
            <span>GreenRoute Fleet</span>
          </div>
          <span className="nav-badge">Live</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'production' ? 'active' : ''}`}
          onClick={() => onTabChange('production')}
        >
          <div className="nav-label">
            <ChefHat size={16} />
            <span>Batch Production</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'forecast' ? 'active' : ''}`}
          onClick={() => onTabChange('forecast')}
        >
          <div className="nav-label">
            <TrendingUp size={16} />
            <span>Demand Forecast</span>
          </div>
          <span className="nav-badge">94%</span>
        </button>

        <div className="nav-section-title" style={{ marginTop: '0.5rem' }}>Redistribution</div>

        <button
          className={`nav-item ${activeTab === 'surplus' ? 'active' : ''}`}
          onClick={() => onTabChange('surplus')}
        >
          <div className="nav-label">
            <Sparkles size={16} />
            <span>Surplus Broadcast</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'handovers' ? 'active' : ''}`}
          onClick={() => onTabChange('handovers')}
        >
          <div className="nav-label">
            <ShieldCheck size={16} />
            <span>Handover Verification</span>
          </div>
        </button>
      </div>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '0 0.5rem' }}>
          Switch Workspaces
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <a
            href="http://localhost:3001"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'center' }}
          >
            Student
          </a>
          <a
            href="http://localhost:3003"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.75rem', justifyContent: 'center' }}
          >
            NGO
          </a>
        </div>

        <div className="user-mini-card">
          <div className="user-mini-info">
            <div className="user-avatar">RK</div>
            <div>
              <div className="user-name">Rajesh Kumar</div>
              <div className="user-sub">Hostel A Central Mess</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

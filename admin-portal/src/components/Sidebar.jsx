import React from 'react';
import { 
  LayoutDashboard, 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  LogOut,
  Bike
  Boxes,
  Trophy,
  Utensils,
  Droplets,
  ThumbsUp,
  BarChart3
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
          className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => onTabChange('analytics')}
        >
          <div className="nav-label">
            <BarChart3 size={16} />
            <span>Analytics & Sustainability</span>
          </div>
          <span className="nav-badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 800 }}>Intelligence</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => onTabChange('preferences')}
        >
          <div className="nav-label">
            <ThumbsUp size={16} />
            <span>Student Preferences</span>
          </div>
          <span className="nav-badge" style={{ background: '#fef3c7', color: '#b45309', fontWeight: 800 }}>Zero-Waste</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => onTabChange('menu')}
        >
          <div className="nav-label">
            <Utensils size={16} />
            <span>Daily Menu Operations</span>
          </div>
          <span className="nav-badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 800 }}>Live Sync</span>
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
          className={`nav-item ${activeTab === 'stock' ? 'active' : ''}`}
          onClick={() => onTabChange('stock')}
        >
          <div className="nav-label">
            <Boxes size={16} />
            <span>Stock Health</span>
          </div>
          <span className="nav-badge" style={{ background: '#fef3c7', color: '#92400e' }}>FIFO</span>
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

        <button
          className={`nav-item ${activeTab === 'uco' ? 'active' : ''}`}
          onClick={() => onTabChange('uco')}
        >
          <div className="nav-label">
            <Droplets size={16} />
            <span>Used Cooking Oil</span>
          </div>
          <span className="nav-badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 800 }}>Eco Net</span>
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

        <div className="nav-section-title" style={{ marginTop: '0.5rem' }}>Campus Engagement</div>

        <button
          className={`nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => onTabChange('leaderboard')}
        >
          <div className="nav-label">
            <Trophy size={16} />
            <span>Student Eco Leaders</span>
          </div>
          <span className="nav-badge" style={{ background: '#dcfce7', color: '#166534', fontWeight: 800 }}>Eco Pts</span>
        </button>
      </div>

      <div className="sidebar-footer">

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

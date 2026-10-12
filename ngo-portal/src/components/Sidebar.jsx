import React from 'react';
import { 
  LayoutDashboard, 
  Utensils, 
  Truck, 
  HeartHandshake, 
  LogOut 
} from 'lucide-react';
import { authApi } from '../api/client';

const Sidebar = ({ activeTab, onTabChange }) => {
  return (
    <aside className="portal-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <HeartHandshake size={18} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h2>MessWise</h2>
          <span className="brand-badge">NGO Rescue</span>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-title">Rescue Logistics</div>
        
        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => onTabChange('dashboard')}
        >
          <div className="nav-label">
            <LayoutDashboard size={16} />
            <span>Surplus Live Feed</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => onTabChange('catalog')}
        >
          <div className="nav-label">
            <Utensils size={16} />
            <span>Campus Dining Hall Feed</span>
          </div>
        </button>

        <button
          className={`nav-item ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => onTabChange('requests')}
        >
          <div className="nav-label">
            <Truck size={16} />
            <span>Active Pickups</span>
          </div>
          <span className="nav-badge">Live</span>
        </button>

        <div className="nav-section-title" style={{ marginTop: '0.5rem' }}>Accountability</div>

        <button
          className={`nav-item ${activeTab === 'distribution' ? 'active' : ''}`}
          onClick={() => onTabChange('distribution')}
        >
          <div className="nav-label">
            <HeartHandshake size={16} />
            <span>Distribution Logs</span>
          </div>
        </button>
      </div>

      <div className="sidebar-footer">

        <div className="user-mini-card">
          <div className="user-mini-info">
            <div className="user-avatar">HH</div>
            <div>
              <div className="user-name">Helping Hands NGO</div>
              <div className="user-sub">Verified Partner #8841</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

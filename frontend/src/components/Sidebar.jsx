import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Utensils, 
  CalendarCheck, 
  TrendingUp, 
  HeartHandshake, 
  Award, 
  ShieldCheck, 
  Truck, 
  ChefHat, 
  LayoutDashboard,
  LogOut,
  Sparkles,
  Layers,
  User,
  Trophy,
  Droplets,
  ThumbsUp,
  Bike
} from 'lucide-react';
import { authApi } from '../api/client';

const Sidebar = ({ role = 'student', activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const studentMain = [
    { id: 'dashboard', label: 'RSVP & Today\'s Meals', icon: LayoutDashboard },
    { id: 'preferences', label: 'Meal Preferences', icon: ThumbsUp, badge: '+15 Pts' },
    { id: 'menu', label: 'Weekly Dining Menu', icon: Utensils },
    { id: 'history', label: 'Booking Passes', icon: CalendarCheck },
  ];
  const studentSecondary = [
    { id: 'leaderboard', label: 'Eco Leaderboard', icon: Trophy, badge: 'Top 5' },
    { id: 'impact', label: 'Eco Impact & Ranking', icon: Award },
  ];

  const adminMain = [
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'preferences', label: 'Student Preferences', icon: ThumbsUp, badge: 'Zero-Waste' },
    { id: 'menu', label: 'Daily Menu Operations', icon: Utensils, badge: 'Live Sync' },
    { id: 'greenroute', label: 'GreenRoute Dispatches', icon: Bike, badge: 'Live' },
    { id: 'production', label: 'Batch Production Logs', icon: ChefHat },
    { id: 'forecast', label: 'Demand Forecasting', icon: TrendingUp, badge: '94%' },
    { id: 'uco', label: 'Used Cooking Oil', icon: Droplets, badge: 'Eco Net' },
  ];
  const adminSecondary = [
    { id: 'surplus', label: 'Surplus Food Queue', icon: Sparkles },
    { id: 'handovers', label: 'OTP Verification', icon: ShieldCheck },
    { id: 'leaderboard', label: 'Student Eco Leaders', icon: Trophy },
  ];

  const ngoMain = [
    { id: 'dashboard', label: 'Available Surplus', icon: LayoutDashboard },
    { id: 'catalog', label: 'Dining Hall Catalog', icon: Utensils },
    { id: 'requests', label: 'Pickup Logistics', icon: Truck, badge: 'Live' },
  ];
  const ngoSecondary = [
    { id: 'distribution', label: 'Distribution Logs', icon: HeartHandshake },
  ];

  const mainLinks = role === 'admin' ? adminMain : role === 'ngo' ? ngoMain : studentMain;
  const secondaryLinks = role === 'admin' ? adminSecondary : role === 'ngo' ? ngoSecondary : studentSecondary;

  const roleMeta = {
    student: { title: 'MessWise', badge: 'Student Portal', user: 'Nitin Sharma', sub: 'Hostel A • Room B-304', initial: 'NS' },
    admin: { title: 'MessWise', badge: 'Supervisor Hub', user: 'Rajesh Kumar', sub: 'Hostel A Central Mess', initial: 'RK' },
    ngo: { title: 'MessWise', badge: 'NGO Partner', user: 'Helping Hands NGO', sub: 'Verified Shelter Partner', initial: 'HH' },
  }[role];

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/');
  };

  return (
    <aside className="portal-sidebar">
      <Link to="/" className="sidebar-brand">
        <div className="brand-icon">
          <Utensils size={18} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h2>{roleMeta.title}</h2>
          <span className="brand-badge">{roleMeta.badge}</span>
        </div>
      </Link>

      <div className="sidebar-nav">
        <div className="nav-section-title">Operations</div>
        {mainLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-label">
                <Icon size={16} strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}

        <div className="nav-section-title" style={{ marginTop: '0.5rem' }}>Management</div>
        {secondaryLinks.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(item.id)}
            >
              <span className="nav-label">
                <Icon size={16} strokeWidth={isActive ? 2.4 : 2} />
                <span>{item.label}</span>
              </span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <Link to="/" className="nav-item" style={{ padding: '0.45rem 0.65rem' }}>
          <span className="nav-label">
            <Layers size={16} />
            <span>Switch Portal Hub</span>
          </span>
        </Link>

        <div className="user-mini-card">
          <div className="user-mini-info">
            <div className="user-avatar">{roleMeta.initial}</div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name">{roleMeta.user}</div>
              <div className="user-sub">{roleMeta.sub}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '0.2rem',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

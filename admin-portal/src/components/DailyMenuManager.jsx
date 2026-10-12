import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Clock, 
  PlusCircle, 
  CheckCircle2, 
  Edit3, 
  Sparkles, 
  Coffee, 
  Sun, 
  Moon, 
  Sunrise, 
  Check, 
  Leaf, 
  Send,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../api/client';

const SESSION_META = {
  breakfast: {
    label: 'Breakfast',
    icon: Sunrise,
    defaultTime: '7:00 AM - 9:00 AM',
    defaultDeadline: '6:30 AM',
    color: '#d97706',
    bgColor: '#fef3c7',
    badge: 'Morning Session',
  },
  lunch: {
    label: 'Lunch',
    icon: Sun,
    defaultTime: '12:00 PM - 2:00 PM',
    defaultDeadline: '10:30 AM',
    color: '#047857',
    bgColor: '#d1fae5',
    badge: 'Peak Dining Session',
  },
  snacks: {
    label: 'Snacks / High Tea',
    icon: Coffee,
    defaultTime: '4:30 PM - 6:00 PM',
    defaultDeadline: '3:30 PM',
    color: '#b45309',
    bgColor: '#ffedd5',
    badge: 'Evening Session',
  },
  dinner: {
    label: 'Dinner',
    icon: Moon,
    defaultTime: '7:30 PM - 9:30 PM',
    defaultDeadline: '5:30 PM',
    color: '#4338ca',
    bgColor: '#e0e7ff',
    badge: 'Night Session',
  },
};

const DailyMenuManager = ({ onMenuPushed }) => {
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('push'); // 'push' (append) or 'edit' (replace)
  const [targetSession, setTargetSession] = useState('snacks');
  const [dishInput, setDishInput] = useState('');
  const [timeWindowInput, setTimeWindowInput] = useState('4:30 PM - 6:00 PM');
  const [deadlineInput, setDeadlineInput] = useState('3:30 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getMenu();
      if (res?.sessions) {
        setMenuData(res);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sessionKey, mode = 'push') => {
    const meta = SESSION_META[sessionKey] || SESSION_META.lunch;
    const currentSessionData = menuData?.sessions?.[sessionKey];

    setTargetSession(sessionKey);
    setModalMode(mode);
    setDishInput(mode === 'edit' ? currentSessionData?.menu || '' : '');
    setTimeWindowInput(currentSessionData?.time_window || meta.defaultTime);
    setDeadlineInput(currentSessionData?.deadline || meta.defaultDeadline);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dishInput.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        session: targetSession,
        menu: dishInput.trim(),
        time_window: timeWindowInput,
        deadline: deadlineInput,
        append_dish: modalMode === 'push',
      };

      const res = await adminApi.updateMenu(payload);
      if (res?.sessions) {
        setMenuData(res);
      } else {
        await loadMenu();
      }

      const sessionLabel = SESSION_META[targetSession]?.label || targetSession;
      const successText = modalMode === 'push'
        ? `✨ Added "${dishInput.trim()}" to ${sessionLabel} menu! Live on Student Portal.`
        : `✅ Updated ${sessionLabel} menu! Live on Student Portal.`;

      setToastMsg(successText);
      setShowModal(false);
      setDishInput('');

      if (onMenuPushed) onMenuPushed();
      setTimeout(() => setToastMsg(null), 4500);
    } catch {
      setToastMsg('Failed to update menu.');
      setTimeout(() => setToastMsg(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessions = ['breakfast', 'lunch', 'snacks', 'dinner'];

  return (
    <div className="daily-menu-manager" style={{ marginTop: '0.5rem' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            background: '#dcfce7',
            border: '1px solid #86efac',
            color: '#14532d',
            padding: '0.85rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.25rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          <CheckCircle2 size={18} color="#16a34a" /> {toastMsg}
        </div>
      )}

      {/* Header bar */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d6e2d4',
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '2px 3px 0px rgba(40, 62, 46, 0.08)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Utensils size={18} color="#283e2e" />
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.35rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
              Daily Dining Menu Operations
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#55685a', margin: 0 }}>
            {menuData?.date || 'Today'} • All changes sync instantaneously to student portals & digital pass QR tokens.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={loadMenu}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Refresh from server"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal('snacks', 'push')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={15} /> + Push Food to Menu
          </button>
        </div>
      </div>

      {/* 4 Sessions Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {sessions.map((sessKey) => {
          const meta = SESSION_META[sessKey] || SESSION_META.lunch;
          const Icon = meta.icon;
          const data = menuData?.sessions?.[sessKey];
          const menuText = data?.menu || 'Special Dining Dish (Pending Supervisor Log)';
          const timeWindow = data?.time_window || meta.defaultTime;
          const deadline = data?.deadline || meta.defaultDeadline;
          const rsvps = data?.rsvps_count || 0;
          const addons = data?.addons || [];

          return (
            <div
              key={sessKey}
              style={{
                background: '#ffffff',
                border: '1px solid #d6e2d4',
                borderRadius: '16px',
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '3px 4px 0px #283e2e',
                position: 'relative',
                transition: 'all 0.18s ease',
              }}
            >
              <div>
                {/* Session Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: meta.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} color={meta.color} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
                        {meta.label}
                      </h3>
                      <span style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>
                        {meta.badge}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      border: '1px solid #a7f3d0',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '0.2rem 0.55rem',
                      borderRadius: '999px',
                    }}
                  >
                    ● RSVP Open
                  </span>
                </div>

                {/* Serving Window & Deadline */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem',
                    background: '#f8faf5',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    color: '#44684f',
                    marginBottom: '0.85rem',
                    border: '1px solid #e2ece4',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={13} color="#283e2e" />
                    <span><strong>Serving:</strong> {timeWindow}</span>
                  </div>
                  <span>•</span>
                  <div><strong>Cutoff:</strong> {deadline}</div>
                </div>

                {/* Current Menu Content */}
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#748879' }}>
                    Current Menu Items
                  </span>
                  <div
                    style={{
                      fontSize: '0.96rem',
                      fontWeight: 700,
                      color: '#1d3324',
                      lineHeight: 1.45,
                      marginTop: '0.25rem',
                      background: '#fcfdfa',
                      padding: '0.75rem 0.85rem',
                      borderRadius: '10px',
                      border: '1px solid #eef3ec',
                      minHeight: '62px',
                    }}
                  >
                    {menuText}
                  </div>
                </div>

                {/* Active Add-On Badges */}
                {addons.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    {addons.map((a) => (
                      <div
                        key={a.addon_id}
                        style={{
                          background: '#f0fdf4',
                          border: '1px solid #86efac',
                          borderRadius: '8px',
                          padding: '0.4rem 0.65rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontSize: '0.76rem',
                          color: '#166534',
                          fontWeight: 700,
                        }}
                      >
                        <Leaf size={12} color="#15803d" />
                        <span>Zero-Waste Special: {a.name} (+{a.eco_points} pts)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Live RSVPs & Action Buttons */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid #eef3ec',
                    marginBottom: '0.85rem',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ color: '#55685a' }}>Student Bookings:</span>
                  <span style={{ fontWeight: 800, color: '#1d3324' }}>
                    {rsvps} Boarders Active
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleOpenModal(sessKey, 'push')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <PlusCircle size={13} /> + Push Dish
                  </button>
                  <button
                    onClick={() => handleOpenModal(sessKey, 'edit')}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                  >
                    <Edit3 size={13} /> Edit Menu
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Push / Edit Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 46, 32, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #d6e2d4',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Utensils size={18} color="#283e2e" />
                <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
                  {modalMode === 'push' ? 'Push Food Item to Menu' : 'Update Session Menu'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: '#f0f5f1',
                  border: 'none',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontWeight: 800,
                  color: '#55685a',
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* 1. Meal Session Selector */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.45rem' }}>
                  Target Meal Session
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                  {sessions.map((sKey) => {
                    const isSelected = targetSession === sKey;
                    const meta = SESSION_META[sKey];
                    return (
                      <button
                        key={sKey}
                        type="button"
                        onClick={() => {
                          setTargetSession(sKey);
                          setTimeWindowInput(meta.defaultTime);
                          setDeadlineInput(meta.defaultDeadline);
                        }}
                        style={{
                          border: isSelected ? '2px solid #283e2e' : '1px solid #d6e2d4',
                          background: isSelected ? '#eaf2ec' : '#ffffff',
                          color: isSelected ? '#1d3324' : '#55685a',
                          padding: '0.55rem 0.25rem',
                          borderRadius: '10px',
                          fontSize: '0.78rem',
                          fontWeight: isSelected ? 800 : 600,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.2rem',
                        }}
                      >
                        {(() => {
                          const SIcon = SESSION_META[sKey]?.icon || Utensils;
                          return <SIcon size={16} color={isSelected ? '#1d3324' : '#55685a'} />;
                        })()}
                        <span>{sKey.slice(0, 1).toUpperCase() + sKey.slice(1)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Mode: Append (+) or Replace Full */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.45rem' }}>
                  Operation Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setModalMode('push')}
                    style={{
                      border: modalMode === 'push' ? '2px solid #283e2e' : '1px solid #d6e2d4',
                      background: modalMode === 'push' ? '#eaf2ec' : '#ffffff',
                      color: modalMode === 'push' ? '#1d3324' : '#55685a',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: modalMode === 'push' ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    ➕ Append Dish (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalMode('edit')}
                    style={{
                      border: modalMode === 'edit' ? '2px solid #283e2e' : '1px solid #d6e2d4',
                      background: modalMode === 'edit' ? '#eaf2ec' : '#ffffff',
                      color: modalMode === 'edit' ? '#1d3324' : '#55685a',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: modalMode === 'edit' ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    ✏️ Replace Full Menu
                  </button>
                </div>
              </div>

              {/* 3. Dish Content Input */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.35rem' }}>
                  {modalMode === 'push' ? 'Dish Name to Push' : 'Full Menu Dish Listing'}
                </label>
                <textarea
                  rows={2}
                  value={dishInput}
                  onChange={(e) => setDishInput(e.target.value)}
                  placeholder={
                    modalMode === 'push'
                      ? 'e.g. Veg Cutlet + Mint Chutney, Masala Dosa, Pav Bhaji...'
                      : 'e.g. Rajma + Jeera Rice + Roti + Salad + Gulab Jamun'
                  }
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid #d6e2d4',
                    fontFamily: 'inherit',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              {/* 4. Serving Hours & Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.3rem' }}>
                    Serving Window
                  </label>
                  <input
                    type="text"
                    value={timeWindowInput}
                    onChange={(e) => setTimeWindowInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #d6e2d4',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.3rem' }}>
                    RSVP Cutoff Deadline
                  </label>
                  <input
                    type="text"
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1px solid #d6e2d4',
                      fontSize: '0.84rem',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={14} /> {isSubmitting ? 'Syncing...' : 'Push to Student Portals'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMenuManager;

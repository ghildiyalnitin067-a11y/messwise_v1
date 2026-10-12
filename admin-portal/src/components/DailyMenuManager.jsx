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
  AlertCircle,
  Calendar,
  LayoutGrid,
  Table,
  Zap
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

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const QUICK_SUGGESTIONS = [
  'Fresh Gulab Jamun',
  'Paneer Butter Masala',
  'Veg Hakka Noodles',
  'Aloo Paratha + Curd',
  'Samosa + Mint Chutney',
  'Sweet Mango Lassi',
  'Fruit Custard',
  'Special Jeera Rice'
];

const DailyMenuManager = ({ onMenuPushed }) => {
  const [menuData, setMenuData] = useState(null);
  const [weeklyMenu, setWeeklyMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [viewTab, setViewTab] = useState('cards'); // 'cards' | 'table'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('push'); // 'push' (append) or 'edit' (replace)
  const [targetSession, setTargetSession] = useState('lunch');
  const [targetDay, setTargetDay] = useState('today'); // 'today' or day of week
  const [dishInput, setDishInput] = useState('');
  const [timeWindowInput, setTimeWindowInput] = useState('12:00 PM - 2:00 PM');
  const [deadlineInput, setDeadlineInput] = useState('10:30 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const [resDaily, resWeekly] = await Promise.allSettled([
        adminApi.getMenu(),
        adminApi.getWeeklyMenu()
      ]);

      if (resDaily.status === 'fulfilled' && resDaily.value?.sessions) {
        setMenuData(resDaily.value);
      }
      if (resWeekly.status === 'fulfilled' && resWeekly.value?.schedule) {
        setWeeklyMenu(resWeekly.value);
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (sessionKey = 'lunch', mode = 'push', day = 'today') => {
    const meta = SESSION_META[sessionKey] || SESSION_META.lunch;
    const currentSessionData = menuData?.sessions?.[sessionKey];

    setTargetSession(sessionKey);
    setTargetDay(day);
    setModalMode(mode);
    setDishInput(mode === 'edit' ? currentSessionData?.menu || '' : '');
    setTimeWindowInput(currentSessionData?.time_window || meta.defaultTime);
    setDeadlineInput(currentSessionData?.deadline || meta.defaultDeadline);
    setShowModal(true);
  };

  const handleApplySuggestion = (dish) => {
    if (modalMode === 'push') {
      setDishInput(dish);
    } else {
      setDishInput((prev) => (prev ? `${prev} + ${dish}` : dish));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!dishInput.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        session: targetSession,
        menu: dishInput.trim(),
        day: targetDay,
        time_window: timeWindowInput,
        deadline: deadlineInput,
        append_dish: modalMode === 'push',
      };

      const res = await adminApi.updateMenu(payload);
      if (res?.sessions) {
        setMenuData(res);
      }
      await loadMenu();

      const dayLabel = targetDay === 'today' ? 'Today' : targetDay;
      const sessionLabel = SESSION_META[targetSession]?.label || targetSession;
      const successText = modalMode === 'push'
        ? `✨ Added "${dishInput.trim()}" to ${dayLabel} ${sessionLabel} menu! Live on Student Portal Today's RSVP & Weekly Dining Schedule.`
        : `✅ Updated ${dayLabel} ${sessionLabel} menu! Live on Student Portal.`;

      setToastMsg(successText);
      setShowModal(false);
      setDishInput('');

      if (onMenuPushed) onMenuPushed();
      setTimeout(() => setToastMsg(null), 5000);
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
            animation: 'fadeIn 0.3s ease',
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
          padding: '1.4rem 1.6rem',
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
              Dining Menu Operations & Push Hub
            </h2>
          </div>
          <p style={{ fontSize: '0.86rem', color: '#55685a', margin: 0 }}>
            {menuData?.date || 'Today'} • All dishes pushed sync in real-time to student Today's RSVPs and Weekly Dining Schedule.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          {/* View Toggle */}
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              padding: '3px',
              borderRadius: '9px',
              border: '1px solid #cbd5e1',
            }}
          >
            <button
              type="button"
              onClick={() => setViewTab('cards')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: viewTab === 'cards' ? '#ffffff' : 'transparent',
                color: viewTab === 'cards' ? '#1d3324' : '#64748b',
                fontWeight: viewTab === 'cards' ? 800 : 600,
                fontSize: '0.78rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: viewTab === 'cards' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <LayoutGrid size={13} /> Session Cards
            </button>
            <button
              type="button"
              onClick={() => setViewTab('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                border: 'none',
                background: viewTab === 'table' ? '#ffffff' : 'transparent',
                color: viewTab === 'table' ? '#1d3324' : '#64748b',
                fontWeight: viewTab === 'table' ? 800 : 600,
                fontSize: '0.78rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '7px',
                cursor: 'pointer',
                boxShadow: viewTab === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Table size={13} /> Weekly Menu Table
            </button>
          </div>

          <button
            onClick={loadMenu}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            title="Refresh from server"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
          </button>
          <button
            onClick={() => handleOpenModal('lunch', 'push', 'today')}
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={15} /> + Push Food to Menu
          </button>
        </div>
      </div>

      {/* VIEW 1: 4 SESSIONS CARDS GRID */}
      {viewTab === 'cards' && (
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
                      ● RSVP Live
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#748879' }}>
                        Current Menu Items
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 700 }}>
                        Synced to Student Portal
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.96rem',
                        fontWeight: 700,
                        color: '#1d3324',
                        lineHeight: 1.45,
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
                      onClick={() => handleOpenModal(sessKey, 'push', 'today')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.78rem', justifyContent: 'center' }}
                    >
                      <PlusCircle size={13} /> + Push Dish
                    </button>
                    <button
                      onClick={() => handleOpenModal(sessKey, 'edit', 'today')}
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
      )}

      {/* VIEW 2: WEEKLY DINING SCHEDULE TABULAR VIEW */}
      {viewTab === 'table' && (
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #d6e2d4',
            borderRadius: '16px',
            padding: '1.25rem',
            marginBottom: '2rem',
            boxShadow: '3px 4px 0px rgba(40, 62, 46, 0.08)',
            overflowX: 'auto',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1d3324', margin: 0, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Table size={16} color="#283e2e" /> Weekly Dining Menu Schedule (Tabular Form)
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
                Click "+ Push" in any session cell to add dishes to that day's dining plan.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 700 }}>
                ● Today Live Row Highlighted
              </span>
            </div>
          </div>

          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 0.85rem', width: '130px', fontWeight: 800, color: '#334155' }}>Day / Date</th>
                <th style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#d97706' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sunrise size={13} /> Breakfast (7:00-9:00 AM)
                  </span>
                </th>
                <th style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#047857' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sun size={13} /> Lunch (12:00-2:00 PM)
                  </span>
                </th>
                <th style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#b45309' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Coffee size={13} /> Snacks (4:30-6:00 PM)
                  </span>
                </th>
                <th style={{ padding: '0.75rem 0.85rem', fontWeight: 800, color: '#4338ca' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Moon size={13} /> Dinner (7:30-9:30 PM)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {(weeklyMenu?.schedule || [
                { day: 'Monday', date: 'Mon', is_today: false, breakfast: 'Idli Sambhar + Coconut Chutney', lunch: 'Chole + Jeera Rice + Roti', snacks: 'Ginger Tea + Biscuits', dinner: 'Mix Dal + Sev Tamatar + Chapati' },
                { day: 'Tuesday', date: 'Tue (Today)', is_today: true, breakfast: menuData?.sessions?.breakfast?.menu || 'Poha + Boiled Eggs + Milk', lunch: menuData?.sessions?.lunch?.menu || 'Rajma + Jeera Rice + Roti + Salad', snacks: menuData?.sessions?.snacks?.menu || 'Samosa + Hot Masala Chai', dinner: menuData?.sessions?.dinner?.menu || 'Paneer Butter Masala + Roti' },
                { day: 'Wednesday', date: 'Wed', is_today: false, breakfast: 'Aloo Paratha + Curd', lunch: 'Kadhi Pakoda + Steamed Rice', snacks: 'Filter Coffee + Bun Maska', dinner: 'Egg Curry / Paneer Bhurji + Roti' },
                { day: 'Thursday', date: 'Thu', is_today: false, breakfast: 'Upma + Coconut Chutney', lunch: 'Dal Makhani + Tandoori Roti', snacks: 'Veg Samosa + Green Chutney', dinner: 'Veg Biryani + Cucumber Raita' },
                { day: 'Friday', date: 'Fri', is_today: false, breakfast: 'Puri Bhaji + Sooji Halwa', lunch: 'Sambar Rice + Beans Poriyal', snacks: 'Crispy Corn Chaat + Lemonade', dinner: 'Matar Paneer + Jeera Pulao' },
                { day: 'Saturday', date: 'Sat', is_today: false, breakfast: 'Masala Dosa + Sambhar', lunch: 'Moong Dal Khichdi + Papad', snacks: 'Aloo Bonda + Kadak Chai', dinner: 'Dal Tadka + Jeera Rice' },
                { day: 'Sunday', date: 'Sun', is_today: false, breakfast: 'Pav Bhaji + Fruit Juice', lunch: 'Special Dum Biryani Feast', snacks: 'Dhokla + Mint Chutney', dinner: 'Light Moong Khichdi + Curd' },
              ]).map((row, idx) => {
                const isToday = Boolean(row.is_today);
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: isToday ? '#f0fdf4' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Day Column */}
                    <td style={{ padding: '0.85rem', verticalAlign: 'top' }}>
                      <div style={{ fontWeight: 800, color: isToday ? '#15803d' : '#1e293b' }}>
                        {row.day}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {row.date}
                      </div>
                      {isToday && (
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            background: '#15803d',
                            color: '#ffffff',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '999px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                          }}
                        >
                          ● Live Today
                        </span>
                      )}
                    </td>

                    {/* Breakfast Cell */}
                    <td style={{ padding: '0.85rem', verticalAlign: 'top' }}>
                      <div style={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {isToday ? (menuData?.sessions?.breakfast?.menu || row.breakfast) : row.breakfast}
                      </div>
                      <button
                        onClick={() => handleOpenModal('breakfast', 'push', isToday ? 'today' : row.day)}
                        style={{
                          background: '#fef3c7',
                          border: '1px solid #fde68a',
                          color: '#92400e',
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Push Dish
                      </button>
                    </td>

                    {/* Lunch Cell */}
                    <td style={{ padding: '0.85rem', verticalAlign: 'top' }}>
                      <div style={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {isToday ? (menuData?.sessions?.lunch?.menu || row.lunch) : row.lunch}
                      </div>
                      <button
                        onClick={() => handleOpenModal('lunch', 'push', isToday ? 'today' : row.day)}
                        style={{
                          background: '#d1fae5',
                          border: '1px solid #a7f3d0',
                          color: '#065f46',
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Push Dish
                      </button>
                    </td>

                    {/* Snacks Cell */}
                    <td style={{ padding: '0.85rem', verticalAlign: 'top' }}>
                      <div style={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {isToday ? (menuData?.sessions?.snacks?.menu || row.snacks) : row.snacks}
                      </div>
                      <button
                        onClick={() => handleOpenModal('snacks', 'push', isToday ? 'today' : row.day)}
                        style={{
                          background: '#ffedd5',
                          border: '1px solid #fed7aa',
                          color: '#9a3412',
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Push Dish
                      </button>
                    </td>

                    {/* Dinner Cell */}
                    <td style={{ padding: '0.85rem', verticalAlign: 'top' }}>
                      <div style={{ color: '#1e293b', fontWeight: 600, marginBottom: '0.35rem' }}>
                        {isToday ? (menuData?.sessions?.dinner?.menu || row.dinner) : row.dinner}
                      </div>
                      <button
                        onClick={() => handleOpenModal('dinner', 'push', isToday ? 'today' : row.day)}
                        style={{
                          background: '#e0e7ff',
                          border: '1px solid #c7d2fe',
                          color: '#3730a3',
                          borderRadius: '6px',
                          padding: '0.2rem 0.5rem',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        + Push Dish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

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
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #d6e2d4',
              maxHeight: '90vh',
              overflowY: 'auto',
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
              {/* 1. Target Day Selector */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.45rem' }}>
                  Target Day Schedule
                </label>
                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
                  <button
                    type="button"
                    onClick={() => setTargetDay('today')}
                    style={{
                      border: targetDay === 'today' ? '2px solid #15803d' : '1px solid #d6e2d4',
                      background: targetDay === 'today' ? '#dcfce7' : '#ffffff',
                      color: targetDay === 'today' ? '#14532d' : '#55685a',
                      padding: '0.4rem 0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    ● Today (Live RSVP)
                  </button>
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setTargetDay(d)}
                      style={{
                        border: targetDay === d ? '2px solid #283e2e' : '1px solid #d6e2d4',
                        background: targetDay === d ? '#eaf2ec' : '#ffffff',
                        color: targetDay === d ? '#1d3324' : '#55685a',
                        padding: '0.4rem 0.65rem',
                        borderRadius: '8px',
                        fontSize: '0.78rem',
                        fontWeight: targetDay === d ? 800 : 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Meal Session Selector */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.45rem' }}>
                  Target Meal Session
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem' }}>
                  {sessions.map((sKey) => {
                    const isSelected = targetSession === sKey;
                    const meta = SESSION_META[sKey];
                    const SIcon = meta?.icon || Utensils;
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
                        <SIcon size={16} color={isSelected ? '#1d3324' : '#55685a'} />
                        <span>{sKey.slice(0, 1).toUpperCase() + sKey.slice(1)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Mode: Append (+) or Replace Full */}
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

              {/* Quick Suggestion Chips */}
              <div style={{ marginBottom: '1.15rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#283e2e', marginBottom: '0.35rem' }}>
                  ⚡ Quick Dish Inspiration (Click to Add):
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {QUICK_SUGGESTIONS.map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleApplySuggestion(sug)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #cbd5e1',
                        color: '#334155',
                        borderRadius: '999px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e2e8f0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8fafc';
                      }}
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Dish Content Input */}
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
                      ? 'e.g. Fresh Gulab Jamun, Veg Cutlet + Mint Chutney, Masala Dosa...'
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

              {/* 5. Serving Hours & Deadline */}
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
                  <Send size={14} /> {isSubmitting ? 'Syncing...' : 'Push to Student Portals & Weekly Menu'}
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

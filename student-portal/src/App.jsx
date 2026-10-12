import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  CalendarCheck, 
  Award, 
  Leaf, 
  Star, 
  QrCode, 
  Check, 
  Sparkles, 
  Clock, 
  Send,
  LogOut,
  LogIn,
  CheckCircle2,
  PlusCircle,
  Trophy,
  ThumbsUp,
  Sun,
  SunMedium,
  Coffee,
  Moon,
  Megaphone,
  AlertTriangle,
  CloudRain,
  Calendar,
  Table,
  LayoutGrid,
  RefreshCw,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import TicketModal from './components/TicketModal';
import LoginModal from './components/LoginModal';
import EcoLeaderboard from './components/EcoLeaderboard';
import StudentPreferenceManager from './components/StudentPreferenceManager';
import { studentApi, authApi, subscribeToPointsEarned } from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [rsvpViewMode, setRsvpViewMode] = useState('cards'); // 'cards' | 'table'
  const [selectedTicketMeal, setSelectedTicketMeal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('messwise_jwt_token')));

  const [student, setStudent] = useState({
    name: 'Nitin Sharma',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-304',
    diet: 'Vegetarian',
    meals_booked: 82,
    meals_saved: 14,
    co2_avoided_kg: 24.0,
    eco_points: 580,
    eco_rank: 5,
  });

  const [studentMeals, setStudentMeals] = useState({
    breakfast: { session: 'breakfast', menu: 'Poha + Milk + Banana', time: '7:30 AM - 9:30 AM', booked: true, status: 'Booked', token: 'BKF-892' },
    lunch: { session: 'lunch', menu: 'Rajma + Jeera Rice + Roti + Salad', time: '12:30 PM - 2:30 PM', booked: true, status: 'Booked', token: 'LCH-419' },
    snacks: { session: 'snacks', menu: 'Masala Chai + Veg Pakoda / Samosa', time: '4:30 PM - 6:00 PM', booked: false, status: 'Not Booked', token: null },
    dinner: { session: 'dinner', menu: 'Paneer Butter Masala + Roti + Dal', time: '7:30 PM - 9:30 PM', booked: false, status: 'Not Booked', token: null },
  });

  const [weeklySchedule, setWeeklySchedule] = useState(null);
  const [liveMenuAlert, setLiveMenuAlert] = useState(null);
  const [lastPushedSession, setLastPushedSession] = useState(null);
  const [isRefreshingMenu, setIsRefreshingMenu] = useState(false);

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Sustainability Menu Add-On Opt-In State
  const [claimedAddons, setClaimedAddons] = useState({});
  const [addonToastMsg, setAddonToastMsg] = useState(null);
  const [livePointsPulse, setLivePointsPulse] = useState(null);

  const triggerPointsBurst = (pts, actionText) => {
    setLivePointsPulse({ pts, action: actionText, id: Date.now() });
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
      });
    } catch (_) {}
    setTimeout(() => setLivePointsPulse(null), 3200);
  };

  const handleOptInAddon = (addon) => {
    const pts = addon.eco_points || 25;
    const co2 = Number((addon.co2_saved_per_portion_kg || 0.084).toFixed(3));
    // 1. Instantaneous 0ms optimistic state update
    setClaimedAddons((prev) => ({ ...prev, [addon.addon_id]: true }));
    setStudent((prev) => ({
      ...prev,
      meals_saved: prev.meals_saved + 1,
      eco_points: (prev.eco_points || 580) + pts,
      co2_avoided_kg: Number((prev.co2_avoided_kg + co2).toFixed(1)),
    }));
    triggerPointsBurst(pts, 'Sustainability Add-On Claimed');
    setAddonToastMsg(`Zero-Waste Special Added! Rescued fresh produce. +${pts} Eco Points awarded instantly!`);
    setTimeout(() => setAddonToastMsg(null), 4000);

    // 2. Non-blocking async background broadcast & DB persistence
    studentApi.earnPoints(pts, 'sustainability_addon_opt_in', addon.name, 1, co2).catch(() => {});
    studentApi.optInAddon(addon.addon_id, student.name).catch(() => {});
  };

  const fetchMealsAndMenu = async () => {
    try {
      const [resMeals, resWeekly] = await Promise.allSettled([
        studentApi.getTodayMeals(),
        studentApi.getWeeklyMenu()
      ]);
      if (resMeals.status === 'fulfilled' && resMeals.value?.meals) {
        setStudentMeals(resMeals.value.meals);
      }
      if (resWeekly.status === 'fulfilled' && resWeekly.value?.schedule) {
        setWeeklySchedule(resWeekly.value.schedule);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchMealsAndMenu();
    studentApi.getMe().then((u) => {
      if (u) {
        setStudent((prev) => ({ ...prev, ...u }));
      }
    });

    // Real-time synchronization with Admin Menu Operations
    let bcMenu, bcSurplus;
    const handleBroadcastPayload = (data) => {
      if (data?.type === 'MENU_PUSHED') {
        const sess = data.session?.toLowerCase();
        const dish = data.menu;
        setLastPushedSession(sess);

        setLiveMenuAlert(`🔔 Mess Supervisor updated the ${data.session} menu: Added "${dish}"! Live in Today's RSVP & Weekly Dining Schedule.`);
        try {
          confetti({
            particleCount: 35,
            spread: 60,
            origin: { y: 0.3 },
            colors: ['#059669', '#10b981', '#34d399']
          });
        } catch (_) {}

        if (sess) {
          setStudentMeals((prev) => {
            const currentObj = prev[sess] || {};
            const updatedMenuText = data.append_dish && currentObj.menu
              ? `${currentObj.menu} + ${dish}`
              : dish;
            return {
              ...prev,
              [sess]: {
                ...currentObj,
                menu: updatedMenuText,
                time: data.time_window || currentObj.time,
              }
            };
          });
        }

        setTimeout(() => fetchMealsAndMenu(), 400);
        setTimeout(() => setLiveMenuAlert(null), 7000);
      }
    };

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bcMenu = new BroadcastChannel('messwise-menu-channel');
        bcMenu.onmessage = (event) => handleBroadcastPayload(event.data);

        bcSurplus = new BroadcastChannel('messwise-surplus-channel');
        bcSurplus.onmessage = (event) => handleBroadcastPayload(event.data);
      }
    } catch (_) {}

    // Storage event for cross-origin / cross-tab updates
    const handleStorageEvent = (e) => {
      if (e.key === 'messwise_menu_update' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          handleBroadcastPayload(parsed);
        } catch (_) {}
      }
    };
    window.addEventListener('storage', handleStorageEvent);

    // Background poll every 3.5 seconds
    const pollInterval = setInterval(() => {
      fetchMealsAndMenu();
    }, 3500);

    return () => {
      if (bcMenu) bcMenu.close();
      if (bcSurplus) bcSurplus.close();
      window.removeEventListener('storage', handleStorageEvent);
      clearInterval(pollInterval);
    };
  }, []);


  useEffect(() => {
    const unsub = subscribeToPointsEarned((payload) => {
      if (payload && payload.points_added > 0 && payload.student_id === 'usr-student-01') {
        setStudent((prev) => ({
          ...prev,
          eco_points: (prev.eco_points || 580) + payload.points_added,
          meals_saved: prev.meals_saved + (payload.meals_saved_increment || 0),
          co2_avoided_kg: Number((prev.co2_avoided_kg + (payload.co2_avoided_increment || 0)).toFixed(1)),
        }));
      }
    });
    return () => unsub();
  }, []);

  const handleToggle = (session) => {
    const isNowBooking = !studentMeals[session]?.booked;
    const tokenStr = isNowBooking ? `TK-${session.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : null;
    const ptsEarned = !isNowBooking ? 30 : 10;
    const actionKey = !isNowBooking ? 'meal_skipped_alert' : 'meal_advance_rsvp';
    const actionDesc = !isNowBooking ? `Skipped ${session} to prevent plate waste` : `Advance RSVP for ${session}`;
    const mealsSavedInc = !isNowBooking ? 1 : 0;
    const co2Inc = isNowBooking ? 0.3 : 0.5;

    // 1. Instantaneous 0ms optimistic UI update
    setStudentMeals((prev) => ({
      ...prev,
      [session]: {
        ...prev[session],
        booked: isNowBooking,
        status: isNowBooking ? 'Booked' : 'Not Booked',
        token: tokenStr,
      },
    }));

    setStudent((prev) => ({
      ...prev,
      meals_booked: isNowBooking ? prev.meals_booked + 1 : Math.max(0, prev.meals_booked - 1),
      meals_saved: prev.meals_saved + mealsSavedInc,
      eco_points: (prev.eco_points || 580) + ptsEarned,
      co2_avoided_kg: Math.round((prev.co2_avoided_kg + co2Inc) * 10) / 10,
    }));

    triggerPointsBurst(ptsEarned, actionDesc);

    // 2. Non-blocking async background broadcast & DB persistence
    studentApi.earnPoints(ptsEarned, actionKey, actionDesc, mealsSavedInc, co2Inc).catch(() => {});
    studentApi.toggleBooking(session).catch(() => {});
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    try {
      await studentApi.submitFeedback('lunch', feedbackRating, feedbackText);
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 3500);
    } catch {}
  };

  const bookingHistory = [
    { id: 'b-01', date: '16 Sep 2025', meal: 'Breakfast', item: 'Poha + Milk + Banana', status: 'Served', token: 'QR-BKF-1609' },
    { id: 'b-02', date: '16 Sep 2025', meal: 'Lunch', item: 'Rajma + Jeera Rice + Roti', status: 'Booked', token: 'QR-LCH-1609' },
    { id: 'b-03', date: '15 Sep 2025', meal: 'Dinner', item: 'Dal Tadka + Roti', status: 'Served', token: 'QR-DIN-1509' },
    { id: 'b-04', date: '15 Sep 2025', meal: 'Lunch', item: 'Chole Bhature + Rice', status: 'Served', token: 'QR-LCH-1509' },
    { id: 'b-05', date: '14 Sep 2025', meal: 'Dinner', item: 'Veg Pulao + Kadhi', status: 'Served', token: 'QR-DIN-1409' },
  ];

  return (
    <div className="portal-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} studentRank={student.eco_rank || 5} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Student Dining Portal</h1>
            <p>
              {student.name} • {student.hostel} (Room {student.room}) • {student.diet} Plan
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Active Boarder
            </span>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setActiveTab('leaderboard')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  color: '#92400e',
                  borderRadius: '999px',
                  padding: '0.3rem 0.75rem',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: livePointsPulse ? 'scale(1.06)' : 'scale(1)',
                }}
                title="Click to view full Eco Points Leaderboard"
              >
                <Trophy size={13} color="#d97706" /> Rank #{student.eco_rank || 5} • {student.eco_points || 580} Eco Pts
              </button>
              {livePointsPulse && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-18px',
                    right: '-4px',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    boxShadow: '0 4px 12px rgba(5,150,105,0.4)',
                    whiteSpace: 'nowrap',
                    zIndex: 20,
                  }}
                >
                  +{livePointsPulse.pts} Eco Pts!
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await authApi.logout();
                  setIsAuthenticated(false);
                }}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={14} /> Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Dashboard & RSVP */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Summary Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Booked</div>
                  <div className="kpi-value">{student.meals_booked}</div>
                  <div className="kpi-meta">September active term</div>
                </div>
                <div className="kpi-icon brand">
                  <Utensils size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Surplus Prevented</div>
                  <div className="kpi-value">{student.meals_saved}</div>
                  <div className="kpi-meta">Via timely opt-outs</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">CO₂ Diverted</div>
                  <div className="kpi-value">{student.co2_avoided_kg} kg</div>
                  <div className="kpi-meta">Clean air credits</div>
                </div>
                <div className="kpi-icon brand">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Green Streak</div>
                  <div className="kpi-value">14 Days</div>
                  <div className="kpi-meta">Consecutive meal logs</div>
                </div>
                <div className="kpi-icon warm">
                  <Award size={18} />
                </div>
              </div>
            </div>

            {/* Zero-Waste Tomorrow's Menu Preference Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ThumbsUp size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.94rem' }}>
                    Vote on Tomorrow's Dining Menu to Prevent Waste!
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                    Cast your 1 daily vote across meal categories. Less preferred options are pruned to cut food waste (+15 Eco Points).
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('preferences')}
                className="btn btn-sm"
                style={{ background: '#d97706', color: '#fff', border: 'none', fontWeight: 700, padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <ThumbsUp size={13} /> Cast My Daily Vote →
              </button>
            </div>

            {/* Real Campus Mess Notice Board & Daily Advisories */}
            <div style={{
              background: '#fefce8',
              border: '1px solid #fef08a',
              borderRadius: '12px',
              padding: '0.9rem 1.25rem',
              marginBottom: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: '#854d0e', fontSize: '0.88rem' }}>
                  <Megaphone size={16} />
                  <span>Hostel A Central Mess — Operational Advisories & Deadlines</span>
                </div>
                <span style={{ fontSize: '0.74rem', background: '#fef08a', color: '#713f12', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                  Updated today by Supervisor Rajesh Kumar
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.65rem', marginTop: '0.2rem' }}>
                <div style={{ background: '#ffffff', borderRadius: '8px', padding: '0.65rem 0.85rem', border: '1px solid #fef9c3', fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <AlertTriangle size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#92400e' }}>Weekend Outing Cutoff:</strong> If traveling this Friday, cancel dinner RSVP before <strong>4:00 PM</strong> to allow kitchen prep calibration and prevent unserved waste.
                  </div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '8px', padding: '0.65rem 0.85rem', border: '1px solid #fef9c3', fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <CloudRain size={15} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#166534' }}>Rain Contingency Active:</strong> Campus delivery is restricted due to waterlogging. Extra hot roti counter active today to handle 100% dining hall attendance.
                  </div>
                </div>
                <div style={{ background: '#ffffff', borderRadius: '8px', padding: '0.65rem 0.85rem', border: '1px solid #fef9c3', fontSize: '0.8rem', color: '#475569', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <Calendar size={15} style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#1e40af' }}>Sunday Special Feast:</strong> Special Dum Biryani tokens will activate on your app at 12:00 PM. Please present your digital token pass at Counter 2.
                  </div>
                </div>
              </div>
            </div>

            {/* Today's Meal RSVPs */}
            <div className="panel">
              <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
                <div className="panel-header-title">
                  <Utensils size={16} />
                  <span>Today's Meal RSVPs & Digital Passes</span>
                  <span
                    style={{
                      background: '#dcfce7',
                      color: '#15803d',
                      border: '1px solid #86efac',
                      borderRadius: '999px',
                      padding: '0.15rem 0.55rem',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      marginLeft: '0.5rem',
                    }}
                  >
                    ● Live Connected
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flexWrap: 'wrap' }}>
                  {/* View Mode Switcher */}
                  <div
                    style={{
                      display: 'inline-flex',
                      background: 'var(--bg-canvas-subtle)',
                      padding: '2px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setRsvpViewMode('cards')}
                      className={`btn btn-sm ${rsvpViewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.22rem 0.6rem', fontSize: '0.74rem', borderRadius: '6px' }}
                    >
                      <LayoutGrid size={12} /> Cards View
                    </button>
                    <button
                      type="button"
                      onClick={() => setRsvpViewMode('table')}
                      className={`btn btn-sm ${rsvpViewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ padding: '0.22rem 0.6rem', fontSize: '0.74rem', borderRadius: '6px' }}
                    >
                      <Table size={12} /> Tabular View
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsRefreshingMenu(true);
                      await fetchMealsAndMenu();
                      setTimeout(() => setIsRefreshingMenu(false), 500);
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.22rem 0.55rem', fontSize: '0.74rem' }}
                    title="Refresh live menu from server"
                  >
                    <RefreshCw size={12} className={isRefreshingMenu ? 'spin' : ''} /> Sync
                  </button>
                </div>
              </div>

              <div className="panel-body">
                {/* Real-time Push Notification from Admin */}
                {liveMenuAlert && (
                  <div
                    style={{
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                      border: '1px solid #6ee7b7',
                      color: '#065f46',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: '1rem',
                      fontSize: '0.86rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: '0 2px 4px rgba(5, 150, 105, 0.08)',
                      animation: 'fadeIn 0.3s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Sparkles size={16} color="#059669" />
                      <span>{liveMenuAlert}</span>
                    </div>
                    <button
                      onClick={() => setLiveMenuAlert(null)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontWeight: 800,
                        color: '#065f46',
                        fontSize: '0.9rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Toast Notification */}
                {addonToastMsg && (
                  <div style={{
                    background: '#dcfce7',
                    border: '1px solid #86efac',
                    color: '#14532d',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '1rem',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle2 size={16} color="#16a34a" /> {addonToastMsg}
                  </div>
                )}

                {/* OPTION A: TABULAR FORM FOR TODAY'S RSVPS */}
                {rsvpViewMode === 'table' ? (
                  <div className="table-container" style={{ marginTop: '0.25rem', overflowX: 'auto' }}>
                    <table className="saas-table">
                      <thead>
                        <tr>
                          <th style={{ width: '140px' }}>Session</th>
                          <th style={{ width: '150px' }}>Serving Hours</th>
                          <th style={{ width: '100px' }}>Cutoff</th>
                          <th>Today's Live Menu Items (Live Sync)</th>
                          <th style={{ width: '120px' }}>RSVP Status</th>
                          <th style={{ width: '110px' }}>Pass Token</th>
                          <th className="text-right" style={{ width: '165px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { id: 'breakfast', name: 'Breakfast', iconComponent: <Sun size={14} className="text-amber-600" />, defaultTime: '7:30 AM - 9:30 AM', deadline: '6:30 AM' },
                          { id: 'lunch', name: 'Lunch', iconComponent: <SunMedium size={14} className="text-amber-700" />, defaultTime: '12:30 PM - 2:30 PM', deadline: '10:30 AM' },
                          { id: 'snacks', name: 'Snacks', iconComponent: <Coffee size={14} className="text-stone-600" />, defaultTime: '4:30 PM - 6:00 PM', deadline: '3:30 PM' },
                          { id: 'dinner', name: 'Dinner', iconComponent: <Moon size={14} className="text-indigo-600" />, defaultTime: '7:30 PM - 9:30 PM', deadline: '5:30 PM' },
                        ].map((sess) => {
                          const meal = studentMeals[sess.id] || { session: sess.id, menu: 'Menu being prepared', time: sess.defaultTime, booked: false };
                          const isBooked = Boolean(meal.booked);
                          const isJustPushed = lastPushedSession === sess.id;

                          return (
                            <tr
                              key={sess.id}
                              style={{
                                backgroundColor: isJustPushed ? '#f0fdf4' : isBooked ? '#fafdfb' : 'transparent',
                                transition: 'background-color 0.2s ease',
                              }}
                            >
                              {/* Session Name */}
                              <td style={{ verticalAlign: 'middle' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}>
                                  {sess.iconComponent}
                                  <span>{sess.name}</span>
                                </div>
                                {isJustPushed && (
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      marginTop: '0.2rem',
                                      background: '#dcfce7',
                                      color: '#15803d',
                                      border: '1px solid #86efac',
                                      fontSize: '0.68rem',
                                      fontWeight: 800,
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    ✨ Just Pushed
                                  </span>
                                )}
                              </td>

                              {/* Serving Time */}
                              <td style={{ verticalAlign: 'middle', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <Clock size={12} /> {meal.time || sess.defaultTime}
                                </div>
                              </td>

                              {/* Cutoff */}
                              <td style={{ verticalAlign: 'middle', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {meal.deadline || sess.deadline}
                              </td>

                              {/* Live Menu Items */}
                              <td style={{ verticalAlign: 'middle' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                                  {meal.menu || 'Menu being finalized by mess kitchen'}
                                </div>
                                {meal.addons && meal.addons.length > 0 && (
                                  <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                    {meal.addons.map((a) => (
                                      <span
                                        key={a.addon_id}
                                        style={{
                                          background: '#f0fdf4',
                                          border: '1px solid #86efac',
                                          color: '#15803d',
                                          fontSize: '0.7rem',
                                          padding: '0.15rem 0.45rem',
                                          borderRadius: '999px',
                                          fontWeight: 700,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.25rem',
                                        }}
                                      >
                                        <Leaf size={10} /> Special: {a.name} (+{a.eco_points} pts)
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </td>

                              {/* RSVP Status */}
                              <td style={{ verticalAlign: 'middle' }}>
                                <span className={`badge ${isBooked ? 'badge-success' : 'badge-neutral'}`}>
                                  {isBooked ? 'Booked' : 'Not Booked'}
                                </span>
                              </td>

                              {/* Digital Token */}
                              <td style={{ verticalAlign: 'middle', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>
                                {isBooked ? (meal.token || 'TK-ACTIVE') : '—'}
                              </td>

                              {/* Action Buttons */}
                              <td className="text-right" style={{ verticalAlign: 'middle' }}>
                                <div style={{ display: 'inline-flex', gap: '0.35rem', alignItems: 'center' }}>
                                  <button
                                    className={`btn btn-sm ${isBooked ? 'btn-secondary' : 'btn-primary'}`}
                                    onClick={() => handleToggle(sess.id)}
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    {isBooked ? 'Cancel RSVP' : 'RSVP (Opt-In)'}
                                  </button>
                                  {isBooked && (
                                    <button
                                      className="btn btn-sm btn-warm"
                                      onClick={() => setSelectedTicketMeal(sess.id)}
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      <QrCode size={12} /> Pass
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* OPTION B: CARDS VIEW FOR TODAY'S RSVPS */
                  <div className="meal-rsvp-list">
                    {[
                      { id: 'breakfast', name: 'Breakfast', iconComponent: <Sun size={15} className="text-amber-600" />, defaultTime: '7:30 AM - 9:30 AM' },
                      { id: 'lunch', name: 'Lunch', iconComponent: <SunMedium size={15} className="text-amber-700" />, defaultTime: '12:30 PM - 2:30 PM' },
                      { id: 'snacks', name: 'Evening Snacks', iconComponent: <Coffee size={15} className="text-stone-600" />, defaultTime: '4:30 PM - 6:00 PM' },
                      { id: 'dinner', name: 'Dinner', iconComponent: <Moon size={15} className="text-indigo-600" />, defaultTime: '7:30 PM - 9:30 PM' },
                    ].map((sess) => {
                      const meal = studentMeals[sess.id] || { session: sess.id, menu: 'Menu being prepared', time: sess.defaultTime, booked: false };
                      const isBooked = Boolean(meal.booked);
                      const isJustPushed = lastPushedSession === sess.id;

                      return (
                        <div key={sess.id} style={{ display: 'flex', flexDirection: 'column' }}>
                          <div
                            className={`meal-rsvp-item ${isBooked ? 'booked' : ''}`}
                            style={isJustPushed ? { borderLeft: '4px solid #16a34a', backgroundColor: '#f0fdf4' } : {}}
                          >
                            <div className="meal-rsvp-info">
                              <div>
                                <div className="meal-session-name" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                  <span>{sess.iconComponent}</span>
                                  <span>{sess.name}</span>
                                  {isJustPushed && (
                                    <span
                                      style={{
                                        background: '#dcfce7',
                                        color: '#15803d',
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '0.1rem 0.4rem',
                                        borderRadius: '4px',
                                        border: '1px solid #86efac',
                                      }}
                                    >
                                      ✨ Live Added
                                    </span>
                                  )}
                                </div>
                                <div className="meal-time-tag">
                                  <Clock size={12} /> {meal.time || sess.defaultTime}
                                </div>
                              </div>
                              <div className="meal-menu-text">
                                <strong>Menu:</strong> {meal.menu || 'To be announced by mess supervisor'}
                              </div>
                            </div>

                            <div className="meal-rsvp-actions">
                              <span className={`badge ${isBooked ? 'badge-success' : 'badge-neutral'}`}>
                                {isBooked ? 'Booked' : 'Not Booked'}
                              </span>
                              <button
                                className={`btn btn-sm ${isBooked ? 'btn-secondary' : 'btn-primary'}`}
                                onClick={() => handleToggle(sess.id)}
                              >
                                {isBooked ? 'Cancel RSVP' : 'RSVP (Opt-In)'}
                              </button>
                              {isBooked && (
                                <button
                                  className="btn btn-sm btn-warm"
                                  onClick={() => setSelectedTicketMeal(sess.id)}
                                >
                                  <QrCode size={13} /> Pass
                                </button>
                              )}
                            </div>
                          </div>

                          {meal.addons?.map((addon) => {
                            const isClaimed = Boolean(claimedAddons[addon.addon_id]);
                            const currentClaimed = (addon.portions_claimed || 0) + (isClaimed ? 1 : 0);
                            const target = addon.portions_target || 250;
                            const pct = Math.min(100, Math.round((currentClaimed / target) * 100));

                            return (
                              <div key={addon.addon_id} className="sustainability-addon-card">
                                <div className="sustainability-addon-left">
                                  <div className="sustainability-addon-tag-row">
                                    <span className="addon-badge-pill">
                                      <Leaf size={11} /> Mess Kitchen Special
                                    </span>
                                    <span className="addon-eco-pts-pill">
                                      +{addon.eco_points || 25} Eco Points
                                    </span>
                                    <span style={{ fontSize: '0.72rem', color: '#15803d', fontWeight: 600 }}>
                                      Zero-Waste Initiative
                                    </span>
                                  </div>

                                  <div className="sustainability-addon-title">{addon.name}</div>
                                  <div className="sustainability-addon-desc">{addon.description}</div>

                                  <div className="sustainability-addon-meta">
                                    <span>Claimed: {currentClaimed} / {target} ({pct}%)</span>
                                    <span>•</span>
                                    <span>Rescued: {Math.round((addon.waste_rescued_per_portion_kg || 0.06) * 1000)}g fresh produce / plate</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <button
                                    className={`addon-claim-btn ${isClaimed ? 'claimed' : ''}`}
                                    disabled={isClaimed}
                                    onClick={() => handleOptInAddon(addon)}
                                  >
                                    {isClaimed ? (
                                      <>
                                        <Check size={14} /> Added to Plate (+{addon.eco_points || 25} pts)
                                      </>
                                    ) : (
                                      <>
                                        <PlusCircle size={14} /> + Add to Plate (+{addon.eco_points || 25} pts)
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Kitchen Feedback */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Star size={16} />
                  <span>Kitchen Supervisor & Food Quality Feedback</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Sent directly to mess supervisor
                </span>
              </div>

              <div className="panel-body">
                {feedbackSubmitted ? (
                  <div style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success-text)',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Check size={16} /> Rating recorded. Thank you for helping optimize kitchen preparation.
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>Dish Quality Rating:</span>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                              color: star <= feedbackRating ? 'var(--accent-warm)' : 'var(--border-default)',
                              padding: '0.1rem',
                            }}
                          >
                            <Star size={20} fill={star <= feedbackRating ? 'var(--accent-warm)' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Portion or spice suggestions</label>
                      <input
                        type="text"
                        className="form-control"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="e.g. Lunch dal consistency was great, portion was adequate..."
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Send size={14} /> Submit Feedback
                      </button>
                    </div>
                  </form>
                )}
                {/* Recent Student Feedback & Chef Actions */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.65rem' }}>
                    Recent Student Grievances &amp; Head Chef Resolution Tracker:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
                    {[
                      {
                        student: "Aarav Sharma (B-204)",
                        meal: "Today Lunch (Rajma Rice)",
                        rating: 4,
                        comment: "Rajma was delicious and thick, but rice ran out 15 mins before closing!",
                        reply: "Supervisor: ML buffer increased by 15 portions for late-arriving boarders.",
                      },
                      {
                        student: "Rahul Meena (C-311)",
                        meal: "Today Breakfast (Poha + Banana)",
                        rating: 5,
                        comment: "Poha with roasted peanuts and hot lemon tea was fresh and on time. Good job team!",
                        reply: "Chef Rajesh: Thank you Rahul! Glad you enjoyed the breakfast.",
                      },
                      {
                        student: "Harshil Patel (B-118)",
                        meal: "15 Sep Dinner (Dal Tadka)",
                        rating: 2,
                        comment: "Yellow dal was very watery like turmeric water. Rotis became rubbery by 9:00 PM.",
                        reply: "Chef Rajesh: Dal-water ratio recalibrated with cook. Rotis moved to double-insulated warmers after 8:30 PM.",
                      }
                    ].map((rev, idx) => (
                      <div key={idx} style={{
                        background: 'var(--bg-canvas-subtle)',
                        borderRadius: '8px',
                        padding: '0.75rem 0.95rem',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{rev.student} • <span style={{ fontWeight: 500, color: 'var(--text-muted)' }}>{rev.meal}</span></span>
                          <span style={{ color: '#d97706', fontSize: '0.8rem' }}>{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0.4rem 0', fontStyle: 'italic' }}>
                          "{rev.comment}"
                        </p>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '0.35rem 0.6rem', color: '#166534', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <CheckCircle2 size={12} color="#16a34a" />
                          <span><strong>{rev.reply}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Zero-Waste Meal Preferences */}
        {activeTab === 'preferences' && (
          <StudentPreferenceManager
            onPointsEarned={(pts) => {
              const ptsAwarded = pts || 15;
              setStudent((prev) => ({ ...prev, eco_points: (prev.eco_points || 580) + ptsAwarded }));
              triggerPointsBurst(ptsAwarded, 'Preference Poll Completed');
              studentApi.earnPoints(ptsAwarded, 'preference_poll_vote', 'Student Menu Choice Poll', 0, 0.1).catch(() => {});
            }}
          />
        )}

        {/* Tab 2: Menu */}
        {activeTab === 'menu' && (
          <div className="panel">
            <div className="panel-header" style={{ flexWrap: 'wrap', gap: '0.65rem' }}>
              <div className="panel-header-title">
                <Utensils size={16} />
                <span>Hostel A Weekly Dining Schedule (Tabular Form)</span>
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #86efac',
                    borderRadius: '999px',
                    padding: '0.15rem 0.55rem',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    marginLeft: '0.5rem',
                  }}
                >
                  ● Live Synced with Admin Operations
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <CalendarCheck size={13} /> View Today's RSVPs
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setIsRefreshingMenu(true);
                    await fetchMealsAndMenu();
                    setTimeout(() => setIsRefreshingMenu(false), 500);
                  }}
                  className="btn btn-sm btn-secondary"
                  style={{ fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  title="Reload schedule from server"
                >
                  <RefreshCw size={13} className={isRefreshingMenu ? 'spin' : ''} /> Refresh Schedule
                </button>
              </div>
            </div>

            {liveMenuAlert && (
              <div
                style={{
                  margin: '1rem 1.25rem 0 1.25rem',
                  background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                  border: '1px solid #6ee7b7',
                  color: '#065f46',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.08)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={16} color="#059669" />
                  <span>{liveMenuAlert}</span>
                </div>
                <button
                  onClick={() => setLiveMenuAlert(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontWeight: 800,
                    color: '#065f46',
                    fontSize: '0.9rem',
                  }}
                >
                  ✕
                </button>
              </div>
            )}

            <div className="table-container" style={{ marginTop: '0.5rem' }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '135px' }}>Day / Date</th>
                    <th>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Sun size={13} className="text-amber-600" /> Breakfast (7:00-9:00 AM)
                      </span>
                    </th>
                    <th>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <SunMedium size={13} className="text-amber-700" /> Lunch (12:00-2:00 PM)
                      </span>
                    </th>
                    <th>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Coffee size={13} className="text-stone-600" /> Snacks (4:30-6:00 PM)
                      </span>
                    </th>
                    <th>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Moon size={13} className="text-indigo-600" /> Dinner (7:30-9:30 PM)
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(weeklySchedule || [
                    { day: 'Monday', date: 'Mon', is_today: false, breakfast: 'Idli Sambhar + Chutney', lunch: 'Chole + Jeera Rice + Roti', snacks: 'Ginger Tea + Biscuits', dinner: 'Mix Dal + Sev Tamatar + Chapati' },
                    { day: 'Tuesday', date: 'Today (Live)', is_today: true, breakfast: studentMeals.breakfast?.menu || 'Poha + Milk + Banana', lunch: studentMeals.lunch?.menu || 'Rajma + Steamed Rice + Salad', snacks: studentMeals.snacks?.menu || 'Masala Chai + Veg Pakoda', dinner: studentMeals.dinner?.menu || 'Paneer Butter Masala + Roti' },
                    { day: 'Wednesday', date: 'Wed', is_today: false, breakfast: 'Aloo Paratha + Curd', lunch: 'Kadhi Pakoda + Rice', snacks: 'Filter Coffee + Bun Maska', dinner: 'Egg Curry / Paneer Bhurji + Roti' },
                    { day: 'Thursday', date: 'Thu', is_today: false, breakfast: 'Upma + Tea + Sprouts', lunch: 'Dal Makhani + Tandoori Roti', snacks: 'Samosa + Green Chutney', dinner: 'Veg Biryani + Cucumber Raita' },
                    { day: 'Friday', date: 'Fri', is_today: false, breakfast: 'Puri Bhaji + Halwa', lunch: 'Sambar Rice + Papad', snacks: 'Corn Chaat + Lemonade', dinner: 'Matar Paneer + Pulao' },
                    { day: 'Saturday', date: 'Sat', is_today: false, breakfast: 'Masala Dosa + Sambhar', lunch: 'Khichdi + Baingan Bharta', snacks: 'Aloo Bonda + Kadak Chai', dinner: 'Dal Tadka + Jeera Rice' },
                    { day: 'Sunday', date: 'Sun', is_today: false, breakfast: 'Pav Bhaji + Fruit Juice', lunch: 'Special Dum Biryani Feast', snacks: 'Dhokla + Mint Chutney', dinner: 'Light Khichdi + Curd' },
                  ]).map((row, idx) => {
                    const isToday = Boolean(row.is_today || row.current || row.day === 'Tuesday');
                    
                    // Live menus for today always reflect real-time studentMeals pushed by admin
                    const bMenu = isToday ? (studentMeals.breakfast?.menu || row.breakfast) : row.breakfast;
                    const lMenu = isToday ? (studentMeals.lunch?.menu || row.lunch) : row.lunch;
                    const sMenu = isToday ? (studentMeals.snacks?.menu || row.snacks) : row.snacks;
                    const dMenu = isToday ? (studentMeals.dinner?.menu || row.dinner) : row.dinner;

                    return (
                      <tr
                        key={idx}
                        style={isToday ? { backgroundColor: 'var(--brand-50)', borderLeft: '3px solid var(--brand-700)' } : {}}
                      >
                        <td style={{ fontWeight: 700, verticalAlign: 'top' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <span style={{ color: isToday ? 'var(--brand-800)' : 'var(--text-primary)' }}>{row.day}</span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{row.date}</span>
                            {isToday && (
                              <span
                                className="badge badge-success"
                                style={{ alignSelf: 'flex-start', fontSize: '0.68rem', padding: '0.1rem 0.45rem' }}
                              >
                                ● Live Today
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Breakfast */}
                        <td style={{ verticalAlign: 'top' }}>
                          <div style={{ lineHeight: 1.45 }}>{bMenu}</div>
                          {isToday && lastPushedSession === 'breakfast' && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✨ Just Pushed
                            </span>
                          )}
                        </td>

                        {/* Lunch */}
                        <td style={{ verticalAlign: 'top' }}>
                          <div style={{ lineHeight: 1.45 }}>{lMenu}</div>
                          {isToday && lastPushedSession === 'lunch' && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✨ Just Pushed
                            </span>
                          )}
                        </td>

                        {/* Snacks */}
                        <td style={{ verticalAlign: 'top' }}>
                          <div style={{ lineHeight: 1.45 }}>{sMenu}</div>
                          {isToday && lastPushedSession === 'snacks' && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✨ Just Pushed
                            </span>
                          )}
                        </td>

                        {/* Dinner */}
                        <td style={{ verticalAlign: 'top' }}>
                          <div style={{ lineHeight: 1.45 }}>{dMenu}</div>
                          {isToday && lastPushedSession === 'dinner' && (
                            <span style={{ display: 'inline-block', marginTop: '0.25rem', fontSize: '0.68rem', color: '#15803d', background: '#dcfce7', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>
                              ✨ Just Pushed
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Quick Helper Banner */}
            <div
              style={{
                marginTop: '1rem',
                padding: '0.85rem 1.25rem',
                background: 'var(--bg-canvas-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={15} color="#ea580c" />
                <span>
                  <strong>Real-time Food Sync:</strong> Any dish pushed by mess administration is updated instantaneously in both Today's RSVP pass counter and this weekly dining schedule.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('dashboard')}
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.78rem' }}
              >
                Manage My RSVPs & Passes
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: History */}
        {activeTab === 'history' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <CalendarCheck size={16} />
                <span>Booking & Digital Pass Records</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {['all', 'Served', 'Booked'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`btn btn-sm ${historyFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Meal Session</th>
                    <th>Date</th>
                    <th>Menu Items</th>
                    <th>Status</th>
                    <th className="text-right">Pass Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingHistory
                    .filter((b) => historyFilter === 'all' || b.status === historyFilter)
                    .map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 600 }}>{b.meal}</td>
                        <td>{b.date}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{b.item}</td>
                        <td>
                          <span className={`badge ${b.status === 'Served' ? 'badge-success' : 'badge-warning'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-right" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem' }}>
                          {b.token}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Impact */}
        {activeTab === 'impact' && (
          <div>
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Campus Ranking</div>
                  <div className="kpi-value">#12</div>
                  <div className="kpi-meta">Top 3% eco boarders</div>
                </div>
                <div className="kpi-icon brand">
                  <Award size={18} />
                </div>
              </div>
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Food Waste Diverted</div>
                  <div className="kpi-value">4.2 kg</div>
                  <div className="kpi-meta">Personal term contribution</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Carbon Offset</div>
                  <div className="kpi-value">24.0 kg</div>
                  <div className="kpi-meta">Equivalent CO2 emissions</div>
                </div>
                <div className="kpi-icon brand">
                  <Sparkles size={18} />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Leaf size={16} />
                  <span>Campus Food Waste Prevention Protocol</span>
                </div>
              </div>
              <div className="panel-body">
                <p style={{ lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  By confirming attendance or opting out at least 2 hours prior to kitchen preparation cycles, our mess staff can reduce safety buffer margins from 18% down to 2.6%. Surplus portions from students who opt out are systematically redirected to verified local food bank networks.
                </p>

                <div
                  style={{
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    border: '1px solid #86efac',
                    borderRadius: '14px',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 800, color: '#166534' }}>
                      <Trophy size={16} color="#15803d" />
                      <span>You have earned {student.eco_points || 580} Eco Points!</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#14532d', marginTop: '0.2rem' }}>
                      Ranked #{student.eco_rank || 5} across campus hostel boarders.
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#15803d', borderColor: '#15803d', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <Trophy size={14} /> Open Eco Leaderboard →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Eco Leaderboard */}
        {activeTab === 'leaderboard' && (
          <EcoLeaderboard
            currentStudent={student}
            onNavigateTab={setActiveTab}
          />
        )}
      </main>

      <TicketModal
        isOpen={Boolean(selectedTicketMeal)}
        onClose={() => setSelectedTicketMeal(null)}
        mealType={selectedTicketMeal}
        mealData={selectedTicketMeal ? studentMeals[selectedTicketMeal] : null}
        studentName={student.name}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          if (user) setStudent((prev) => ({ ...prev, ...user }));
          studentApi.getTodayMeals().then((res) => {
            if (res?.meals) setStudentMeals(res.meals);
          });
        }}
      />
    </div>
  );
}

export default App;

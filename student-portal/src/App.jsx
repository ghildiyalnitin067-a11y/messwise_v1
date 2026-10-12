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
  ThumbsUp
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from './components/Sidebar';
import TicketModal from './components/TicketModal';
import LoginModal from './components/LoginModal';
import EcoLeaderboard from './components/EcoLeaderboard';
import StudentPreferenceManager from './components/StudentPreferenceManager';
import { studentApi, authApi } from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
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

  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Sustainability Menu Add-On Opt-In State
  const [claimedAddons, setClaimedAddons] = useState({});
  const [addonToastMsg, setAddonToastMsg] = useState(null);

  const handleOptInAddon = async (addon) => {
    try {
      await studentApi.optInAddon(addon.addon_id, student.name);
      setClaimedAddons((prev) => ({ ...prev, [addon.addon_id]: true }));
      setStudent((prev) => ({
        ...prev,
        meals_saved: prev.meals_saved + 1,
        eco_points: (prev.eco_points || 580) + (addon.eco_points || 25),
        co2_avoided_kg: Number((prev.co2_avoided_kg + (addon.co2_saved_per_portion_kg || 0.084)).toFixed(1)),
      }));
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.6 }
      });
      setAddonToastMsg(`🌱 Zero-Waste Special Added! Rescued fresh produce. +${addon.eco_points || 25} Eco Points awarded to your profile!`);
      setTimeout(() => setAddonToastMsg(null), 4500);
    } catch {
      setAddonToastMsg('Failed to add special.');
      setTimeout(() => setAddonToastMsg(null), 3500);
    }
  };

  useEffect(() => {
    studentApi.getTodayMeals().then((res) => {
      if (res?.meals) {
        setStudentMeals(res.meals);
      }
    });
    studentApi.getMe().then((u) => {
      if (u) {
        setStudent((prev) => ({ ...prev, ...u }));
      }
    });
  }, []);


  const handleToggle = (session) => {
    const isNowBooking = !studentMeals[session]?.booked;
    const tokenStr = isNowBooking ? `TK-${session.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : null;

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
      meals_saved: !isNowBooking ? prev.meals_saved + 1 : prev.meals_saved,
      eco_points: !isNowBooking ? (prev.eco_points || 580) + 30 : (prev.eco_points || 580) + 10,
      co2_avoided_kg: isNowBooking ? Math.round((prev.co2_avoided_kg + 0.3) * 10) / 10 : Math.round((prev.co2_avoided_kg + 0.5) * 10) / 10,
    }));

    if (isNowBooking) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#123B2A', '#EA580C', '#2F8563'],
      });
    }

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
              }}
              title="Click to view full Eco Points Leaderboard"
            >
              <Trophy size={13} color="#d97706" /> Rank #{student.eco_rank || 5} • {student.eco_points || 580} Eco Pts
            </button>

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

            {/* Today's Meal RSVPs */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Utensils size={16} />
                  <span>Today's Meal RSVPs & Digital Passes</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tue, 16 Sep 2025 • Cutoff: 2h before session
                </span>
              </div>

              <div className="panel-body">
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

                <div className="meal-rsvp-list">
                  {[
                    { id: 'breakfast', name: 'Breakfast', icon: '🌅', defaultTime: '7:30 AM - 9:30 AM' },
                    { id: 'lunch', name: 'Lunch', icon: '☀️', defaultTime: '12:30 PM - 2:30 PM' },
                    { id: 'snacks', name: 'Evening Snacks', icon: '☕', defaultTime: '4:30 PM - 6:00 PM' },
                    { id: 'dinner', name: 'Dinner', icon: '🌙', defaultTime: '7:30 PM - 9:30 PM' },
                  ].map((sess) => {
                    const meal = studentMeals[sess.id] || { session: sess.id, menu: 'Menu being prepared', time: sess.defaultTime, booked: false };
                    const isBooked = Boolean(meal.booked);

                    return (
                      <div key={sess.id} style={{ display: 'flex', flexDirection: 'column' }}>
                        <div className={`meal-rsvp-item ${isBooked ? 'booked' : ''}`}>
                          <div className="meal-rsvp-info">
                            <div>
                              <div className="meal-session-name" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                                <span>{sess.icon}</span>
                                <span>{sess.name}</span>
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
              </div>
            </div>
          </div>
        )}

        {/* Tab: Zero-Waste Meal Preferences */}
        {activeTab === 'preferences' && (
          <StudentPreferenceManager
            onPointsEarned={(pts) => {
              setStudent((prev) => ({ ...prev, eco_points: (prev.eco_points || 0) + pts }));
              try {
                confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
              } catch (_) {}
            }}
          />
        )}

        {/* Tab 2: Menu */}
        {activeTab === 'menu' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Utensils size={16} />
                <span>Hostel A Weekly Dining Schedule</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Managed by Chef Rajesh Kumar
              </span>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>Day</th>
                    <th>🌅 Breakfast</th>
                    <th>☀️ Lunch</th>
                    <th>☕ Snacks</th>
                    <th>🌙 Dinner</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { day: 'Monday', b: 'Idli Sambhar + Chutney', l: 'Chole + Jeera Rice + Roti', s: 'Ginger Tea + Biscuits', d: 'Mix Dal + Sev Tamatar + Chapati' },
                    { 
                      day: 'Today (Live)', 
                      b: studentMeals.breakfast?.menu || 'Poha + Milk + Banana', 
                      l: studentMeals.lunch?.menu || 'Rajma + Steamed Rice + Salad', 
                      s: studentMeals.snacks?.menu || 'Masala Chai + Veg Pakoda',
                      d: studentMeals.dinner?.menu || 'Paneer Butter Masala + Roti', 
                      current: true 
                    },
                    { day: 'Wednesday', b: 'Aloo Paratha + Curd', l: 'Kadhi Pakoda + Rice', s: 'Filter Coffee + Bun Maska', d: 'Egg Curry / Paneer Bhurji + Roti' },
                    { day: 'Thursday', b: 'Upma + Tea + Sprouts', l: 'Dal Makhani + Tandoori Roti', s: 'Samosa + Green Chutney', d: 'Veg Biryani + Cucumber Raita' },
                    { day: 'Friday', b: 'Puri Bhaji + Halwa', l: 'Sambar Rice + Papad', s: 'Corn Chaat + Lemonade', d: 'Matar Paneer + Pulao' },
                    { day: 'Saturday', b: 'Masala Dosa + Sambhar', l: 'Khichdi + Baingan Bharta', s: 'Aloo Bonda + Kadak Chai', d: 'Dal Tadka + Jeera Rice' },
                    { day: 'Sunday', b: 'Pav Bhaji + Fruit Juice', l: 'Special Dum Biryani Feast', s: 'Dhokla + Mint Chutney', d: 'Light Khichdi + Curd' },
                  ].map((row, idx) => (
                    <tr key={idx} style={row.current ? { backgroundColor: 'var(--brand-50)' } : {}}>
                      <td style={{ fontWeight: 600 }}>
                        {row.day}
                        {row.current && <span className="badge badge-success" style={{ marginLeft: '0.4rem' }}>Live</span>}
                      </td>
                      <td>{row.b}</td>
                      <td>{row.l}</td>
                      <td>{row.s}</td>
                      <td>{row.d}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

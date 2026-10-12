import React, { useState } from 'react';
import { 
  Utensils, 
  CalendarCheck, 
  Award, 
  Leaf, 
  Star, 
  QrCode, 
  Check, 
  X, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Send,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  ThumbsUp,
  Sun,
  SunMedium,
  Coffee,
  Moon,
  Megaphone,
  AlertTriangle,
  CloudRain,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from '../components/Sidebar';
import TicketModal from '../components/TicketModal';
import EcoLeaderboard from '../components/EcoLeaderboard';
import StudentPreferenceManager from '../components/StudentPreferenceManager';
import { useMesswise } from '../context/MesswiseContext';
import { studentApi } from '../api/client';

const StudentPortal = () => {
  const { currentUser, studentMeals, toggleMealBooking } = useMesswise();
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const [showPreferenceModal, setShowPreferenceModal] = useState(() => {
    const votedDate = localStorage.getItem('messwise_pref_voted_date');
    if (votedDate === todayDateStr) return false;
    return sessionStorage.getItem('messwise_prompt_pref') === 'true' || !votedDate;
  });

  React.useEffect(() => {
    if (sessionStorage.getItem('messwise_prompt_pref') === 'true') {
      sessionStorage.removeItem('messwise_prompt_pref');
    }
  }, []);
  
  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // History filter
  const [historyFilter, setHistoryFilter] = useState('all');

  const handleToggle = (session) => {
    const isNowBooking = !studentMeals[session]?.booked;
    toggleMealBooking(session);

    if (isNowBooking) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
        colors: ['#123B2A', '#EA580C', '#2F8563']
      });
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    try {
      await studentApi.submitFeedback('lunch', feedbackRating, feedbackText);
      setFeedbackSubmitted(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSubmitted(false), 3500);
    } catch (err) {}
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
      <Sidebar role="student" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Application Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Student Dining Portal</h1>
            <p>
              {currentUser.name} • {currentUser.hostel} (Room {currentUser.room}) • {currentUser.diet} Plan
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
              <Trophy size={13} color="#d97706" /> Rank #{currentUser.eco_rank || 5} • {currentUser.eco_points || 580} Eco Pts
            </button>
          </div>
        </header>

        {/* Tab 1: Dashboard & Today's RSVPs */}
        {activeTab === 'dashboard' && (
          <div>
            {/* KPI Summary Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Booked</div>
                  <div className="kpi-value">{currentUser.meals_booked}</div>
                  <div className="kpi-meta">September active term</div>
                </div>
                <div className="kpi-icon brand">
                  <Utensils size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Surplus Prevented</div>
                  <div className="kpi-value">{currentUser.meals_saved}</div>
                  <div className="kpi-meta">Via timely opt-outs</div>
                </div>
                <div className="kpi-icon brand">
                  <Leaf size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">CO₂ Diverted</div>
                  <div className="kpi-value">{currentUser.co2_avoided_kg} kg</div>
                  <div className="kpi-meta">Certified environmental credits</div>
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

            {/* Zero-Waste Student Preference Poll Callout */}
            <div style={{
              background: 'linear-gradient(135deg, #064e3b 0%, #047857 100%)',
              borderRadius: '14px',
              padding: '1.1rem 1.4rem',
              color: '#ffffff',
              marginBottom: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.08)'
            }}>
              <div style={{ maxWidth: '640px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>
                    DAILY ZERO-WASTE POLL
                  </span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a7f3d0' }}>
                    Cut Kitchen Waste • Earn +15 Eco Pts
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Choose What You Want To Eat In Major Options
                </div>
                <div style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>
                  Vote for your preferred dish choices. Categories receiving low preference (&lt;20%) are eliminated from kitchen prep to prevent excess food wastage!
                </div>
              </div>

              <button
                onClick={() => setShowPreferenceModal(true)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#064e3b',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem 1.25rem',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <ThumbsUp size={15} /> Select Meal Preferences
              </button>
            </div>

            {/* Real Campus Mess Notice Board */}
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

            {/* Today's Meal RSVPs Section */}
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
                <div className="meal-rsvp-list">
                  {[
                    { id: 'breakfast', name: 'Breakfast', iconComponent: <Sun size={15} className="text-amber-600" />, defaultTime: '7:30 AM - 9:30 AM' },
                    { id: 'lunch', name: 'Lunch', iconComponent: <SunMedium size={15} className="text-amber-700" />, defaultTime: '12:30 PM - 2:30 PM' },
                    { id: 'snacks', name: 'Evening Snacks', iconComponent: <Coffee size={15} className="text-stone-600" />, defaultTime: '4:30 PM - 6:00 PM' },
                    { id: 'dinner', name: 'Dinner', iconComponent: <Moon size={15} className="text-indigo-600" />, defaultTime: '7:30 PM - 9:30 PM' },
                  ].map((sess) => {
                    const meal = studentMeals[sess.id] || { session: sess.id, menu: 'Menu being prepared', time: sess.defaultTime, booked: false };
                    const isBooked = Boolean(meal.booked);

                    return (
                      <div key={sess.id} className={`meal-rsvp-item ${isBooked ? 'booked' : ''}`}>
                        <div className="meal-rsvp-info">
                          <div>
                            <div className="meal-session-name" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                              <span>{sess.iconComponent}</span>
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
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Meal Quality & Supervisor Feedback */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Star size={16} />
                  <span>Kitchen Supervisor & Food Quality Feedback</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Directly dispatched to hostel head chef
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
                      <label className="form-label">Portion or spice comments</label>
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

                {/* Real Student Reviews & Chef Actions */}
                <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recent Student Reviews & Kitchen Action Logs
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Verified Boarder Feedback (Last 24 Hours)
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {[
                      {
                        student: "Aditya Verma (B-204)",
                        meal: "Yesterday Dinner (Paneer Butter Masala)",
                        rating: 3,
                        comment: "Gravy was flavorful, but paneer pieces were only 2-3 cubes per bowl. Please improve portioning.",
                        reply: "Chef Rajesh: Noted. Standardized ladle measure (50g paneer cubes per serving) enforced at counter.",
                      },
                      {
                        student: "Simran Kaur (Girls Wing A-12)",
                        meal: "Yesterday Lunch (Rajma Rice)",
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

        {/* Tab 2: Weekly Menu */}
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
                    <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Sun size={13} className="text-amber-600" /> Breakfast</span></th>
                    <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><SunMedium size={13} className="text-amber-700" /> Lunch</span></th>
                    <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Coffee size={13} className="text-stone-600" /> Snacks</span></th>
                    <th><span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Moon size={13} className="text-indigo-600" /> Dinner</span></th>
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
                      <span>You have earned {currentUser.eco_points || 580} Eco Points!</span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#14532d', marginTop: '0.2rem' }}>
                      Ranked #{currentUser.eco_rank || 5} across campus hostel boarders.
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
            currentStudent={currentUser}
            onNavigateTab={setActiveTab}
          />
        )}

        {/* Tab 6: Meal Preferences Poll */}
        {activeTab === 'preferences' && (
          <div>
            <StudentPreferenceManager
              onPreferenceSubmitted={() => {
                localStorage.setItem('messwise_pref_voted_date', todayDateStr);
              }}
            />
          </div>
        )}
      </main>

      {/* Zero-Waste Preference Onboarding / Daily Poll Modal */}
      {showPreferenceModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem',
        }}>
          <div style={{ width: '100%', maxWidth: '860px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px' }}>
            <StudentPreferenceManager
              isModal={true}
              onClose={() => setShowPreferenceModal(false)}
              onPreferenceSubmitted={() => {
                localStorage.setItem('messwise_pref_voted_date', todayDateStr);
              }}
            />
          </div>
        </div>
      )}

      {/* Pass Modal */}
      <TicketModal
        isOpen={Boolean(selectedTicketMeal)}
        onClose={() => setSelectedTicketMeal(null)}
        mealType={selectedTicketMeal}
        mealData={selectedTicketMeal ? studentMeals[selectedTicketMeal] : null}
        studentName={currentUser.name}
      />
    </div>
  );
};

export default StudentPortal;

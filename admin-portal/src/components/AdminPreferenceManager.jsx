import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Sparkles, 
  AlertTriangle, 
  TrendingUp, 
  Leaf, 
  CheckCircle2, 
  Trash2, 
  RefreshCw, 
  ShieldCheck, 
  Clock, 
  Scissors,
  Check,
  ChevronRight,
  Sliders
} from 'lucide-react';
import { preferenceApi } from '../api/client';

const safeConfetti = (opts) => {
  if (typeof window !== 'undefined' && typeof window.confetti === 'function') {
    window.confetti(opts);
  }
};

const AdminPreferenceManager = ({ onMenuOptimized }) => {
  const [activeSession, setActiveSession] = useState('lunch');
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [threshold, setThreshold] = useState(20);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    loadPoll(activeSession);
  }, [activeSession]);

  const loadPoll = async (session) => {
    setLoading(true);
    try {
      const res = await preferenceApi.getPoll(session);
      if (res) {
        setPollData(res);
      }
    } catch (err) {
      console.warn('Failed to fetch admin preference poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeMenu = async () => {
    setOptimizing(true);
    try {
      const res = await preferenceApi.optimizeMenu({
        session: activeSession,
        threshold_pct: Number(threshold),
        auto_update_menu: true
      });

      if (res?.success) {
        safeConfetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#047857', '#10b981', '#3b82f6', '#f59e0b']
        });

        setToastMessage(res.message || `Pruned ${res.pruned_dishes?.length} low-preference dishes. Live menu synchronized!`);
        await loadPoll(activeSession);

        if (onMenuOptimized) {
          onMenuOptimized(res);
        }

        setTimeout(() => setToastMessage(null), 4500);
      }
    } catch (err) {
      console.error('Failed to optimize menu:', err);
      setToastMessage('Failed to optimize menu. Please try again.');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setOptimizing(false);
    }
  };

  // Calculate low preference candidates currently below threshold
  const lowDemandCandidates = [];
  pollData?.categories?.forEach((cat) => {
    cat.options?.forEach((opt) => {
      if (opt.is_active && opt.vote_percentage < threshold) {
        lowDemandCandidates.push({ ...opt, category: cat.category });
      }
    });
  });

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: '1.5rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '1.75rem'
    }}>
      {/* Title & Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#ecfdf5',
              color: '#047857'
            }}>
              <Utensils size={18} />
            </span>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Student Preference & Zero-Waste Menu Optimization
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: '#d1fae5',
              color: '#047857',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={12} /> Real-Time Telemetry
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', maxWidth: '680px' }}>
            Monitor student dining votes in real time. Items receiving low preference (&lt;{threshold}%) are flagged as high wastage risks. Pruning them automatically updates the live kitchen preparation menu and eliminates excess unserved cafeteria food.
          </p>
        </div>

        {/* Session Toggle */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'lunch', label: 'Lunch', icon: '☀️' },
            { id: 'dinner', label: 'Dinner', icon: '🌙' },
          ].map((sess) => (
            <button
              key={sess.id}
              onClick={() => setActiveSession(sess.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.45rem 0.9rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: activeSession === sess.id ? '#047857' : '#cbd5e1',
                backgroundColor: activeSession === sess.id ? '#047857' : '#ffffff',
                color: activeSession === sess.id ? '#ffffff' : '#334155',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{sess.icon}</span>
              <span>{sess.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI & Alert Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1.25rem'
      }}>
        <div style={{ background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Student Voters
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            {pollData?.total_voters || 290} <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>boarders</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginTop: '0.2rem' }}>
            48.5% campus turnout
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Wastage Cutoff Threshold
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>{threshold}%</span>
            <input 
              type="range" 
              min="10" 
              max="35" 
              value={threshold} 
              onChange={(e) => setThreshold(Number(e.target.value))}
              style={{ width: '90px', cursor: 'pointer' }}
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
            Dishes below {threshold}% flagged for removal
          </div>
        </div>

        <div style={{ background: lowDemandCandidates.length > 0 ? '#fffbeb' : '#f0fdf4', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid', borderColor: lowDemandCandidates.length > 0 ? '#fde68a' : '#bbf7d0' }}>
          <div style={{ fontSize: '0.75rem', color: lowDemandCandidates.length > 0 ? '#b45309' : '#15803d', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Low Preference Candidates
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: lowDemandCandidates.length > 0 ? '#b45309' : '#15803d' }}>
            {lowDemandCandidates.length} <span style={{ fontSize: '0.78rem', fontWeight: 500 }}>dishes</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: lowDemandCandidates.length > 0 ? '#b45309' : '#15803d', fontWeight: 600, marginTop: '0.2rem' }}>
            {lowDemandCandidates.length > 0 ? `~${(lowDemandCandidates.length * 14.5).toFixed(1)}kg waste risk` : 'All dishes above cutoff'}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '0.9rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: '0.2rem' }}>
            Prevented Kitchen Surplus
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#047857' }}>
            {pollData?.waste_prevented_kg ? `${pollData.waste_prevented_kg} kg` : '0.0 kg'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#047857', fontWeight: 600, marginTop: '0.2rem' }}>
            {pollData?.carbon_saved_kg ? `~${pollData.carbon_saved_kg} kg CO2e avoided` : 'Pending optimization'}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {toastMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#065f46',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Current Live Menu & Auto-Pruning Action Strip */}
      <div style={{
        backgroundColor: '#f1f5f9',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        border: '1px solid #cbd5e1'
      }}>
        <div style={{ maxWidth: '620px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Current Official {activeSession.toUpperCase()} Menu:
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
            {pollData?.current_menu || 'Menu undergoing calibration'}
          </div>
        </div>

        <button
          onClick={handleOptimizeMenu}
          disabled={optimizing}
          style={{
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: lowDemandCandidates.length > 0 ? '#b91c1c' : '#047857',
            color: '#ffffff',
            fontSize: '0.86rem',
            fontWeight: 700,
            cursor: optimizing ? 'not-allowed' : 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            opacity: optimizing ? 0.7 : 1,
            transition: 'all 0.15s ease'
          }}
          title={`Remove dishes with <${threshold}% preference and update live menu`}
        >
          {optimizing ? (
            <>
              <RefreshCw size={15} className="spin-icon" />
              Pruning & Updating Menu...
            </>
          ) : (
            <>
              <Scissors size={15} />
              {lowDemandCandidates.length > 0
                ? `Auto-Remove ${lowDemandCandidates.length} Low-Demand Dish(es) & Update Menu`
                : 'Synchronize Zero-Waste Menu'}
            </>
          )}
        </button>
      </div>

      {/* Category Breakdown Table / Grid */}
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin-icon" />
          <p style={{ marginTop: '0.5rem', fontSize: '0.88rem' }}>Loading live preferences...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pollData?.categories?.map((cat) => (
            <div key={cat.category} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.65rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b' }}>
                  {cat.category}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Total Votes: <strong>{cat.total_category_votes}</strong>
                </span>
              </div>

              <div style={{ padding: '0.75rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {cat.options.map((opt) => {
                    const isBelow = opt.vote_percentage < threshold;
                    const isPruned = !opt.is_active;

                    return (
                      <div
                        key={opt.id}
                        style={{
                          border: '1px solid',
                          borderColor: isPruned ? '#e2e8f0' : (isBelow ? '#fed7aa' : '#bbf7d0'),
                          backgroundColor: isPruned ? '#f8fafc' : (isBelow ? '#fff7ed' : '#f0fdf4'),
                          borderRadius: '8px',
                          padding: '0.75rem',
                          opacity: isPruned ? 0.6 : 1
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                          <span style={{
                            fontSize: '0.86rem',
                            fontWeight: 700,
                            color: isPruned ? '#94a3b8' : '#0f172a',
                            textDecoration: isPruned ? 'line-through' : 'none'
                          }}>
                            {opt.dish_name}
                          </span>

                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: isPruned ? '#fee2e2' : (isBelow ? '#fef3c7' : '#dcfce7'),
                            color: isPruned ? '#b91c1c' : (isBelow ? '#b45309' : '#15803d')
                          }}>
                            {isPruned ? 'Pruned' : (isBelow ? 'Wastage Risk' : 'High Demand')}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.35rem' }}>
                          <span>{opt.votes} student votes</span>
                          <strong>{opt.vote_percentage}%</strong>
                        </div>

                        <div style={{ width: '100%', height: '5px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${Math.min(opt.vote_percentage, 100)}%`,
                              height: '100%',
                              backgroundColor: isPruned ? '#cbd5e1' : (isBelow ? '#ea580c' : '#059669'),
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPreferenceManager;

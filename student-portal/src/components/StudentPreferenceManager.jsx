import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Sparkles, 
  Check, 
  AlertTriangle, 
  TrendingUp, 
  ThumbsUp, 
  Leaf, 
  CheckCircle2, 
  X, 
  Award,
  ChevronRight,
  RefreshCw,
  Clock,
  Flame,
  Info,
  Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { preferenceApi } from '../api/client';

const StudentPreferenceManager = ({ onPreferenceSubmitted, isModal = false, onClose = null }) => {
  const [activeSession, setActiveSession] = useState('lunch');
  const [pollData, setPollData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDishes, setSelectedDishes] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  useEffect(() => {
    loadPoll(activeSession);
  }, [activeSession]);

  const loadPoll = async (session) => {
    setLoading(true);
    try {
      const res = await preferenceApi.getPoll(session);
      if (res) {
        setPollData(res);
        // Pre-populate selections if student previously selected
        const initialSelections = {};
        if (res.student_selection && res.student_selection.length > 0) {
          res.categories?.forEach((cat) => {
            const found = cat.options.find((opt) => res.student_selection.includes(opt.id) || res.student_selection.includes(opt.dish_name));
            if (found) {
              initialSelections[cat.category] = found.id;
            }
          });
        }
        setSelectedDishes(initialSelections);
      }
    } catch (err) {
      console.warn('Failed to load preference poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const isDailyLimitReached = Boolean(pollData?.daily_limit_reached);

  const handleSelectOption = (category, optionId) => {
    if (isDailyLimitReached) return;
    setSelectedDishes((prev) => ({
      ...prev,
      [category]: optionId,
    }));
  };

  const handleSubmit = async () => {
    if (isDailyLimitReached) {
      setErrorToast(`Daily limit reached: You have already filled your meal preference for today (${pollData?.voted_session || 'Lunch'} session). Each student can fill 1 preference per day.`);
      setTimeout(() => setErrorToast(null), 4000);
      return;
    }

    const optionIds = Object.values(selectedDishes);
    if (optionIds.length === 0) {
      alert('Please select at least one dish preference before confirming.');
      return;
    }

    setSubmitting(true);
    setErrorToast(null);
    try {
      const res = await preferenceApi.submitVote({
        session: activeSession,
        selected_option_ids: optionIds,
        notes: 'Submitted via Student Dining Portal'
      });

      if (res?.success) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#047857', '#10b981', '#f59e0b', '#3b82f6']
        });

        setSuccessToast(res.message || 'Preferences recorded! +15 Eco Points added to your balance.');
        if (res.updated_poll) {
          setPollData(res.updated_poll);
        } else {
          await loadPoll(activeSession);
        }

        if (onPreferenceSubmitted) {
          onPreferenceSubmitted(res);
        }

        setTimeout(() => {
          setSuccessToast(null);
          if (isModal && onClose) {
            onClose();
          }
        }, 2200);
      }
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to submit preference.';
      setErrorToast(msg);
      setTimeout(() => setErrorToast(null), 4500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`student-preference-hub ${isModal ? 'preference-modal-view' : ''}`} style={{
      background: '#ffffff',
      borderRadius: '16px',
      border: '1px solid #e2e8f0',
      padding: isModal ? '1.75rem' : '1.5rem',
      boxShadow: isModal ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 1px 3px rgba(0,0,0,0.05)',
      position: 'relative'
    }}>
      {/* Header bar */}
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
              Student Dining Preference Poll
            </h2>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              backgroundColor: '#fef3c7',
              color: '#b45309',
              padding: '0.2rem 0.6rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <Award size={12} /> Earn +15 Eco Pts
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748b', maxWidth: '640px' }}>
            Vote for the major dish options you want today. The mess uses collective student preferences to cook precisely what is demanded and <strong>removes options with low preference (&lt;20%)</strong> to eliminate kitchen food wastage.
          </p>
        </div>

        {isModal && onClose && (
          <button 
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Session Switcher & Zero-Waste Impact Summary */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        marginBottom: '1.25rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
        border: '1px solid #e2e8f0'
      }}>
        {/* Session toggle buttons */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {[
            { id: 'lunch', label: 'Lunch Session', icon: '☀️' },
            { id: 'dinner', label: 'Dinner Session', icon: '🌙' },
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

        {/* Live stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#475569' }}>
            <TrendingUp size={15} color="#047857" />
            <span><strong>{pollData?.total_voters || 290}</strong> Students Voted</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#047857', fontWeight: 600 }}>
            <Leaf size={15} />
            <span>{pollData?.waste_prevented_kg ? `${pollData.waste_prevented_kg}kg Waste Saved` : 'Wastage Cutoff: 20%'}</span>
          </div>
        </div>
      </div>

      {/* Daily 1-Preference Limit Banner */}
      {isDailyLimitReached && (
        <div style={{
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '10px',
          padding: '0.85rem 1.1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#1e40af',
          fontSize: '0.86rem'
        }}>
          <Lock size={20} color="#2563eb" style={{ flexShrink: 0 }} />
          <div>
            <strong>Daily Limit Active (1 Submission Per Day):</strong> You have already submitted your meal preference for today ({pollData?.voted_session || 'Lunch'} session). To ensure optimal and balanced meal batching, each student can fill 1 preference entry per day. Your selections below are locked in the kitchen queue.
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successToast && (
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
          <span>{successToast}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorToast && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#991b1b',
          fontSize: '0.875rem',
          fontWeight: 600
        }}>
          <AlertTriangle size={18} color="#dc2626" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Voting Cards Grouped by Category */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          <RefreshCw size={24} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>Loading live student preference tally...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {pollData?.categories?.map((catGroup) => {
            const currentSelection = selectedDishes[catGroup.category];

            return (
              <div 
                key={catGroup.category} 
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '1rem',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Category Title */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1e293b' }}>
                      {catGroup.category}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      Pick 1 favorite
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Total Category Votes: <strong>{catGroup.total_category_votes}</strong>
                  </div>
                </div>

                {/* Candidate Options in Category */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
                  {catGroup.options.map((opt) => {
                    const isSelected = currentSelection === opt.id || (pollData?.student_selection && pollData.student_selection.includes(opt.id));
                    const isBelowThreshold = opt.vote_percentage < opt.min_threshold_pct;
                    const isPruned = !opt.is_active;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => {
                          if (!isPruned && !isDailyLimitReached) handleSelectOption(catGroup.category, opt.id);
                        }}
                        style={{
                          border: '2px solid',
                          borderColor: isSelected ? '#047857' : (isPruned ? '#f1f5f9' : '#e2e8f0'),
                          borderRadius: '10px',
                          padding: '0.85rem',
                          backgroundColor: isSelected ? '#f0fdf4' : (isPruned ? '#f8fafc' : '#ffffff'),
                          cursor: (isPruned || isDailyLimitReached) ? 'not-allowed' : 'pointer',
                          opacity: isPruned ? 0.6 : 1,
                          transition: 'all 0.15s ease',
                          position: 'relative',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          {/* Dish Name & Dietary Tag */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.35rem' }}>
                            <span style={{ 
                              fontSize: '0.88rem', 
                              fontWeight: 700, 
                              color: isPruned ? '#94a3b8' : '#0f172a',
                              textDecoration: isPruned ? 'line-through' : 'none'
                            }}>
                              {opt.dish_name}
                            </span>

                            {isSelected && (
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: '#047857',
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </div>

                          {/* Description */}
                          {opt.description && (
                            <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.76rem', color: '#64748b', lineHeight: 1.35 }}>
                              {opt.description}
                            </p>
                          )}
                        </div>

                        {/* Voting percentage bar & status badge */}
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.75rem' }}>
                            <span style={{ color: '#475569', fontWeight: 600 }}>
                              {opt.votes} votes ({opt.vote_percentage}%)
                            </span>

                            {isPruned ? (
                              <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.7rem' }}>
                                Removed (Low Demand)
                              </span>
                            ) : isBelowThreshold ? (
                              <span style={{ color: '#d97706', fontWeight: 700, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <AlertTriangle size={11} /> Wastage Risk (&lt;20%)
                              </span>
                            ) : (
                              <span style={{ color: '#047857', fontWeight: 700, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                <Check size={11} /> High Demand
                              </span>
                            )}
                          </div>

                          {/* Progress Bar */}
                          <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                            <div 
                              style={{ 
                                width: `${Math.min(opt.vote_percentage, 100)}%`, 
                                height: '100%', 
                                backgroundColor: isPruned ? '#cbd5e1' : (isBelowThreshold ? '#f59e0b' : '#047857'),
                                transition: 'width 0.3s ease'
                              }} 
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Action Footer */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1.25rem',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#64748b' }}>
          <Info size={16} color="#047857" />
          <span>
            {Object.keys(selectedDishes).length} of {pollData?.categories?.length || 4} categories selected. Voting closes 1.5h before preparation starts.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {isModal && onClose && (
            <button
              onClick={onClose}
              style={{
                padding: '0.55rem 1.1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#475569',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Decide Later
            </button>
          )}

          {isDailyLimitReached ? (
            <button
              disabled={true}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'not-allowed',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <CheckCircle2 size={16} color="#059669" />
              Preference Submitted Today (1/1 Limit Reached)
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting || Object.keys(selectedDishes).length === 0}
              style={{
                padding: '0.55rem 1.4rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#047857',
                color: '#ffffff',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: (submitting || Object.keys(selectedDishes).length === 0) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 2px 4px rgba(4, 120, 87, 0.25)',
                opacity: (submitting || Object.keys(selectedDishes).length === 0) ? 0.6 : 1
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="spin-icon" />
                  Recording Vote...
                </>
              ) : (
                <>
                  <ThumbsUp size={15} />
                  Lock My Preferences (+15 Pts)
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPreferenceManager;

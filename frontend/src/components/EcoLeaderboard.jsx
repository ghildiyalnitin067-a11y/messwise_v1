import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Award, 
  Flame, 
  Leaf, 
  Sparkles, 
  Search, 
  Filter, 
  ArrowUp, 
  TrendingUp, 
  Star, 
  ShieldCheck, 
  Gift, 
  ChevronRight, 
  Users,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { studentApi } from '../api/client';

const DEFAULT_LEADERBOARD = [
  {
    rank: 1,
    id: 'st-aarav-01',
    name: 'Aarav Patel',
    avatar: '🥇',
    roll_no: '2022CSB019',
    hostel: 'Hostel B (Ramanujan)',
    room: 'A-108',
    eco_points: 940,
    meals_saved: 31,
    co2_avoided_kg: 48.5,
    streak_days: 28,
    tier: 'Eco Legend',
    badge: '🥇 1st Gold',
    is_current_user: false,
  },
  {
    rank: 2,
    id: 'st-priya-02',
    name: 'Priya Sharma',
    avatar: '🥈',
    roll_no: '2023EEB054',
    hostel: 'Hostel C (Gargi)',
    room: 'C-212',
    eco_points: 875,
    meals_saved: 28,
    co2_avoided_kg: 42.1,
    streak_days: 24,
    tier: 'Green Champion',
    badge: '🥈 2nd Silver',
    is_current_user: false,
  },
  {
    rank: 3,
    id: 'st-rohan-03',
    name: 'Rohan Sengupta',
    avatar: '🥉',
    roll_no: '2022MEB088',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-114',
    eco_points: 790,
    meals_saved: 25,
    co2_avoided_kg: 38.0,
    streak_days: 21,
    tier: 'Green Champion',
    badge: '🥉 3rd Bronze',
    is_current_user: false,
  },
  {
    rank: 4,
    id: 'st-ananya-04',
    name: 'Ananya Iyer',
    avatar: '⭐',
    roll_no: '2023CSB112',
    hostel: 'Hostel C (Gargi)',
    room: 'D-305',
    eco_points: 710,
    meals_saved: 22,
    co2_avoided_kg: 33.2,
    streak_days: 19,
    tier: 'Sustainability Hero',
    badge: '⭐ Top 5',
    is_current_user: false,
  },
  {
    rank: 5,
    id: 'usr-student-01',
    name: 'Nitin Sharma',
    avatar: '👨‍🎓',
    roll_no: '2022CSB042',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-304',
    eco_points: 580,
    meals_saved: 14,
    co2_avoided_kg: 24.0,
    streak_days: 18,
    tier: 'Sustainability Hero',
    badge: '⭐ Top 5',
    is_current_user: true,
  },
  {
    rank: 6,
    id: 'st-siddharth-05',
    name: 'Siddharth Rao',
    avatar: '🌱',
    roll_no: '2022CHB031',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-402',
    eco_points: 540,
    meals_saved: 16,
    co2_avoided_kg: 25.4,
    streak_days: 14,
    tier: 'Sustainability Hero',
    badge: '🌿 Top 10',
    is_current_user: false,
  },
  {
    rank: 7,
    id: 'st-divya-06',
    name: 'Divya Nair',
    avatar: '🌿',
    roll_no: '2024CSB009',
    hostel: 'Hostel B (Ramanujan)',
    room: 'A-321',
    eco_points: 490,
    meals_saved: 15,
    co2_avoided_kg: 22.8,
    streak_days: 12,
    tier: 'Eco Warrior',
    badge: '🌿 Top 10',
    is_current_user: false,
  },
  {
    rank: 8,
    id: 'st-kabir-07',
    name: 'Kabir Joshi',
    avatar: '🍃',
    roll_no: '2023CEB077',
    hostel: 'Hostel D (Kalam)',
    room: 'E-101',
    eco_points: 430,
    meals_saved: 13,
    co2_avoided_kg: 19.5,
    streak_days: 10,
    tier: 'Eco Warrior',
    badge: '🌿 Top 10',
    is_current_user: false,
  },
  {
    rank: 9,
    id: 'st-sneha-08',
    name: 'Sneha Kulkarni',
    avatar: '🌾',
    roll_no: '2024EEB043',
    hostel: 'Hostel C (Gargi)',
    room: 'C-118',
    eco_points: 380,
    meals_saved: 11,
    co2_avoided_kg: 16.2,
    streak_days: 8,
    tier: 'Sprout',
    badge: '🌿 Top 10',
    is_current_user: false,
  },
  {
    rank: 10,
    id: 'st-vikram-09',
    name: 'Vikram Malhotra',
    avatar: '🍀',
    roll_no: '2022MEB015',
    hostel: 'Hostel B (Ramanujan)',
    room: 'A-205',
    eco_points: 320,
    meals_saved: 9,
    co2_avoided_kg: 13.8,
    streak_days: 7,
    tier: 'Sprout',
    badge: '🌿 Top 10',
    is_current_user: false,
  },
];

const EcoLeaderboard = ({ currentStudent, onNavigateTab }) => {
  const [leaderboardData, setLeaderboardData] = useState(DEFAULT_LEADERBOARD);
  const [currentUserRank, setCurrentUserRank] = useState(5);
  const [currentUserPoints, setCurrentUserPoints] = useState(580);
  const [pointsToNext, setPointsToNext] = useState(130);
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, [currentStudent?.eco_points, currentStudent?.meals_saved]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await studentApi.getLeaderboard();
      if (res && res.leaderboard) {
        setLeaderboardData(res.leaderboard);
        setCurrentUserRank(res.current_student_rank || 5);
        setCurrentUserPoints(res.current_student_points || (currentStudent?.eco_points || 580));
        setPointsToNext(res.points_to_next_rank || 130);
      } else {
        const updated = DEFAULT_LEADERBOARD.map((item) => {
          if (item.is_current_user) {
            const pts = currentStudent?.eco_points || 580;
            const saved = currentStudent?.meals_saved || 14;
            const co2 = currentStudent?.co2_avoided_kg || 24.0;
            return { ...item, eco_points: pts, meals_saved: saved, co2_avoided_kg: co2 };
          }
          return item;
        }).sort((a, b) => b.eco_points - a.eco_points);

        const rankMap = updated.map((it, idx) => ({ ...it, rank: idx + 1 }));
        setLeaderboardData(rankMap);
        const me = rankMap.find((it) => it.is_current_user);
        if (me) {
          setCurrentUserRank(me.rank);
          setCurrentUserPoints(me.eco_points);
          const above = rankMap[me.rank - 2];
          setPointsToNext(above ? Math.max(0, above.eco_points - me.eco_points + 1) : 0);
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = leaderboardData
    .filter((entry) => {
      const matchHostel = selectedHostel === 'all' || entry.hostel.toLowerCase().includes(selectedHostel.toLowerCase());
      const matchSearch =
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.hostel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchHostel && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'streak') return b.streak_days - a.streak_days;
      if (sortBy === 'saved') return b.meals_saved - a.meals_saved;
      return b.eco_points - a.eco_points;
    });

  const top1 = leaderboardData[0];
  const top2 = leaderboardData[1];
  const top3 = leaderboardData[2];

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Eco Legend':
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case 'Green Champion':
        return { bg: '#e0f2fe', text: '#075985', border: '#7dd3fc' };
      case 'Sustainability Hero':
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case 'Eco Warrior':
        return { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe' };
      default:
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
    }
  };

  return (
    <div className="leaderboard-view">
      {/* 1. Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1d3324 0%, #283e2e 50%, #35533e 100%)',
          color: '#ffffff',
          borderRadius: '20px',
          padding: '2rem 2.25rem',
          marginBottom: '1.75rem',
          boxShadow: '3px 4px 0px #1a2e20',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(8px)',
                padding: '0.35rem 0.85rem',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#c2d8c7',
                marginBottom: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Sparkles size={14} color="#fcd34d" /> Campus Sustainability League • Term 2025
            </div>
            <h1
              style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '2.1rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                marginBottom: '0.6rem',
                color: '#ffffff',
              }}
            >
              Eco Points Leaderboard 🏆
            </h1>
            <p style={{ color: '#d6e2d4', fontSize: '0.96rem', lineHeight: 1.5, margin: 0 }}>
              Recognizing student eco boarders leading zero food-waste practices, timely meal opt-outs, and farm produce rescues.
            </p>
          </div>

          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              borderRadius: '16px',
              padding: '1.25rem 1.5rem',
              minWidth: '280px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#c2d8c7', fontWeight: 800 }}>
                Your Standing
              </span>
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '999px',
                }}
              >
                Rank #{currentUserRank}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                {currentUserPoints}
              </span>
              <span style={{ fontSize: '0.9rem', color: '#c2d8c7', fontWeight: 600 }}>Eco Points</span>
            </div>
            {pointsToNext > 0 ? (
              <div style={{ fontSize: '0.82rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <ArrowUp size={14} /> +{pointsToNext} pts to overtake Rank #{currentUserRank - 1}!
              </div>
            ) : (
              <div style={{ fontSize: '0.82rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                👑 You are holding the top leaderboard spot!
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            right: '-40px',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(134, 239, 172, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* 2. Top 3 Champions Podium */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Trophy size={18} color="#283e2e" />
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
            Top Campus Sustainability Champions
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            alignItems: 'end',
          }}
        >
          {/* 🥈 #2 Silver */}
          {top2 && (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #e2ece4',
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '3px 4px 0px #748879',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#f1f5f9',
                  color: '#475569',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                }}
              >
                🥈 2nd Place
              </div>
              <div style={{ fontSize: '3rem', margin: '0.5rem 0 0.25rem' }}>🥈</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d3324', marginBottom: '0.15rem' }}>{top2.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#55685a', marginBottom: '0.75rem' }}>{top2.hostel}</p>

              <div
                style={{
                  background: '#f8faf5',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  border: '1px solid #e2ece4',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d3324' }}>{top2.eco_points}</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Eco Points</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>{top2.meals_saved}</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Meals Saved</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>🔥{top2.streak_days}d</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Streak</div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                {top2.tier}
              </span>
            </div>
          )}

          {/* 🥇 #1 Gold Champion */}
          {top1 && (
            <div
              style={{
                background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 40%)',
                border: '2px solid #f59e0b',
                borderRadius: '20px',
                padding: '1.85rem 1.5rem',
                boxShadow: '4px 6px 0px #b45309',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                transform: 'scale(1.02)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-14px',
                  background: 'linear-gradient(90deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.9rem',
                  borderRadius: '999px',
                  boxShadow: '0 2px 4px rgba(217, 119, 6, 0.3)',
                }}
              >
                👑 CAMPUS LEADER
              </div>
              <div style={{ fontSize: '3.6rem', margin: '0.4rem 0 0.25rem' }}>🥇</div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1d3324', marginBottom: '0.15rem' }}>{top1.name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#55685a', marginBottom: '0.85rem' }}>{top1.hostel}</p>

              <div
                style={{
                  background: '#fef3c7',
                  borderRadius: '14px',
                  padding: '0.85rem 1.25rem',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  border: '1px solid #fde68a',
                  marginBottom: '0.85rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#92400e' }}>{top1.eco_points}</div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>Eco Points</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#047857' }}>{top1.meals_saved}</div>
                  <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 700 }}>Meals Saved</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#dc2626' }}>🔥{top1.streak_days}d</div>
                  <div style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: 700 }}>Streak</div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  padding: '0.3rem 0.9rem',
                  borderRadius: '999px',
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fcd34d',
                }}
              >
                👑 {top1.tier}
              </span>
            </div>
          )}

          {/* 🥉 #3 Bronze */}
          {top3 && (
            <div
              style={{
                background: '#ffffff',
                border: '2px solid #e2ece4',
                borderRadius: '18px',
                padding: '1.5rem',
                boxShadow: '3px 4px 0px #748879',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: '#fff7ed',
                  color: '#9a3412',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                }}
              >
                🥉 3rd Place
              </div>
              <div style={{ fontSize: '3rem', margin: '0.5rem 0 0.25rem' }}>🥉</div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1d3324', marginBottom: '0.15rem' }}>{top3.name}</h3>
              <p style={{ fontSize: '0.82rem', color: '#55685a', marginBottom: '0.75rem' }}>{top3.hostel}</p>

              <div
                style={{
                  background: '#f8faf5',
                  borderRadius: '12px',
                  padding: '0.75rem 1rem',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-around',
                  border: '1px solid #e2ece4',
                  marginBottom: '0.75rem',
                }}
              >
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d3324' }}>{top3.eco_points}</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Eco Points</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#047857' }}>{top3.meals_saved}</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Meals Saved</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706' }}>🔥{top3.streak_days}d</div>
                  <div style={{ fontSize: '0.72rem', color: '#748879', fontWeight: 600 }}>Streak</div>
                </div>
              </div>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '999px',
                  background: '#e0f2fe',
                  color: '#0369a1',
                }}
              >
                {top3.tier}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Filter Bar & Search Controls */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #d6e2d4',
          padding: '1.2rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '2px 3px 0px rgba(40, 62, 46, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8faf5',
              border: '1px solid #d6e2d4',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
              minWidth: '220px',
            }}
          >
            <Search size={16} color="#748879" />
            <input
              type="text"
              placeholder="Search student or roll no..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.85rem',
                width: '100%',
                color: '#1d3324',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#55685a' }}>Hostel:</span>
            {['all', 'Hostel A', 'Hostel B', 'Hostel C'].map((h) => (
              <button
                key={h}
                onClick={() => setSelectedHostel(h)}
                style={{
                  border: '1px solid',
                  borderColor: selectedHostel === h ? '#283e2e' : '#d6e2d4',
                  background: selectedHostel === h ? '#283e2e' : '#ffffff',
                  color: selectedHostel === h ? '#ffffff' : '#1d3324',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  padding: '0.4rem 0.75rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {h === 'all' ? 'All Hostels' : h}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#55685a' }}>Sort by:</span>
          {[
            { id: 'points', label: 'Eco Points' },
            { id: 'streak', label: 'Streak 🔥' },
            { id: 'saved', label: 'Meals Saved' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setSortBy(s.id)}
              style={{
                border: '1px solid',
                borderColor: sortBy === s.id ? '#44684f' : '#d6e2d4',
                background: sortBy === s.id ? '#eaf2ec' : '#ffffff',
                color: sortBy === s.id ? '#1d3324' : '#748879',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '0.4rem 0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Full Ranked Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #d6e2d4',
          overflow: 'hidden',
          boxShadow: '3px 4px 0px #283e2e',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            padding: '1.15rem 1.5rem',
            borderBottom: '1px solid #d6e2d4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafbf9',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="#283e2e" />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1d3324' }}>
              Full Campus Rankings ({filteredEntries.length} Students)
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#55685a', fontWeight: 600 }}>
            Updates live on RSVP changes & zero-waste menu opt-ins
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: '#f0f5f1', borderBottom: '1px solid #d6e2d4', color: '#44684f', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '0.85rem 1.25rem', width: '80px' }}>Rank</th>
                <th style={{ padding: '0.85rem 1rem' }}>Student Boarder</th>
                <th style={{ padding: '0.85rem 1rem' }}>Hostel & Room</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Eco Points</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Streak</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Meals Saved</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>CO₂ Avoided</th>
                <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Tier Badge</th>
              </tr>
            </thead>
            <tbody>
              {filteredEntries.map((row) => {
                const tierStyle = getTierColor(row.tier);
                const isMe = row.is_current_user;

                return (
                  <tr
                    key={row.id}
                    style={{
                      borderBottom: '1px solid #eef3ec',
                      background: isMe ? '#f0fdf4' : 'transparent',
                      transition: 'background 0.15s ease',
                      fontWeight: isMe ? 700 : 500,
                    }}
                    onMouseEnter={(e) => {
                      if (!isMe) e.currentTarget.style.background = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (!isMe) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {row.rank === 1 ? (
                          <span style={{ fontSize: '1.25rem' }}>🥇</span>
                        ) : row.rank === 2 ? (
                          <span style={{ fontSize: '1.25rem' }}>🥈</span>
                        ) : row.rank === 3 ? (
                          <span style={{ fontSize: '1.25rem' }}>🥉</span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: isMe ? '#22c55e' : '#e2ece4',
                              color: isMe ? '#ffffff' : '#283e2e',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                            }}
                          >
                            {row.rank}
                          </span>
                        )}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{row.avatar}</span>
                        <div>
                          <div style={{ color: '#1d3324', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span>{row.name}</span>
                            {isMe && (
                              <span
                                style={{
                                  background: '#283e2e',
                                  color: '#ffffff',
                                  fontSize: '0.68rem',
                                  fontWeight: 800,
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: '999px',
                                  textTransform: 'uppercase',
                                }}
                              >
                                You
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#748879', fontFamily: 'monospace' }}>
                            {row.roll_no}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', color: '#55685a' }}>
                      <div>{row.hostel}</div>
                      {row.room && <div style={{ fontSize: '0.75rem', color: '#748879' }}>Room {row.room}</div>}
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: isMe ? '#dcfce7' : '#f0f5f1',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '10px',
                          border: isMe ? '1px solid #86efac' : '1px solid #d6e2d4',
                        }}
                      >
                        <Leaf size={14} color="#15803d" />
                        <span
                          style={{
                            fontWeight: 800,
                            fontFamily: 'Outfit, sans-serif',
                            fontSize: '1rem',
                            color: '#15803d',
                          }}
                        >
                          {row.eco_points}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.2rem',
                          color: '#d97706',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        <Flame size={14} color="#f59e0b" />
                        {row.streak_days}d
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center', color: '#1d3324', fontWeight: 600 }}>
                      {row.meals_saved} meals
                    </td>

                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center', color: '#44684f', fontWeight: 600 }}>
                      {row.co2_avoided_kg.toFixed(1)} kg
                    </td>

                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '0.25rem 0.65rem',
                          borderRadius: '999px',
                          background: tierStyle.bg,
                          color: tierStyle.text,
                          border: `1px solid ${tierStyle.border}`,
                        }}
                      >
                        {row.tier}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. How to Earn Eco Points + Campus Milestone Perks */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #d6e2d4',
            padding: '1.5rem',
            boxShadow: '2px 3px 0px rgba(40, 62, 46, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Sparkles size={18} color="#283e2e" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
              How to Earn Eco Points
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#f8faf5',
                border: '1px solid #e2ece4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.3rem' }}>⏰</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1d3324' }}>Timely Meal Opt-Out</div>
                  <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Cancel attendance 2h prior to prep cycle</div>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>+30 Points</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#f8faf5',
                border: '1px solid #e2ece4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🥗</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1d3324' }}>Claim Zero-Waste Special</div>
                  <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Add rescued fresh farm produce to plate</div>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>+25 Points</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#f8faf5',
                border: '1px solid #e2ece4',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🍽️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#1d3324' }}>Zero Plate-Waste Review</div>
                  <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Submit feedback confirming finished meal</div>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#15803d', fontSize: '0.85rem' }}>+15 Points</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '12px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🔥</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.86rem', color: '#92400e' }}>7-Day Green Streak</div>
                  <div style={{ fontSize: '0.75rem', color: '#b45309' }}>Zero food waste log for full week</div>
                </div>
              </div>
              <span style={{ fontWeight: 800, color: '#b45309', fontSize: '0.85rem' }}>+100 Bonus</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            borderRadius: '18px',
            border: '1px solid #d6e2d4',
            padding: '1.5rem',
            boxShadow: '2px 3px 0px rgba(40, 62, 46, 0.08)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Gift size={18} color="#283e2e" />
            <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
              Campus Eco Milestone Perks
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: currentUserPoints >= 400 ? '#f0fdf4' : '#fafafa',
                border: currentUserPoints >= 400 ? '1px solid #86efac' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>🎟️</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1d3324' }}>
                    Mess Express Priority Pass
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentUserPoints >= 400 ? '#15803d' : '#9ca3af' }}>
                    {currentUserPoints >= 400 ? '✓ Unlocked' : '400 pts'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Skip rush peak queues during dinner rush hours</div>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: currentUserPoints >= 650 ? '#f0fdf4' : '#fafafa',
                border: currentUserPoints >= 650 ? '1px solid #86efac' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>🍰</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1d3324' }}>
                    Chef's Weekend Premium Dessert
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentUserPoints >= 650 ? '#15803d' : '#9ca3af' }}>
                    {currentUserPoints >= 650 ? '✓ Unlocked' : `${650 - currentUserPoints} pts to go`}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Complimentary Gulab Jamun / Kulfi on Sunday dinners</div>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                borderRadius: '12px',
                background: currentUserPoints >= 850 ? '#f0fdf4' : '#fafafa',
                border: currentUserPoints >= 850 ? '1px solid #86efac' : '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div style={{ fontSize: '1.6rem' }}>📜</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#1d3324' }}>
                    Dean's Green Honor Certificate
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: currentUserPoints >= 850 ? '#15803d' : '#9ca3af' }}>
                    {currentUserPoints >= 850 ? '✓ Unlocked' : '850 pts required'}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#55685a' }}>Official campus sustainability recognition on transcript</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcoLeaderboard;

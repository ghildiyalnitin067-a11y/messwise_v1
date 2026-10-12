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
import axios from 'axios';

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

const EcoLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState(DEFAULT_LEADERBOARD);
  const [selectedHostel, setSelectedHostel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('points');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://127.0.0.1:8000/api/v1/student/leaderboard');
      if (res?.data?.leaderboard) {
        setLeaderboardData(res.data.leaderboard);
      }
    } catch {
      // Default data fallback
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
        <div style={{ position: 'relative', zIndex: 2 }}>
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
            <Sparkles size={14} color="#fcd34d" /> Mess Supervisor Analytics • Student Sustainability League
          </div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '0.6rem',
              color: '#ffffff',
            }}
          >
            Student Eco Points Leaderboard 🏆
          </h1>
          <p style={{ color: '#d6e2d4', fontSize: '0.96rem', lineHeight: 1.5, maxWidth: '700px', margin: 0 }}>
            Track boarder engagement with proactive meal RSVP opt-outs, plate waste prevention, and zero-waste chef specials across campus hostels.
          </p>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Trophy size={18} color="#283e2e" />
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#1d3324', margin: 0 }}>
            Campus Eco Champions
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

      {/* Filter and Table */}
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
                }}
              >
                {h === 'all' ? 'All Hostels' : h}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#55685a' }}>Sort:</span>
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

      <div
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          border: '1px solid #d6e2d4',
          overflow: 'hidden',
          boxShadow: '3px 4px 0px #283e2e',
        }}
      >
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
                return (
                  <tr key={row.id} style={{ borderBottom: '1px solid #eef3ec' }}>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle' }}>
                      {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : row.rank === 3 ? '🥉' : row.rank}
                    </td>
                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <span style={{ fontSize: '1.2rem' }}>{row.avatar}</span>
                        <div>
                          <div style={{ color: '#1d3324', fontWeight: 700 }}>{row.name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#748879', fontFamily: 'monospace' }}>{row.roll_no}</div>
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
                          background: '#f0f5f1',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '10px',
                          border: '1px solid #d6e2d4',
                        }}
                      >
                        <Leaf size={14} color="#15803d" />
                        <span style={{ fontWeight: 800, color: '#15803d' }}>{row.eco_points}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      <span style={{ color: '#d97706', fontWeight: 700 }}>🔥 {row.streak_days}d</span>
                    </td>
                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                      {row.meals_saved} meals
                    </td>
                    <td style={{ padding: '1rem 1rem', verticalAlign: 'middle', textAlign: 'center', color: '#44684f' }}>
                      {row.co2_avoided_kg.toFixed(1)} kg
                    </td>
                    <td style={{ padding: '1rem 1.25rem', verticalAlign: 'middle', textAlign: 'right' }}>
                      <span
                        style={{
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
    </div>
  );
};

export default EcoLeaderboard;

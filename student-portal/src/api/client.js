import axios from 'axios';

const rawEnvUrl = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').trim().replace(/\/+$/, '');
const API_BASE_URL = rawEnvUrl.endsWith('/api/v1') ? rawEnvUrl : `${rawEnvUrl}/api/v1`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('messwise_jwt_token') || 'mock-student-token-2025';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MOCK_STUDENT = {
  id: 'usr-student-01',
  name: 'Nitin Sharma',
  email: 'nitin.sharma@campus.edu',
  enrollment_no: '2023CSB1042',
  role: 'student',
  hostel: 'Hostel A (Aryabhatta)',
  room: 'B-304',
  diet: 'Vegetarian',
  meals_booked: 82,
  meals_saved: 14,
  co2_avoided_kg: 24.0,
  eco_rank: 12,
};

const MOCK_MEALS = {
  date: '2025-09-16',
  meals: {
    breakfast: { session: 'breakfast', menu: 'Poha + Milk + Banana', time: '7:00 AM - 9:00 AM', booked: true, status: 'Booked', token: 'BKF-892' },
    lunch: {
      session: 'lunch',
      menu: 'Rajma + Jeera Rice + Roti + Salad',
      time: '12:00 PM - 2:00 PM',
      booked: true,
      status: 'Booked',
      token: 'LCH-419',
      addons: [
        {
          addon_id: 'ADDON-TOMATO-01',
          ingredient_id: 'tomato',
          ingredient_name: 'Tomato (Hybrid)',
          name: 'Fresh Tomato Shorba & Roasted Chutney (Zero-Waste Special)',
          meal_session: 'lunch',
          portions_target: 250,
          portions_claimed: 142,
          description: "Chef's Sustainability Special: Rescuing 35kg farm-fresh tomatoes nearing shelf-life cutoff. +25 Eco Points!",
          eco_points: 25,
          waste_rescued_per_portion_kg: 0.06,
          co2_saved_per_portion_kg: 0.084,
          status: 'active'
        }
      ]
    },
    dinner: { session: 'dinner', menu: 'Paneer Butter Masala + Roti + Dal', time: '7:00 PM - 9:00 PM', booked: false, status: 'Not Booked', token: null },
  },
};


export const authApi = {
  loginStudent: async (enrollment_no, father_name) => {
    localStorage.setItem('messwise_jwt_token', 'mock-student-token-2025');
    try {
      const res = await api.post('/auth/student/login', { enrollment_no, father_name });
      return res.data;
    } catch {
      return { access_token: 'mock-student-token-2025', role: 'student', user: MOCK_STUDENT };
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data || MOCK_STUDENT;
    } catch {
      return MOCK_STUDENT;
    }
  },
  logout: async () => {
    localStorage.removeItem('messwise_jwt_token');
    try {
      await api.post('/auth/logout');
    } catch {}
  },
};

export const studentApi = {
  getTodayMeals: async () => {
    try {
      const res = await api.get('/student/meals/today');
      if (res?.data?.meals) return res.data;
      return MOCK_MEALS;
    } catch {
      return MOCK_MEALS;
    }
  },
  getWeeklyMenu: async () => {
    try {
      const res = await api.get('/student/menu/weekly');
      if (res?.data?.schedule) return res.data;
      return null;
    } catch {
      return null;
    }
  },
  toggleBooking: async (mealSession) => {
    try {
      const res = await api.post('/student/meals/toggle', { meal_session: mealSession });
      return res.data;
    } catch {
      return { success: true, meal_session: mealSession };
    }
  },
  submitFeedback: async (mealSession, rating, comments) => {
    try {
      const res = await api.post('/student/feedback', {
        meal_session: mealSession,
        rating,
        comment: comments,
      });
      return res.data;
    } catch {
      return { success: true };
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data || MOCK_STUDENT;
    } catch {
      return MOCK_STUDENT;
    }
  },
  optInAddon: async (addonId, studentId = 'usr-student-01') => {
    try {
      const res = await api.post('/stock/addons/opt-in', {
        addon_id: addonId,
        student_id: studentId,
      });
      return res.data;
    } catch {
      return {
        addon_id: addonId,
        status: 'confirmed',
        eco_points_awarded: 25,
        portions_claimed: 143,
        waste_rescued_kg: 0.06,
        co2_avoided_kg: 0.084,
        message: 'Sustainability Add-On confirmed! +25 Eco Points awarded.',
      };
    }
  },
  earnPoints: async (points, action = 'eco_action', details = 'Sustainability Action', mealsSavedInc = 0, co2Inc = 0) => {
    // 1. Instantaneous 0ms client-side broadcast across tabs, windows, and ports
    broadcastPointsEarned({
      student_id: 'usr-student-01',
      student_name: 'Nitin Sharma',
      points_added: points,
      action: action,
      details: details,
      meals_saved_increment: mealsSavedInc,
      co2_avoided_increment: co2Inc,
      timestamp: new Date().toISOString(),
    });

    // 2. Non-blocking asynchronous backend call
    try {
      const res = await api.post('/student/points/earn', {
        student_id: 'usr-student-01',
        points: points,
        action: action,
        details: details,
      });
      return res.data;
    } catch {
      return {
        success: true,
        student_id: 'usr-student-01',
        points_added: points,
        current_points: 580 + points,
        action: action,
        message: `+${points} Eco Points recorded!`,
      };
    }
  },
  getLeaderboard: async () => {
    try {
      const res = await api.get('/student/leaderboard');
      if (res?.data?.leaderboard) return res.data;
      return null;
    } catch {
      return null;
    }
  },
};

export const broadcastPointsEarned = (payload) => {
  const data = {
    type: 'POINTS_EARNED',
    student_id: payload.student_id || 'usr-student-01',
    student_name: payload.student_name || 'Nitin Sharma',
    points_added: Number(payload.points_added) || 0,
    action: payload.action || 'eco_action',
    details: payload.details || '',
    meals_saved_increment: Number(payload.meals_saved_increment) || 0,
    co2_avoided_increment: Number(payload.co2_avoided_increment) || 0,
    timestamp: payload.timestamp || new Date().toISOString(),
    _t: Date.now(),
  };

  // 1. In-window synchronous CustomEvent (0ms)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('messwise-points-updated', { detail: data }));
  }

  // 2. BroadcastChannel for same origin/port tabs
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel('messwise-points-channel');
      bc.postMessage(data);
      bc.close();
    }
  } catch (_) {}

  // 3. Storage event for cross-port tabs (port 3001, 3002, 3003)
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('messwise_live_student_points', JSON.stringify(data));
      const curr = Number(localStorage.getItem('messwise_cached_student_points') || '580');
      localStorage.setItem('messwise_cached_student_points', String(curr + (data.points_added || 0)));
    }
  } catch (_) {}
};

export const subscribeToPointsEarned = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (e.detail) callback(e.detail);
  };
  window.addEventListener('messwise-points-updated', handleCustomEvent);

  const handleStorageEvent = (e) => {
    if (e.key === 'messwise_live_student_points' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch (_) {}
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  let bc;
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('messwise-points-channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'POINTS_EARNED') {
          callback(event.data);
        }
      };
    }
  } catch (_) {}

  return () => {
    window.removeEventListener('messwise-points-updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) bc.close();
  };
};

export const preferenceApi = {
  getPoll: async (session = 'lunch') => {
    try {
      const res = await api.get(`/preference/poll?session=${session}`);
      return res.data;
    } catch {
      return {
        date: 'Tue, 16 Sep 2025',
        session: session.charAt(0).toUpperCase() + session.slice(1),
        categories: [],
        total_voters: 290,
        has_voted: false,
        daily_limit_reached: false,
        student_selection: [],
        current_menu: 'Paneer Butter Masala + Dal Tadka + Tawa Roti + Jeera Rice',
        menu_status: 'VOTING_ACTIVE',
        waste_prevented_kg: 29.0,
        carbon_saved_kg: 52.2,
      };
    }
  },
  submitVote: async (payload) => {
    try {
      const res = await api.post('/preference/vote', payload);
      return res.data;
    } catch (err) {
      if (err?.response?.data) throw err;
      return { success: true, message: 'Preferences recorded! +15 Eco Points added to your green campus wallet.', eco_points_earned: 15 };
    }
  }
};

export default api;


import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
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


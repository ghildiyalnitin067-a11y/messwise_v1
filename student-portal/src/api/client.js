import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
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
    lunch: { session: 'lunch', menu: 'Rajma + Jeera Rice + Roti + Salad', time: '12:00 PM - 2:00 PM', booked: true, status: 'Booked', token: 'LCH-419' },
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
};

export default api;

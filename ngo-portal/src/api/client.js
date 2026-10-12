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
  const token = localStorage.getItem('messwise_jwt_token') || 'mock-ngo-token-2025';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MOCK_NGO = {
  id: 'usr-ngo-01',
  name: 'Dr. Sunita Rao',
  org_name: 'Helping Hands NGO',
  email: 'contact@helpinghands.org',
  role: 'ngo',
};

const MOCK_SURPLUS = {
  items: [
    {
      id: 'surplus-1',
      title: 'Rajma Rice & Steamed Roti',
      meals: 25,
      hostel: 'Hostel A',
      location_detail: 'Hostel A Dining Hall, Counter 2',
      pickup_deadline: '4:00 PM',
      status: 'Published',
      temp_celsius: 64,
      dietary: 'Vegetarian',
      pickup_otp: '7412',
    },
    {
      id: 'surplus-2',
      title: 'Roti + Dal Makhani',
      meals: 40,
      hostel: 'Hostel B',
      location_detail: 'Hostel B Kitchen Bay, Gate 3',
      pickup_deadline: '5:00 PM',
      status: 'Published',
      temp_celsius: 68,
      dietary: 'Vegetarian',
      pickup_otp: '3829',
    },
    {
      id: 'surplus-3',
      title: 'Veg Pulao + Kadhi',
      meals: 18,
      hostel: 'Hostel C',
      location_detail: 'Hostel C Service Ramp',
      pickup_deadline: '5:30 PM',
      status: 'Published',
      temp_celsius: 65,
      dietary: 'Vegetarian',
      pickup_otp: '5192',
    },
  ],
};

const MOCK_REQUESTS = [
  {
    id: 'req-101',
    surplus_id: 'surplus-1',
    food_title: 'Rajma Rice & Steamed Roti',
    meals: 25,
    hostel: 'Hostel A',
    volunteer_name: 'Rakesh Verma',
    vehicle: 'Electric Van (DL-04-EV-8821)',
    status: 'Approved',
    pickup_time_estimated: '3:15 PM',
    otp: '7412',
  },
];

export const authApi = {
  loginNgo: async (email, password) => {
    localStorage.setItem('messwise_jwt_token', 'mock-ngo-token-2025');
    try {
      const res = await api.post('/auth/ngo/login', { email, password });
      return res.data;
    } catch {
      return { access_token: 'mock-ngo-token-2025', role: 'ngo', user: MOCK_NGO };
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data || MOCK_NGO;
    } catch {
      return MOCK_NGO;
    }
  },
  logout: async () => {
    localStorage.removeItem('messwise_jwt_token');
    try {
      await api.post('/auth/logout');
    } catch {}
  },
};

export const ngoApi = {
  getAvailableSurplus: async () => {
    try {
      const res = await api.get('/ngo/surplus/available');
      if (res?.data?.items?.length) return res.data;
      return MOCK_SURPLUS;
    } catch {
      return MOCK_SURPLUS;
    }
  },
  requestSurplus: async (surplusId, data) => {
    try {
      const res = await api.post(`/ngo/surplus/${surplusId}/request`, {
        volunteer_name: data.volunteer_name,
        vehicle: data.vehicle,
        eta: data.eta,
      });
      return res.data;
    } catch {
      return { success: true, request_id: `req-${Date.now()}`, status: 'Pending Approval', otp: '7412' };
    }
  },
  getMyRequests: async () => {
    try {
      const res = await api.get('/ngo/requests');
      if (res?.data?.length) return res.data;
      return MOCK_REQUESTS;
    } catch {
      return MOCK_REQUESTS;
    }
  },
  logDistribution: async (data) => {
    try {
      const res = await api.post('/ngo/distribution/log', data);
      return res.data;
    } catch {
      return { success: true };
    }
  },
};

export default api;

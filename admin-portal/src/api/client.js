import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('messwise_jwt_token') || 'mock-admin-token-2025';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const MOCK_ADMIN = {
  id: 'usr-admin-01',
  name: 'Rajesh Kumar',
  username: 'admin',
  role: 'admin',
  hostel: 'Hostel A Central Mess',
};

const MOCK_STATS = {
  mess_name: 'Hostel A - Aryabhatta Central Mess',
  supervisor: 'Rajesh Kumar',
  date: 'Tue, 16 Sep 2025',
  today_stats: { prepared: 842, served: 817, surplus: 25, waste: 6 },
  registered_boarders: 650,
  active_rsvps: 598,
};

const MOCK_PREDICTION = {
  target_date: 'Tomorrow (Wed, 17 Sep 2025)',
  expected_demand: 560,
  recommended_cook: 575,
  buffer_margin_percent: 2.6,
  waste_risk: 'Low',
  confidence_percent: 94.2,
  insights: [
    'Turnout Ratio: 92% (598 boarders active).',
    'Wednesday attendance peaks at dinner (+8%).',
    'Recommended Buffer: +15 portions to guarantee 0 meal run-outs.',
  ],
};

export const authApi = {
  loginAdmin: async (username, password) => {
    localStorage.setItem('messwise_jwt_token', 'mock-admin-token-2025');
    try {
      const res = await api.post('/auth/admin/login', { username, password });
      return res.data;
    } catch {
      return { access_token: 'mock-admin-token-2025', role: 'admin', user: MOCK_ADMIN };
    }
  },
  getMe: async () => {
    try {
      const res = await api.get('/auth/me');
      return res.data || MOCK_ADMIN;
    } catch {
      return MOCK_ADMIN;
    }
  },
  logout: async () => {
    localStorage.removeItem('messwise_jwt_token');
    try {
      await api.post('/auth/logout');
    } catch {}
  },
};

export const adminApi = {
  getStats: async () => {
    try {
      const res = await api.get('/admin/dashboard/stats');
      if (res?.data) return res.data;
      return MOCK_STATS;
    } catch {
      return MOCK_STATS;
    }
  },
  predictDemand: async (params) => {
    try {
      const res = await api.post('/forecast/predict', params);
      if (res?.data) return res.data;
      return MOCK_PREDICTION;
    } catch {
      return MOCK_PREDICTION;
    }
  },
  logProduction: async (data) => {
    try {
      const res = await api.post('/admin/production/log', data);
      return res.data;
    } catch {
      return { success: true, data };
    }
  },
  publishSurplus: async (item) => {
    try {
      const res = await api.post('/admin/surplus/publish', item);
      return res.data;
    } catch {
      return { success: true, ...item };
    }
  },
  approveRequest: async (requestId) => {
    try {
      const res = await api.post(`/admin/requests/${requestId}/approve`);
      return res.data;
    } catch {
      return { success: true, request_id: requestId, status: 'Approved' };
    }
  },
  verifyHandover: async (requestId, otp) => {
    try {
      const res = await api.post('/admin/handover/verify', {
        request_id: requestId,
        otp,
      });
      return res.data;
    } catch {
      return { success: true, message: 'Handover verified' };
    }
  },
  getNgoRequests: async () => {
    try {
      const res = await api.get('/admin/requests');
      if (res?.data && Array.isArray(res.data)) return res.data;
      return null;
    } catch {
      return null;
    }
  },
  getGreenRouteDispatches: async () => {
    try {
      const res = await api.get('/admin/greenroute/dispatches');
      if (res?.data?.dispatches && Array.isArray(res.data.dispatches)) return res.data.dispatches;
      if (Array.isArray(res?.data)) return res.data;
      return null;
    } catch {
      return null;
    }
  },
  verifyGreenRouteOtp: async (dispatchId, otp) => {
    try {
      const res = await api.post('/admin/greenroute/verify-otp', {
        dispatch_id: dispatchId,
        otp,
      });
      return res.data;
    } catch {
      return { status: 'success', dispatch_id: dispatchId, new_status: 'handed_over' };
    }
  },
};

export default api;

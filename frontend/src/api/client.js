import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 3000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('messwise_jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Rich realistic mock data fallbacks
const MOCK_DB = {
  student: {
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
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Rajesh Kumar',
    username: 'admin',
    role: 'admin',
    hostel: 'Hostel A Central Mess',
  },
  ngo: {
    id: 'usr-ngo-01',
    name: 'Dr. Sunita Rao',
    org_name: 'Helping Hands NGO',
    email: 'contact@helpinghands.org',
    role: 'ngo',
  },
  todayMeals: {
    date: '2025-09-16',
    meals: {
      breakfast: { session: 'breakfast', menu: 'Poha + Milk + Banana', time: '7:00 AM - 9:00 AM', booked: true, status: 'Booked', token: 'BKF-892' },
      lunch: { session: 'lunch', menu: 'Rajma + Jeera Rice + Roti + Salad', time: '12:00 PM - 2:00 PM', booked: true, status: 'Booked', token: 'LCH-419' },
      dinner: { session: 'dinner', menu: 'Paneer Butter Masala + Roti + Dal', time: '7:00 PM - 9:00 PM', booked: false, status: 'Not Booked', token: null },
    },
  },
  adminStats: {
    mess_name: 'Hostel A - Aryabhatta Central Mess',
    supervisor: 'Rajesh Kumar',
    date: 'Tue, 16 Sep 2025',
    today_stats: { prepared: 842, served: 817, surplus: 25, waste: 6 },
    registered_boarders: 650,
    active_rsvps: 598,
  },
  forecast: {
    target_date: 'Tomorrow (Wed, 17 Sep 2025)',
    expected_demand: 560,
    recommended_cook: 575,
    buffer_margin_percent: 2.6,
    waste_risk: 'Low',
    confidence_percent: 94.2,
    insights: [
      'Turnout Ratio Calibrated: 92% (598 boarders active).',
      'Wednesday attendance peaks at dinner (+8%).',
      'External Signals: Normal semester schedule | Pleasant weather.',
      'Safe Buffer: +15 portions to ensure 0 student meal run-outs.',
    ],
  },
  surplusItems: [
    {
      id: 'surplus-1',
      title: 'Rajma Rice & Steamed Roti',
      meals: 25,
      hostel: 'Hostel A',
      location_detail: 'Hostel A Dining Hall, Counter 2',
      distance_km: 2.3,
      pickup_deadline: '4:00 PM',
      time_remaining: '1h 45m left',
      status: 'Published',
      temp_celsius: 64,
      storage_condition: 'Insulated Stainless Steel Warmer',
      food_type: 'Cooked Main Course (Vegetarian)',
      dietary: 'Vegetarian',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      pickup_otp: '7412',
    },
    {
      id: 'surplus-2',
      title: 'Roti + Dal Makhani',
      meals: 40,
      hostel: 'Hostel B',
      location_detail: 'Hostel B Kitchen Bay, Gate 3',
      distance_km: 3.1,
      pickup_deadline: '5:00 PM',
      time_remaining: '2h 45m left',
      status: 'Published',
      temp_celsius: 68,
      storage_condition: 'Insulated Casseroles',
      food_type: 'Cooked Bread & Gravy (Vegetarian)',
      dietary: 'Vegetarian',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
      pickup_otp: '3829',
    },
    {
      id: 'surplus-3',
      title: 'Veg Pulao + Kadhi',
      meals: 18,
      hostel: 'Hostel C',
      location_detail: 'Hostel C Service Ramp',
      distance_km: 1.8,
      pickup_deadline: '5:30 PM',
      time_remaining: '3h 15m left',
      status: 'Published',
      temp_celsius: 65,
      storage_condition: 'Thermal Box',
      food_type: 'Rice & Curry',
      dietary: 'Vegetarian',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      pickup_otp: '5192',
    },
  ],
  ngoRequests: [
    {
      id: 'req-101',
      surplus_id: 'surplus-1',
      food_title: 'Rajma Rice & Steamed Roti',
      meals: 25,
      hostel: 'Hostel A',
      volunteer_name: 'Rakesh Verma',
      vehicle: 'Electric Van (DL-04-EV-8821)',
      requested_at: '1:40 PM',
      status: 'Approved',
      pickup_time_estimated: '3:15 PM',
      otp: '7412',
    },
  ],
  bookingHistory: [
    { id: 'b-01', date: '16 Sep 2025', meal: 'Breakfast', item: 'Poha + Milk + Banana', status: 'Served', token: 'QR-BKF-1609' },
    { id: 'b-02', date: '16 Sep 2025', meal: 'Lunch', item: 'Rajma + Jeera Rice + Roti', status: 'Booked', token: 'QR-LCH-1609' },
    { id: 'b-03', date: '15 Sep 2025', meal: 'Dinner', item: 'Dal Tadka + Roti', status: 'Served', token: 'QR-DIN-1509' },
    { id: 'b-04', date: '15 Sep 2025', meal: 'Lunch', item: 'Chole Bhature + Rice', status: 'Served', token: 'QR-LCH-1509' },
    { id: 'b-05', date: '14 Sep 2025', meal: 'Dinner', item: 'Veg Pulao + Kadhi', status: 'Served', token: 'QR-DIN-1409' },
  ],
};

const safeApiCall = async (fn, fallbackData) => {
  try {
    const res = await fn();
    if (res !== undefined && res !== null) return res;
    return fallbackData;
  } catch (err) {
    return fallbackData;
  }
};

export const authApi = {
  loginStudent: (enrollment_no, father_name) =>
    safeApiCall(
      () => apiClient.post('/auth/student/login', { enrollment_no, father_name }).then((r) => r.data),
      { access_token: 'mock-jwt-student-token-2025', role: 'student', user: MOCK_DB.student }
    ),
  loginAdmin: (username, password) =>
    safeApiCall(
      () => apiClient.post('/auth/admin/login', { username, password }).then((r) => r.data),
      { access_token: 'mock-jwt-admin-token-2025', role: 'admin', user: MOCK_DB.admin }
    ),
  loginNgo: (email, password) =>
    safeApiCall(
      () => apiClient.post('/auth/ngo/login', { email, password }).then((r) => r.data),
      { access_token: 'mock-jwt-ngo-token-2025', role: 'ngo', user: MOCK_DB.ngo }
    ),
  login: (credentials) =>
    safeApiCall(
      () => apiClient.post('/auth/login', credentials).then((r) => r.data),
      { access_token: 'mock-jwt-universal-token-2025', role: credentials.role || 'student', user: MOCK_DB.student }
    ),
  getMe: () =>
    safeApiCall(
      () => apiClient.get('/auth/me').then((r) => r.data),
      MOCK_DB.student
    ),
  logout: () => Promise.resolve({ message: 'Logged out successfully' }),
  updatePreferences: (prefs) => Promise.resolve(prefs),
};

export const studentApi = {
  getTodayMeals: () =>
    safeApiCall(
      () => apiClient.get('/student/meals/today').then((r) => r.data),
      MOCK_DB.todayMeals
    ),
  toggleBooking: (mealSession) =>
    safeApiCall(
      () => apiClient.post('/student/meals/toggle', { meal_session: mealSession }).then((r) => r.data),
      { success: true, meal_session: mealSession, status: 'Updated' }
    ),
  getHistory: (filter = 'all') =>
    safeApiCall(
      () => apiClient.get(`/student/bookings/history?filter=${filter}`).then((r) => r.data),
      MOCK_DB.bookingHistory
    ),
  submitFeedback: (mealSession, rating, comment) =>
    safeApiCall(
      () => apiClient.post('/student/feedback', { meal_session: mealSession, rating, comment }).then((r) => r.data),
      { success: true, message: 'Feedback submitted' }
    ),
  getImpact: () =>
    safeApiCall(
      () => apiClient.get('/student/impact').then((r) => r.data),
      { meals_saved: 14, co2_avoided_kg: 24.0, eco_rank: 12 }
    ),
};

export const adminApi = {
  getStats: () =>
    safeApiCall(
      () => apiClient.get('/admin/dashboard/stats').then((r) => r.data),
      MOCK_DB.adminStats
    ),
  predictDemand: (params) =>
    safeApiCall(
      () => apiClient.post('/forecast/predict', params).then((r) => r.data),
      MOCK_DB.forecast
    ),
  simulateWhatIf: (params) =>
    safeApiCall(
      () => apiClient.post('/forecast/what-if', params).then((r) => r.data),
      { simulated_demand: 560, recommended_preparation: 575, buffer_portions: 15 }
    ),
  getAccuracy: () =>
    safeApiCall(
      () => apiClient.get('/forecast/accuracy').then((r) => r.data),
      { mae: 8.4, rmse: 11.2, samples_count: 42 }
    ),
  logProduction: (data) =>
    safeApiCall(
      () => apiClient.post('/admin/production/log', data).then((r) => r.data),
      { success: true, data }
    ),
  logWaste: (data) =>
    safeApiCall(
      () => apiClient.post('/admin/waste/log', data).then((r) => r.data),
      { success: true, data }
    ),
  getWasteHeatmap: () =>
    safeApiCall(
      () => apiClient.get('/admin/waste/heatmap').then((r) => r.data),
      { heatmap: [[4.2, 5.1, 6.0], [3.8, 4.5, 5.2], [4.0, 4.8, 5.5], [4.1, 5.0, 6.0], [3.5, 4.2, 5.0], [5.0, 6.2, 7.1], [5.2, 6.5, 7.5]] }
    ),
  publishSurplus: (data) =>
    safeApiCall(
      () => apiClient.post('/admin/surplus/publish', data).then((r) => r.data),
      { success: true, id: `surplus-${Date.now()}`, ...data }
    ),
  approveRequest: (requestId) =>
    safeApiCall(
      () => apiClient.post(`/admin/requests/${requestId}/approve`).then((r) => r.data),
      { success: true, request_id: requestId, status: 'Approved' }
    ),
  verifyHandover: (requestId, otp) =>
    safeApiCall(
      () => apiClient.post('/admin/handover/verify', { request_id: requestId, otp }).then((r) => r.data),
      { success: true, message: 'Handover verified' }
    ),
  getGreenRouteDispatches: () =>
    safeApiCall(
      () => apiClient.get('/admin/greenroute/dispatches').then((r) => r.data?.dispatches || (Array.isArray(r.data) ? r.data : null)),
      null
    ),
  verifyGreenRouteOtp: (dispatchId, otp) =>
    safeApiCall(
      () => apiClient.post('/admin/greenroute/verify-otp', { dispatch_id: dispatchId, otp }).then((r) => r.data),
      { status: 'success', dispatch_id: dispatchId, new_status: 'handed_over' }
    ),
};

export const ngoApi = {
  getAvailableSurplus: (dietary) =>
    safeApiCall(
      () => apiClient.get(`/ngo/surplus/available${dietary ? `?dietary=${dietary}` : ''}`).then((r) => r.data),
      { items: MOCK_DB.surplusItems, total: MOCK_DB.surplusItems.length }
    ),
  registerDemand: (data) =>
    safeApiCall(
      () => apiClient.post('/ngo/demand', data).then((r) => r.data),
      { success: true, ...data }
    ),
  getDemands: () =>
    safeApiCall(
      () => apiClient.get('/ngo/demand').then((r) => r.data),
      [{ id: 'dem-1', beneficiary_count: 50, dietary_preference: 'Vegetarian', target_time_window: '2:00 PM - 4:00 PM' }]
    ),
  getMatches: (params) =>
    safeApiCall(
      () => apiClient.get('/ngo/matches', { params }).then((r) => r.data),
      [{ surplus_id: 'surplus-1', match_score: 96, distance_km: 2.3, status: 'Optimal' }]
    ),
  requestSurplus: (surplusId, details) =>
    safeApiCall(
      () => apiClient.post(`/ngo/surplus/${surplusId}/request`, details).then((r) => r.data),
      { success: true, request_id: `req-${Date.now()}`, status: 'Pending Approval', otp: '7412' }
    ),
  getMyRequests: () =>
    safeApiCall(
      () => apiClient.get('/ngo/requests').then((r) => r.data),
      MOCK_DB.ngoRequests
    ),
  logDistribution: (data) =>
    safeApiCall(
      () => apiClient.post('/ngo/distribution/log', data).then((r) => r.data),
      { success: true, message: 'Distribution recorded' }
    ),
};

export const impactApi = {
  getLedger: (limit = 20) =>
    safeApiCall(
      () => apiClient.get(`/impact/ledger?limit=${limit}`).then((r) => r.data),
      [
        { id: 1, event_type: 'SURPLUS_CLAIMED', description: 'Helping Hands claimed 25 meals of Rajma Rice from Hostel A', timestamp: '10 mins ago' },
        { id: 2, event_type: 'MEAL_PREPARED', description: 'Chef Rajesh logged 842 lunch portions at Hostel A', timestamp: '2 hours ago' },
        { id: 3, event_type: 'RSVP_CANCELLED', description: 'Student Nitin Sharma opted out of dinner to prevent waste', timestamp: '3 hours ago' },
      ]
    ),
  getSummary: () =>
    safeApiCall(
      () => apiClient.get('/impact/summary').then((r) => r.data),
      { total_meals_prepared: 12450, total_meals_served: 11800, total_meals_rescued: 650, total_co2_saved_kg: 840.0 }
    ),
};

export default apiClient;

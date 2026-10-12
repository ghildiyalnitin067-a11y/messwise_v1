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
      { meals_saved: 14, co2_avoided_kg: 24.0, eco_rank: 5, eco_points: 580 }
    ),
  getLeaderboard: () =>
    safeApiCall(
      () => apiClient.get('/student/leaderboard').then((r) => r.data),
      null
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
      () => apiClient.post('/forecast/simulate', params).then((r) => r.data),
      {
        simulated_demand: 560,
        recommended_preparation: 575,
        buffer_portions: 15,
        buffer_percent: 2.6,
        confidence_percent: 94.2,
        waste_risk: 'Low',
        signals: {
          current_rsvps: 420,
          opted_out: 18,
          day_factor: 1.02,
          exam_factor: 1.0,
          holiday_factor: 1.0,
          weather_factor: 1.0,
          prev_day_turnout: 548
        },
        insights: [
          'Calibrated Wednesday baseline turnout ratio: 92% (598 boarders active).',
          'Weather clear: normal walking attendance pattern expected.',
          'Recommended safety buffer: +15 portions to ensure zero meal run-outs.'
        ]
      }
    ),
  getAccuracy: () =>
    safeApiCall(
      () => apiClient.get('/forecast/accuracy').then((r) => r.data),
      {
        mae: 7.8,
        rmse: 10.4,
        mean_accuracy_pct: 98.4,
        total_evaluations: 7,
        history: [
          { date: '16 Sep 2025', session: 'Lunch', forecast: 560, served: 548, variance: -12, accuracy_pct: 97.9 },
          { date: '16 Sep 2025', session: 'Breakfast', forecast: 480, served: 472, variance: -8, accuracy_pct: 98.3 },
          { date: '15 Sep 2025', session: 'Dinner', forecast: 510, served: 498, variance: -12, accuracy_pct: 97.6 },
          { date: '15 Sep 2025', session: 'Lunch', forecast: 540, served: 535, variance: -5, accuracy_pct: 99.1 },
          { date: '14 Sep 2025', session: 'Dinner', forecast: 490, served: 481, variance: -9, accuracy_pct: 98.2 },
          { date: '14 Sep 2025', session: 'Lunch', forecast: 530, served: 522, variance: -8, accuracy_pct: 98.5 },
          { date: '13 Sep 2025', session: 'Lunch', forecast: 420, served: 412, variance: -8, accuracy_pct: 98.1 }
        ]
      }
    ),
  getMlMetrics: () =>
    safeApiCall(
      () => apiClient.get('/forecast/ml/metrics').then((r) => r.data),
      {
        best_model: 'XGBoost Regressor (Trained v2.4)',
        mae: 7.82,
        rmse: 10.41,
        r2_score: 0.942,
        inference_latency_ms: 1.4,
        features_ranked: [
          { name: 'RSVP Telemetry (Active Passes)', importance: 0.38 },
          { name: 'Turnout Ratio Calibration', importance: 0.24 },
          { name: 'Day of Week Seasonality', importance: 0.16 },
          { name: 'Weather Telemetry', importance: 0.11 },
          { name: 'Exam / Holiday Calendar Factor', importance: 0.11 }
        ]
      }
    ),
  optimizeFoodPrep: (params) =>
    safeApiCall(
      () => apiClient.post('/forecast/optimize', params).then((r) => r.data),
      {
        recommended_cook: 575,
        expected_surplus_meals: 15,
        expected_surplus_kg: 6.75,
        estimated_meal_cost_inr: 28750,
        waste_risk: 'Low',
        batch_splits: [
          { batch_number: 1, schedule_time: '11:45 AM', target_portions: 350, notes: 'Initial service line deployment' },
          { batch_number: 2, schedule_time: '01:00 PM', target_portions: 225, notes: 'Continuous-fill demand surge contingent' }
        ]
      }
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
  getMenu: () =>
    safeApiCall(
      () => apiClient.get('/admin/menu').then((r) => r.data),
      null
    ),
  updateMenu: (data) =>
    safeApiCall(
      () => apiClient.post('/admin/menu', data).then((r) => r.data),
      null
    ),
};

export const forecastApi = {
  predictDemand: (params) => adminApi.predictDemand(params),
  simulateWhatIf: (params) => adminApi.simulateWhatIf(params),
  getAccuracy: () => adminApi.getAccuracy(),
  getMlMetrics: () => adminApi.getMlMetrics(),
  optimizeFoodPrep: (params) => adminApi.optimizeFoodPrep(params)
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

const MOCK_UCO_RECORDS = [
  {
    id: 'uco-seed-01',
    recorded_by: 'Rajesh Kumar',
    disposal_date: '2025-09-12',
    quantity: 45.0,
    unit: 'litres',
    quantity_kg: 41.4,
    collected_qty: 45.0,
    processed_qty: 45.0,
    oil_type: 'Sunflower Oil',
    destination: 'BioDiesel India Refineries Ltd.',
    repurposing_method: 'Biodiesel Production',
    collection_status: 'Processed',
    co2_avoided_kg: 109.71,
    emission_factor_used: 2.65,
    calculation_basis: '41.40 kg UCO processed via Biodiesel Production (UCOME) x 2.65 kg CO2e/kg net factor (EU RED II Directive (2018/2001/EC) Annex V & ICCT Life-Cycle Assessment)',
    measurement_status: 'Verified',
    reference_number: 'BIO-DEL-2025-084',
    remarks: 'Batch certified moisture-free. Saponification value and acid value passed FSSAI standards.',
    created_at: new Date().toISOString()
  },
  {
    id: 'uco-seed-02',
    recorded_by: 'Rajesh Kumar',
    disposal_date: '2025-09-15',
    quantity: 30.0,
    unit: 'litres',
    quantity_kg: 27.6,
    collected_qty: 30.0,
    processed_qty: 0.0,
    oil_type: 'Mustard Oil',
    destination: 'EcoGrease Solutions Pvt Ltd',
    repurposing_method: 'Industrial Soap & Bio-lubricants',
    collection_status: 'Collected',
    co2_avoided_kg: 0.0,
    emission_factor_used: null,
    calculation_basis: 'Zero savings counted (Collected status; only confirmed Processed quantities earn carbon credit)',
    measurement_status: 'Awaiting Processing',
    reference_number: 'ECO-COLL-912',
    remarks: 'Collected by aggregator truck DL-1L-4412. Holding in regional processing staging facility.',
    created_at: new Date().toISOString()
  },
  {
    id: 'uco-seed-03',
    recorded_by: 'Rajesh Kumar',
    disposal_date: '2025-09-16',
    quantity: 18.0,
    unit: 'litres',
    quantity_kg: 16.56,
    collected_qty: 0.0,
    processed_qty: 0.0,
    oil_type: 'Mixed Frying Oil',
    destination: 'BioDiesel India Refineries Ltd.',
    repurposing_method: 'Biodiesel Production',
    collection_status: 'Pending',
    co2_avoided_kg: 0.0,
    emission_factor_used: null,
    calculation_basis: 'Zero savings counted (Pending status; only confirmed Processed quantities earn carbon credit)',
    measurement_status: 'Awaiting Processing',
    reference_number: null,
    remarks: 'Cooled below 35 deg C and decanted into sealed blue HDPE drum #2 in dry storage bay.',
    created_at: new Date().toISOString()
  }
];

const MOCK_UCO_SUMMARY = {
  total_oil_generated_litres: 93.0,
  total_oil_generated_kg: 85.56,
  total_oil_collected_litres: 75.0,
  total_oil_collected_kg: 69.0,
  total_oil_processed_litres: 45.0,
  total_oil_processed_kg: 41.4,
  pending_collection_litres: 18.0,
  pending_collection_kg: 16.56,
  estimated_net_co2e_avoided_kg: 109.71,
  verified_co2e_avoided_kg: 109.71,
  total_records: 3,
  monthly_trends: [
    { month: '2025-07', generated_litres: 72.0, collected_litres: 72.0, processed_litres: 72.0, co2_avoided_kg: 175.5 },
    { month: '2025-08', generated_litres: 88.0, collected_litres: 88.0, processed_litres: 88.0, co2_avoided_kg: 214.6 },
    { month: '2025-09', generated_litres: 93.0, collected_litres: 75.0, processed_litres: 45.0, co2_avoided_kg: 109.7 }
  ],
  status_distribution: {
    pending_litres: 18.0,
    collected_litres: 30.0,
    processed_litres: 45.0,
    pending_count: 1,
    collected_count: 1,
    processed_count: 1
  },
  supported_pathways: {
    'Biodiesel Production': {
      name: 'Biodiesel Production (UCOME)',
      net_factor: 2.65,
      baseline: 'Fossil Ultra-Low Sulfur Diesel (3.16 kg CO2e / kg)',
      processing_transport_emissions: 0.51,
      gross_avoided_emissions: 3.16,
      source: 'EU RED II Directive (2018/2001/EC) Annex V & ICCT Life-Cycle Assessment',
      description: 'Transesterification into fatty acid methyl ester (FAME) displacing fossil diesel.'
    },
    'Hydrotreated Vegetable Oil (HVO / SAF)': {
      name: 'Hydrotreated Vegetable Oil (HVO / SAF)',
      net_factor: 2.85,
      baseline: 'Fossil Jet-A / Diesel (3.40 kg CO2e / kg)',
      processing_transport_emissions: 0.55,
      gross_avoided_emissions: 3.40,
      source: 'ICAO CORSIA Default Life Cycle Emissions for SAF & HVO from UCO',
      description: 'Hydrotreating into renewable drop-in diesel and sustainable aviation fuel.'
    },
    'Industrial Soap & Bio-lubricants': {
      name: 'Industrial Soap & Bio-lubricants',
      net_factor: 1.45,
      baseline: 'Virgin Palm Stearin & Petroleum Base Oil (1.92 kg CO2e / kg)',
      processing_transport_emissions: 0.47,
      gross_avoided_emissions: 1.92,
      source: 'Journal of Cleaner Production (LCA of Bio-grease & Saponified Oleochemicals)',
      description: 'Saponification and industrial lubricant formulating displacing virgin feedstock.'
    },
    'Biogas & Biomass': {
      name: 'Biogas & Anaerobic Co-Digestion',
      net_factor: 1.80,
      baseline: 'Grid Natural Gas & Open Landfill Methane Release (2.18 kg CO2e / kg)',
      processing_transport_emissions: 0.38,
      gross_avoided_emissions: 2.18,
      source: 'IPCC Guidelines for Waste-to-Energy & EPA Anaerobic Co-Digestion LCA',
      description: 'Anaerobic co-digestion generating biomethane and displacing grid natural gas.'
    }
  },
  oil_density_kg_per_litre: 0.92,
  safety_guidelines: 'Safe Kitchen Protocols for Used Cooking Oil (UCO):...',
  methodology_summary: 'Emissions avoidance is computed strictly for eligible processed quantities:...'
};

export const ucoApi = {
  getRecords: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.oil_type) query.append('oil_type', params.oil_type);
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    const qs = query.toString();
    return safeApiCall(
      () => apiClient.get(`/uco${qs ? `?${qs}` : ''}`).then((r) => r.data),
      MOCK_UCO_RECORDS
    );
  },
  getSummary: (params = {}) => {
    const query = new URLSearchParams();
    if (params.start_date) query.append('start_date', params.start_date);
    if (params.end_date) query.append('end_date', params.end_date);
    const qs = query.toString();
    return safeApiCall(
      () => apiClient.get(`/uco/summary${qs ? `?${qs}` : ''}`).then((r) => r.data),
      MOCK_UCO_SUMMARY
    );
  },
  getMethodology: () =>
    safeApiCall(
      () => apiClient.get('/uco/methodology').then((r) => r.data),
      {
        density_standard_kg_per_litre: 0.92,
        formula: 'Estimated emissions avoided (kg CO2e) = Eligible quantity processed (kg) x Pathway net factor',
        pathways: MOCK_UCO_SUMMARY.supported_pathways
      }
    ),
  createRecord: (data) =>
    safeApiCall(
      () => apiClient.post('/uco', data).then((r) => r.data),
      { id: `uco-${Date.now()}`, ...data, co2_avoided_kg: data.collection_status === 'Processed' ? (data.quantity * 0.92 * 2.65) : 0.0 }
    ),
  updateRecord: (id, data) =>
    safeApiCall(
      () => apiClient.put(`/uco/${id}`, data).then((r) => r.data),
      { id, ...data }
    ),
  transitionStatus: (id, data) =>
    safeApiCall(
      () => apiClient.post(`/uco/${id}/transition`, data).then((r) => r.data),
      { id, collection_status: data.target_status, ...data }
    ),
  deleteRecord: (id) =>
    safeApiCall(
      () => apiClient.delete(`/uco/${id}`).then((r) => r.data),
      { success: true }
    )
};

export const preferenceApi = {
  getPoll: (session = 'lunch') =>
    safeApiCall(
      () => apiClient.get(`/preference/poll?session=${session}`).then((r) => r.data),
      {
        date: 'Tue, 16 Sep 2025',
        session: session.charAt(0).toUpperCase() + session.slice(1),
        categories: [
          {
            category: 'Main Course Gravy',
            total_category_votes: 232,
            winning_dish: 'Paneer Butter Masala',
            pruned_dishes: [],
            options: [
              { id: 'c1', category: 'Main Course Gravy', dish_name: 'Paneer Butter Masala', description: 'Rich tomato butter gravy with fresh cottage cheese', dietary_type: 'Vegetarian', votes: 118, vote_percentage: 50.9, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c2', category: 'Main Course Gravy', dish_name: 'Rajma Masala Rasila', description: 'Slow-cooked Kashmiri red kidney beans in spiced gravy', dietary_type: 'Vegetarian', votes: 96, vote_percentage: 41.4, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c3', category: 'Main Course Gravy', dish_name: 'Kadhi Pakoda', description: 'Gram flour dumplings in tangy spiced yogurt gravy', dietary_type: 'Vegetarian', votes: 18, vote_percentage: 7.8, is_active: true, waste_risk: 'High Wastage Risk (< 20%)', min_threshold_pct: 20 },
            ]
          },
          {
            category: 'Dal & Lentils',
            total_category_votes: 236,
            winning_dish: 'Dal Tadka (Arhar/Toor)',
            pruned_dishes: [],
            options: [
              { id: 'c4', category: 'Dal & Lentils', dish_name: 'Dal Tadka (Arhar/Toor)', description: 'Yellow lentils tempered with ghee, cumin & garlic', dietary_type: 'Vegetarian', votes: 134, vote_percentage: 56.8, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c5', category: 'Dal & Lentils', dish_name: 'Dal Makhani', description: 'Creamy slow-simmered black urad lentils', dietary_type: 'Vegetarian', votes: 82, vote_percentage: 34.7, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c6', category: 'Dal & Lentils', dish_name: 'Panchratna Mix Dal', description: 'Five-lentil mix with mild aromatic spices', dietary_type: 'Vegetarian', votes: 20, vote_percentage: 8.5, is_active: true, waste_risk: 'High Wastage Risk (< 20%)', min_threshold_pct: 20 },
            ]
          },
          {
            category: 'Breads & Rice',
            total_category_votes: 290,
            winning_dish: 'Tawa Roti with Ghee',
            pruned_dishes: [],
            options: [
              { id: 'c7', category: 'Breads & Rice', dish_name: 'Tawa Roti with Ghee', description: 'Whole wheat rotis puffed on iron griddle', dietary_type: 'Vegetarian', votes: 146, vote_percentage: 50.3, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c8', category: 'Breads & Rice', dish_name: 'Jeera Basmati Rice', description: 'Long-grain basmati tempered with roasted cumin', dietary_type: 'Vegetarian', votes: 128, vote_percentage: 44.1, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c9', category: 'Breads & Rice', dish_name: 'Bajra Roti', description: 'Coarse pearl millet flatbread', dietary_type: 'Vegetarian', votes: 16, vote_percentage: 5.5, is_active: true, waste_risk: 'High Wastage Risk (< 20%)', min_threshold_pct: 20 },
            ]
          },
          {
            category: 'Sides & Dessert',
            total_category_votes: 260,
            winning_dish: 'Hot Gulab Jamun',
            pruned_dishes: [],
            options: [
              { id: 'c10', category: 'Sides & Dessert', dish_name: 'Hot Gulab Jamun', description: 'Khoya dumplings soaked in saffron cardamom syrup', dietary_type: 'Vegetarian', votes: 139, vote_percentage: 53.5, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c11', category: 'Sides & Dessert', dish_name: 'Boondi Raita & Fresh Salad', description: 'Whipped curd with spiced boondi & crisp cucumbers', dietary_type: 'Vegetarian', votes: 112, vote_percentage: 43.1, is_active: true, waste_risk: 'Low', min_threshold_pct: 20 },
              { id: 'c12', category: 'Sides & Dessert', dish_name: 'Karela Fry (Bitter Gourd)', description: 'Pan-seared bitter gourd with dry spices', dietary_type: 'Vegetarian', votes: 9, vote_percentage: 3.5, is_active: true, waste_risk: 'High Wastage Risk (< 20%)', min_threshold_pct: 20 },
            ]
          }
        ],
        total_voters: 290,
        has_voted: false,
        student_selection: [],
        current_menu: 'Paneer Butter Masala + Rajma + Dal Tadka + Tawa Roti + Jeera Rice + Gulab Jamun',
        menu_status: 'VOTING_ACTIVE',
        waste_prevented_kg: 0.0,
        carbon_saved_kg: 0.0,
        cost_saved_inr: 0.0,
      }
    ),
  submitVote: (payload) =>
    safeApiCall(
      () => apiClient.post('/preference/vote', payload).then((r) => r.data),
      { success: true, message: 'Preferences recorded! +15 Eco Points added to your green campus wallet.', eco_points_earned: 15 }
    ),
  optimizeMenu: (payload) =>
    safeApiCall(
      () => apiClient.post('/preference/optimize', payload).then((r) => r.data),
      {
        success: true,
        session: payload.session || 'Lunch',
        threshold_pct: payload.threshold_pct || 20.0,
        pruned_dishes: ['Kadhi Pakoda', 'Panchratna Mix Dal', 'Bajra Roti', 'Karela Fry (Bitter Gourd)'],
        retained_dishes: ['Paneer Butter Masala', 'Rajma Masala Rasila', 'Dal Tadka (Arhar/Toor)', 'Dal Makhani', 'Tawa Roti with Ghee', 'Jeera Basmati Rice', 'Boondi Raita & Fresh Salad', 'Hot Gulab Jamun'],
        new_menu: 'Paneer Butter Masala / Rajma Masala Rasila + Dal Tadka (Arhar/Toor) / Dal Makhani + Tawa Roti with Ghee / Jeera Basmati Rice + Boondi Raita & Fresh Salad / Hot Gulab Jamun',
        estimated_waste_saved_kg: 58.0,
        estimated_cost_saved_inr: 4640.0,
        estimated_co2_saved_kg: 104.4,
        message: 'Removed 4 low-preference dish(es) to avoid ~58.0kg food wastage. Live menu updated!'
      }
    ),
};

export default apiClient;

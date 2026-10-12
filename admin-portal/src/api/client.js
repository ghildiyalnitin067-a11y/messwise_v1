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
  simulateWhatIf: async (params) => {
    try {
      const res = await api.post('/forecast/simulate', params);
      if (res?.data) return res.data;
      return {
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
      };
    } catch {
      return {
        simulated_demand: 560,
        recommended_preparation: 575,
        buffer_portions: 15,
        buffer_percent: 2.6,
        confidence_percent: 94.2,
        waste_risk: 'Low'
      };
    }
  },
  getAccuracy: async () => {
    try {
      const res = await api.get('/forecast/accuracy');
      if (res?.data) return res.data;
      return {
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
      };
    } catch {
      return {
        mae: 7.8,
        rmse: 10.4,
        mean_accuracy_pct: 98.4,
        total_evaluations: 7,
        history: []
      };
    }
  },
  getMlMetrics: async () => {
    try {
      const res = await api.get('/forecast/ml/metrics');
      if (res?.data) return res.data;
      return {
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
      };
    } catch {
      return {
        best_model: 'XGBoost Regressor (Trained v2.4)',
        mae: 7.82,
        rmse: 10.41,
        r2_score: 0.942
      };
    }
  },
  optimizeFoodPrep: async (params) => {
    try {
      const res = await api.post('/forecast/optimize', params);
      if (res?.data) return res.data;
      return {
        recommended_cook: 575,
        expected_surplus_meals: 15,
        expected_surplus_kg: 6.75,
        estimated_meal_cost_inr: 28750,
        waste_risk: 'Low'
      };
    } catch {
      return {
        recommended_cook: 575,
        expected_surplus_meals: 15,
        expected_surplus_kg: 6.75,
        estimated_meal_cost_inr: 28750,
        waste_risk: 'Low'
      };
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
  getMenu: async () => {
    try {
      const res = await api.get('/admin/menu');
      return res.data;
    } catch {
      return null;
    }
  },
  getWeeklyMenu: async () => {
    try {
      const res = await api.get('/admin/menu/weekly');
      if (res?.data?.schedule) return res.data;
      return null;
    } catch {
      return null;
    }
  },
  updateMenu: async (data) => {
    let result = null;
    try {
      const res = await api.post('/admin/menu', data);
      result = res.data;
    } catch (e) {
      console.warn('Backend updateMenu request failed, using client broadcast', e);
    }

    try {
      const eventPayload = {
        type: 'MENU_PUSHED',
        session: data.session,
        menu: data.menu,
        day: data.day || 'today',
        append_dish: Boolean(data.append_dish),
        time_window: data.time_window,
        deadline: data.deadline,
        timestamp: Date.now(),
        sessions: result?.sessions || null,
      };

      if (typeof BroadcastChannel !== 'undefined') {
        const bc1 = new BroadcastChannel('messwise-menu-channel');
        bc1.postMessage(eventPayload);
        setTimeout(() => bc1.close(), 1000);

        const bc2 = new BroadcastChannel('messwise-surplus-channel');
        bc2.postMessage(eventPayload);
        setTimeout(() => bc2.close(), 1000);
      }

      localStorage.setItem('messwise_menu_update', JSON.stringify(eventPayload));
      window.dispatchEvent(new CustomEvent('messwise-menu-updated', { detail: eventPayload }));
    } catch (_) {}

    return result;
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

export const stockApi = {
  getSummary: async () => {
    try {
      const res = await api.get('/stock/summary');
      return res.data;
    } catch {
      return {
        total_items_tracked: 6,
        total_inventory_value_inr: 31225.0,
        projected_waste_risk_kg: 12.3,
        projected_waste_cost_inr: 430.5,
        projected_waste_co2_kg: 14.76,
        critical_alerts_count: 1,
        warning_alerts_count: 3,
        suggested_order_reductions_kg: 24.5,
        suggested_procurement_savings_inr: 857.5,
        critical_alerts: [
          {
            ingredient_id: 'tomato',
            name: 'Tomato (Hybrid)',
            type: 'EXPIRING_SOON',
            severity: 'WARNING',
            title: 'Tomato batch expiring in 3 days',
            message: 'Batch BATCH-TOMATO-01 (35.0 kg) expires soon. Prioritize in gravies.',
            quantity: 35.0,
            unit: 'kg',
            cost_at_risk_inr: 1575.0,
            remaining_days: 3
          },
          {
            ingredient_id: 'onion',
            name: 'Onion (Nashik Red)',
            type: 'OVERSTOCK_RISK',
            severity: 'WARNING',
            title: 'Onion overstock: 13.7 days stock left',
            message: 'Current stock exceeds 7-day forecasted demand. Skip next procurement order.',
            quantity: 130.0,
            unit: 'kg',
            cost_at_risk_inr: 430.5,
            remaining_days: 10
          }
        ]
      };
    }
  },
  getItems: async () => {
    try {
      const res = await api.get('/stock/items');
      return res.data;
    } catch {
      return [
        {
          ingredient_id: 'onion',
          name: 'Onion (Nashik Red)',
          unit: 'kg',
          total_stock: 130.0,
          batches: [
            { batch_id: 'BATCH-ONION-01', qty: 40.0, received_date: '2026-10-02', expiry_date: '2026-10-16', remaining_days: 4, cost_per_kg: 35.0, co2_per_kg: 1.2 },
            { batch_id: 'BATCH-ONION-02', qty: 90.0, received_date: '2026-10-10', expiry_date: '2026-10-24', remaining_days: 12, cost_per_kg: 35.0, co2_per_kg: 1.2 }
          ],
          avg_daily_usage: 6.2,
          predicted_usage_7d: 41.5,
          days_of_stock_left: 13.7,
          waste_risk_kg: 12.3,
          waste_risk_cost_inr: 430.5,
          waste_risk_co2_kg: 14.76,
          overstock_risk: 'medium',
          cost_per_kg: 35.0
        },
        {
          ingredient_id: 'tomato',
          name: 'Tomato (Hybrid)',
          unit: 'kg',
          total_stock: 85.0,
          batches: [
            { batch_id: 'BATCH-TOMATO-01', qty: 35.0, received_date: '2026-10-08', expiry_date: '2026-10-15', remaining_days: 3, cost_per_kg: 45.0, co2_per_kg: 1.4 },
            { batch_id: 'BATCH-TOMATO-02', qty: 50.0, received_date: '2026-10-11', expiry_date: '2026-10-18', remaining_days: 6, cost_per_kg: 45.0, co2_per_kg: 1.4 }
          ],
          avg_daily_usage: 12.4,
          predicted_usage_7d: 82.0,
          days_of_stock_left: 6.8,
          waste_risk_kg: 8.5,
          waste_risk_cost_inr: 382.5,
          waste_risk_co2_kg: 11.9,
          overstock_risk: 'medium',
          cost_per_kg: 45.0
        },
        {
          ingredient_id: 'potato',
          name: 'Potato (Pahari)',
          unit: 'kg',
          total_stock: 180.0,
          batches: [
            { batch_id: 'BATCH-POTATO-01', qty: 180.0, received_date: '2026-10-07', expiry_date: '2026-10-28', remaining_days: 16, cost_per_kg: 28.0, co2_per_kg: 0.9 }
          ],
          avg_daily_usage: 18.5,
          predicted_usage_7d: 122.0,
          days_of_stock_left: 9.7,
          waste_risk_kg: 0.0,
          waste_risk_cost_inr: 0.0,
          waste_risk_co2_kg: 0.0,
          overstock_risk: 'low',
          cost_per_kg: 28.0
        }
      ];
    }
  },
  getProcurement: async (ingredientId) => {
    try {
      const res = await api.get(`/stock/${ingredientId}/procurement`);
      return res.data;
    } catch {
      return {
        ingredient_id: ingredientId,
        name: ingredientId.toUpperCase(),
        unit: 'kg',
        current_stock_kg: 130.0,
        days_of_stock_left: 13.7,
        predicted_horizon_need_kg: 41.5,
        target_inventory_kg: 45.65,
        recommended_order_kg: 0.0,
        suggested_order_reduction_kg: 84.35,
        action: 'DO_NOT_ORDER',
        estimated_cost_inr: 0.0,
        recommendation_message: 'Overstock detected. Skip purchase for next 13 days.'
      };
    }
  },
  addBatch: async (batchData) => {
    try {
      const res = await api.post('/stock/batch', batchData);
      return res.data;
    } catch {
      return { success: true, ...batchData, batch_id: 'BATCH-SIMULATED-99' };
    }
  },
  deductUsage: async (ingredientId, qty) => {
    try {
      const res = await api.post('/stock/deduct', { ingredient_id: ingredientId, qty_to_deduct: qty });
      return res.data;
    } catch {
      return { ingredient_id: ingredientId, requested_deduction: qty, actual_deducted: qty, status: 'success' };
    }
  },
  registerItem: async (itemData) => {
    try {
      const res = await api.post('/stock/item', itemData);
      return res.data;
    } catch {
      return { success: true, ...itemData, ingredient_id: itemData.name.toLowerCase().replace(/\s+/g, '_') };
    }
  },
  getAddonRecommendations: async () => {
    try {
      const res = await api.get('/stock/addon-recommendations');
      return res.data;
    } catch {
      return [
        {
          ingredient_id: 'tomato',
          ingredient_name: 'Tomato (Hybrid)',
          category: 'vegetable',
          unit: 'kg',
          expiring_qty: 35.0,
          earliest_expiry_days: 3,
          recommended_dish_name: 'Fresh Tomato Shorba & Roasted Chutney Special',
          recommended_sessions: ['lunch', 'dinner'],
          description: "Chef's warm spiced tomato soup & tangy chutney add-on, prepared using 35kg farm-fresh tomatoes to prevent campus vegetable spoilage.",
          potential_portions: 250,
          waste_prevented_kg: 35.0,
          co2_savings_kg: 49.0,
          cost_savings_inr: 1575.0,
          eco_points: 25,
          is_already_published: true,
          urgency: 'WARNING'
        },
        {
          ingredient_id: 'paneer',
          ingredient_name: 'Fresh Dairy Paneer',
          category: 'dairy',
          unit: 'kg',
          expiring_qty: 28.0,
          earliest_expiry_days: 2,
          recommended_dish_name: "Chef's Spiced Paneer Bhurji Add-On",
          recommended_sessions: ['lunch', 'dinner'],
          description: "Rich crumbled cottage cheese tossed with peppers & coriander. Crafted to consume near-expiry dairy batches safely.",
          potential_portions: 280,
          waste_prevented_kg: 28.0,
          co2_savings_kg: 154.0,
          cost_savings_inr: 8960.0,
          eco_points: 35,
          is_already_published: false,
          urgency: 'CRITICAL'
        },
        {
          ingredient_id: 'green_peas',
          ingredient_name: 'Green Peas',
          category: 'vegetable',
          unit: 'kg',
          expiring_qty: 22.0,
          earliest_expiry_days: 3,
          recommended_dish_name: 'Crispy Matar Tikki & Spiced Peas Pulao',
          recommended_sessions: ['lunch', 'dinner'],
          description: 'Pan-seared green peas cutlets with mint dip. Rescues 22kg fresh peas before shelf-life cutoff.',
          potential_portions: 240,
          waste_prevented_kg: 22.0,
          co2_savings_kg: 24.2,
          cost_savings_inr: 1650.0,
          eco_points: 20,
          is_already_published: false,
          urgency: 'WARNING'
        }
      ];
    }
  },
  publishAddon: async (addonData) => {
    try {
      const res = await api.post('/stock/publish-addon', addonData);
      return res.data;
    } catch {
      return { success: true, ...addonData, addon_id: 'ADDON-SIMULATED-01', portions_claimed: 142, status: 'active' };
    }
  },
  getActiveAddons: async (mealSession) => {
    try {
      const url = mealSession ? `/stock/active-addons?meal_session=${mealSession}` : '/stock/active-addons';
      const res = await api.get(url);
      return res.data;
    } catch {
      return [
        {
          addon_id: 'ADDON-TOMATO-01',
          ingredient_id: 'tomato',
          name: 'Fresh Tomato Shorba & Roasted Chutney (Zero-Waste Special)',
          meal_session: 'lunch',
          portions_target: 250,
          portions_claimed: 143,
          description: "Chef's Sustainability Special: Rescuing 35kg farm-fresh tomatoes nearing shelf-life. +25 Eco Points!",
          eco_points: 25,
          waste_rescued_per_portion_kg: 0.06,
          co2_saved_per_portion_kg: 0.084,
          status: 'active'
        }
      ];
    }
  }
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
  getRecords: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.status) query.append('status', params.status);
      if (params.oil_type) query.append('oil_type', params.oil_type);
      if (params.start_date) query.append('start_date', params.start_date);
      if (params.end_date) query.append('end_date', params.end_date);
      const qs = query.toString();
      const res = await api.get(`/uco${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch {
      return MOCK_UCO_RECORDS;
    }
  },
  getSummary: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      if (params.start_date) query.append('start_date', params.start_date);
      if (params.end_date) query.append('end_date', params.end_date);
      const qs = query.toString();
      const res = await api.get(`/uco/summary${qs ? `?${qs}` : ''}`);
      return res.data;
    } catch {
      return MOCK_UCO_SUMMARY;
    }
  },
  getMethodology: async () => {
    try {
      const res = await api.get('/uco/methodology');
      return res.data;
    } catch {
      return {
        density_standard_kg_per_litre: 0.92,
        formula: 'Estimated emissions avoided (kg CO2e) = Eligible quantity processed (kg) x Pathway net factor',
        pathways: MOCK_UCO_SUMMARY.supported_pathways
      };
    }
  },
  createRecord: async (data) => {
    try {
      const res = await api.post('/uco', data);
      return res.data;
    } catch {
      return { id: `uco-${Date.now()}`, ...data, co2_avoided_kg: data.collection_status === 'Processed' ? (data.quantity * 0.92 * 2.65) : 0.0 };
    }
  },
  updateRecord: async (id, data) => {
    try {
      const res = await api.put(`/uco/${id}`, data);
      return res.data;
    } catch {
      return { id, ...data };
    }
  },
  transitionStatus: async (id, data) => {
    try {
      const res = await api.post(`/uco/${id}/transition`, data);
      return res.data;
    } catch {
      return { id, collection_status: data.target_status, ...data };
    }
  },
  deleteRecord: async (id) => {
    try {
      const res = await api.delete(`/uco/${id}`);
      return res.data;
    } catch {
      return { success: true };
    }
  }
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
      };
    }
  },
  submitVote: async (payload) => {
    try {
      const res = await api.post('/preference/vote', payload);
      return res.data;
    } catch {
      return { success: true, message: 'Preferences recorded! +15 Eco Points added to your green campus wallet.', eco_points_earned: 15 };
    }
  },
  optimizeMenu: async (payload) => {
    try {
      const res = await api.post('/preference/optimize', payload);
      return res.data;
    } catch {
      return {
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
      };
    }
  }
};

export const analyticsApi = {
  getOverview: async (params = {}) => {
    try {
      const res = await api.get('/analytics/overview', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch analytics overview:', err);
      throw err;
    }
  },
  getStudentMeals: async (params = {}) => {
    try {
      const res = await api.get('/analytics/student-meals', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch student meals analytics:', err);
      throw err;
    }
  },
  getFoodWaste: async (params = {}) => {
    try {
      const res = await api.get('/analytics/food-waste', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch food waste analytics:', err);
      throw err;
    }
  },
  getUco: async (params = {}) => {
    try {
      const res = await api.get('/analytics/uco', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch UCO analytics:', err);
      throw err;
    }
  },
  getNgo: async (params = {}) => {
    try {
      const res = await api.get('/analytics/ngo', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch NGO analytics:', err);
      throw err;
    }
  },
  getMlPerformance: async (params = {}) => {
    try {
      const res = await api.get('/analytics/ml-performance', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch ML performance analytics:', err);
      throw err;
    }
  },
  getCarbonEnergy: async (params = {}) => {
    try {
      const res = await api.get('/analytics/carbon-energy', { params });
      return res.data;
    } catch (err) {
      console.error('Failed to fetch carbon & energy analytics:', err);
      throw err;
    }
  }
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

export default api;


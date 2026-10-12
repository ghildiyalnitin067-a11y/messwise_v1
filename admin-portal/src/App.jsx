import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Sliders, 
  Truck,
  LogOut,
  LogIn,
  CheckCircle2,
  Bike
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import HandoverModal from './components/HandoverModal';
import LoginModal from './components/LoginModal';
import GreenRouteTracker from './components/GreenRouteTracker';
import { adminApi, authApi } from './api/client';

export const INITIAL_PRODUCTION_LOGS = [
  { id: 'log-1', date: 'Today (Lunch)', menu: 'Rajma + Steamed Rice + Roti', p: 842, s: 817, sur: 25, w: 6.0, prepared: 842, served: 817, surplus: 25, waste: 6.0, status: 'Active Log', isSurplus: false },
  { id: 'log-2', date: 'Today (Breakfast)', menu: 'Poha + Milk + Banana', p: 480, s: 472, sur: 8, w: 2.2, prepared: 480, served: 472, surplus: 8, waste: 2.2, status: 'Completed', isSurplus: false },
  { id: 'log-3', date: 'Yesterday (Dinner)', menu: 'Dal Tadka + Roti + Rice', p: 610, s: 598, sur: 12, w: 4.8, prepared: 610, served: 598, surplus: 12, waste: 4.8, status: 'Completed', isSurplus: false },
  { id: 'log-4', date: 'Yesterday (Lunch)', menu: 'Chole Bhature + Rice', p: 820, s: 795, sur: 25, w: 7.4, prepared: 820, served: 795, surplus: 25, waste: 7.4, status: 'Completed', isSurplus: false },
  { id: 'log-5', date: '14 Sep (Dinner)', menu: 'Veg Pulao + Kadhi', p: 580, s: 565, sur: 15, w: 3.9, prepared: 580, served: 565, surplus: 15, waste: 3.9, status: 'Completed', isSurplus: false },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHandoverReq, setSelectedHandoverReq] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('messwise_jwt_token')));

  const [adminStats, setAdminStats] = useState({
    mess_name: 'Hostel A - Aryabhatta Central Mess',
    supervisor: 'Rajesh Kumar',
    date: 'Tue, 16 Sep 2025',
    today_stats: { prepared: 842, served: 817, surplus: 25, waste: 6 },
  });

  const [aiPrediction, setAiPrediction] = useState({
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
  });

  const [ngoRequests, setNgoRequests] = useState([
    {
      id: 'req-102',
      surplus_id: 'surplus-chapati',
      food_title: 'Fresh Chapati',
      meals: 50,
      hostel: 'Hostel A',
      volunteer_name: 'Pranav',
      vehicle: 'Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: '1:20 PM',
      otp: '8294',
    },
    {
      id: 'req-101',
      surplus_id: 'surplus-1',
      food_title: 'Rajma Rice',
      meals: 25,
      hostel: 'Hostel A',
      volunteer_name: 'Rakesh Verma',
      vehicle: 'Electric Van (DL-04-EV-8821)',
      status: 'Approved',
      pickup_time_estimated: '3:15 PM',
      otp: '7412',
    },
  ]);

  const [prepQty, setPrepQty] = useState(842);
  const [servQty, setServQty] = useState(817);
  const [wasteQty, setWasteQty] = useState(6);
  const [prodSuccess, setProdSuccess] = useState(false);

  const [simDay, setSimDay] = useState('wed');
  const [simRatio, setSimRatio] = useState(92);
  const [simWeather, setSimWeather] = useState('clear');

  const [newSurplus, setNewSurplus] = useState({
    title: 'Rajma Rice & Roti',
    meals: 25,
    location_detail: 'Hostel A Central Mess, Dispatch Bay 2',
    pickup_deadline: 'Today, 4:00 PM',
  });
  const [publishSuccess, setPublishSuccess] = useState(false);

  const leftover = Math.max(0, Number(prepQty) - Number(servQty));

  const [productionLogs, setProductionLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('messwise_production_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRODUCTION_LOGS;
  });

  const allProductionLogs = useMemo(() => {
    const list = [...(productionLogs || [])];
    const seenTitles = new Set(list.map((l) => (l.menu || '').toLowerCase().trim()));
    let surplusItems = [];
    try {
      surplusItems = JSON.parse(localStorage.getItem('messwise_surplus_listings') || '[]');
    } catch {}
    (surplusItems || []).forEach((s) => {
      const cleanTitle = (s.title || '').toLowerCase().trim();
      if (cleanTitle && !seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const mealsCount = Number(s.meals) || 20;
        list.unshift({
          id: `surplus-log-${s.id}`,
          date: 'Surplus Queue Active',
          menu: s.title,
          p: mealsCount + 30,
          s: 30,
          sur: mealsCount,
          w: Number((mealsCount * 0.04).toFixed(1)),
          prepared: mealsCount + 30,
          served: 30,
          surplus: mealsCount,
          waste: Number((mealsCount * 0.04).toFixed(1)),
          status: s.status === 'Requested' ? 'NGO Matched' : s.status === 'PickedUp' ? 'Collected' : 'Surplus Queue Active',
          isSurplus: true,
          surplusId: s.id,
        });
      }
    });
    return list;
  }, [productionLogs]);

  const fetchNgoRequests = async () => {
    try {
      const data = await adminApi.getNgoRequests();
      const localReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
      const combined = [...(data && Array.isArray(data) ? data : []), ...localReqs];
      if (combined.length > 0) {
        setNgoRequests((prev) => {
          const map = new Map();
          combined.forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          prev.forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Failed to fetch admin requests:', err);
    }
  };

  useEffect(() => {
    adminApi.getStats().then((res) => {
      if (res) setAdminStats(res);
    });

    fetchNgoRequests();
    const pollInterval = setInterval(fetchNgoRequests, 3500);

    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('messwise-surplus-channel');
        bc.onmessage = (event) => {
          if (
            event.data?.type === 'RIDER_ASSIGNED' ||
            event.data?.type === 'CLAIM_SUBMITTED' ||
            event.data?.type === 'SURPLUS_CLAIMED'
          ) {
            if (event.data?.claim) {
              setNgoRequests((prev) => [
                event.data.claim,
                ...prev.filter((r) => r.id !== event.data.claim.id),
              ]);
            }
            if (event.data?.dispatch) {
              window.dispatchEvent(
                new CustomEvent('messwise-dispatch-updated', {
                  detail: event.data.dispatch,
                })
              );
            }
            fetchNgoRequests();
          }

          if (event.data?.type === 'SURPLUS_PUBLISHED') {
            const dish = event.data?.dish;
            if (dish) {
              const mealsCount = Number(dish.meals) || 20;
              const logItem = {
                id: `prod-surplus-${dish.id || Date.now()}`,
                date: 'Surplus Queue Active',
                menu: dish.title,
                p: mealsCount + 30,
                s: 30,
                sur: mealsCount,
                w: Number((mealsCount * 0.04).toFixed(1)),
                prepared: mealsCount + 30,
                served: 30,
                surplus: mealsCount,
                waste: Number((mealsCount * 0.04).toFixed(1)),
                status: 'Surplus Queue Active',
                isSurplus: true,
                surplusId: dish.id,
              };
              setProductionLogs((prev) => {
                if (prev.some((p) => (p.menu || '').toLowerCase().trim() === (dish.title || '').toLowerCase().trim())) {
                  return prev;
                }
                const updated = [logItem, ...prev];
                try {
                  localStorage.setItem('messwise_production_logs', JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }
        };
      }
    } catch {}

    const handleFocus = () => {
      fetchNgoRequests();
      try {
        const saved = localStorage.getItem('messwise_production_logs');
        if (saved) setProductionLogs(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('focus', handleFocus);

    const handleStorage = (e) => {
      if (e.key === 'messwise_ngo_requests') {
        fetchNgoRequests();
      }
      if (e.key === 'messwise_production_logs' && e.newValue) {
        try {
          setProductionLogs(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  const handleSimulateForecast = async () => {
    try {
      const pred = await adminApi.predictDemand({
        day_of_week: simDay,
        turnout_ratio: simRatio / 100,
        weather: simWeather,
        meal_session: 'Lunch',
      });
      if (pred) setAiPrediction(pred);
    } catch {
      let base = 600 * (simRatio / 100);
      if (simDay === 'wed') base *= 1.02;
      const exp = Math.round(base);
      setAiPrediction({
        target_date: 'Tomorrow (Wed, 17 Sep 2025)',
        expected_demand: exp,
        recommended_cook: Math.round(exp * 1.026),
        buffer_margin_percent: 2.6,
        waste_risk: 'Low',
        confidence_percent: 94.2,
        insights: [
          `Turnout Ratio: ${simRatio}% (${Math.round(650 * simRatio / 100)} boarders active).`,
          `Day Adjustment (${simDay.toUpperCase()}): Normal mid-week turnout factor.`,
          `Recommended Buffer: +${Math.round(exp * 0.026)} portions to guarantee 0 meal run-outs.`,
        ],
      });
    }
  };

  const handleSaveProduction = async (e) => {
    e.preventDefault();
    try {
      await adminApi.logProduction({
        meal_session: 'Lunch',
        prepared_qty: prepQty,
        served_qty: servQty,
        waste_qty: wasteQty,
        notes: 'Daily batch production record',
      });
      setAdminStats((prev) => ({
        ...prev,
        today_stats: {
          prepared: prepQty,
          served: servQty,
          surplus: leftover,
          waste: wasteQty,
        },
      }));
      const newManualLog = {
        id: `manual-log-${Date.now()}`,
        date: `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        menu: 'Lunch Batch (Rajma + Steamed Rice + Roti)',
        p: Number(prepQty),
        s: Number(servQty),
        sur: leftover,
        w: Number(wasteQty),
        prepared: Number(prepQty),
        served: Number(servQty),
        surplus: leftover,
        waste: Number(wasteQty),
        status: 'Completed',
        isSurplus: false,
      };
      setProductionLogs((prev) => {
        const next = [newManualLog, ...prev];
        try {
          localStorage.setItem('messwise_production_logs', JSON.stringify(next));
        } catch {}
        return next;
      });
      setProdSuccess(true);
      setTimeout(() => setProdSuccess(false), 3000);
    } catch {}
  };

  const handlePublishSurplus = async (e) => {
    e.preventDefault();
    const newDispatchId = `GR-DISP-${Math.floor(800 + Math.random() * 199)}`;
    const isChapatiBatch = newSurplus.title.toLowerCase().includes('chapati');
    const assignedRiderName = isChapatiBatch ? 'Pranav' : 'Pranav';
    
    const createdDispatch = {
      id: newDispatchId,
      surplusId: `surplus-${Date.now()}`,
      batchTitle: newSurplus.title,
      portions: Number(newSurplus.meals) || 25,
      foodType: 'Fresh Kitchen Surplus',
      hostel: adminStats.mess_name.split(' - ')[0] || 'Hostel A',
      pickupLocation: newSurplus.location_detail || 'Central Mess Dispatch Bay 2',
      targetNgo: 'Robin Hood Army & Jan Seva Shelter',
      distanceKm: 1.2,
      platform: 'Blinkit',
      platformBrandColor: '#F8CB46',
      platformTextColor: '#0F172A',
      platformTag: 'Blinkit Instant Dispatch',
      rider: {
        id: 'RDR-502',
        name: assignedRiderName,
        phone: '+91 98450 12345',
        rating: 4.95,
        totalDeliveries: 1120,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        vehicleType: 'Electric Scooter (Ather 450X)',
        vehicleCategory: 'EV Two-Wheeler',
        licensePlate: 'DL 3S PR 9021',
        batteryPercent: 89,
      },
      otp: '8294',
      otpVerified: false,
      status: 'arriving',
      etaMinutes: 3,
      timeline: [
        { step: 'searching', title: 'Searching Partner', desc: `Broadcast active for ${newSurplus.title}`, time: 'Just now' },
        { step: 'assigned', title: 'Rider Assigned', desc: `${assignedRiderName} confirmed dispatch order`, time: 'Just now' },
        { step: 'arriving', title: 'Arriving at Mess', desc: '0.6 km away • Approaching Gate 4 Ramp', time: 'Est. in 3 mins' },
        { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'Pending OTP handover verification', time: 'Est. in 10 mins' }
      ],
      temperatureLogged: '68°C (Insulated Casseroles)',
      pickupDeadline: newSurplus.pickup_deadline
    };

    const newNgoReq = {
      id: `req-${Date.now()}`,
      surplus_id: createdDispatch.surplusId,
      food_title: newSurplus.title,
      meals: Number(newSurplus.meals) || 25,
      hostel: createdDispatch.hostel,
      volunteer_name: assignedRiderName,
      vehicle: 'Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: 'Within 10 mins',
      otp: '8294',
    };

    setNgoRequests((prev) => [newNgoReq, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      localStorage.setItem('messwise_greenroute_dispatches', JSON.stringify([createdDispatch, ...existing]));
      window.dispatchEvent(new CustomEvent('messwise-dispatch-updated', { detail: createdDispatch }));
    } catch {}

    let backendRes = null;
    try {
      backendRes = await adminApi.publishSurplus({
        title: newSurplus.title,
        food_title: newSurplus.title,
        meals: Number(newSurplus.meals) || 25,
        meals_available: Number(newSurplus.meals) || 25,
        location_detail: newSurplus.location_detail || 'Hostel A Central Mess, Dispatch Bay 2',
        pickup_deadline: newSurplus.pickup_deadline || 'Today, 5:00 PM',
        temp_celsius: 68,
        storage_temperature: 68.0,
      });
    } catch (err) {
      console.warn('Publish surplus error:', err);
    }

    const mealsCount = Number(newSurplus.meals) || 25;
    const newSurplusLog = {
      id: `prod-surplus-${Date.now()}`,
      date: `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      menu: newSurplus.title,
      p: mealsCount + 35,
      s: 35,
      sur: mealsCount,
      w: Number((mealsCount * 0.04).toFixed(1)),
      prepared: mealsCount + 35,
      served: 35,
      surplus: mealsCount,
      waste: Number((mealsCount * 0.04).toFixed(1)),
      status: 'Surplus Queue Active',
      isSurplus: true,
      surplusId: backendRes?.id || createdDispatch.surplusId,
    };
    setProductionLogs((prev) => {
      const next = [newSurplusLog, ...prev];
      try {
        localStorage.setItem('messwise_production_logs', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'SURPLUS_PUBLISHED',
          dish: {
            id: backendRes?.id || createdDispatch.surplusId,
            title: newSurplus.title,
            meals: Number(newSurplus.meals) || 25,
            hostel: createdDispatch.hostel,
            location_detail: newSurplus.location_detail || 'Hostel A Central Mess, Dispatch Bay 2',
            pickup_deadline: newSurplus.pickup_deadline || '5:00 PM',
            status: 'Published',
            temp_celsius: 68,
            dietary: 'Vegetarian',
            pickup_otp: backendRes?.pickup_otp || '8294'
          }
        });
        bc.close();
      }
    } catch {}

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setActiveTab('production');
    }, 1200);
  };

  const handleVerifyOtpSubmit = async (requestId, otp) => {
    const req = ngoRequests.find((r) => r.id === requestId);
    if (!req) return;
    if (req.otp !== otp.trim()) {
      alert('Incorrect OTP! Verification failed.');
      return;
    }
    setNgoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Collected' } : r))
    );
    try {
      await adminApi.verifyHandover(requestId, otp);
    } catch {}
    alert(`Successfully verified! ${req.meals} meals handed over for redistribution.`);
    setSelectedHandoverReq(null);
  };

  return (
    <div className="portal-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Mess Operations Management</h1>
            <p>
              {adminStats.mess_name} • Supervisor {adminStats.supervisor} • {adminStats.date}
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Kitchen Online
            </span>
            <button 
              className={`btn ${activeTab === 'greenroute' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
              onClick={() => setActiveTab('greenroute')}
            >
              <Bike size={14} /> GreenRoute Fleet
            </button>
            <button className="btn btn-warm btn-sm" onClick={() => setActiveTab('surplus')}>
              <Sparkles size={14} /> Broadcast Surplus
            </button>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await authApi.logout();
                  setIsAuthenticated(false);
                }}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={14} /> Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Operations Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Operational Summary KPI Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Prepared Batch</div>
                  <div className="kpi-value">{adminStats.today_stats.prepared}</div>
                  <div className="kpi-meta">Lunch cycle total</div>
                </div>
                <div className="kpi-icon brand">
                  <ChefHat size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Served</div>
                  <div className="kpi-value">{adminStats.today_stats.served}</div>
                  <div className="kpi-meta">Student turnout verified</div>
                </div>
                <div className="kpi-icon brand">
                  <Check size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Available Surplus</div>
                  <div className="kpi-value">{adminStats.today_stats.surplus}</div>
                  <div className="kpi-meta">Portions for food rescue</div>
                </div>
                <div className="kpi-icon warm">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Plate Waste</div>
                  <div className="kpi-value">{adminStats.today_stats.waste} kg</div>
                  <div className="kpi-meta">0.7% preparation ratio</div>
                </div>
                <div className="kpi-icon">
                  <Trash2 size={18} />
                </div>
              </div>
            </div>

            {/* Demand Forecast & Kitchen Calibration */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <TrendingUp size={16} />
                  <span>Demand Forecast Recommendation ({aiPrediction.target_date})</span>
                </div>
                <span className="badge badge-success">
                  {aiPrediction.confidence_percent}% Confidence
                </span>
              </div>

              <div className="panel-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Expected Attendance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{aiPrediction.expected_demand}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on historical & RSVP patterns</div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--brand-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand-100)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-900)', fontWeight: 600, textTransform: 'uppercase' }}>Recommended Preparation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-900)', margin: '0.2rem 0' }}>{aiPrediction.recommended_cook}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-700)' }}>Includes +{aiPrediction.buffer_margin_percent}% safety buffer</div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Waste Over-Prep Risk</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)', margin: '0.2rem 0' }}>{aiPrediction.waste_risk}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Within optimal target threshold</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Model Calibration Factors:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {aiPrediction.insights?.map((ins, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--brand-900)' }} />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Batch Production Logger */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <ChefHat size={16} />
                  <span>Daily Batch Production & Wastage Logger</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lunch Session Records
                </span>
              </div>

              <div className="panel-body">
                {prodSuccess && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success-text)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Check size={16} /> Production log recorded into kitchen audit database.
                  </div>
                )}

                <form onSubmit={handleSaveProduction}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Meals Prepared (Portions)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={prepQty}
                        onChange={(e) => setPrepQty(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Meals Served (Turnout)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={servQty}
                        onChange={(e) => setServQty(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Calculated Surplus</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`${leftover} Portions`}
                        disabled
                        style={{ backgroundColor: 'var(--bg-canvas-subtle)', fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Plate Waste (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={wasteQty}
                        onChange={(e) => setWasteQty(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <ChefHat size={14} /> Record Batch Production
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* GreenRoute Quick-Commerce Dispatch & Rider Telemetry */}
            <GreenRouteTracker 
              ngoRequests={ngoRequests}
              onHandoverSuccess={(disp) => {
                setAdminStats((prev) => ({
                  ...prev,
                  today_stats: {
                    ...prev.today_stats,
                    surplus: Math.max(0, prev.today_stats.surplus - disp.portions),
                  }
                }));
                setNgoRequests((prev) =>
                  prev.map((r) =>
                    (r.surplus_id === disp.surplusId || r.id === disp.id || r.otp === disp.otp)
                      ? { ...r, status: 'Collected' }
                      : r
                  )
                );
              }}
            />

            {/* Active NGO Handover Verification Queue */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Truck size={16} />
                  <span>Active NGO Pickup & Handover Requests</span>
                </div>
                <span className="badge badge-neutral">
                  {ngoRequests.length} Active Records
                </span>
              </div>

              <div className="table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Food Batch</th>
                      <th>Quantity</th>
                      <th>Volunteer Driver</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngoRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem' }}>{req.id}</td>
                        <td style={{ fontWeight: 600 }}>{req.food_title}</td>
                        <td>{req.meals} Meals</td>
                        <td>{req.volunteer_name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{req.vehicle}</td>
                        <td>
                          <span className={`badge ${req.status === 'Collected' ? 'badge-success' : req.status === 'Approved' ? 'badge-info' : 'badge-warning'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {req.status !== 'Collected' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedHandoverReq(req)}
                            >
                              <ShieldCheck size={13} /> Verify OTP
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--success-text)', fontWeight: 600 }}>
                              ✓ Collected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated GreenRoute Quick-Commerce Fleet Tab */}
        {activeTab === 'greenroute' && (
          <div>
            <GreenRouteTracker 
              ngoRequests={ngoRequests}
              onHandoverSuccess={(disp) => {
                setAdminStats((prev) => ({
                  ...prev,
                  today_stats: {
                    ...prev.today_stats,
                    surplus: Math.max(0, prev.today_stats.surplus - disp.portions),
                  }
                }));
                setNgoRequests((prev) =>
                  prev.map((r) =>
                    (r.surplus_id === disp.surplusId || r.id === disp.id || r.otp === disp.otp)
                      ? { ...r, status: 'Collected' }
                      : r
                  )
                );
              }}
            />
          </div>
        )}

        {/* Tab 2: Batch Production Details */}
        {activeTab === 'production' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <ChefHat size={16} />
                <span>Kitchen Production History & Leftover Calibrations</span>
              </div>
              <span className="badge badge-neutral">
                {allProductionLogs.length} Records Active
              </span>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Date & Session</th>
                    <th>Menu / Dish Item</th>
                    <th className="text-right">Prepared</th>
                    <th className="text-right">Served</th>
                    <th className="text-right">Surplus</th>
                    <th className="text-right">Waste (kg)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allProductionLogs.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td style={{ fontWeight: 600 }}>{row.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{row.menu}</span>
                          {row.isSurplus && (
                            <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                              Surplus Food Queue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">{row.prepared ?? row.p}</td>
                      <td className="text-right">{row.served ?? row.s}</td>
                      <td className="text-right" style={{ color: 'var(--accent-warm)', fontWeight: 700 }}>
                        {row.surplus ?? row.sur} Portions
                      </td>
                      <td className="text-right">{row.waste ?? row.w}</td>
                      <td>
                        <span className={`badge ${row.status === 'Completed' ? 'badge-success' : row.status === 'Surplus Queue Active' ? 'badge-warning' : 'badge-info'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Forecast Simulator */}
        {activeTab === 'forecast' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <TrendingUp size={16} />
                <span>Demand Forecast Scenario Simulator</span>
              </div>
            </div>

            <div className="panel-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Day of Week</label>
                  <select
                    className="form-control"
                    value={simDay}
                    onChange={(e) => setSimDay(e.target.value)}
                  >
                    <option value="mon">Monday</option>
                    <option value="tue">Tuesday</option>
                    <option value="wed">Wednesday</option>
                    <option value="thu">Thursday</option>
                    <option value="fri">Friday</option>
                    <option value="sat">Saturday</option>
                    <option value="sun">Sunday</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Simulated RSVP Ratio ({simRatio}%)</label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={simRatio}
                    onChange={(e) => setSimRatio(Number(e.target.value))}
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Weather Signal</label>
                  <select
                    className="form-control"
                    value={simWeather}
                    onChange={(e) => setSimWeather(e.target.value)}
                  >
                    <option value="clear">Clear / Pleasant</option>
                    <option value="rain">Rain / Storm (+4% turnout)</option>
                    <option value="heat">High Heat (-3% turnout)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSimulateForecast}
                >
                  <Sliders size={14} /> Run Model Forecast
                </button>
              </div>

              <div style={{ padding: '1rem', background: 'var(--brand-50)', border: '1px solid var(--brand-100)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--brand-900)', marginBottom: '0.25rem' }}>
                  Simulated Output: Expected Attendance {aiPrediction.expected_demand} • Recommended Cooking {aiPrediction.recommended_cook} portions
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--brand-700)' }}>
                  Targeting 0 student meal run-outs with minimal buffer waste.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Surplus Broadcast */}
        {activeTab === 'surplus' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Sparkles size={16} />
                <span>Broadcast Fresh Food Surplus to NGO Shelter Network</span>
              </div>
            </div>

            <div className="panel-body">
              {publishSuccess && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--success-text)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Check size={16} /> Surplus batch published. Verified NGOs notified for dispatch.
                </div>
              )}

              <form onSubmit={handlePublishSurplus}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Food Dish / Item Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.title}
                      onChange={(e) => setNewSurplus({ ...newSurplus, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Available Portions (Meals)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newSurplus.meals}
                      onChange={(e) => setNewSurplus({ ...newSurplus, meals: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pickup Location Detail</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.location_detail}
                      onChange={(e) => setNewSurplus({ ...newSurplus, location_detail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pickup Deadline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.pickup_deadline}
                      onChange={(e) => setNewSurplus({ ...newSurplus, pickup_deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('dashboard')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warm btn-sm">
                    <Sparkles size={14} /> Publish Surplus Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Handover Records */}
        {activeTab === 'handovers' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <ShieldCheck size={16} />
                <span>Completed Food Handover & Audit Log</span>
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Request Ref</th>
                    <th>Food Item</th>
                    <th>Quantity</th>
                    <th>Partner Organization</th>
                    <th>Pickup Volunteer</th>
                    <th>OTP Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngoRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{req.id}</td>
                      <td style={{ fontWeight: 600 }}>{req.food_title}</td>
                      <td>{req.meals} Meals</td>
                      <td>Helping Hands NGO</td>
                      <td>{req.volunteer_name} ({req.vehicle})</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-900)' }}>{req.otp}</td>
                      <td>
                        <span className={`badge ${req.status === 'Collected' ? 'badge-success' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <HandoverModal
        isOpen={Boolean(selectedHandoverReq)}
        onClose={() => setSelectedHandoverReq(null)}
        request={selectedHandoverReq}
        onVerify={handleVerifyOtpSubmit}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          if (user?.name) setAdminStats((prev) => ({ ...prev, supervisor: user.name }));
          adminApi.getStats().then((res) => {
            if (res) setAdminStats(res);
          });
        }}
      />
    </div>
  );
}

export default App;

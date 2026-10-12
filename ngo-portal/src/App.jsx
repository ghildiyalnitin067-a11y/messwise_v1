import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Truck, 
  Clock, 
  Thermometer, 
  Sparkles, 
  Utensils, 
  ShieldCheck, 
  Check, 
  Send,
  LogOut,
  LogIn,
  RefreshCw
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import RequestModal from './components/RequestModal';
import LoginModal from './components/LoginModal';
import { ngoApi, authApi } from './api/client';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [selectedSurplusForClaim, setSelectedSurplusForClaim] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('messwise_jwt_token')));

  const [surplusListings, setSurplusListings] = useState([
    {
      id: 'surplus-1',
      title: 'Rajma Masala + Jeera Rice + Tawa Roti',
      meals: 35,
      hostel: 'Hostel A (Aryabhatta)',
      location_detail: 'North Gate Kitchen Dispatch Bay 2',
      pickup_deadline: '4:00 PM (Consume before 6:30 PM)',
      status: 'Published',
      temp_celsius: 67,
      dietary: 'Vegetarian',
      pickup_otp: '7412',
    },
    {
      id: 'surplus-2',
      title: 'Dal Makhani + Tandoori Roti (Insulated Warmer)',
      meals: 45,
      hostel: 'Hostel B (Bhaskara)',
      location_detail: 'Rear Ramp Loading Dock 1',
      pickup_deadline: '4:45 PM (Consume before 7:15 PM)',
      status: 'Published',
      temp_celsius: 65,
      dietary: 'Vegetarian',
      pickup_otp: '3829',
    },
    {
      id: 'surplus-3',
      title: 'Friday Weekend Khichdi + Dahi + Papad (Hostel Exodus Batch)',
      meals: 75,
      hostel: 'Hostel A Central Mess',
      location_detail: 'Main Kitchen Counter 1',
      pickup_deadline: '9:30 PM (Dinner Batch)',
      status: 'Published',
      temp_celsius: 68,
      dietary: 'Vegetarian',
      pickup_otp: '5192',
    },
  ]);

  const [ngoRequests, setNgoRequests] = useState([
    {
      id: 'req-101',
      surplus_id: 'surplus-1',
      food_title: 'Rajma Masala + Jeera Rice',
      meals: 35,
      hostel: 'Hostel A',
      volunteer_name: 'Rakesh Verma (Driver DL-8821)',
      vehicle: 'Tata Ace EV (DL-04-EV-8821)',
      status: 'Approved',
      pickup_time_estimated: 'Within 25 mins',
      otp: '7412',
    },
    {
      id: 'req-102',
      surplus_id: 'surplus-chapati',
      food_title: 'Fresh Tawa Chapati & Dal Makhani',
      meals: 50,
      hostel: 'Hostel B',
      volunteer_name: 'Pranav (Blinkit GreenFleet)',
      vehicle: 'Ather 450X Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: 'Within 12 mins',
      otp: '8294',
    },
  ]);

  const [distBatch, setDistBatch] = useState('Rajma Masala + Rice (Hostel A)');
  const [distPeople, setDistPeople] = useState(65);
  const [distLocation, setDistLocation] = useState('Rain Basera Night Shelter, Near Old Railway Station Gate 2');
  const [distSuccess, setDistSuccess] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSurplusData = async () => {
    try {
      const res = await ngoApi.getAvailableSurplus();
      if (res?.items && Array.isArray(res.items)) {
        setSurplusListings(res.items);
      }
      const reqs = await ngoApi.getMyRequests();
      if (reqs && Array.isArray(reqs)) {
        setNgoRequests(reqs);
      }
    } catch (e) {
      console.warn('Error fetching NGO surplus data:', e);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchSurplusData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  useEffect(() => {
    fetchSurplusData();

    // Auto-poll every 3.5 seconds for instant real-time synchronization with admin portal
    const pollInterval = setInterval(fetchSurplusData, 3500);

    // Cross-tab broadcast channel for instantaneous sync across browser tabs
    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('messwise-surplus-channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'SURPLUS_PUBLISHED') {
            fetchSurplusData();
          }
        };
      }
    } catch {}

    const handleWindowFocus = () => fetchSurplusData();
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const handleClaimSubmit = async (surplusId, details) => {
    const surplus = surplusListings.find((s) => s.id === surplusId);
    if (!surplus) return;

    const plateMatch = (details.vehicle || '').match(/\(([^)]+)\)/);
    const licensePlate = plateMatch ? plateMatch[1] : 'DL 3S PR 9021';
    const riderName = details.volunteer_name || 'Pranav';
    const reqOtp = surplus.pickup_otp || '8294';

    const newReq = {
      id: `req-${Date.now()}`,
      surplus_id: surplus.id,
      food_title: surplus.title,
      meals: surplus.meals,
      hostel: surplus.hostel || 'Hostel A',
      volunteer_name: riderName,
      vehicle: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: details.eta || 'Within 15 mins',
      otp: reqOtp,
    };

    const newDispatch = {
      id: `GR-DISP-${Date.now().toString().slice(-4)}`,
      surplusId: surplus.id,
      surplus_id: surplus.id,
      batchTitle: surplus.title,
      batch_title: surplus.title,
      portions: surplus.meals,
      foodType: surplus.food_type || 'Fresh Cooked Surplus',
      food_type: surplus.food_type || 'Fresh Cooked Surplus',
      hostel: surplus.hostel || 'Hostel A (Aryabhatta)',
      pickupLocation: surplus.location_detail || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      pickup_location: surplus.location_detail || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      targetNgo: 'Helping Hands NGO',
      target_ngo: 'Helping Hands NGO',
      distanceKm: surplus.distance_km || 1.2,
      distance_km: surplus.distance_km || 1.2,
      platform: 'Blinkit',
      platformTag: 'Blinkit Instant Dispatch',
      platformBrandColor: '#F8CB46',
      platformTextColor: '#0F172A',
      rider: {
        id: `RDR-${Math.floor(100 + Math.random() * 899)}`,
        name: riderName,
        phone: '+91 98450 12345',
        rating: 4.95,
        totalDeliveries: 1120,
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        vehicleType: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
        vehicle_type: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
        licensePlate: licensePlate,
        license_plate: licensePlate,
        batteryPercent: 92,
        battery_percent: 92,
      },
      otp: reqOtp,
      otpVerified: false,
      status: 'arriving',
      etaMinutes: 3,
      eta_minutes: 3,
      timeline: [
        { step: 'searching', title: 'Searching Partner', desc: 'Broadcast matched with Helping Hands NGO', time: 'Just now' },
        { step: 'assigned', title: 'Rider Assigned', desc: `${riderName} confirmed dispatch order`, time: 'Just now' },
        { step: 'arriving', title: 'Arriving at Mess', desc: `Approaching Mess Dispatch Bay 2 (${details.eta || 'Within 15 mins'})`, time: 'In transit' },
        { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'Pending OTP handover verification', time: 'Est. in 10 mins' },
      ],
      temperatureLogged: `${surplus.temp_celsius || 68}°C (Insulated Casseroles)`,
      pickupDeadline: surplus.pickup_deadline || '5:00 PM',
    };

    setNgoRequests((prev) => [newReq, ...prev]);
    setSurplusListings((prev) =>
      prev.map((s) => (s.id === surplusId ? { ...s, status: 'Requested', requested_by_ngo: 'Helping Hands NGO' } : s))
    );

    try {
      const existingDispatches = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      localStorage.setItem('messwise_greenroute_dispatches', JSON.stringify([newDispatch, ...existingDispatches]));

      const existingReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
      localStorage.setItem('messwise_ngo_requests', JSON.stringify([newReq, ...existingReqs]));

      window.dispatchEvent(new CustomEvent('messwise-dispatch-updated', { detail: newDispatch }));
    } catch {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'RIDER_ASSIGNED',
          claim: newReq,
          dispatch: newDispatch,
          riderName: riderName,
          vehicle: details.vehicle,
          surplusId: surplus.id,
        });
        bc.close();
      }
    } catch {}

    try {
      await ngoApi.requestSurplus(surplusId, details);
    } catch {}

    alert(`✅ Pickup Dispatched!\nBatch: ${surplus.title}\nAssigned Rider: ${riderName}\nHandover OTP: ${newReq.otp}\nDriver must present this 4-digit code at kitchen counter.`);
    setSelectedSurplusForClaim(null);
    setActiveTab('requests');
  };

  const handleDistributionSubmit = async (e) => {
    e.preventDefault();
    if (!distLocation.trim()) return;
    try {
      await ngoApi.logDistribution({
        food_title: distBatch,
        beneficiaries_served: Number(distPeople) || 25,
        location: distLocation.trim(),
        notes: 'Safely served hot meals',
      });
      setDistSuccess(true);
      setTimeout(() => setDistSuccess(false), 3000);
    } catch {}
  };

  const filteredSurplus = surplusListings.filter((s) => {
    if (dietaryFilter === 'all') return true;
    return s.dietary?.toLowerCase() === dietaryFilter.toLowerCase();
  });

  return (
    <div className="portal-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>NGO Food Rescue Logistics</h1>
            <p>
              Helping Hands NGO • Contact: Dr. Sunita Rao • Partner #FSSAI-NGO-8841
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <ShieldCheck size={13} /> FSSAI Certified Partner
            </span>

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

        {/* Tab 1: Live Surplus Feed */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Logistics Summary Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Available Donations</div>
                  <div className="kpi-value">{surplusListings.filter(s => s.status === 'Published').length} Batches</div>
                  <div className="kpi-meta">Ready for immediate dispatch</div>
                </div>
                <div className="kpi-icon brand">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Active Pickups</div>
                  <div className="kpi-value">{ngoRequests.filter(r => r.status !== 'Collected').length} Vehicles</div>
                  <div className="kpi-meta">Dispatched to campus</div>
                </div>
                <div className="kpi-icon warm">
                  <Truck size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Rescued</div>
                  <div className="kpi-value">4,320</div>
                  <div className="kpi-meta">Total campus term diversion</div>
                </div>
                <div className="kpi-icon brand">
                  <HeartHandshake size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">People Fed Today</div>
                  <div className="kpi-value">184</div>
                  <div className="kpi-meta">Verified shelter logs</div>
                </div>
                <div className="kpi-icon brand">
                  <Utensils size={18} />
                </div>
              </div>
            </div>

            {/* Available Surplus Table */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Sparkles size={16} />
                  <span>Live Surplus Batches Available for Claim</span>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <button
                    onClick={handleManualRefresh}
                    className="btn btn-secondary btn-sm"
                    title="Refresh live surplus availability"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
                    <span>Refresh Feed</span>
                  </button>
                  {['all', 'Vegetarian', 'Non-Vegetarian'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDietaryFilter(filter)}
                      className={`btn btn-sm ${dietaryFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {filter.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Dish Description</th>
                      <th>Quantity</th>
                      <th>Location / Bay</th>
                      <th>Holding Temp</th>
                      <th>Pickup Deadline</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSurplus.map((item) => (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 600 }}>{item.title}</td>
                        <td>{item.meals} Portions</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.location_detail || item.hostel}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: item.temp_celsius >= 60 ? 'var(--success-text)' : 'var(--warning-text)', fontWeight: 600 }}>
                            <Thermometer size={13} /> {item.temp_celsius}°C
                          </span>
                        </td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                            <Clock size={13} /> {item.pickup_deadline}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${item.status === 'Published' ? 'badge-success' : item.status === 'Requested' ? 'badge-warning' : 'badge-neutral'}`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {item.status === 'Published' ? (
                            <button
                              className="btn btn-warm btn-sm"
                              onClick={() => setSelectedSurplusForClaim(item)}
                            >
                              <Truck size={13} /> Claim & Dispatch
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Claimed
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

        {/* Tab 2: Food Catalog */}
        {activeTab === 'catalog' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Utensils size={16} />
                <span>Campus Dining Hall Pickup Bays</span>
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Hostel Dining Facility</th>
                    <th>Designated Loading Bay</th>
                    <th>Distance from HQ</th>
                    <th>Supervisor In-Charge</th>
                    <th>Operating Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'Hostel A (Aryabhatta)', bay: 'North Gate Kitchen Bay 2', dist: '2.3 km', sup: 'Chef Rajesh Kumar', hours: '6:30 AM - 10:00 PM' },
                    { name: 'Hostel B (Bhaskara)', bay: 'Rear Ramp Loading Bay 1', dist: '3.1 km', sup: 'Chef Mohan Das', hours: '7:00 AM - 9:30 PM' },
                    { name: 'Hostel C (Charaka)', bay: 'Central Service Counter 3', dist: '1.8 km', sup: 'Chef Rameshwar', hours: '7:00 AM - 10:00 PM' },
                    { name: 'Main Campus Mess Hub', bay: 'Loading Dock A', dist: '0.9 km', sup: 'Supervisor Anand', hours: '6:00 AM - 11:00 PM' },
                  ].map((row, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{row.name}</td>
                      <td>{row.bay}</td>
                      <td>{row.dist}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{row.sup}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{row.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Active Requests */}
        {activeTab === 'requests' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Truck size={16} />
                <span>Active Rescue Van Pickups & Handover OTP Codes</span>
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Request ID</th>
                    <th>Food Batch</th>
                    <th>Quantity</th>
                    <th>Assigned Vehicle</th>
                    <th>Pickup ETA</th>
                    <th>Handover OTP</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngoRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{req.id}</td>
                      <td style={{ fontWeight: 600 }}>{req.food_title}</td>
                      <td>{req.meals} Meals</td>
                      <td>{req.volunteer_name} ({req.vehicle})</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{req.pickup_time_estimated || 'Within 30 mins'}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-900)', backgroundColor: 'var(--brand-50)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--brand-100)' }}>
                          {req.otp}
                        </span>
                      </td>
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

        {/* Tab 4: Distribution Log */}
        {activeTab === 'distribution' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <HeartHandshake size={16} />
                <span>Record Community Distribution & Shelter Proof</span>
              </div>
            </div>

            <div className="panel-body">
              {distSuccess && (
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
                  <Check size={16} /> Distribution log saved. Thank you for feeding community shelters.
                </div>
              )}

              <form onSubmit={handleDistributionSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Batch Collected</label>
                    <input
                      type="text"
                      className="form-control"
                      value={distBatch}
                      onChange={(e) => setDistBatch(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Beneficiaries Fed (Count)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={distPeople}
                      onChange={(e) => setDistPeople(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Shelter / Distribution Site</label>
                    <input
                      type="text"
                      className="form-control"
                      value={distLocation}
                      onChange={(e) => setDistLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Send size={14} /> Submit Distribution Log
                  </button>
                </div>
              </form>

              {/* Recent Verified Shelter Distribution Log */}
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} color="#16a34a" />
                  <span>Recent Shelter Distribution &amp; Geo-Tag Receipt Audit</span>
                </div>
                <div className="table-container">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Food Batch</th>
                        <th>Shelter Destination</th>
                        <th>Beneficiaries Fed</th>
                        <th>Temp at Handover</th>
                        <th>Verification Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { time: 'Today 2:15 PM', batch: 'Rajma Masala + Steamed Rice (Hostel A)', shelter: 'Rain Basera Night Shelter, Gate 2', people: 65, temp: '66.2°C', status: 'Delivered & Signed' },
                        { time: 'Yesterday 8:45 PM', batch: 'Paneer Makhani + Roti (Hostel B)', shelter: 'Asha Jyoti Bal Ashram, Sector 14', people: 40, temp: '64.8°C', status: 'Delivered & Signed' },
                        { time: '14 Sep 2:30 PM', batch: 'Chole Bhature (Sunday Feast Batch)', shelter: 'Kalyanpuri Slum Community Kitchen', people: 80, temp: '67.0°C', status: 'Delivered & Signed' },
                        { time: '13 Sep 9:15 PM', batch: 'Khichdi + Papad (Exodus Batch)', shelter: 'Shanti Vridh Ashram, Civil Lines', people: 30, temp: '65.5°C', status: 'Delivered & Signed' },
                      ].map((log, idx) => (
                        <tr key={idx}>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{log.time}</td>
                          <td style={{ fontWeight: 600 }}>{log.batch}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{log.shelter}</td>
                          <td style={{ fontWeight: 700, color: 'var(--brand-900)' }}>{log.people} Persons</td>
                          <td style={{ color: '#16a34a', fontWeight: 600 }}>{log.temp}</td>
                          <td>
                            <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <RequestModal
        isOpen={Boolean(selectedSurplusForClaim)}
        onClose={() => setSelectedSurplusForClaim(null)}
        surplusItem={selectedSurplusForClaim}
        onSubmit={handleClaimSubmit}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          ngoApi.getAvailableSurplus().then((res) => {
            if (res?.items) setSurplusListings(res.items);
          });
          ngoApi.getMyRequests().then((reqs) => {
            if (reqs?.length) setNgoRequests(reqs);
          });
        }}
      />
    </div>
  );
}

export default App;

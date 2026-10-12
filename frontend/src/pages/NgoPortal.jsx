import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Truck, 
  MapPin, 
  Clock, 
  Thermometer, 
  Sparkles, 
  Utensils, 
  ShieldCheck, 
  Check, 
  Send,
  CheckCircle2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RequestModal from '../components/RequestModal';
import { useMesswise } from '../context/MesswiseContext';
import { ngoApi } from '../api/client';

const NgoPortal = () => {
  const { surplusListings, ngoRequests, ngoStats, requestSurplus } = useMesswise();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [selectedSurplusForClaim, setSelectedSurplusForClaim] = useState(null);

  // Distribution Form
  const [distBatch, setDistBatch] = useState('Rajma Masala + Rice (Hostel A)');
  const [distPeople, setDistPeople] = useState(65);
  const [distLocation, setDistLocation] = useState('Rain Basera Night Shelter, Near Old Railway Station Gate 2');
  const [distSuccess, setDistSuccess] = useState(false);

  const handleClaimSubmit = async (surplusId, details) => {
    const res = await requestSurplus(surplusId, details);
    if (res) {
      const riderName = details.volunteer_name || 'Volunteer Driver';
      alert(`✅ Pickup Dispatched to GreenRoute Fleet!\nBatch: ${res.food_title}\nAssigned Rider: ${riderName}\nVehicle: ${details.vehicle || 'Electric Van'}\nHandover OTP: ${res.otp}\nDriver must present this 4-digit code at kitchen counter.`);
      setSelectedSurplusForClaim(null);
      setActiveTab('requests');
    }
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
      <Sidebar role="ngo" activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>NGO Food Rescue Logistics</h1>
            <p>
              {ngoStats.name} • Contact: {ngoStats.contactPerson} • Partner #FSSAI-NGO-8841
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <ShieldCheck size={13} /> FSSAI Certified Partner
            </span>
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
                  <div className="kpi-value">{ngoStats.totalMealsRescued}</div>
                  <div className="kpi-meta">Total campus term diversion</div>
                </div>
                <div className="kpi-icon brand">
                  <HeartHandshake size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">People Fed Today</div>
                  <div className="kpi-value">{ngoStats.peopleServed}</div>
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
                <div style={{ display: 'flex', gap: '0.4rem' }}>
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
                              Claimed ({item.requested_by_ngo || 'Assigned'})
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

      {/* Claim Modal */}
      <RequestModal
        isOpen={Boolean(selectedSurplusForClaim)}
        onClose={() => setSelectedSurplusForClaim(null)}
        surplusItem={selectedSurplusForClaim}
        onSubmit={handleClaimSubmit}
      />
    </div>
  );
};

export default NgoPortal;

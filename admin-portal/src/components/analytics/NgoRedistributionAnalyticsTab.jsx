import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { HeartHandshake, Truck, Clock, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

const NgoRedistributionAnalyticsTab = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading NGO & Food Redistribution Analytics...</div>
      </div>
    );
  }

  const {
    summary = {},
    ngo_distribution_breakdown = [],
    offered_vs_delivered_timeline = [],
    transaction_status_breakdown = [],
    pickup_completion_time_trend = [],
    ngo_partners_table = []
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Registered NGOs
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {summary.total_ngos_registered} Networks
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {summary.active_ngo_partners} Active Rescue Partners
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Surplus Meals Offered
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
            {summary.surplus_food_offered_meals} Meals
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Broadcast via Kitchen Dispatch
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #15803d' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Delivered to Shelters
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
            {summary.surplus_food_collected_meals} Meals
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            100% Beneficiary Verified
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #7c3aed' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Average Pickup SLA Time
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#7c3aed' }}>
            {summary.average_pickup_time_minutes} Mins
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Target SLA: &lt; 45 Mins
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #166534' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            CO₂ Diverted from Landfills
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>
            {summary.food_emissions_avoided_kg} kg CO₂e
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Clean Air Impact Factor: 2.5 kg/kg
          </div>
        </div>
      </div>

      {/* Row 1: Food Redistributed per NGO (Bar) + Offered vs Delivered Timeline (Line) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Bar Chart: Food Redistributed to each NGO */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <HeartHandshake size={16} />
              <span>Surplus Meals Rescued by Partner NGO</span>
            </div>
            <span className="badge badge-neutral">Partner Share</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ngo_distribution_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="ngo_name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="meals_rescued" name="Meals Rescued" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="co2_diverted_kg" name="CO₂ Diverted (kg)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Line Chart: Surplus Food Offered vs Successfully Delivered */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Truck size={16} />
              <span>Surplus Offered vs Successfully Delivered Timeline</span>
            </div>
            <span className="badge badge-success">Rescue Fulfillment</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={offered_vs_delivered_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="meals_offered" name="Surplus Meals Offered" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="meals_delivered" name="Delivered to Shelters" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Table: NGO Partners Detailed Records */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <Users size={16} />
            <span>Accredited NGO Partners & Redistribution Log</span>
          </div>
          <span className="badge badge-success">FSSAI RUCO Verified</span>
        </div>
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>NGO Partner Name</th>
                <th>Quantity Received (Meals)</th>
                <th>Completed Pickups</th>
                <th>Pending Requests</th>
                <th>CO₂ Diverted (kg)</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {ngo_partners_table.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.ngo_name}</td>
                  <td><strong>{row.quantity_received_meals} meals</strong></td>
                  <td>{row.completed_pickups} verified handovers</td>
                  <td>
                    <span className={`badge ${row.pending_requests === 0 ? 'badge-neutral' : 'badge-warning'}`}>
                      {row.pending_requests} pending
                    </span>
                  </td>
                  <td style={{ color: '#166534', fontWeight: 600 }}>{row.co2_diverted_kg} kg</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> {row.compliance_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default NgoRedistributionAnalyticsTab;

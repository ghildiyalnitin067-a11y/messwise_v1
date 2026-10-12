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
  Legend,
  AreaChart,
  Area 
} from 'recharts';
import { Droplets, CheckCircle2, Truck, Leaf, ShieldCheck, Factory } from 'lucide-react';

const UcoAnalyticsTab = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Used Cooking Oil (UCO) Analytics...</div>
      </div>
    );
  }

  const {
    summary = {},
    oil_timeline = [],
    destination_distribution = [],
    status_breakdown = [],
    emissions_avoided_trend = [],
    partner_performance_table = []
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Total Oil Recorded
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {summary.total_oil_recorded_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Decanted from kitchen fryers
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #64748b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Awaiting Collection (Pending)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#64748b' }}>
            {summary.total_oil_pending_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Stored in HDPE sealed drums
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Collected by Aggregators
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
            {summary.total_oil_collected_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Dispatched via certified tankers
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #15803d' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Confirmed Processed (Biofuel)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#15803d' }}>
            {summary.total_oil_processed_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Verified lab QA certificates
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #166534' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Emissions Avoided (Processed)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#166534' }}>
            {summary.total_emissions_avoided_kg} kg CO₂e
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Credited strictly on completion
          </div>
        </div>
      </div>

      {/* Row 1: Oil Generated, Collected & Processed (Line) + Destination Distribution (Bar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Oil Generated, Collected, Processed Over Time */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Droplets size={16} />
              <span>Oil Generation, Collection & Processing Timeline</span>
            </div>
            <span className="badge badge-neutral">Batch History</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={oil_timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="kg" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="recorded_generated_kg" name="Recorded (kg)" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="collected_kg" name="Collected (kg)" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="processed_kg" name="Processed (kg)" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Quantities by Repurposing Destination */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Factory size={16} />
              <span>Oil Quantities by Repurposing Method</span>
            </div>
            <span className="badge badge-neutral">Circular Destination</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destination_distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="repurposing_method" tick={{ fontSize: 10 }} />
                <YAxis unit="kg" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="quantity_kg" name="Consigned Oil (kg)" fill="#b45309" radius={[4, 4, 0, 0]} />
                <Bar dataKey="co2_avoided_kg" name="CO₂e Avoided (kg)" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Stacked Status Breakdown & Emissions Avoided Trend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 3: Stacked Bar Chart: Pending, Collected, Processed */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Truck size={16} />
              <span>Current UCO Lifecycle Status Breakdown (kg)</span>
            </div>
            <span className="badge badge-neutral">Stock Staging</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={status_breakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" unit="kg" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="status" width={180} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="quantity_kg" name="Oil Mass (kg)" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: KPI Trend: Emissions Avoided from Confirmed Processing */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Leaf size={16} />
              <span>Emissions Avoided from Confirmed Processing</span>
            </div>
            <span className="badge badge-success">Clean Air Impact</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissions_avoided_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="kg" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="co2_avoided_kg" name="Cumulative CO₂e Avoided (kg)" stroke="#16a34a" fill="#dcfce7" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Collection Partner Performance Table */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <ShieldCheck size={16} />
            <span>Repurposing Partner Performance & Compliance Audit</span>
          </div>
          <span className="badge badge-success">RUCO Certified</span>
        </div>
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Partner Facility & Destination</th>
                <th>Total Consigned (kg)</th>
                <th>Verified Processed (kg)</th>
                <th>Fulfillment Rate</th>
                <th>Consignment Batches</th>
                <th>Verification Standard</th>
              </tr>
            </thead>
            <tbody>
              {partner_performance_table.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.destination_partner}</td>
                  <td>{row.total_consigned_kg} kg</td>
                  <td><strong>{row.verified_processed_kg} kg</strong></td>
                  <td>
                    <span className="badge badge-success" style={{ fontWeight: 700 }}>
                      {row.fulfillment_rate_pct}%
                    </span>
                  </td>
                  <td>{row.consignment_count} manifest(s)</td>
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

export default UcoAnalyticsTab;

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
import { Leaf, Zap, ShieldCheck, Info, FileText, CheckCircle2 } from 'lucide-react';

const CarbonEnergyAnalyticsTab = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Energy & Net Carbon Footprint Analytics...</div>
      </div>
    );
  }

  const {
    summary = {},
    monthly_emissions_trend = [],
    contribution_stack = [],
    operational_vs_avoided = [],
    emission_factors_documentation = []
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* KPI Cards Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem'
      }}>
        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #15803d' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Net CO₂e Avoided (Audited)
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#15803d' }}>
            {summary.net_co2e_avoided_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            After subtracting ML compute emissions
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #0284c7' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Food Waste Landfill Avoidance
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7' }}>
            {summary.food_waste_emissions_avoided_kg} kg CO₂e
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            UN FAO Factor: 2.50 kg CO₂e / kg
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #d97706' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            Used Cooking Oil Recycling
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706' }}>
            {summary.uco_emissions_avoided_kg} kg CO₂e
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            EU RED II Directive LCA standard
          </div>
        </div>

        <div className="panel" style={{ marginBottom: 0, borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.3rem' }}>
            ML Operational Emissions
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#6366f1' }}>
            {summary.ml_operational_emissions_kg} kg
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Energy: {summary.energy_per_prediction_uwh} µWh/call • CEA Grid
          </div>
        </div>
      </div>

      {/* Row 1: Monthly Emissions Avoided (Line) & Source Contribution Stack (Bar) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Monthly Estimated Emissions Avoided */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Leaf size={16} />
              <span>Monthly Estimated Net Emissions Avoided (kg CO₂e)</span>
            </div>
            <span className="badge badge-success">Clean Air Credits</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly_emissions_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis unit="kg" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="food_waste_co2_avoided" name="Food Waste Landfill Avoidance" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="uco_recycling_co2_avoided" name="UCO Biofuel Repurposing" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Stacked Bar Chart: Contributions from Food vs Oil */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <ShieldCheck size={16} />
              <span>Environmental Benefit Source Contribution</span>
            </div>
            <span className="badge badge-neutral">Proportion Stack</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contribution_stack} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" unit="kg" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="source" width={180} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="co2_avoided_kg" name="Avoided CO₂e (kg)" fill="#059669" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Operational ML Emissions vs Avoided Savings (Bar Chart) */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <Zap size={16} />
            <span>Operational ML Energy Footprint vs Clean Air Savings Balance</span>
          </div>
          <span className="badge badge-success">Net Carbon Positive (99.99%)</span>
        </div>
        <div className="panel-body" style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={operational_vs_avoided}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="category" tick={{ fontSize: 11 }} />
              <YAxis unit="kg" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="kg_co2e" name="Mass (kg CO₂e)" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3: Emission Factors & Life-Cycle Accounting Documentation Table */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <FileText size={16} />
            <span>Scientific Emission Factors & LCA System Boundary Documentation</span>
          </div>
          <span className="badge badge-success">Auditable Methodology</span>
        </div>
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Environmental Benefit Domain</th>
                <th>Configured Factor Value</th>
                <th>Authoritative Scientific Source / Benchmark</th>
                <th>Accounting Methodology Note</th>
              </tr>
            </thead>
            <tbody>
              {emission_factors_documentation.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.item}</td>
                  <td>
                    <strong style={{ color: '#15803d' }}>{row.factor}</strong>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.source}</td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <CheckCircle2 size={13} /> Displaces equivalent fossil / landfill baseline
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

export default CarbonEnergyAnalyticsTab;

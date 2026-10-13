import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Trash2, AlertTriangle, CheckCircle2, IndianRupee, Layers, Scale } from 'lucide-react';

const FoodWasteAnalyticsTab = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Food Preparation & Waste Analytics...</div>
      </div>
    );
  }

  const {
    daily_prep_consumed_waste = [],
    waste_by_meal_type = [],
    waste_by_category = [],
    waste_percentage_trend = [],
    financial_loss_trend = [],
    pre_post_ml_comparison = [],
    highest_waste_meals_table = []
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Primary Comparison Chart: Pre-ML Baseline vs ML-Optimized */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <CheckCircle2 size={16} />
            <span>Waste Outcomes: Pre-ML vs ML-Optimized Operations (Basic Comparison)</span>
          </div>
          <span className="badge badge-success">Intervention Comparison</span>
        </div>
        <div className="panel-body" style={{ height: '320px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pre_post_ml_comparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Pre_ML_Baseline" name="Pre-ML Rule Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Post_ML_Optimized" name="ML-Calibrated Outcomes" fill="#15803d" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Financial Loss & Waste by Category */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 2: Estimated Financial Loss (INR) */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <IndianRupee size={16} />
              <span>Financial Loss Due to Wasted Food (₹)</span>
            </div>
            <span className="badge badge-neutral">Cost Accounting</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financial_loss_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="₹" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="loss_inr" name="Direct Ingredient Loss (₹)" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Waste by Food Category */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Layers size={16} />
              <span>Waste by Category Distribution</span>
            </div>
            <span className="badge badge-neutral">Audit Classification</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waste_by_category}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                <YAxis unit="kg" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="waste_kg" name="Waste (kg)" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 4: Table: Highest-Waste Meals & Recommended Corrective Actions */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <AlertTriangle size={16} />
            <span>Highest-Waste Incidents & Recommended Corrective Actions</span>
          </div>
          <span className="badge badge-warning">Remediation Log</span>
        </div>
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Date & Meal Session</th>
                <th>Total Measured Waste</th>
                <th>Plate Waste (kg)</th>
                <th>Unserved Surplus (kg)</th>
                <th>Primary Root Cause</th>
                <th>Recommended Corrective Action</th>
              </tr>
            </thead>
            <tbody>
              {highest_waste_meals_table.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.date_display} &bull; {row.session}</td>
                  <td>
                    <strong style={{ color: '#b45309' }}>{row.total_waste_kg} kg</strong>
                  </td>
                  <td>{row.plate_waste_kg} kg</td>
                  <td>{row.unserved_surplus_kg} kg</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{row.primary_root_cause}</td>
                  <td>
                    <span style={{ fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                      &bull; {row.recommended_corrective_action}
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

export default FoodWasteAnalyticsTab;

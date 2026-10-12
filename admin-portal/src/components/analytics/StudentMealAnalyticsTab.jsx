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
import { Calendar, Users, Utensils, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';

const StudentMealAnalyticsTab = ({ data, loading }) => {
  if (loading || !data) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '1rem', fontWeight: 600 }}>Loading Student & Meal Attendance Analytics...</div>
      </div>
    );
  }

  const {
    daily_bookings_trend = [],
    session_comparison = [],
    predicted_vs_actual = [],
    rates_over_time = [],
    bookings_by_dow = [],
    stacked_booking_status = [],
    attendance_vs_consumption = [],
    demand_periods_table = []
  } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Row 1: Daily Bookings Trend & Session Demand Comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Daily Meal Bookings Over Time */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Calendar size={16} />
              <span>Daily Meal Bookings & RSVPs Over Time</span>
            </div>
            <span className="badge badge-neutral">Line Trend</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily_bookings_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="total_bookings" name="Total Bookings" stroke="#0369a1" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="confirmed_served" name="Confirmed / Served" stroke="#15803d" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="opted_out_cancelled" name="Opted Out / Cancelled" stroke="#b45309" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Meal Session Demand Comparison */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Utensils size={16} />
              <span>Demand Comparison by Meal Session</span>
            </div>
            <span className="badge badge-neutral">Bar Comparison</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={session_comparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="meal_session" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="total_demand" name="Total Meal Demand" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_attended" name="Attended / Served" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Predicted vs Actual Demand (Grouped Bar) & RSVP/Confirmation Rates (Line) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 3: Grouped Bar Chart: Predicted vs Actual */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <TrendingUp size={16} />
              <span>Predicted vs Actual Meal Attendance</span>
            </div>
            <span className="badge badge-success">Grouped Comparison</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={predicted_vs_actual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="predicted_demand" name="ML Predicted Demand" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual_attendance" name="Actual Attendance" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: RSVP Rate, Confirmation Rate, Cancellation Rate Over Time */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <CheckCircle2 size={16} />
              <span>Student Attendance & Cancellation Rates (%)</span>
            </div>
            <span className="badge badge-neutral">Rate Metrics</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rates_over_time}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis unit="%" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="rsvp_rate_pct" name="RSVP Rate %" stroke="#0ea5e9" strokeWidth={2} />
                <Line type="monotone" dataKey="confirmation_rate_pct" name="Confirmation Rate %" stroke="#16a34a" strokeWidth={2} />
                <Line type="monotone" dataKey="cancellation_rate_pct" name="Cancellation Rate %" stroke="#e11d48" strokeWidth={1.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 3: Day of Week Demand & Stacked Booking Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 5: Meal Bookings by Day of the Week */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Calendar size={16} />
              <span>Demand Distribution by Day of Week</span>
            </div>
            <span className="badge badge-neutral">Weekly Heat</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookings_by_dow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day_of_week" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="relative_index" name="Weekly Demand Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avg_waste_kg" name="Average Waste (kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Stacked Bar Chart: Confirmed, Cancelled, Unconfirmed */}
        <div className="panel" style={{ marginBottom: 0 }}>
          <div className="panel-header">
            <div className="panel-header-title">
              <Users size={16} />
              <span>Stacked Status: Confirmed vs Cancelled vs Unconfirmed</span>
            </div>
            <span className="badge badge-neutral">Stacked Distribution</span>
          </div>
          <div className="panel-body" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stacked_booking_status}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="Served" stackId="status" name="Served / Attended" fill="#15803d" />
                <Bar dataKey="Cancelled" stackId="status" name="Cancelled / Opted Out" fill="#ef4444" />
                <Bar dataKey="BookedPending" stackId="status" name="Booked (Pending)" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 4: Student Attendance vs Food Consumption (Line Chart) */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <TrendingUp size={16} />
            <span>Student Attendance vs Food Consumption (kg)</span>
          </div>
          <span className="badge badge-neutral">Portion Correlation</span>
        </div>
        <div className="panel-body" style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendance_vs_consumption}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} label={{ value: 'Boarders Attending', angle: -90, position: 'insideLeft', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} label={{ value: 'Food Consumed (kg)', angle: 90, position: 'insideRight', fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line yAxisId="left" type="monotone" dataKey="attendance_students" name="Boarders Attending" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} />
              <Line yAxisId="right" type="monotone" dataKey="food_consumption_kg" name="Food Consumed (kg)" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 5: Table: Highest and Lowest Demand Periods & Waste Levels */}
      <div className="panel" style={{ marginBottom: 0 }}>
        <div className="panel-header">
          <div className="panel-header-title">
            <Utensils size={16} />
            <span>Demand Extremes & Corresponding Waste Levels</span>
          </div>
          <span className="badge badge-neutral">Operational Audit</span>
        </div>
        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Date & Meal Session</th>
                <th>Turnout Classification</th>
                <th>Actual Attendance</th>
                <th>Predicted Demand</th>
                <th>Measured Kitchen Waste</th>
                <th>Attendance Delta</th>
              </tr>
            </thead>
            <tbody>
              {demand_periods_table.map((row, idx) => {
                const delta = (row.actual_attendance || 0) - (row.predicted_demand || 0);
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{row.date_display} &bull; {row.session}</td>
                    <td>
                      <span className={`badge ${row.turnout_category === 'Peak' ? 'badge-success' : 'badge-neutral'}`}>
                        {row.turnout_category} Demand
                      </span>
                    </td>
                    <td><strong>{row.actual_attendance} students</strong></td>
                    <td style={{ color: 'var(--text-secondary)' }}>{row.predicted_demand} portions</td>
                    <td style={{ fontWeight: 600, color: row.waste_recorded_kg > 5.0 ? '#b45309' : '#15803d' }}>
                      {row.waste_recorded_kg} kg
                    </td>
                    <td style={{ color: delta >= 0 ? '#15803d' : '#b45309', fontWeight: 600 }}>
                      {delta >= 0 ? `+${delta}` : delta} students
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default StudentMealAnalyticsTab;

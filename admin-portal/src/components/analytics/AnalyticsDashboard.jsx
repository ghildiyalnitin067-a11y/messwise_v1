import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Trash2, 
  Droplets, 
  HeartHandshake, 
  Cpu, 
  Leaf, 
  RefreshCw, 
  Filter, 
  Calendar, 
  Download, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { analyticsApi } from '../../api/client';
import ExecutiveOverviewTab from './ExecutiveOverviewTab';
import StudentMealAnalyticsTab from './StudentMealAnalyticsTab';
import FoodWasteAnalyticsTab from './FoodWasteAnalyticsTab';
import UcoAnalyticsTab from './UcoAnalyticsTab';
import NgoRedistributionAnalyticsTab from './NgoRedistributionAnalyticsTab';
import MlPerformanceAnalyticsTab from './MlPerformanceAnalyticsTab';
import CarbonEnergyAnalyticsTab from './CarbonEnergyAnalyticsTab';
import CoreIntelligenceDashboard from './CoreIntelligenceDashboard';
import { Zap as ZapIcon } from 'lucide-react';

const AnalyticsDashboard = () => {
  const [activeSubTab, setActiveSubTab] = useState('core-intelligence');
  
  // Global Filters
  const [dateRange, setDateRange] = useState('30d');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mealSession, setMealSession] = useState('all');
  const [showCustomDate, setShowCustomDate] = useState(false);

  // Data states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({});

  const fetchTabAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        date_range: showCustomDate ? 'all' : dateRange,
        start_date: showCustomDate ? startDate : undefined,
        end_date: showCustomDate ? endDate : undefined,
        meal_session: mealSession
      };

      if (activeSubTab === 'core-intelligence') {
        const [mlRes, carbonRes] = await Promise.all([
          analyticsApi.getMlPerformance(params),
          analyticsApi.getCarbonEnergy(params)
        ]);
        setAnalyticsData(prev => ({ ...prev, ml: mlRes, carbon: carbonRes }));
        return;
      }

      let result = null;
      if (activeSubTab === 'overview') {
        result = await analyticsApi.getOverview(params);
      } else if (activeSubTab === 'student-meals') {
        result = await analyticsApi.getStudentMeals(params);
      } else if (activeSubTab === 'food-waste') {
        result = await analyticsApi.getFoodWaste(params);
      } else if (activeSubTab === 'uco') {
        result = await analyticsApi.getUco(params);
      } else if (activeSubTab === 'ngo') {
        result = await analyticsApi.getNgo(params);
      } else if (activeSubTab === 'ml') {
        result = await analyticsApi.getMlPerformance(params);
      } else if (activeSubTab === 'carbon') {
        result = await analyticsApi.getCarbonEnergy(params);
      }

      setAnalyticsData(prev => ({ ...prev, [activeSubTab]: result }));
    } catch (err) {
      console.error('Failed to load tab analytics:', err);
      setError('Failed to fetch data from the analytics engine. Showing live local aggregation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTabAnalytics();
  }, [activeSubTab, dateRange, mealSession, startDate, endDate, showCustomDate]);

  const handleExportData = () => {
    const jsonStr = JSON.stringify(analyticsData[activeSubTab] || {}, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `messwise_analytics_${activeSubTab}_${dateRange}.json`;
    link.click();
  };

  const navTabs = [
    { id: 'core-intelligence', label: 'Core Intelligence (Accuracy, Energy & Latency)', icon: ZapIcon, badge: 'Main Focus' },
    { id: 'overview', label: 'Executive Overview', icon: BarChart3, badge: 'Live Intel' },
    { id: 'student-meals', label: 'Student & Meal Attendance', icon: Users, badge: 'RSVP' },
    { id: 'food-waste', label: 'Food Prep & Waste', icon: Trash2, badge: '<5% Target' },
    { id: 'uco', label: 'Used Cooking Oil', icon: Droplets, badge: 'RUCO' },
    { id: 'ngo', label: 'NGO Redistribution', icon: HeartHandshake, badge: '100% Rescue' },
    { id: 'ml', label: 'ML Performance Deep Dive', icon: Cpu, badge: 'XGBoost' },
    { id: 'carbon', label: 'Energy & Net Carbon', icon: Leaf, badge: 'CO₂ Net' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Top Header & Global Filter Controls Bar */}
      <div className="panel" style={{ marginBottom: 0, padding: '1rem 1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--brand-800)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.15 }}>
                  Admin Analytics & Sustainability Intelligence Dashboard
                </h2>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Campus-Wide Turnout Verification &bull; Culinary Waste Calibration &bull; Net Carbon Ledger
                </span>
              </div>
            </div>
          </div>

          {/* Controls: Date Range, Session Filter, Actions */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem' }}>
            {/* Quick Date Pills */}
            <div style={{
              display: 'flex',
              background: 'var(--bg-canvas-subtle)',
              padding: '0.2rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              {[
                { id: '7d', label: '7D' },
                { id: '30d', label: '30D' },
                { id: '90d', label: '90D' },
                { id: 'this_month', label: 'Month' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setDateRange(opt.id);
                    setShowCustomDate(false);
                  }}
                  className={`btn btn-sm ${!showCustomDate && dateRange === opt.id ? 'btn-primary' : 'btn-secondary'}`}
                  style={{
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    border: 'none',
                    boxShadow: 'none'
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustomDate(!showCustomDate)}
                className={`btn btn-sm ${showCustomDate ? 'btn-primary' : 'btn-secondary'}`}
                style={{
                  padding: '0.25rem 0.65rem',
                  fontSize: '0.75rem',
                  border: 'none',
                  boxShadow: 'none'
                }}
              >
                Custom
              </button>
            </div>

            {/* Meal Session Selector */}
            <select
              className="form-control"
              value={mealSession}
              onChange={(e) => setMealSession(e.target.value)}
              style={{
                width: 'auto',
                fontSize: '0.78rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)'
              }}
            >
              <option value="all">All Meal Sessions</option>
              <option value="breakfast">Breakfast Only</option>
              <option value="lunch">Lunch Only</option>
              <option value="snacks">Snacks Only</option>
              <option value="dinner">Dinner Only</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchTabAnalytics}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Refresh Data"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync</span>
            </button>

            {/* Export JSON / Report */}
            <button
              onClick={handleExportData}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              title="Export Analytics JSON"
            >
              <Download size={13} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Custom Date Pickers Row (if toggled) */}
        {showCustomDate && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            marginTop: '0.85rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.82rem'
          }}>
            <Calendar size={14} color="var(--brand-800)" />
            <span>Select Range:</span>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '140px', padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
            />
            <span>to</span>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '140px', padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
            />
          </div>
        )}
      </div>

      {/* Subsections Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {navTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.5rem 0.95rem',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 500,
                borderRadius: '8px',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <span
                className="badge"
                style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.35rem',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'var(--bg-canvas-subtle)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)'
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-tab Views Render */}
      <div>
        {activeSubTab === 'core-intelligence' && (
          <CoreIntelligenceDashboard
            mlData={analyticsData['ml']}
            carbonData={analyticsData['carbon']}
            loading={loading && (!analyticsData['ml'] || !analyticsData['carbon'])}
          />
        )}

        {activeSubTab === 'overview' && (
          <ExecutiveOverviewTab
            data={analyticsData['overview']}
            loading={loading && !analyticsData['overview']}
          />
        )}

        {activeSubTab === 'student-meals' && (
          <StudentMealAnalyticsTab
            data={analyticsData['student-meals']}
            loading={loading && !analyticsData['student-meals']}
          />
        )}

        {activeSubTab === 'food-waste' && (
          <FoodWasteAnalyticsTab
            data={analyticsData['food-waste']}
            loading={loading && !analyticsData['food-waste']}
          />
        )}

        {activeSubTab === 'uco' && (
          <UcoAnalyticsTab
            data={analyticsData['uco']}
            loading={loading && !analyticsData['uco']}
          />
        )}

        {activeSubTab === 'ngo' && (
          <NgoRedistributionAnalyticsTab
            data={analyticsData['ngo']}
            loading={loading && !analyticsData['ngo']}
          />
        )}

        {activeSubTab === 'ml' && (
          <MlPerformanceAnalyticsTab
            data={analyticsData['ml']}
            loading={loading && !analyticsData['ml']}
          />
        )}

        {activeSubTab === 'carbon' && (
          <CarbonEnergyAnalyticsTab
            data={analyticsData['carbon']}
            loading={loading && !analyticsData['carbon']}
          />
        )}
      </div>

    </div>
  );
};

export default AnalyticsDashboard;

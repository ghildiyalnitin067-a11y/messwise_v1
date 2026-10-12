import React, { useState, useEffect, useMemo } from 'react';
import {
  Droplets,
  Recycle,
  Leaf,
  ShieldAlert,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Filter,
  PlusCircle,
  Edit3,
  Truck,
  Factory,
  Info,
  Calendar,
  AlertTriangle,
  RefreshCw,
  X,
  FileCheck,
  Check,
  Scale
} from 'lucide-react';
import { ucoApi } from '../api/client';

const UcoManagement = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [oilTypeFilter, setOilTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [showMethodologyModal, setShowMethodologyModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [transitioningRecord, setTransitioningRecord] = useState(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState(null);
  const [actionErrorMsg, setActionErrorMsg] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    disposal_date: new Date().toISOString().slice(0, 10),
    quantity: 35,
    unit: 'litres',
    oil_type: 'Sunflower Oil',
    destination: 'BioDiesel India Refineries Ltd.',
    repurposing_method: 'Biodiesel Production',
    collection_status: 'Pending',
    reference_number: '',
    remarks: ''
  });

  // Transition form state
  const [transitionData, setTransitionData] = useState({
    target_status: 'Collected',
    destination: '',
    repurposing_method: 'Biodiesel Production',
    reference_number: '',
    quantity_to_transition: '',
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [recordsRes, summaryRes] = await Promise.all([
        ucoApi.getRecords({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          oil_type: oilTypeFilter !== 'all' ? oilTypeFilter : undefined,
          start_date: dateFilter.start || undefined,
          end_date: dateFilter.end || undefined
        }),
        ucoApi.getSummary({
          start_date: dateFilter.start || undefined,
          end_date: dateFilter.end || undefined
        })
      ]);
      setRecords(recordsRes || []);
      setSummary(summaryRes || null);
    } catch (err) {
      console.error('Failed to load UCO data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, oilTypeFilter, dateFilter]);

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      disposal_date: new Date().toISOString().slice(0, 10),
      quantity: 30,
      unit: 'litres',
      oil_type: 'Sunflower Oil',
      destination: 'BioDiesel India Refineries Ltd.',
      repurposing_method: 'Biodiesel Production',
      collection_status: 'Pending',
      reference_number: '',
      remarks: ''
    });
    setActionErrorMsg(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (rec) => {
    setEditingRecord(rec);
    setFormData({
      disposal_date: rec.disposal_date,
      quantity: rec.quantity,
      unit: rec.unit,
      oil_type: rec.oil_type || 'Sunflower Oil',
      destination: rec.destination || '',
      repurposing_method: rec.repurposing_method || 'Biodiesel Production',
      collection_status: rec.collection_status,
      reference_number: rec.reference_number || '',
      remarks: rec.remarks || ''
    });
    setActionErrorMsg(null);
    setShowAddModal(true);
  };

  const handleOpenTransition = (rec) => {
    setTransitioningRecord(rec);
    const nextStatus = rec.collection_status === 'Pending' ? 'Collected' : 'Processed';
    setTransitionData({
      target_status: nextStatus,
      destination: rec.destination || 'BioDiesel India Refineries Ltd.',
      repurposing_method: rec.repurposing_method || 'Biodiesel Production',
      reference_number: rec.reference_number || (nextStatus === 'Processed' ? `CERT-${Date.now().toString().slice(-6)}` : `COLL-${Date.now().toString().slice(-6)}`),
      quantity_to_transition: rec.quantity,
      remarks: ''
    });
    setActionErrorMsg(null);
    setShowTransitionModal(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();
    setActionErrorMsg(null);
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setActionErrorMsg('Quantity must be strictly greater than 0.');
      return;
    }

    try {
      if (editingRecord) {
        await ucoApi.updateRecord(editingRecord.id, formData);
        setActionSuccessMsg(`Batch #${editingRecord.id.slice(0, 8)} updated successfully.`);
      } else {
        await ucoApi.createRecord(formData);
        setActionSuccessMsg(`Disposal log for ${formData.quantity} ${formData.unit} recorded into kitchen database.`);
      }
      setShowAddModal(false);
      loadData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      setActionErrorMsg(err?.response?.data?.detail || 'Failed to persist used cooking oil record.');
    }
  };

  const handleSaveTransition = async (e) => {
    e.preventDefault();
    setActionErrorMsg(null);
    if (!transitioningRecord) return;

    const qty = Number(transitionData.quantity_to_transition);
    if (qty <= 0 || qty > transitioningRecord.quantity) {
      setActionErrorMsg(`Transition quantity must be between 0.1 and ${transitioningRecord.quantity} ${transitioningRecord.unit}.`);
      return;
    }

    try {
      await ucoApi.transitionStatus(transitioningRecord.id, {
        target_status: transitionData.target_status,
        destination: transitionData.destination,
        repurposing_method: transitionData.repurposing_method,
        reference_number: transitionData.reference_number,
        quantity_to_transition: qty < transitioningRecord.quantity ? qty : undefined,
        remarks: transitionData.remarks
      });

      setActionSuccessMsg(`Status advanced to ${transitionData.target_status} for ${qty} ${transitioningRecord.unit}.`);
      setShowTransitionModal(false);
      loadData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err) {
      setActionErrorMsg(err?.response?.data?.detail || 'Failed to transition record status.');
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cooking oil disposal record?')) return;
    try {
      await ucoApi.deleteRecord(id);
      setActionSuccessMsg('Used cooking oil entry deleted.');
      loadData();
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch (err) {
      alert('Failed to delete record.');
    }
  };

  // Instant calculation preview in modal
  const previewCarbon = useMemo(() => {
    const qty = Number(formData.quantity) || 0;
    if (qty <= 0) return { kg: 0, co2: 0, factor: 0 };
    const kg = formData.unit === 'litres' ? qty * 0.92 : qty;
    let factor = 0;
    if (formData.repurposing_method === 'Biodiesel Production') factor = 2.65;
    else if (formData.repurposing_method === 'Hydrotreated Vegetable Oil (HVO / SAF)') factor = 2.85;
    else if (formData.repurposing_method === 'Industrial Soap & Bio-lubricants') factor = 1.45;
    else if (formData.repurposing_method === 'Biogas & Biomass') factor = 1.80;

    return {
      kg: Number(kg.toFixed(2)),
      co2: Number((kg * factor).toFixed(2)),
      factor
    };
  }, [formData.quantity, formData.unit, formData.repurposing_method]);

  return (
    <div className="uco-management-hub">
      {/* Action Banners */}
      {actionSuccessMsg && (
        <div style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: 'var(--success-bg)',
          border: '1px solid var(--success-border)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--success-text)',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Check size={16} /> {actionSuccessMsg}
        </div>
      )}

      {/* Header & Controls */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div className="panel-header" style={{ padding: '1rem 1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Droplets size={17} />
              </div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Used Cooking Oil Management & Carbon Savings
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Track kitchen frying oil disposal, verify collection by authorized recyclers, and calculate auditable avoided carbon emissions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-secondary btn-sm" onClick={loadData} title="Refresh data">
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowMethodologyModal(true)}>
              <Scale size={14} /> Methodology & Standards
            </button>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAdd}>
              <PlusCircle size={14} /> + Record Oil Disposal
            </button>
          </div>
        </div>
      </div>

      {/* Safety Notice Callout */}
      <div className="panel" style={{
        marginBottom: '1.25rem',
        borderLeft: '4px solid #059669',
        backgroundColor: '#f0fdf4'
      }}>
        <div style={{ padding: '0.85rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <ShieldAlert size={20} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem', color: '#166534', lineHeight: 1.5 }}>
            <strong>Responsible Kitchen Protocols:</strong> Used cooking oil must be cooled below 40&deg;C before transferring into clean, sealed HDPE or stainless-steel containers. 
            <strong> Never pour oil into sinks or storm drains</strong> (prevents fatbergs and wastewater toxicity) and <strong>never reuse degraded oil for food consumption</strong>. 
            Emissions savings are credited exclusively when oil transfer to an authorized partner is supported by consignment records.
          </div>
        </div>
      </div>

      {/* 5 Primary Carbon & Oil KPI Cards */}
      <div className="kpi-strip" style={{ marginBottom: '1.25rem' }}>
        <div className="kpi-card">
          <div>
            <div className="kpi-label">Total Oil Generated</div>
            <div className="kpi-value">{summary?.total_oil_generated_litres || 0} L</div>
            <div className="kpi-meta">{summary?.total_oil_generated_kg || 0} kg (Density 0.92)</div>
          </div>
          <div className="kpi-icon brand">
            <Droplets size={18} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Quantity Collected</div>
            <div className="kpi-value">{summary?.total_oil_collected_litres || 0} L</div>
            <div className="kpi-meta">{summary?.total_oil_collected_kg || 0} kg in transit/staging</div>
          </div>
          <div className="kpi-icon brand">
            <Truck size={18} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Confirmed Processed</div>
            <div className="kpi-value">{summary?.total_oil_processed_litres || 0} L</div>
            <div className="kpi-meta">{summary?.total_oil_processed_kg || 0} kg converted</div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#ecfdf5', color: '#059669' }}>
            <Factory size={18} />
          </div>
        </div>

        <div className="kpi-card">
          <div>
            <div className="kpi-label">Awaiting Collection</div>
            <div className="kpi-value">{summary?.pending_collection_litres || 0} L</div>
            <div className="kpi-meta">{summary?.status_distribution?.pending_count || 0} pending batches in mess</div>
          </div>
          <div className="kpi-icon warm">
            <Clock size={18} />
          </div>
        </div>

        <div className="kpi-card" style={{ border: '1px solid #bbf7d0', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
          <div>
            <div className="kpi-label" style={{ color: '#166534', fontWeight: 600 }}>Estimated Net CO₂e Avoided</div>
            <div className="kpi-value" style={{ color: '#15803d' }}>
              {summary?.estimated_net_co2e_avoided_kg || 0} kg
            </div>
            <div className="kpi-meta">
              <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                {summary?.verified_co2e_avoided_kg || 0} kg Verified
              </span>
            </div>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
            <Leaf size={18} />
          </div>
        </div>
      </div>

      {/* Sustainability Trends & Distribution Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Monthly Recycling Trends */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <Recycle size={16} />
              <span>Monthly Recycling & Carbon Trajectory</span>
            </div>
          </div>
          <div className="panel-body">
            {summary?.monthly_trends && summary.monthly_trends.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {summary.monthly_trends.map((m) => {
                  const pct = m.generated_litres > 0 ? Math.min(100, Math.round((m.processed_litres / m.generated_litres) * 100)) : 0;
                  return (
                    <div key={m.month} style={{ fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{m.month}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          <strong>{m.processed_litres}L</strong> processed / {m.generated_litres}L generated &bull; <strong style={{ color: '#166534' }}>{m.co2_avoided_kg} kg CO₂e</strong>
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-canvas-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: pct === 100 ? '#10b981' : '#3b82f6',
                          borderRadius: '4px',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                No historical trend data logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Recycling Pathway Factors & Status Distribution */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <Factory size={16} />
              <span>Verified Repurposing Pathways (LCA Net Factors)</span>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div style={{ padding: '0.65rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Biodiesel (UCOME)</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>2.65 kg CO₂e / kg</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Displaces fossil diesel (-85% GHG)</div>
              </div>

              <div style={{ padding: '0.65rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>HVO / SAF Jet Fuel</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>2.85 kg CO₂e / kg</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Aviation biofuel displacement</div>
              </div>

              <div style={{ padding: '0.65rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Industrial Soap & Lubricant</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>1.45 kg CO₂e / kg</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Replaces virgin palm stearin</div>
              </div>

              <div style={{ padding: '0.65rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface-hover)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Biogas Co-Digestion</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#166534' }}>1.80 kg CO₂e / kg</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Grid natural gas offset</div>
              </div>
            </div>

            <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Info size={13} />
              <span>Volume converted via ASTM D4052 density: <strong>1 Litre = 0.92 kg</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="panel" style={{ marginBottom: '1.25rem' }}>
        <div style={{
          padding: '0.75rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <Filter size={14} /> Filter Status:
            </div>
            {['all', 'Pending', 'Collected', 'Processed'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.25rem 0.65rem', fontSize: '0.78rem' }}
                onClick={() => setStatusFilter(st)}
              >
                {st === 'all' ? 'All Records' : st}
              </button>
            ))}

            <select
              className="form-control"
              style={{ width: 'auto', padding: '0.25rem 0.65rem', fontSize: '0.78rem', height: '30px' }}
              value={oilTypeFilter}
              onChange={(e) => setOilTypeFilter(e.target.value)}
            >
              <option value="all">All Oil Types</option>
              <option value="Sunflower">Sunflower Oil</option>
              <option value="Mustard">Mustard Oil</option>
              <option value="Palm">Palm Oil</option>
              <option value="Mixed">Mixed Cooking Oil</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Date:</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '130px', padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: '28px' }}
              value={dateFilter.start}
              onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
            />
            <span>to</span>
            <input
              type="date"
              className="form-control"
              style={{ width: '130px', padding: '0.2rem 0.4rem', fontSize: '0.75rem', height: '28px' }}
              value={dateFilter.end}
              onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
            />
            {(dateFilter.start || dateFilter.end || statusFilter !== 'all' || oilTypeFilter !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => {
                  setStatusFilter('all');
                  setOilTypeFilter('all');
                  setDateFilter({ start: '', end: '' });
                }}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-header-title">
            <Droplets size={16} />
            <span>Kitchen Cooking Oil Disposal Logs</span>
          </div>
          <span className="badge badge-neutral">
            {records.length} Recorded Batches
          </span>
        </div>

        <div className="table-container">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Disposal Date</th>
                <th>Batch / Oil Type</th>
                <th>Quantity</th>
                <th>Collection Status</th>
                <th>Partner & Pathway</th>
                <th>Net CO₂e Avoided</th>
                <th>Verification</th>
                <th>Receipt / Ref #</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No oil disposal records found matching current filters.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isProcessed = r.collection_status === 'Processed';
                  const isCollected = r.collection_status === 'Collected';
                  const isPending = r.collection_status === 'Pending';

                  return (
                    <tr key={r.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>{r.disposal_date}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>By: {r.recorded_by}</div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 600 }}>{r.oil_type || 'Mixed Frying Oil'}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          ID: {r.id.slice(0, 8)}
                        </div>
                      </td>

                      <td>
                        <div style={{ fontWeight: 700 }}>
                          {r.quantity} {r.unit}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          ({r.quantity_kg || (r.unit === 'litres' ? (r.quantity * 0.92).toFixed(1) : r.quantity)} kg)
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${
                          isProcessed ? 'badge-success' : isCollected ? 'badge-info' : 'badge-warning'
                        }`}>
                          {r.collection_status}
                        </span>
                      </td>

                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          {r.destination || <span style={{ color: 'var(--text-muted)' }}>Not assigned</span>}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {r.repurposing_method || 'Awaiting pathway'}
                        </div>
                      </td>

                      <td>
                        {isProcessed ? (
                          r.co2_avoided_kg ? (
                            <div>
                              <strong style={{ color: '#15803d' }}>+{r.co2_avoided_kg} kg</strong>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                ({r.emission_factor_used} kg CO₂e/kg)
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.72rem', color: '#b45309' }}>
                              Pending factor
                            </span>
                          )
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            0.0 kg ({r.collection_status})
                          </span>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${
                          r.measurement_status === 'Verified' ? 'badge-success' : 'badge-neutral'
                        }`} style={{ fontSize: '0.7rem' }}>
                          {r.measurement_status || 'Estimated'}
                        </span>
                      </td>

                      <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
                        {r.reference_number || <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>}
                      </td>

                      <td className="text-right">
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                          {!isProcessed && (
                            <button
                              className="btn btn-warm btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
                              onClick={() => handleOpenTransition(r)}
                              title={isPending ? 'Confirm Collection' : 'Confirm Processing'}
                            >
                              {isPending ? 'Collect' : 'Process'}
                            </button>
                          )}
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.45rem' }}
                            onClick={() => handleOpenEdit(r)}
                            title="Edit Record"
                          >
                            <Edit3 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Record / Edit Disposal Form */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '540px' }}>
            <div className="modal-header">
              <h3>{editingRecord ? 'Edit Cooking Oil Disposal Log' : 'Record Used Cooking Oil Disposal'}</h3>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {actionErrorMsg && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}>
                  {actionErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveRecord}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Disposal Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={formData.disposal_date}
                      onChange={(e) => setFormData({ ...formData, disposal_date: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Oil Type</label>
                    <select
                      className="form-control"
                      value={formData.oil_type}
                      onChange={(e) => setFormData({ ...formData, oil_type: e.target.value })}
                    >
                      <option value="Sunflower Oil">Sunflower Oil</option>
                      <option value="Mustard Oil">Mustard Oil</option>
                      <option value="Palm Oil">Palm Oil</option>
                      <option value="Soybean Oil">Soybean Oil</option>
                      <option value="Groundnut Oil">Groundnut Oil</option>
                      <option value="Mixed Cooking Oil">Mixed Cooking Oil</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity Disposed *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      className="form-control"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Unit *</label>
                    <select
                      className="form-control"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    >
                      <option value="litres">Litres (L)</option>
                      <option value="kg">Kilograms (kg)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Destination / Recycling Partner</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. BioDiesel India Refineries"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Intended Repurposing Method</label>
                    <select
                      className="form-control"
                      value={formData.repurposing_method}
                      onChange={(e) => setFormData({ ...formData, repurposing_method: e.target.value })}
                    >
                      <option value="Biodiesel Production">Biodiesel Production (2.65 kg CO₂e/kg)</option>
                      <option value="Hydrotreated Vegetable Oil (HVO / SAF)">HVO / SAF (2.85 kg CO₂e/kg)</option>
                      <option value="Industrial Soap & Bio-lubricants">Industrial Soap (1.45 kg CO₂e/kg)</option>
                      <option value="Biogas & Biomass">Biogas Co-Digestion (1.80 kg CO₂e/kg)</option>
                      <option value="Other / Unverified">Other / Unverified (Pending Factor)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Collection Status</label>
                    <select
                      className="form-control"
                      value={formData.collection_status}
                      onChange={(e) => setFormData({ ...formData, collection_status: e.target.value })}
                    >
                      <option value="Pending">Pending (In Mess Storage)</option>
                      <option value="Collected">Collected (Transferred to Partner)</option>
                      <option value="Processed">Processed (Confirmed Recycled)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Receipt / Consignment Ref #</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. REC-2025-081"
                      value={formData.reference_number}
                      onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Storage Remarks / Notes</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="Storage drum #, temperature when poured, odor, contaminants check..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>

                {/* Live Carbon Calculation Preview Box */}
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: formData.collection_status === 'Processed' ? '#ecfdf5' : '#f8fafc',
                  border: `1px solid ${formData.collection_status === 'Processed' ? '#a7f3d0' : '#e2e8f0'}`,
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.82rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>Mass Equivalent:</strong> {previewCarbon.kg} kg
                    </div>
                    <div>
                      <strong>Factor:</strong> {previewCarbon.factor ? `${previewCarbon.factor} kg CO₂e/kg` : 'Pending'}
                    </div>
                  </div>
                  <div style={{ marginTop: '0.35rem', color: formData.collection_status === 'Processed' ? '#15803d' : 'var(--text-muted)' }}>
                    {formData.collection_status === 'Processed' ? (
                      <span><strong>Eligible Net Avoidance:</strong> +{previewCarbon.co2} kg CO₂e (Confirmed Processed)</span>
                    ) : (
                      <span>Carbon savings credited once status is confirmed <strong>Processed</strong>.</span>
                    )}
                  </div>
                </div>

                <div className="modal-footer" style={{ padding: 0 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Check size={14} /> {editingRecord ? 'Save Changes' : 'Record Oil Batch'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Status Transition & Partial Processing */}
      {showTransitionModal && transitioningRecord && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Advance Recycling Workflow</h3>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowTransitionModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {actionErrorMsg && (
                <div style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--danger-bg)',
                  border: '1px solid var(--danger-border)',
                  color: 'var(--danger-text)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem'
                }}>
                  {actionErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveTransition}>
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'var(--bg-canvas-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.82rem',
                  marginBottom: '1rem'
                }}>
                  <div>Batch: <strong>{transitioningRecord.oil_type}</strong> (ID: {transitioningRecord.id.slice(0, 8)})</div>
                  <div>Current Status: <span className="badge badge-warning">{transitioningRecord.collection_status}</span> &rarr; Target: <span className="badge badge-success">{transitionData.target_status}</span></div>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Status</label>
                  <select
                    className="form-control"
                    value={transitionData.target_status}
                    onChange={(e) => setTransitionData({ ...transitionData, target_status: e.target.value })}
                  >
                    <option value="Collected">Collected (Transferred to Partner Truck)</option>
                    <option value="Processed">Processed (Recycled into Final Product)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Quantity to Transition ({transitioningRecord.unit})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={transitioningRecord.quantity}
                    className="form-control"
                    value={transitionData.quantity_to_transition}
                    onChange={(e) => setTransitionData({ ...transitionData, quantity_to_transition: e.target.value })}
                    required
                  />
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Partial transition supported: entering less than {transitioningRecord.quantity} splits the batch so remainder retains uncollected/unprocessed status without double counting.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Destination / Partner</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Recycling Partner Name"
                    value={transitionData.destination}
                    onChange={(e) => setTransitionData({ ...transitionData, destination: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Repurposing Pathway</label>
                  <select
                    className="form-control"
                    value={transitionData.repurposing_method}
                    onChange={(e) => setTransitionData({ ...transitionData, repurposing_method: e.target.value })}
                  >
                    <option value="Biodiesel Production">Biodiesel Production (2.65 kg CO₂e/kg)</option>
                    <option value="Hydrotreated Vegetable Oil (HVO / SAF)">HVO / SAF (2.85 kg CO₂e/kg)</option>
                    <option value="Industrial Soap & Bio-lubricants">Industrial Soap (1.45 kg CO₂e/kg)</option>
                    <option value="Biogas & Biomass">Biogas Co-Digestion (1.80 kg CO₂e/kg)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Consignment Receipt / Ref #</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. TRUCK-REC-902"
                    value={transitionData.reference_number}
                    onChange={(e) => setTransitionData({ ...transitionData, reference_number: e.target.value })}
                  />
                </div>

                <div className="modal-footer" style={{ padding: 0, marginTop: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTransitionModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <CheckCircle2 size={14} /> Confirm Status Advancement
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Transparent Methodology & Scientific Documentation */}
      {showMethodologyModal && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Scale size={18} color="#059669" />
                <h3>Carbon Accounting Methodology & Verification Standards</h3>
              </div>
              <button
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                onClick={() => setShowMethodologyModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
              <div style={{ padding: '0.75rem', backgroundColor: '#f0fdf4', borderRadius: 'var(--radius-sm)', border: '1px solid #bbf7d0', marginBottom: '1rem' }}>
                <strong style={{ color: '#166534' }}>Governing Equation:</strong>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#15803d', marginTop: '0.2rem' }}>
                  Estimated CO₂e Avoided (kg) = Eligible Processed Quantity (kg) &times; Net Pathway Emission Factor
                </div>
              </div>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>1. Physical Density Conversion</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                In compliance with <strong>ASTM D4052</strong> and the <strong>FSSAI RUCO</strong> national standard, used vegetable cooking oil at ambient temperature (20&ndash;25&deg;C) possesses a documented density of <strong>0.92 kg per litre</strong>. Mass (kg) is computed directly: <code>kg = litres &times; 0.92</code>.
              </p>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>2. Net Emissions Factor Accounting</h4>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                Avoidance factors do not assume zero-emission recycling. They account for <em>displaced fossil fuel lifecycle emissions</em> minus <em>collection, transport, and refinery transesterification emissions</em>:
              </p>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                <li><strong>Biodiesel (UCOME):</strong> 2.65 kg CO₂e / kg UCO (EU RED II 2018/2001/EC Annex V, 85&ndash;88% GHG savings vs fossil diesel).</li>
                <li><strong>HVO / Sustainable Aviation Fuel:</strong> 2.85 kg CO₂e / kg UCO (ICAO CORSIA default LCA).</li>
                <li><strong>Industrial Soap / Greases:</strong> 1.45 kg CO₂e / kg UCO (Displaces virgin palm fatty acids & petroleum mineral oil).</li>
                <li><strong>Biogas Co-Digestion:</strong> 1.80 kg CO₂e / kg UCO (IPCC Waste-to-Energy biogas offset).</li>
              </ul>

              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>3. Verification Integrity Rules</h4>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                <li>Pending and Collected oil yields <strong>0.0 kg CO₂e credit</strong> until processing is confirmed.</li>
                <li>Records with certified partner consignment numbers are stamped <strong>Verified</strong>; internal batches remain <strong>Estimated</strong>.</li>
                <li>Unrecognized pathways display &ldquo;Carbon savings pending verified emission factor&rdquo; instead of fabricated numbers.</li>
              </ul>

              <div className="modal-footer" style={{ padding: '0.75rem 0 0 0', marginTop: '1rem' }}>
                <button className="btn btn-primary" onClick={() => setShowMethodologyModal(false)}>
                  Close Audit Standards
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UcoManagement;

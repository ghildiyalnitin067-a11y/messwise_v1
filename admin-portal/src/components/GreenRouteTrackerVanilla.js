/**
 * Messwise GreenRoute Rider Details & Live Tracking - Reusable Vanilla Component
 * Zero-dependency standalone Vanilla JS module.
 * Can be mounted into any HTML DOM element.
 */

export const INITIAL_GREENROUTE_DISPATCHES = [
  {
    id: 'GR-DISP-896',
    surplusId: 'surplus-chapati',
    batchTitle: 'Fresh Chapati',
    portions: 50,
    foodType: 'Fresh Prepared Lunch Surplus',
    hostel: 'Hostel A (Aryabhatta)',
    pickupLocation: 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
    targetNgo: 'Robin Hood Army & Jan Seva Shelter',
    distanceKm: 1.2,
    platform: 'Blinkit',
    platformTag: 'Blinkit Instant Dispatch',
    platformBrandColor: '#F8CB46',
    platformTextColor: '#0F172A',
    rider: {
      id: 'RDR-502',
      name: 'Pranav',
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
    status: 'arriving', // 'searching' | 'assigned' | 'arriving' | 'handed_over'
    etaMinutes: 3,
    timeline: [
      { step: 'searching', title: 'Searching Partner', desc: 'Broadcast active for fresh chapati batch', time: '1:10 PM' },
      { step: 'assigned', title: 'Rider Assigned', desc: 'Pranav accepted dispatch order', time: '1:12 PM' },
      { step: 'arriving', title: 'Arriving at Mess', desc: '0.6 km away • Approaching Gate 4 Ramp', time: '1:15 PM' },
      { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'OTP handover verification complete', time: 'Est. 1:20 PM' }
    ],
    temperatureLogged: '68°C (Insulated Casseroles)',
    pickupDeadline: '2:30 PM'
  },
  {
    id: 'GR-DISP-892',
    surplusId: 'surplus-1',
    batchTitle: 'Rajma Rice & Steamed Roti',
    portions: 25,
    foodType: 'Fresh Cooked Lunch',
    hostel: 'Hostel A (Aryabhatta)',
    pickupLocation: 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
    targetNgo: 'Robin Hood Army & Jan Seva Shelter',
    distanceKm: 2.3,
    platform: 'Blinkit',
    platformTag: 'Blinkit Instant Dispatch',
    platformBrandColor: '#F8CB46',
    platformTextColor: '#0F172A',
    rider: {
      id: 'RDR-781',
      name: 'Rahul Kumar',
      phone: '+91 98765 43210',
      rating: 4.92,
      totalDeliveries: 1240,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      vehicleType: 'Electric Scooter (Ather 450X)',
      vehicleCategory: 'EV Two-Wheeler',
      licensePlate: 'DL 3S AB 1234',
      batteryPercent: 88,
    },
    otp: '7412',
    otpVerified: false,
    status: 'arriving', // 'searching' | 'assigned' | 'arriving' | 'handed_over'
    etaMinutes: 4,
    timeline: [
      { step: 'searching', title: 'Searching Partner', desc: 'AI broadcast sent to campus fleet radius', time: '12:42 PM' },
      { step: 'assigned', title: 'Rider Assigned', desc: 'Rahul Kumar accepted dispatch order', time: '12:45 PM' },
      { step: 'arriving', title: 'Arriving at Mess', desc: '0.8 km away • Approaching Gate 4 Ramp', time: '12:49 PM' },
      { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'OTP handover verification complete', time: 'Est. 12:54 PM' }
    ],
    temperatureLogged: '66°C (Thermal Warmer)',
    pickupDeadline: '1:15 PM'
  },
  {
    id: 'GR-DISP-893',
    surplusId: 'surplus-2',
    batchTitle: 'Roti + Dal Makhani & Jeera Rice',
    portions: 40,
    foodType: 'Fresh Cooked Dinner Surplus',
    hostel: 'Hostel B (Charaka)',
    pickupLocation: 'Hostel B Kitchen Bay 1',
    targetNgo: 'Asha Deep Children Home',
    distanceKm: 3.4,
    platform: 'Zepto',
    platformTag: 'Zepto Food Rescue',
    platformBrandColor: '#8023EB',
    platformTextColor: '#FFFFFF',
    rider: {
      id: 'RDR-654',
      name: 'Amit Vikram Sharma',
      phone: '+91 91234 56789',
      rating: 4.88,
      totalDeliveries: 980,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      vehicleType: 'EV Cargo Bike (Hero Electric)',
      vehicleCategory: 'EV Cargo Two-Wheeler',
      licensePlate: 'DL 4C XY 9021',
      batteryPercent: 94,
    },
    otp: '3829',
    otpVerified: false,
    status: 'assigned',
    etaMinutes: 9,
    timeline: [
      { step: 'searching', title: 'Searching Partner', desc: 'Demand matched with Zepto dark-store hub', time: '1:02 PM' },
      { step: 'assigned', title: 'Rider Assigned', desc: 'Amit Sharma confirmed for pickup', time: '1:05 PM' },
      { step: 'arriving', title: 'Arriving at Mess', desc: 'Departing dark store • ETA 9 mins', time: 'Est. 1:14 PM' },
      { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'Pending OTP handover verification', time: 'Est. 1:25 PM' }
    ],
    temperatureLogged: '68°C (Insulated Casseroles)',
    pickupDeadline: '1:45 PM'
  },
  {
    id: 'GR-DISP-894',
    surplusId: 'surplus-3',
    batchTitle: 'Vegetable Pulao & Curd Packets',
    portions: 18,
    foodType: 'Fresh Prepared Lunch',
    hostel: 'Hostel A (Aryabhatta)',
    pickupLocation: 'Hostel A Service Ramp Gate',
    targetNgo: 'Sneha Sadan Care Home',
    distanceKm: 1.8,
    platform: 'Instamart',
    platformTag: 'Swiggy Instamart Rescue',
    platformBrandColor: '#FC8019',
    platformTextColor: '#FFFFFF',
    rider: {
      id: 'RDR-912',
      name: 'Priya N. Sundaram',
      phone: '+91 97654 32190',
      rating: 4.96,
      totalDeliveries: 1530,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      vehicleType: 'Electric Scooter (Ola S1 Pro)',
      vehicleCategory: 'EV Two-Wheeler',
      licensePlate: 'DL 1T EF 4567',
      batteryPercent: 76,
    },
    otp: '5192',
    otpVerified: true,
    status: 'handed_over',
    etaMinutes: 0,
    timeline: [
      { step: 'searching', title: 'Searching Partner', desc: 'Swiggy Instamart fleet pinged', time: '11:30 AM' },
      { step: 'assigned', title: 'Rider Assigned', desc: 'Priya Sundaram allocated', time: '11:34 AM' },
      { step: 'arriving', title: 'Arriving at Mess', desc: 'Reached Hostel A Ramp', time: '11:42 AM' },
      { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'OTP 5192 verified by Supervisor Rajesh', time: '11:45 AM' }
    ],
    temperatureLogged: '64°C (Safe Storage)',
    pickupDeadline: '12:00 PM'
  }
];

export const STAGES = [
  { key: 'searching', label: 'Searching Partner', stepNum: 1 },
  { key: 'assigned', label: 'Rider Assigned', stepNum: 2 },
  { key: 'arriving', label: 'Arriving at Mess', stepNum: 3 },
  { key: 'handed_over', label: 'Food Handed Over / En Route to NGO', stepNum: 4 },
];

export class GreenRouteTrackerVanilla {
  constructor(options = {}) {
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;
    
    if (!this.container) {
      throw new Error('[GreenRouteTrackerVanilla] Target container element not found.');
    }

    const convertReqToDispatch = (req) => {
      if (!req) return null;
      const plateMatch = (req.vehicle || '').match(/\(([^)]+)\)/);
      const licensePlate = plateMatch ? plateMatch[1] : 'DL 3S PR 9021';
      const riderName = req.volunteer_name || 'Assigned Rider';
      const dispId = req.id?.startsWith('GR-DISP-')
        ? req.id
        : `GR-DISP-${(req.id || 'REQ').slice(-6).toUpperCase()}`;

      return {
        id: dispId,
        surplusId: req.surplus_id || req.id,
        batchTitle: req.food_title || 'Fresh Cooked Surplus',
        portions: req.meals || 25,
        foodType: 'Fresh Cooked Surplus',
        hostel: req.hostel || 'Hostel A (Aryabhatta)',
        pickupLocation: 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
        targetNgo: 'Robin Hood Army & Jan Seva Shelter',
        distanceKm: 1.2,
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
          vehicleType: req.vehicle || 'Electric Scooter (DL 3S PR 9021)',
          licensePlate: licensePlate,
          batteryPercent: 92,
        },
        otp: req.otp || '7412',
        otpVerified: req.status === 'Collected',
        status: req.status === 'Collected' ? 'handed_over' : 'arriving',
        etaMinutes: req.status === 'Collected' ? 0 : 3,
        timeline: [
          { step: 'searching', title: 'Searching Partner', desc: 'Broadcast matched with Robin Hood Army & Jan Seva Shelter', time: 'Just now' },
          { step: 'assigned', title: 'Rider Assigned', desc: `${riderName} confirmed dispatch order`, time: 'Just now' },
          { step: 'arriving', title: 'Arriving at Mess', desc: `Approaching Mess Dispatch Bay 2 (${req.pickup_time_estimated || 'Within 15 mins'})`, time: 'In transit' },
          { step: 'handed_over', title: 'Food Handed Over / En Route', desc: req.status === 'Collected' ? 'Handover completed' : 'Pending OTP handover verification', time: req.status === 'Collected' ? 'Verified' : 'Est. in 10 mins' },
        ],
        temperatureLogged: '68°C (Insulated Casseroles)',
        pickupDeadline: '5:00 PM',
      };
    };

    let initialList = options.initialDispatches;
    if (!initialList) {
      try {
        const local = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
        const localReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
        const converted = localReqs.filter(r => r && r.volunteer_name).map(convertReqToDispatch);
        const map = new Map();
        [...converted, ...local].forEach(d => { if (d && d.id) map.set(d.id, d); });
        INITIAL_GREENROUTE_DISPATCHES.forEach(d => { if (!map.has(d.id)) map.set(d.id, d); });
        initialList = Array.from(map.values());
      } catch (e) {}
    }

    this.dispatches = initialList || JSON.parse(JSON.stringify(INITIAL_GREENROUTE_DISPATCHES));
    this.selectedId = options.selectedId || (this.dispatches.length ? this.dispatches[0].id : INITIAL_GREENROUTE_DISPATCHES[0].id);
    this.showOtp = options.showOtp !== undefined ? options.showOtp : true;
    this.onHandoverSuccess = options.onHandoverSuccess || null;
    this.copiedOtp = false;
    this.copiedPlate = false;
    this.verifyError = '';
    this.verifySuccess = false;
    this.checklist = {
      identityVerified: true,
      plateMatches: true,
      thermalInsulated: true,
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('messwise-dispatch-updated', (e) => {
        if (e?.detail) {
          this.dispatches = [e.detail, ...this.dispatches.filter(d => d.id !== e.detail.id)];
          this.selectedId = e.detail.id;
          this.render();
        }
      });
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const bc = new BroadcastChannel('messwise-surplus-channel');
          bc.onmessage = (event) => {
            if (event.data?.dispatch) {
              this.dispatches = [event.data.dispatch, ...this.dispatches.filter(d => d.id !== event.data.dispatch.id)];
              this.selectedId = event.data.dispatch.id;
              this.render();
            }
          };
        }
      } catch {}
    }

    this.render();
  }

  getCurrentDispatch() {
    return this.dispatches.find((d) => d.id === this.selectedId) || this.dispatches[0];
  }

  getCurrentStageIndex() {
    const disp = this.getCurrentDispatch();
    return STAGES.findIndex((s) => s.key === disp.status);
  }

  selectDispatch(id) {
    this.selectedId = id;
    this.verifyError = '';
    this.verifySuccess = false;
    this.render();
  }

  advanceStage() {
    const current = this.getCurrentDispatch();
    const currIdx = this.getCurrentStageIndex();
    const nextIdx = (currIdx + 1) % STAGES.length;
    const nextStage = STAGES[nextIdx].key;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.dispatches = this.dispatches.map((d) => {
      if (d.id !== current.id) return d;
      return {
        ...d,
        status: nextStage,
        otpVerified: nextStage === 'handed_over' ? true : d.otpVerified,
        etaMinutes: nextStage === 'handed_over' ? 0 : nextStage === 'arriving' ? 3 : nextStage === 'assigned' ? 8 : 12,
        timeline: d.timeline.map((t, idx) => idx === nextIdx ? { ...t, time: nowTime } : t)
      };
    });

    this.render();
  }

  resetStage() {
    const current = this.getCurrentDispatch();
    this.dispatches = this.dispatches.map((d) => {
      if (d.id !== current.id) return d;
      return {
        ...d,
        status: 'searching',
        otpVerified: false,
        etaMinutes: 12,
        timeline: d.timeline.map((t, idx) => idx === 0 ? { ...t, time: 'Just now' } : t)
      };
    });
    this.verifySuccess = false;
    this.verifyError = '';
    this.render();
  }

  copyOtp() {
    const current = this.getCurrentDispatch();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(current.otp);
    }
    this.copiedOtp = true;
    this.render();
    setTimeout(() => {
      this.copiedOtp = false;
      this.render();
    }, 2000);
  }

  copyPlate() {
    const current = this.getCurrentDispatch();
    if (current.rider?.licensePlate && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(current.rider.licensePlate);
    }
    this.copiedPlate = true;
    this.render();
    setTimeout(() => {
      this.copiedPlate = false;
      this.render();
    }, 2000);
  }

  verifyOtp(enteredCode) {
    const current = this.getCurrentDispatch();
    if (enteredCode.trim() !== current.otp) {
      this.verifyError = `Incorrect OTP. Please enter "${current.otp}"`;
      this.render();
      return;
    }

    this.verifyError = '';
    this.verifySuccess = true;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.dispatches = this.dispatches.map((d) => {
      if (d.id !== current.id) return d;
      return {
        ...d,
        status: 'handed_over',
        otpVerified: true,
        etaMinutes: 0,
        timeline: d.timeline.map((t, idx) => 
          idx === 3 ? { ...t, desc: `OTP ${d.otp} verified • Food handed over`, time: nowTime } : t
        )
      };
    });

    if (typeof this.onHandoverSuccess === 'function') {
      this.onHandoverSuccess(this.getCurrentDispatch());
    }

    this.render();
  }

  render() {
    const current = this.getCurrentDispatch();
    const stageIdx = this.getCurrentStageIndex();
    const isSearching = current.status === 'searching';

    let platformBadgeClass = 'platform-badge-blinkit';
    let platformBadgeText = '⚡ Blinkit GreenRoute';
    if (current.platform === 'Zepto') {
      platformBadgeClass = 'platform-badge-zepto';
      platformBadgeText = '🟣 Zepto Express Rescue';
    } else if (current.platform === 'Instamart') {
      platformBadgeClass = 'platform-badge-instamart';
      platformBadgeText = '🟠 Instamart Quick Rescue';
    }

    this.container.innerHTML = `
      <div class="greenroute-container w-full flex flex-col gap-5 mb-7">
        <div class="greenroute-card bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <!-- Header -->
          <div class="greenroute-header px-6 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-b from-slate-50 to-white">
            <div class="greenroute-title-group flex items-center gap-3.5">
              <div class="greenroute-icon-badge w-11 h-11 rounded-lg bg-[#123b2a] text-white flex items-center justify-center shadow-md">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2.5 flex-wrap">
                  <h3 class="text-base font-bold text-slate-900 m-0">GreenRoute Rider Details & Live Tracking</h3>
                  <span class="greenroute-live-indicator inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase">
                    <span class="live-beacon-dot w-2 h-2 rounded-full bg-emerald-500"></span>
                    Live GPS Fleet Active
                  </span>
                </div>
                <p class="text-xs text-slate-500 mt-1 mb-0 font-medium">Quick-commerce delivery partner live telemetry for verified surplus food handover</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <button id="gr-btn-advance" type="button" class="btn btn-secondary btn-sm text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer">
                Simulate Next Status
              </button>
              <button id="gr-btn-reset" type="button" class="btn btn-secondary btn-sm text-xs font-semibold px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 cursor-pointer">
                Reset
              </button>
            </div>
          </div>

          <!-- Dispatches Selector -->
          <div class="gr-batch-selector flex gap-2.5 overflow-x-auto px-6 py-3 border-b border-slate-200 bg-slate-50">
            <div class="flex items-center text-slate-400 text-xs font-bold uppercase pr-1">Active Dispatches:</div>
            ${this.dispatches.map((disp) => `
              <button data-id="${disp.id}" class="gr-batch-tab gr-batch-chip flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer ${disp.id === this.selectedId ? 'active bg-emerald-50 border-emerald-700 text-emerald-900' : 'bg-white border-slate-200 text-slate-600'}">
                <span class="w-2 h-2 rounded-full" style="background-color: ${disp.status === 'handed_over' ? '#10b981' : disp.status === 'arriving' ? '#f59e0b' : '#3b82f6'};"></span>
                <strong>[${disp.platform}]</strong>
                <span class="font-semibold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded text-[11px]">🛵 ${disp.rider?.name || 'Rider'}</span>
                <span>${disp.id}</span>
                <span>•</span>
                <span>${(disp.batchTitle || disp.batch_title || 'Batch').split(' ')[0]} (${disp.portions} meals)</span>
              </button>
            `).join('')}
          </div>

          <!-- Status Timeline -->
          <div class="gr-timeline-wrapper px-6 py-5 border-b border-slate-200 bg-white">
            <div class="flex justify-between items-center mb-4 text-xs font-semibold text-slate-600">
              <span class="text-slate-500 uppercase tracking-wider font-bold">Dispatch Verification Pipeline</span>
              <span>${current.status === 'handed_over' ? 'Handover Completed • Meal Batch En Route' : `Estimated Arrival: ~${current.etaMinutes} mins (${current.distanceKm} km away)`}</span>
            </div>

            <div class="gr-timeline-track flex items-start justify-between relative">
              <div class="gr-timeline-bar-bg absolute top-4 left-[8%] right-[8%] h-1 bg-slate-200 rounded z-0">
                <div class="gr-timeline-bar-fill h-full bg-gradient-to-r from-[#123b2a] to-emerald-500 rounded transition-all" style="width: ${(stageIdx / (STAGES.length - 1)) * 100}%;"></div>
              </div>

              ${STAGES.map((s, idx) => {
                const isPast = idx < stageIdx;
                const isCurr = idx === stageIdx;
                const timeInfo = current.timeline[idx];
                return `
                  <div data-step="${s.key}" class="gr-timeline-step-item gr-step-clickable relative z-10 flex flex-col items-center text-center flex-1 cursor-pointer px-2">
                    <div class="gr-step-node w-9 h-9 rounded-full flex items-center justify-center mb-2 font-bold text-xs border-2 ${isPast ? 'bg-[#123b2a] border-[#123b2a] text-white' : isCurr ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-300 text-slate-400'}">
                      ${isPast ? '✓' : s.stepNum}
                    </div>
                    <div class="gr-step-title text-xs font-bold ${isCurr ? 'text-emerald-950' : 'text-slate-800'}">${s.label}</div>
                    <div class="gr-step-desc text-[11px] text-slate-500 max-w-[150px] leading-tight">${timeInfo?.desc || ''}</div>
                    <div class="gr-step-time text-[11px] font-mono text-emerald-800 font-semibold mt-1">${timeInfo?.time || ''}</div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Main Two-Column View -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-6">
            <!-- Col A: Rider & Vehicle -->
            <div class="flex flex-col gap-5">
              <div class="p-5 border border-slate-200 rounded-lg bg-slate-50/70 flex flex-col gap-4">
                <div class="flex justify-between items-start gap-3">
                  <div class="flex gap-3.5 items-center">
                    <div class="relative">
                      <img src="${current.rider?.avatarUrl || ''}" alt="${current.rider?.name}" class="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                    </div>
                    <div>
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-base font-bold text-slate-900 m-0">${current.rider?.name}</h4>
                        <span class="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 font-bold rounded">★ ${current.rider?.rating}</span>
                      </div>
                      <div class="text-xs text-slate-500 mt-1">Rider ID: <strong>${current.rider?.id}</strong> • ${current.rider?.totalDeliveries}+ deliveries</div>
                    </div>
                  </div>
                  <div class="platform-badge ${platformBadgeClass}">${platformBadgeText}</div>
                </div>

                <div class="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-200">
                  <a href="tel:${current.rider?.phone.replace(/[^0-9+]/g, '')}" class="btn btn-secondary btn-sm bg-white border border-slate-300 text-slate-800 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 no-underline">
                    📞 <span>Call: ${current.rider?.phone}</span>
                  </a>
                  <a href="https://wa.me/${current.rider?.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(current.rider?.name)},%20calling%20from%20Mess%20regarding%20surplus%20food%20pickup%20${current.id}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm bg-white border border-slate-300 text-slate-800 text-xs font-semibold py-2 px-3 rounded-md flex items-center justify-center gap-1.5 no-underline">
                    💬 <span>WhatsApp Rider</span>
                  </a>
                </div>
              </div>

              <!-- Vehicle Details & Plate -->
              <div class="p-5 border border-slate-200 rounded-lg bg-white flex flex-col gap-3.5 shadow-sm">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase">Assigned Vehicle & Registration Plate</span>
                  <span class="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    ⚡ ${current.rider?.batteryPercent}% EV Battery
                  </span>
                </div>

                <div class="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <div class="text-sm font-bold text-slate-900">${current.rider?.vehicleType}</div>
                    <div class="text-xs text-slate-500 mt-0.5">Category: ${current.rider?.vehicleCategory} • 🌱 Zero Emission</div>
                  </div>

                  <div class="flex items-center gap-2">
                    <div class="hsrp-plate">
                      <div class="hsrp-plate-ind"><div class="hsrp-plate-chakra"></div><span>IND</span></div>
                      <div class="hsrp-plate-number">${current.rider?.licensePlate}</div>
                    </div>
                    <button id="gr-btn-copy-plate" class="copy-badge-pill" type="button">
                      ${this.copiedPlate ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                  Security Rule: Verify number plate <strong>${current.rider?.licensePlate}</strong> before opening loading bay ramp.
                </div>
              </div>
            </div>

            <!-- Col B: Batch & OTP -->
            <div class="flex flex-col gap-5">
              <div class="p-5 border border-slate-200 rounded-lg bg-white flex flex-col gap-3 shadow-sm">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase">Surplus Batch Redistribution Info</span>
                  <span class="text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">${current.portions} Meals</span>
                </div>
                <div>
                  <div class="text-base font-bold text-slate-900">${current.batchTitle}</div>
                  <div class="text-xs text-slate-500 mt-1">${current.foodType} • Logged at ${current.temperatureLogged}</div>
                </div>
                <div class="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-slate-200">
                  <div><span class="text-slate-400 block text-[11px] font-semibold">PICKUP BAY:</span><strong class="text-slate-900">${current.pickupLocation}</strong></div>
                  <div><span class="text-slate-400 block text-[11px] font-semibold">DESTINATION NGO:</span><strong class="text-[#123b2a]">${current.targetNgo}</strong></div>
                </div>
              </div>

              <!-- OTP Verification Box -->
              <div class="otp-secure-box p-5 rounded-lg bg-gradient-to-br from-[#123b2a] to-[#164733] text-white flex flex-col gap-3 shadow-md">
                <div class="flex justify-between items-center">
                  <span class="font-bold text-sm">Secure Handover Verification OTP</span>
                  <button id="gr-btn-toggle-otp" type="button" class="bg-transparent border-0 text-white/80 hover:text-white text-xs cursor-pointer">
                    ${this.showOtp ? 'Hide Code' : 'Reveal Code'}
                  </button>
                </div>

                <div class="flex items-center justify-between bg-black/25 px-5 py-3 rounded border border-dashed border-yellow-200/40">
                  <div>
                    <span class="text-[11px] text-white/70 block uppercase">4-Digit Handover Code:</span>
                    <div class="otp-number-display text-3xl font-extrabold text-yellow-300 font-mono tracking-widest">
                      ${this.showOtp ? current.otp : '••••'}
                    </div>
                  </div>
                  <button id="gr-btn-copy-otp" type="button" class="bg-white/15 hover:bg-white/25 border border-white/25 text-white px-3.5 py-2 rounded text-xs font-semibold cursor-pointer">
                    ${this.copiedOtp ? '✓ Copied!' : 'Copy Code'}
                  </button>
                </div>

                <p class="text-xs text-white/90 m-0">Share OTP with rider <strong>${current.rider?.name}</strong> only after inspecting and loading canisters.</p>

                ${current.status !== 'handed_over' ? `
                  <form id="gr-form-verify" class="mt-1 flex flex-col gap-2">
                    <div class="flex gap-2">
                      <input id="gr-input-otp" type="text" maxlength="4" placeholder="Enter OTP (${current.otp})" class="flex-1 px-3.5 py-2 rounded border border-white/30 bg-white/15 text-white font-mono font-bold text-sm focus:outline-none" />
                      <button id="gr-btn-autofill" type="button" class="px-2.5 py-2 rounded bg-white/20 hover:bg-white/30 text-white text-xs font-semibold cursor-pointer border border-white/30">Auto-fill</button>
                      <button type="submit" class="px-4 py-2 rounded bg-yellow-300 hover:bg-yellow-400 text-slate-900 font-bold text-xs cursor-pointer border-0">Confirm Handover</button>
                    </div>
                    ${this.verifyError ? `<div class="text-red-300 text-xs font-semibold">${this.verifyError}</div>` : ''}
                  </form>
                ` : `
                  <div class="flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-2 rounded text-xs font-bold text-emerald-200">
                    ✓ Handover verified! Food batch is collected and en route.
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- Bottom Checklist -->
          <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-wrap gap-4 text-xs">
            <div class="flex items-center gap-5 flex-wrap">
              <span class="font-bold text-slate-500 uppercase">Mess Gate Handover Protocol:</span>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="chk-id" ${this.checklist.identityVerified ? 'checked' : ''} />
                <span>Rider Photo & ID Match</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="chk-plate" ${this.checklist.plateMatches ? 'checked' : ''} />
                <span>Plate ${current.rider?.licensePlate} Verified</span>
              </label>
              <label class="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" id="chk-bag" ${this.checklist.thermalInsulated ? 'checked' : ''} />
                <span>Insulated Bag Inspected</span>
              </label>
            </div>
            <div class="text-slate-500 font-medium">🛡️ FSSAI Clean Campus Compliance Verified</div>
          </div>
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    // Advance and Reset
    this.container.querySelector('#gr-btn-advance')?.addEventListener('click', () => this.advanceStage());
    this.container.querySelector('#gr-btn-reset')?.addEventListener('click', () => this.resetStage());

    // Tabs
    this.container.querySelectorAll('.gr-batch-tab').forEach((tab) => {
      tab.addEventListener('click', () => this.selectDispatch(tab.getAttribute('data-id')));
    });

    // Step nodes
    this.container.querySelectorAll('.gr-step-clickable').forEach((stepEl) => {
      stepEl.addEventListener('click', () => {
        const stepKey = stepEl.getAttribute('data-step');
        const curr = this.getCurrentDispatch();
        this.dispatches = this.dispatches.map((d) => 
          d.id === curr.id ? { ...d, status: stepKey, otpVerified: stepKey === 'handed_over' ? true : d.otpVerified } : d
        );
        this.render();
      });
    });

    // Copy actions
    this.container.querySelector('#gr-btn-copy-otp')?.addEventListener('click', () => this.copyOtp());
    this.container.querySelector('#gr-btn-copy-plate')?.addEventListener('click', () => this.copyPlate());
    this.container.querySelector('#gr-btn-toggle-otp')?.addEventListener('click', () => {
      this.showOtp = !this.showOtp;
      this.render();
    });

    // Auto-fill
    this.container.querySelector('#gr-btn-autofill')?.addEventListener('click', () => {
      const input = this.container.querySelector('#gr-input-otp');
      if (input) input.value = this.getCurrentDispatch().otp;
    });

    // Verify form
    this.container.querySelector('#gr-form-verify')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.container.querySelector('#gr-input-otp');
      if (input) this.verifyOtp(input.value);
    });

    // Checklist
    this.container.querySelector('#chk-id')?.addEventListener('change', (e) => {
      this.checklist.identityVerified = e.target.checked;
    });
    this.container.querySelector('#chk-plate')?.addEventListener('change', (e) => {
      this.checklist.plateMatches = e.target.checked;
    });
    this.container.querySelector('#chk-bag')?.addEventListener('change', (e) => {
      this.checklist.thermalInsulated = e.target.checked;
    });
  }
}

export default GreenRouteTrackerVanilla;

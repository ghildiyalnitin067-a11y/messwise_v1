import React, { useState, useEffect } from 'react';
import { 
  Bike, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle,
  BatteryCharging,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Leaf
} from 'lucide-react';
import { adminApi } from '../api/client';

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
    platformBrandColor: '#F8CB46',
    platformTextColor: '#0F172A',
    platformTag: 'Blinkit Instant Dispatch',
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
    platformBrandColor: '#F8CB46',
    platformTextColor: '#0F172A',
    platformTag: 'Blinkit Instant Dispatch',
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
    platformBrandColor: '#8023EB',
    platformTextColor: '#FFFFFF',
    platformTag: 'Zepto Food Rescue',
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
    platformBrandColor: '#FC8019',
    platformTextColor: '#FFFFFF',
    platformTag: 'Swiggy Instamart Rescue',
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
  },
  {
    id: 'GR-DISP-895',
    surplusId: 'surplus-4',
    batchTitle: 'Chole Bhature & Mixed Pickle',
    portions: 30,
    foodType: 'Fresh Prepared Breakfast Surplus',
    hostel: 'Hostel A (Aryabhatta)',
    pickupLocation: 'Hostel A Kitchen Bay 3 Ramp',
    targetNgo: 'Goonj Delhi Relief Hub',
    distanceKm: 2.8,
    platform: 'Blinkit',
    platformBrandColor: '#F8CB46',
    platformTextColor: '#0F172A',
    platformTag: 'Blinkit Instant Dispatch',
    rider: {
      id: 'RDR-442',
      name: 'Suresh Chandra Pal',
      phone: '+91 98112 34567',
      rating: 4.89,
      totalDeliveries: 820,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      vehicleType: 'Electric Scooter (Bajaj Chetak EV)',
      vehicleCategory: 'EV Two-Wheeler',
      licensePlate: 'DL 2S CD 8831',
      batteryPercent: 91,
    },
    otp: '6219',
    otpVerified: false,
    status: 'searching',
    etaMinutes: 14,
    timeline: [
      { step: 'searching', title: 'Searching Partner', desc: 'AI fleet ping sent to Blinkit, Zepto & Instamart hubs', time: 'Just now' },
      { step: 'assigned', title: 'Rider Assigned', desc: 'Awaiting rider order confirmation', time: 'Est. 1 min' },
      { step: 'arriving', title: 'Arriving at Mess', desc: 'Pending pickup departure', time: 'Est. 10 mins' },
      { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'OTP verification required', time: 'Est. 20 mins' }
    ],
    temperatureLogged: '67°C (Thermal Warmer)',
    pickupDeadline: '2:15 PM'
  }
];

export const STAGES = [
  { key: 'searching', label: 'Searching Partner', stepNum: 1 },
  { key: 'assigned', label: 'Rider Assigned', stepNum: 2 },
  { key: 'arriving', label: 'Arriving at Mess', stepNum: 3 },
  { key: 'handed_over', label: 'Food Handed Over / En Route to NGO', stepNum: 4 },
];

const GreenRouteTracker = ({ onHandoverSuccess, ngoRequests = [] }) => {
  const [dispatches, setDispatches] = useState(INITIAL_GREENROUTE_DISPATCHES);
  const [selectedId, setSelectedId] = useState(INITIAL_GREENROUTE_DISPATCHES[0].id);
  const [showOtp, setShowOtp] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [copiedPlate, setCopiedPlate] = useState(false);
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [liveSimulation, setLiveSimulation] = useState(false);
  const [checklist, setChecklist] = useState({
    identityVerified: true,
    plateMatches: true,
    thermalInsulated: true,
  });

  const convertReqToDispatch = (req) => {
    if (!req) return null;
    const existing = INITIAL_GREENROUTE_DISPATCHES.find(
      (d) =>
        (req.surplus_id && d.surplusId === req.surplus_id) ||
        (req.otp && d.otp === req.otp) ||
        (req.id && (d.id === req.id || d.surplusId === req.id))
    );

    const plateMatch = (req.vehicle || '').match(/\(([^)]+)\)/);
    const licensePlate = plateMatch ? plateMatch[1] : (existing?.rider?.licensePlate || 'DL 3S PR 9021');
    const riderName = req.volunteer_name || existing?.rider?.name || 'Assigned Rider';
    const dispId = existing ? existing.id : (req.id?.startsWith('GR-DISP-') ? req.id : `GR-DISP-${(req.id || 'REQ').replace(/[^a-zA-Z0-9]/g, '').slice(-6).toUpperCase()}`);

    if (existing) {
      return {
        ...existing,
        otpVerified: req.status === 'Collected' || existing.otpVerified,
        status: req.status === 'Collected' ? 'handed_over' : existing.status,
        etaMinutes: req.status === 'Collected' ? 0 : existing.etaMinutes,
      };
    }

    return {
      id: dispId,
      surplusId: req.surplus_id || req.id,
      surplus_id: req.surplus_id || req.id,
      batchTitle: req.food_title || 'Fresh Cooked Surplus',
      batch_title: req.food_title || 'Fresh Cooked Surplus',
      portions: req.meals || 25,
      foodType: 'Fresh Cooked Surplus',
      food_type: 'Fresh Cooked Surplus',
      hostel: req.hostel || 'Hostel A (Aryabhatta)',
      pickupLocation: 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      pickup_location: 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      targetNgo: 'Robin Hood Army & Jan Seva Shelter',
      target_ngo: 'Robin Hood Army & Jan Seva Shelter',
      distanceKm: 1.2,
      distance_km: 1.2,
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
        vehicle_type: req.vehicle || 'Electric Scooter (DL 3S PR 9021)',
        licensePlate: licensePlate,
        license_plate: licensePlate,
        batteryPercent: 92,
        battery_percent: 92,
      },
      otp: req.otp || '7412',
      otpVerified: req.status === 'Collected',
      status: req.status === 'Collected' ? 'handed_over' : 'arriving',
      etaMinutes: req.status === 'Collected' ? 0 : 3,
      eta_minutes: req.status === 'Collected' ? 0 : 3,
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

  const currentDispatch = dispatches.find((d) => d.id === selectedId) || dispatches[0];
  const currentStageIndex = STAGES.findIndex((s) => s.key === currentDispatch?.status);

  const normalizeDispatch = (item) => {
    if (!item) return null;
    const batchTitle = item.batchTitle || item.batch_title || 'Fresh Chapati';
    const rawRider = item.rider || {};
    const rider = {
      id: rawRider.id || 'RDR-502',
      name: rawRider.name || 'Pranav',
      phone: rawRider.phone || '+91 98450 12345',
      rating: rawRider.rating || 4.95,
      totalDeliveries: rawRider.totalDeliveries || rawRider.total_deliveries || 1120,
      avatarUrl: rawRider.avatarUrl || rawRider.avatar_url || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      vehicleType: rawRider.vehicleType || rawRider.vehicle_type || 'Electric Scooter (Ather 450X)',
      vehicleCategory: rawRider.vehicleCategory || rawRider.vehicle_category || 'EV Two-Wheeler',
      licensePlate: rawRider.licensePlate || rawRider.license_plate || 'DL 3S PR 9021',
      batteryPercent: rawRider.batteryPercent ?? rawRider.battery_percent ?? 89,
    };
    return {
      ...item,
      id: item.id,
      batchTitle,
      batch_title: batchTitle,
      portions: item.portions || 50,
      foodType: item.foodType || item.food_type || 'Fresh Prepared Meal',
      food_type: item.foodType || item.food_type || 'Fresh Prepared Meal',
      surplusId: item.surplusId || item.surplus_id || item.id,
      surplus_id: item.surplusId || item.surplus_id || item.id,
      hostel: item.hostel || 'Hostel A (Aryabhatta)',
      pickupLocation: item.pickupLocation || item.pickup_location || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      pickup_location: item.pickupLocation || item.pickup_location || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      targetNgo: item.targetNgo || item.target_ngo || 'Robin Hood Army & Jan Seva Shelter',
      target_ngo: item.targetNgo || item.target_ngo || 'Robin Hood Army & Jan Seva Shelter',
      distanceKm: item.distanceKm ?? item.distance_km ?? 1.2,
      distance_km: item.distanceKm ?? item.distance_km ?? 1.2,
      etaMinutes: item.etaMinutes ?? item.eta_minutes ?? 3,
      eta_minutes: item.etaMinutes ?? item.eta_minutes ?? 3,
      platform: item.platform || 'Blinkit',
      platformTag: item.platformTag || (item.platform === 'Zepto' ? 'Zepto Food Rescue' : item.platform === 'Instamart' ? 'Swiggy Instamart Rescue' : 'Blinkit Instant Dispatch'),
      platformBrandColor: item.platformBrandColor || (item.platform === 'Zepto' ? '#8023EB' : item.platform === 'Instamart' ? '#FC8019' : '#F8CB46'),
      platformTextColor: item.platformTextColor || (item.platform === 'Blinkit' ? '#0F172A' : '#FFFFFF'),
      otp: item.otp || '8294',
      otpVerified: item.otpVerified ?? item.otp_verified ?? false,
      status: item.status || 'arriving',
      rider,
      timeline: item.timeline || [
        { step: 'searching', title: 'Searching Partner', desc: 'AI fleet ping sent', time: '1:10 PM' },
        { step: 'assigned', title: 'Rider Assigned', desc: `${rider.name} accepted dispatch order`, time: '1:12 PM' },
        { step: 'arriving', title: 'Arriving at Mess', desc: '0.6 km away • Approaching Gate 4 Ramp', time: '1:15 PM' },
        { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'OTP verification complete', time: 'Est. 1:20 PM' }
      ],
      temperatureLogged: item.temperatureLogged || item.temperature_logged || '68°C (Insulated Casseroles)',
      pickupDeadline: item.pickupDeadline || item.pickup_deadline || '2:30 PM'
    };
  };

  // Load from backend API and localStorage, with live event synchronization
  useEffect(() => {
    let isMounted = true;

    const syncDispatches = (externalList = [], forceSelectId = null) => {
      try {
        const localCustom = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
        const localReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
        const allReqs = [...(Array.isArray(ngoRequests) ? ngoRequests : []), ...(Array.isArray(localReqs) ? localReqs : [])];
        const reqDispatches = allReqs
          .filter(r => r && r.volunteer_name)
          .map(convertReqToDispatch)
          .filter(Boolean);

        setDispatches((prev) => {
          const combined = [
            ...(forceSelectId ? [{ id: forceSelectId }] : []),
            ...reqDispatches,
            ...localCustom,
            ...externalList,
            ...prev
          ];
          const map = new Map();
          combined.forEach((raw) => {
            if (!raw) return;
            const norm = normalizeDispatch(raw);
            if (!norm || !norm.id) return;

            const canonMatch = INITIAL_GREENROUTE_DISPATCHES.find(
              (d) =>
                d.id === norm.id ||
                d.surplusId === (norm.surplusId || norm.surplus_id) ||
                (norm.otp && d.otp === norm.otp)
            );
            const dedupeKey = canonMatch
              ? canonMatch.id
              : (norm.surplusId || norm.surplus_id || norm.otp || norm.id);

            if (!map.has(dedupeKey)) {
              const finalItem = canonMatch ? { ...canonMatch, ...norm, id: canonMatch.id } : norm;
              map.set(dedupeKey, finalItem);
            } else {
              const current = map.get(dedupeKey);
              if (norm.status === 'handed_over' || norm.otpVerified) {
                map.set(dedupeKey, {
                  ...current,
                  ...norm,
                  id: current.id,
                  status: 'handed_over',
                  otpVerified: true,
                  etaMinutes: 0
                });
              }
            }
          });
          const list = Array.from(map.values());
          if (forceSelectId && map.has(forceSelectId)) {
            setSelectedId(forceSelectId);
          } else if (list.length > 0) {
            setSelectedId((cur) => {
              if (!cur || !list.some(d => d.id === cur)) {
                return list[0].id;
              }
              return cur;
            });
          }
          return list;
        });
      } catch (err) {
        console.warn('Sync error:', err);
      }
    };

    const fetchDispatches = () => {
      if (adminApi && typeof adminApi.getGreenRouteDispatches === 'function') {
        adminApi.getGreenRouteDispatches().then((data) => {
          if (isMounted && data && Array.isArray(data) && data.length > 0) {
            syncDispatches(data);
          } else {
            syncDispatches([]);
          }
        }).catch(() => {
          syncDispatches([]);
        });
      } else {
        syncDispatches([]);
      }
    };

    fetchDispatches();
    const pollInterval = setInterval(fetchDispatches, 3000);

    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('messwise-surplus-channel');
        bc.onmessage = (event) => {
          if (
            event.data?.type === 'RIDER_ASSIGNED' ||
            event.data?.type === 'CLAIM_SUBMITTED' ||
            event.data?.type === 'SURPLUS_CLAIMED'
          ) {
            if (event.data?.dispatch) {
              const normalized = normalizeDispatch(event.data.dispatch);
              setDispatches((prev) => [normalized, ...prev.filter((d) => d.id !== normalized.id)]);
              setSelectedId(normalized.id);
            }
            fetchDispatches();
          } else if (event.data?.type === 'HANDOVER_VERIFIED') {
            fetchDispatches();
          }
        };
      }
    } catch {}

    const handleFocus = () => fetchDispatches();
    window.addEventListener('focus', handleFocus);

    const handleCustomUpdate = (e) => {
      if (e?.detail) {
        const normalized = normalizeDispatch(e.detail);
        setDispatches((prev) => [normalized, ...prev.filter((d) => d.id !== normalized.id)]);
        setSelectedId(normalized.id);
      }
    };

    const handleStorageUpdate = (e) => {
      if (e.key === 'messwise_greenroute_dispatches' || e.key === 'messwise_ngo_requests') {
        syncDispatches([]);
      }
    };

    window.addEventListener('messwise-dispatch-updated', handleCustomUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('messwise-dispatch-updated', handleCustomUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [ngoRequests]);

  // Live GPS Telemetry Simulation Interval
  useEffect(() => {
    if (!liveSimulation) return;

    const interval = setInterval(() => {
      setDispatches((prev) =>
        prev.map((disp) => {
          if (disp.id !== selectedId) return disp;

          if (disp.status === 'arriving' && disp.etaMinutes > 1) {
            const nextEta = Math.max(1, disp.etaMinutes - 1);
            const nextDistance = Math.max(0.2, Number((disp.distanceKm - 0.3).toFixed(1)));
            return {
              ...disp,
              etaMinutes: nextEta,
              distanceKm: nextDistance,
              timeline: disp.timeline.map((t, idx) =>
                idx === 2 ? { ...t, desc: `${nextDistance} km away • Approaching Gate 4 Ramp (ETA ${nextEta}m)` } : t
              )
            };
          } else if (disp.status === 'searching') {
            // Auto match after search
            return {
              ...disp,
              status: 'assigned',
              etaMinutes: 10,
              timeline: disp.timeline.map((t, idx) =>
                idx === 1 ? { ...t, desc: `${disp.rider?.name || 'Rider'} confirmed dispatch order` } : t
              )
            };
          }
          return disp;
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, [liveSimulation, selectedId]);

  const handleCopyOtp = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentDispatch.otp);
    }
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2200);
  };

  const handleCopyPlate = () => {
    if (currentDispatch?.rider?.licensePlate && navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(currentDispatch.rider.licensePlate);
    }
    setCopiedPlate(true);
    setTimeout(() => setCopiedPlate(false), 2200);
  };

  const handleAdvanceStage = () => {
    const nextIdx = (currentStageIndex + 1) % STAGES.length;
    const nextStage = STAGES[nextIdx].key;
    
    setDispatches((prev) =>
      prev.map((disp) => {
        if (disp.id !== currentDispatch.id) return disp;
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          ...disp,
          status: nextStage,
          otpVerified: nextStage === 'handed_over' ? true : disp.otpVerified,
          etaMinutes: nextStage === 'handed_over' ? 0 : nextStage === 'arriving' ? 3 : nextStage === 'assigned' ? 8 : 12,
          timeline: disp.timeline.map((t, idx) =>
            idx === nextIdx ? { ...t, time: nowTime } : t
          )
        };
      })
    );
  };

  const handleResetStage = () => {
    setDispatches((prev) =>
      prev.map((disp) =>
        disp.id === currentDispatch.id
          ? { 
              ...disp, 
              status: 'searching', 
              otpVerified: false, 
              etaMinutes: 14,
              timeline: disp.timeline.map((t, idx) => 
                idx === 0 ? { ...t, time: 'Just now' } : t
              )
            }
          : disp
      )
    );
    setVerifySuccess(false);
    setVerifyInput('');
    setVerifyError('');
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    if (verifyInput.trim() !== currentDispatch.otp) {
      setVerifyError(`Incorrect OTP. Please enter "${currentDispatch.otp}"`);
      return;
    }
    
    setVerifyError('');
    setVerifySuccess(true);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setDispatches((prev) =>
      prev.map((disp) =>
        disp.id === currentDispatch.id
          ? {
              ...disp,
              status: 'handed_over',
              otpVerified: true,
              etaMinutes: 0,
              timeline: disp.timeline.map((t, idx) =>
                idx === 3 ? { ...t, desc: `OTP ${disp.otp} verified • Food handed over`, time: nowTime } : t
              )
            }
          : disp
      )
    );

    // Call backend API if connected
    if (adminApi && typeof adminApi.verifyGreenRouteOtp === 'function') {
      adminApi.verifyGreenRouteOtp(currentDispatch.id, currentDispatch.otp).catch(() => {});
    }

    if (onHandoverSuccess) {
      onHandoverSuccess(currentDispatch);
    }

    setTimeout(() => setVerifySuccess(false), 4500);
  };

  const getPlatformBadge = (platform) => {
    switch (platform) {
      case 'Blinkit':
        return {
          className: 'platform-badge platform-badge-blinkit',
          text: '⚡ Blinkit GreenRoute',
          dotColor: '#16a34a',
          brandColor: '#F8CB46',
          textColor: '#0F172A'
        };
      case 'Zepto':
        return {
          className: 'platform-badge platform-badge-zepto',
          text: 'Zepto Express Rescue',
          dotColor: '#9333ea',
          brandColor: '#8023EB',
          textColor: '#FFFFFF'
        };
      case 'Instamart':
        return {
          className: 'platform-badge platform-badge-instamart',
          text: 'Instamart Quick Rescue',
          dotColor: '#ea580c',
          brandColor: '#FC8019',
          textColor: '#FFFFFF'
        };
      default:
        return {
          className: 'platform-badge',
          text: platform,
          dotColor: '#059669',
          brandColor: '#123B2A',
          textColor: '#FFFFFF'
        };
    }
  };

  const badgeInfo = getPlatformBadge(currentDispatch.platform);
  const isSearching = currentDispatch.status === 'searching';

  return (
    <div className="greenroute-container w-full flex flex-col gap-5 mb-7">
      <div className="greenroute-card bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all">
        {/* Header */}
        <div className="greenroute-header px-6 py-4.5 border-b border-slate-200 flex items-center justify-between flex-wrap gap-4 bg-gradient-to-b from-slate-50 to-white">
          <div className="greenroute-title-group flex items-center gap-3.5">
            <div className="greenroute-icon-badge w-11 h-11 rounded-lg bg-gradient-to-br from-[#123b2a] to-[#1b533c] text-white flex items-center justify-center shadow-md shrink-0">
              <Bike size={22} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 m-0 leading-tight">
                  GreenRoute Rider Details & Live Tracking
                </h3>
                <span className="greenroute-live-indicator inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  <span className="live-beacon-dot w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live GPS Fleet Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 mb-0 font-medium">
                Quick-commerce delivery partner live telemetry for verified surplus food handover (Blinkit • Zepto • Instamart)
              </p>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              className={`btn btn-sm text-xs font-semibold px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all ${
                liveSimulation 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
              onClick={() => setLiveSimulation(!liveSimulation)}
              title="Toggle automatic live GPS coordinates and ETA count-down updates"
            >
              <Radio size={13} className={liveSimulation ? 'animate-pulse text-white' : 'text-slate-500'} />
              <span>{liveSimulation ? 'Live Stream: Active' : 'Enable Live GPS Telemetry'}</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
              onClick={handleAdvanceStage}
              title="Cycle status: Searching → Assigned → Arriving → Handed Over"
            >
              <RefreshCw size={13} />
              <span>Next Status</span>
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-sm bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 text-xs font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all"
              onClick={handleResetStage}
              title="Reset current dispatch to initial stage"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Active Dispatches Chip Selector */}
        <div className="gr-batch-selector flex gap-2.5 overflow-x-auto px-6 py-3.5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold tracking-wider uppercase pr-1 shrink-0">
            Active Dispatches:
          </div>
          {dispatches.map((disp) => {
            const isSelected = disp.id === selectedId;
            return (
              <button
                key={disp.id}
                className={`gr-batch-chip flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border shrink-0 ${
                  isSelected 
                    ? 'active bg-emerald-50 border-emerald-700 text-emerald-900 shadow-sm' 
                    : 'bg-white border-slate-200 text-slate-600 hover:border-emerald-500 hover:text-emerald-950'
                }`}
                onClick={() => {
                  setSelectedId(disp.id);
                  setVerifyInput('');
                  setVerifyError('');
                }}
              >
                <span 
                  className="w-2 h-2 rounded-full shrink-0" 
                  style={{ 
                    backgroundColor: 
                      disp.status === 'handed_over' 
                        ? '#10b981' 
                        : disp.status === 'arriving' 
                        ? '#f59e0b' 
                        : disp.status === 'assigned'
                        ? '#3b82f6'
                        : '#8b5cf6' 
                  }} 
                />
                <span className="font-bold">[{disp.platform}]</span>
                <span className="font-semibold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1">
                  <Bike size={12} className="text-emerald-700" /> {disp.rider?.name || 'Rider'}
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{disp.id}</span>
                <span className="text-slate-300">•</span>
                <span>{(disp.batchTitle || disp.batch_title || 'Batch').split(' ')[0]} ({disp.portions} meals)</span>
                {disp.status === 'arriving' && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold">
                    {disp.etaMinutes}m ETA
                  </span>
                )}
                {disp.status === 'handed_over' && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold">
                    Collected
                  </span>
                )}
                {disp.status === 'searching' && (
                  <span className="text-[11px] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded font-bold animate-pulse">
                    Searching...
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Interactive Status Timeline */}
        <div className="gr-timeline-wrapper px-6 py-5 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Dispatch Verification Pipeline
            </span>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <Clock size={14} className="text-emerald-700" />
              <span>
                {currentDispatch.status === 'handed_over' 
                  ? 'Handover Completed • Meal Batch In Transit to NGO Shelter' 
                  : currentDispatch.status === 'searching'
                  ? 'Broadcasting to nearest quick-commerce partner fleet within 3.5 km radius'
                  : `Estimated Mess Arrival: ~${currentDispatch.etaMinutes} mins (${currentDispatch.distanceKm} km away)`}
              </span>
            </div>
          </div>

          <div className="gr-timeline-track flex items-start justify-between relative">
            <div className="gr-timeline-bar-bg absolute top-4.5 left-[8%] right-[8%] h-1 bg-slate-200 rounded z-0">
              <div 
                className="gr-timeline-bar-fill h-full bg-gradient-to-r from-[#123b2a] to-emerald-500 rounded transition-all duration-500" 
                style={{ 
                  width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%` 
                }} 
              />
            </div>

            {STAGES.map((stage, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const timeItem = currentDispatch.timeline[idx];

              return (
                <div 
                  key={stage.key} 
                  className="gr-timeline-step-item relative z-10 flex flex-col items-center text-center flex-1 cursor-pointer px-2 transition-transform hover:-translate-y-0.5"
                  onClick={() => {
                    setDispatches((prev) =>
                      prev.map((d) =>
                        d.id === currentDispatch.id
                          ? { 
                              ...d, 
                              status: stage.key, 
                              otpVerified: stage.key === 'handed_over' ? true : d.otpVerified,
                              etaMinutes: stage.key === 'handed_over' ? 0 : stage.key === 'arriving' ? 3 : stage.key === 'assigned' ? 8 : 14
                            }
                          : d
                      )
                    );
                  }}
                  title="Click to jump to this stage"
                >
                  <div 
                    className={`gr-step-node w-9 h-9 rounded-full flex items-center justify-center mb-2.5 transition-all text-xs font-bold border-2 ${
                      isPast 
                        ? 'completed bg-[#123b2a] border-[#123b2a] text-white' 
                        : isCurrent 
                        ? 'active bg-emerald-500 border-emerald-600 text-white shadow-md ring-4 ring-emerald-100' 
                        : 'bg-white border-slate-300 text-slate-400'
                    }`}
                  >
                    {isPast ? (
                      <Check size={18} strokeWidth={2.8} />
                    ) : (
                      <span>{stage.stepNum}</span>
                    )}
                  </div>
                  <div className={`gr-step-title text-xs font-bold mb-0.5 ${isCurrent ? 'text-emerald-950' : 'text-slate-800'}`}>
                    {stage.label}
                  </div>
                  <div className="gr-step-desc text-[11px] text-slate-500 max-w-[150px] leading-tight font-normal">
                    {timeItem?.desc}
                  </div>
                  <div className="gr-step-time text-[11px] font-mono font-semibold text-emerald-800 mt-1">
                    {timeItem?.time}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {isSearching ? (
          /* Searching State Radar Screen */
          <div className="p-6">
            <div className="gr-radar-container">
              <div className="gr-radar-sweep">
                <div className="gr-radar-ring" />
                <div className="gr-radar-ring-2" />
                <div className="gr-radar-sweep-beam" />
                <Bike size={28} className="text-emerald-800 relative z-10" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Searching Quick-Commerce Delivery Fleet Partner
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mb-4 leading-relaxed">
                Surplus batch <strong>{currentDispatch.id}</strong> ({currentDispatch.batchTitle}) broadcasted to verified EV riders across <strong>{currentDispatch.platform}</strong>, Zepto, and Instamart campus hubs within 3.5 km.
              </p>
              <div className="flex items-center gap-3 flex-wrap justify-center">
                <span className="text-xs px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-md font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  Estimated Match Time: ~45 seconds
                </span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm bg-[#123b2a] hover:bg-[#0e2e20] text-white text-xs font-semibold px-4 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-all"
                  onClick={() => {
                    setDispatches((prev) =>
                      prev.map((disp) =>
                        disp.id === currentDispatch.id
                          ? {
                              ...disp,
                              status: 'assigned',
                              etaMinutes: 10,
                              timeline: disp.timeline.map((t, idx) =>
                                idx === 1 ? { ...t, desc: `${disp.rider?.name || 'Rahul Kumar'} confirmed dispatch order` } : t
                              )
                            }
                          : disp
                      )
                    );
                  }}
                >
                  <Zap size={14} />
                  <span>Simulate Instant Rider Acceptance</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Matched / Active Rider Details View */
          <div className="gr-columns-grid">
            {/* Column A: Rider & Vehicle Details */}
            <div className="gr-column">
              {/* Rider Identity Card */}
              <div className="gr-panel-card subtle-bg">
                <div className="gr-section-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img 
                        src={currentDispatch.rider.avatarUrl} 
                        alt={currentDispatch.rider.name}
                        style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #ffffff', boxShadow: 'var(--shadow-xs)' }}
                      />
                      <span 
                        style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', border: '2px solid #ffffff' }} 
                        title="Active on GPS" 
                      />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {currentDispatch.rider.name}
                        </h4>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', backgroundColor: '#fef08a', color: '#854d0e', fontWeight: 700, borderRadius: 'var(--radius-xs)' }}>
                          ★ {currentDispatch.rider.rating}
                        </span>
                        <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.45rem', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700, borderRadius: 'var(--radius-xs)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={12} /> Verified
                        </span>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', backgroundColor: 'var(--brand-900)', color: '#ffffff', fontWeight: 600, borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Check size={11} /> Assigned Rider
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Rider ID: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{currentDispatch.rider.id}</strong> • Assigned for <strong style={{ color: 'var(--text-primary)' }}>{currentDispatch.targetNgo}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Partner Platform Badge */}
                  <div className={`${badgeInfo.className}`} style={{ flexShrink: 0 }}>
                    <span 
                      style={{ width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0, backgroundColor: badgeInfo.dotColor }} 
                    />
                    <span>{badgeInfo.text}</span>
                  </div>
                </div>

                {/* Direct Communication Links (Phone & WhatsApp) */}
                <div className="gr-contact-grid">
                  <a 
                    href={`tel:${currentDispatch.rider.phone.replace(/[^0-9+]/g, '')}`} 
                    className="gr-contact-btn"
                    title="Click to dial rider mobile directly"
                  >
                    <Phone size={14} style={{ color: 'var(--brand-700)', flexShrink: 0 }} />
                    <span>{currentDispatch.rider.phone}</span>
                  </a>
                  <a 
                    href={`https://wa.me/${currentDispatch.rider.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(currentDispatch.rider.name)},%20this%20is%20Mess%20Supervisor%20from%20${encodeURIComponent(currentDispatch.hostel)}%20regarding%20surplus%20food%20dispatch%20${currentDispatch.id}.`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="gr-contact-btn"
                    title="Open WhatsApp chat with rider"
                  >
                    <MessageCircle size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                    <span>WhatsApp Rider</span>
                  </a>
                </div>
              </div>

              {/* Vehicle Details & Number Plate Verification */}
              <div className="gr-panel-card">
                <div className="gr-section-header">
                  <span className="gr-section-title">
                    Assigned Vehicle & Registration Plate
                  </span>
                  <span className="gr-battery-pill">
                    <BatteryCharging size={13} />
                    <span>{currentDispatch.rider.batteryPercent}% EV Battery</span>
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {currentDispatch.rider.vehicleType}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>Category: {currentDispatch.rider.vehicleCategory}</span>
                      <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--border-default)' }} />
                      <span style={{ color: 'var(--brand-700)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Leaf size={12} color="#047857" /> Zero Emission Fleet
                      </span>
                    </div>
                  </div>

                  {/* Indian High Security Registration Plate (HSRP) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="hsrp-plate" title="High Security Registration Plate (HSRP) - Verify with vehicle plate">
                      <div className="hsrp-plate-ind">
                        <div className="hsrp-plate-chakra" />
                        <span>IND</span>
                      </div>
                      <div className="hsrp-plate-number">
                        {currentDispatch.rider.licensePlate}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPlate}
                      className="copy-badge-pill"
                      title="Copy plate number to clipboard"
                    >
                      {copiedPlate ? <Check size={12} style={{ color: '#16a34a' }} /> : <Copy size={12} />}
                      <span>{copiedPlate ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="gr-alert-box">
                  <AlertCircle size={15} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
                  <span>
                    Security Gate Rule: Match vehicle number plate <strong>{currentDispatch.rider.licensePlate}</strong> and rider photo before opening loading bay ramp.
                  </span>
                </div>
              </div>
            </div>

            {/* Column B: Food Batch Redistribution & Secure OTP Box */}
            <div className="gr-column">
              {/* Surplus Batch Redistribution Info */}
              <div className="gr-panel-card">
                <div className="gr-section-header">
                  <span className="gr-section-title">
                    Surplus Batch Redistribution Info
                  </span>
                  <span className="badge badge-info">
                    {currentDispatch.portions} Meals Allocated
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                    {currentDispatch.batchTitle}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                    {currentDispatch.foodType} • Logged at <strong>{currentDispatch.temperatureLogged}</strong>
                  </div>
                </div>

                <div className="gr-meta-grid">
                  <div className="gr-meta-item">
                    <span className="gr-meta-label">Pickup Bay</span>
                    <span className="gr-meta-value">{currentDispatch.pickupLocation}</span>
                  </div>
                  <div className="gr-meta-item">
                    <span className="gr-meta-label">Destination NGO</span>
                    <span className="gr-meta-value highlight">{currentDispatch.targetNgo}</span>
                  </div>
                </div>
              </div>

              {/* Secure Handover OTP Box */}
              <div className="otp-secure-box">
                <div className="gr-otp-header">
                  <div className="gr-otp-header-title">
                    <ShieldCheck size={19} style={{ color: '#fef08a' }} />
                    <span>Secure Handover Verification OTP</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowOtp(!showOtp)}
                    className="gr-otp-toggle-btn"
                  >
                    {showOtp ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showOtp ? 'Hide Code' : 'Reveal Code'}</span>
                  </button>
                </div>

                {/* 4-Digit Display */}
                <div className="gr-otp-code-card">
                  <div>
                    <span className="gr-otp-label">
                      4-Digit Verification Handover Code:
                    </span>
                    <div className="otp-number-display">
                      {showOtp ? currentDispatch.otp : '••••'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyOtp}
                    className="gr-otp-copy-btn"
                  >
                    {copiedOtp ? <Check size={14} style={{ color: '#86efac' }} /> : <Copy size={14} />}
                    <span>{copiedOtp ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>

                <p className="gr-otp-desc">
                  Share this secure 4-digit OTP with rider <strong>{currentDispatch.rider.name}</strong> only after verifying their identity and inspecting the sealed food canisters into the vehicle.
                </p>

                {/* Handover Form Action - Gate Simulation Box */}
                {currentDispatch.status !== 'handed_over' ? (
                  <div className="gr-sim-box">
                    <div className="gr-sim-header">
                      <span className="gr-sim-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Zap size={13} color="#f59e0b" /> Quick Gate Simulation / Test Handover
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#fef08a' }}>Demo Mode Active</span>
                    </div>
                    <p className="gr-sim-desc">
                      Simulate entering the rider's verification code to complete gate clearance without opening the rider's mobile app:
                    </p>
                    <form onSubmit={handleVerifyOtp} className="gr-otp-form">
                      <div className="gr-otp-form-row">
                        <input
                          type="text"
                          maxLength={4}
                          value={verifyInput}
                          onChange={(e) => {
                            setVerifyInput(e.target.value.replace(/[^0-9]/g, ''));
                            setVerifyError('');
                          }}
                          placeholder={`Enter OTP (${currentDispatch.otp})`}
                          className="gr-otp-input"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setVerifyInput(currentDispatch.otp);
                            setVerifyError('');
                          }}
                          className="gr-otp-autofill-btn"
                          title="Auto-fill OTP for quick verification test"
                        >
                          Auto fill
                        </button>
                        <button
                          type="submit"
                          className="gr-otp-confirm-btn"
                        >
                          <CheckCircle2 size={15} />
                          <span>Confirm Handover</span>
                        </button>
                      </div>
                      {verifyError && (
                        <div className="gr-otp-error">
                          {verifyError}
                        </div>
                      )}
                    </form>
                  </div>
                ) : (
                  <div className="gr-otp-success">
                    <CheckCircle2 size={16} style={{ color: '#86efac', flexShrink: 0 }} />
                    <span>Handover Verified! Food batch is officially collected and en route to {currentDispatch.targetNgo}.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Supervisor Safety & Gate Verification Protocol Checklist */}
        <div className="gr-protocol-bar">
          <div className="gr-protocol-group">
            <span className="gr-section-title">
              Mess Gate Handover Protocol:
            </span>
            <label className="gr-protocol-item">
              <input 
                type="checkbox" 
                checked={checklist.identityVerified} 
                onChange={(e) => setChecklist({ ...checklist, identityVerified: e.target.checked })} 
              />
              <span>Rider Photo & ID Match</span>
            </label>
            <label className="gr-protocol-item">
              <input 
                type="checkbox" 
                checked={checklist.plateMatches} 
                onChange={(e) => setChecklist({ ...checklist, plateMatches: e.target.checked })} 
              />
              <span>Plate {currentDispatch.rider?.licensePlate || 'DL 3S AB 1234'} Verified</span>
            </label>
            <label className="gr-protocol-item">
              <input 
                type="checkbox" 
                checked={checklist.thermalInsulated} 
                onChange={(e) => setChecklist({ ...checklist, thermalInsulated: e.target.checked })} 
              />
              <span>Insulated Warm Bag Inspected</span>
            </label>
          </div>

          <div className="gr-compliance-badge">
            <ShieldCheck size={16} style={{ color: 'var(--brand-700)' }} />
            <span>FSSAI Clean Campus Compliance Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GreenRouteTracker;

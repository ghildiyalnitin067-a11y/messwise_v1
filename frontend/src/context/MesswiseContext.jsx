import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, studentApi, adminApi, ngoApi } from '../api/client';

const MesswiseContext = createContext(null);

export const INITIAL_PRODUCTION_LOGS = [
  { id: 'prod-seed-1', date: 'Today (Lunch)', menu: 'Rajma + Steamed Rice + Roti', p: 842, s: 817, sur: 25, w: 6.0, prepared: 842, served: 817, surplus: 25, waste: 6.0, status: 'Completed', isSurplus: false },
  { id: 'prod-seed-2', date: 'Today (Breakfast)', menu: 'Poha + Milk + Banana', p: 480, s: 472, sur: 8, w: 2.2, prepared: 480, served: 472, surplus: 8, waste: 2.2, status: 'Completed', isSurplus: false },
  { id: 'prod-seed-3', date: 'Yesterday (Dinner)', menu: 'Dal Tadka + Roti + Rice', p: 610, s: 598, sur: 12, w: 4.8, prepared: 610, served: 598, surplus: 12, waste: 4.8, status: 'Completed', isSurplus: false },
  { id: 'prod-seed-4', date: 'Yesterday (Lunch)', menu: 'Chole Bhature + Rice', p: 820, s: 795, sur: 25, w: 7.4, prepared: 820, served: 795, surplus: 25, waste: 7.4, status: 'Completed', isSurplus: false },
  { id: 'prod-seed-5', date: '14 Sep (Dinner)', menu: 'Veg Pulao + Kadhi', p: 580, s: 565, sur: 15, w: 3.9, prepared: 580, served: 565, surplus: 15, waste: 3.9, status: 'Completed', isSurplus: false },
];

export const MesswiseProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({
    id: 'usr-student-01',
    name: 'Nitin Sharma',
    email: 'nitin.sharma@campus.edu',
    role: 'student',
    hostel: 'Hostel A (Aryabhatta)',
    room: 'B-304',
    diet: 'Vegetarian',
    meals_booked: 82,
    meals_saved: 14,
    co2_avoided_kg: 24.0,
    eco_rank: 12,
    notifications: true,
  });

  const [studentMeals, setStudentMeals] = useState({
    breakfast: { session: 'breakfast', menu: 'Poha + Milk + Banana', time: '7:30 AM - 9:30 AM', booked: true, status: 'Booked', token: 'BKF-892' },
    lunch: { session: 'lunch', menu: 'Rajma + Jeera Rice + Roti + Salad', time: '12:30 PM - 2:30 PM', booked: true, status: 'Booked', token: 'LCH-419' },
    snacks: { session: 'snacks', menu: 'Masala Chai + Veg Pakoda / Samosa', time: '4:30 PM - 6:00 PM', booked: false, status: 'Not Booked', token: null },
    dinner: { session: 'dinner', menu: 'Paneer Butter Masala + Roti + Dal', time: '7:30 PM - 9:30 PM', booked: false, status: 'Not Booked', token: null },
  });

  const [adminStats, setAdminStats] = useState({
    mess_name: 'Hostel A - Aryabhatta Central Mess',
    supervisor: 'Rajesh Kumar',
    date: 'Tue, 16 Sep 2025',
    today_stats: { prepared: 842, served: 817, surplus: 25, waste: 6 },
    registered_boarders: 650,
    active_rsvps: 598,
  });

  const [aiPrediction, setAiPrediction] = useState({
    target_date: 'Tomorrow (Wed, 17 Sep 2025)',
    expected_demand: 560,
    recommended_cook: 575,
    buffer_margin_percent: 2.6,
    waste_risk: 'Low',
    confidence_percent: 94.2,
    insights: [
      'Turnout Ratio Calibrated: 92% (598 boarders active).',
      'Wednesday attendance peaks at dinner (+8%).',
      'External Signals: Normal semester schedule | Pleasant weather.',
      'Safe Buffer: +15 portions to ensure 0 student meal run-outs.',
    ],
  });

  const [surplusListings, setSurplusListings] = useState([
    {
      id: 'surplus-1',
      title: 'Rajma Rice',
      meals: 25,
      hostel: 'Hostel A',
      location_detail: 'Hostel A Dining Hall, Counter 2',
      distance_km: 2.3,
      pickup_deadline: '4:00 PM',
      time_remaining: '1h 45m left',
      status: 'Published',
      temp_celsius: 64,
      storage_condition: 'Insulated Stainless Steel Warmer',
      food_type: 'Cooked Main Course (Vegetarian)',
      dietary: 'Vegetarian',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      pickup_otp: '7412',
    },
    {
      id: 'surplus-2',
      title: 'Roti + Dal Makhani',
      meals: 40,
      hostel: 'Hostel B',
      location_detail: 'Hostel B Kitchen Bay, Gate 3',
      distance_km: 3.1,
      pickup_deadline: '5:00 PM',
      time_remaining: '2h 45m left',
      status: 'Published',
      temp_celsius: 68,
      storage_condition: 'Insulated Casseroles',
      food_type: 'Cooked Bread & Gravy (Vegetarian)',
      dietary: 'Vegetarian',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&auto=format&fit=crop&q=80',
      pickup_otp: '3829',
    },
  ]);

  const [ngoRequests, setNgoRequests] = useState([
    {
      id: 'req-101',
      surplus_id: 'surplus-1',
      food_title: 'Rajma Rice',
      meals: 25,
      hostel: 'Hostel A',
      volunteer_name: 'Rakesh Verma',
      vehicle: 'Electric Van (DL-04-EV-8821)',
      requested_at: '1:40 PM',
      status: 'Approved',
      pickup_time_estimated: '3:15 PM',
      otp: '7412',
    },
  ]);

  const [ngoStats, setNgoStats] = useState({
    name: 'Helping Hands NGO',
    contactPerson: 'Dr. Sunita Rao',
    availableDonations: 18,
    pendingRequests: 4,
    todaysPickups: 3,
    peopleServed: 184,
    totalMealsRescued: 4320,
    co2DivertedKg: 648,
  });

  const [greenrouteDispatches, setGreenrouteDispatches] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return [];
  });

  const [productionLogs, setProductionLogs] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('messwise_production_logs') || '[]');
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return INITIAL_PRODUCTION_LOGS;
  });

  const recordProductionLog = useCallback((logEntry) => {
    const entry = {
      id: logEntry.id || `prod-${Date.now()}`,
      date: logEntry.date || `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      menu: logEntry.menu || 'Daily Batch Menu',
      prepared: Number(logEntry.prepared ?? logEntry.p) || 0,
      served: Number(logEntry.served ?? logEntry.s) || 0,
      surplus: Number(logEntry.surplus ?? logEntry.sur) || 0,
      waste: Number(logEntry.waste ?? logEntry.w) || 0,
      p: Number(logEntry.prepared ?? logEntry.p) || 0,
      s: Number(logEntry.served ?? logEntry.s) || 0,
      sur: Number(logEntry.surplus ?? logEntry.sur) || 0,
      w: Number(logEntry.waste ?? logEntry.w) || 0,
      status: logEntry.status || 'Active Log',
      isSurplus: Boolean(logEntry.isSurplus),
      surplusId: logEntry.surplusId || null,
      notes: logEntry.notes || '',
    };
    setProductionLogs((prev) => {
      const updated = [entry, ...prev.filter(l => l.id !== entry.id)];
      try {
        localStorage.setItem('messwise_production_logs', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    return entry;
  }, []);

  // Fetch initial data from backend API
  const refreshData = useCallback(async () => {
    try {
      const [userRes, mealsRes, adminRes, surplusRes, requestsRes, dispatchesRes] = await Promise.allSettled([
        authApi.getMe(),
        studentApi.getTodayMeals(),
        adminApi.getStats(),
        ngoApi.getAvailableSurplus(),
        ngoApi.getMyRequests(),
        adminApi.getGreenRouteDispatches(),
      ]);

      if (userRes.status === 'fulfilled' && userRes.value) {
        setCurrentUser((prev) => ({ ...prev, ...userRes.value }));
      }
      if (mealsRes.status === 'fulfilled' && mealsRes.value?.meals) {
        setStudentMeals(mealsRes.value.meals);
      }
      if (adminRes.status === 'fulfilled' && adminRes.value) {
        setAdminStats(adminRes.value);
      }
      if (surplusRes.status === 'fulfilled' && surplusRes.value?.items?.length) {
        setSurplusListings(surplusRes.value.items);
      }
      if (requestsRes.status === 'fulfilled' && requestsRes.value?.length) {
        setNgoRequests(requestsRes.value);
      }
      if (dispatchesRes.status === 'fulfilled' && dispatchesRes.value && Array.isArray(dispatchesRes.value) && dispatchesRes.value.length) {
        setGreenrouteDispatches(dispatchesRes.value);
      }
    } catch (e) {
      console.warn('Backend sync failed, using realistic mock cache.', e);
    }
  }, []);

  useEffect(() => {
    let bc;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('messwise-surplus-channel');
        bc.onmessage = (event) => {
          if (event.data?.type === 'RIDER_ASSIGNED') {
            if (event.data?.claim) {
              setNgoRequests((prev) => [
                event.data.claim,
                ...prev.filter((r) => r.id !== event.data.claim.id),
              ]);
            }
            if (event.data?.dispatch) {
              setGreenrouteDispatches((prev) => [
                event.data.dispatch,
                ...prev.filter((d) => d.id !== event.data.dispatch.id),
              ]);
            }
          } else if (event.data?.type === 'HANDOVER_VERIFIED') {
            setNgoRequests((prev) =>
              prev.map((r) => (r.id === event.data.requestId ? { ...r, status: 'Collected' } : r))
            );
          }
        };
      }
    } catch {}

    return () => {
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    refreshData();

    let channel;
    try {
      channel = new BroadcastChannel('messwise_menu_sync');
      channel.onmessage = (msg) => {
        if (msg.data?.type === 'MENU_UPDATED') {
          refreshData();
        }
      };
    } catch {}

    const handleStorage = (e) => {
      if (e.key === 'messwise_menu_last_synced') {
        refreshData();
      }
    };
    window.addEventListener('storage', handleStorage);

    const handleFocus = () => {
      refreshData();
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      refreshData();
    }, 12000);

    return () => {
      if (channel) channel.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [refreshData]);

  // Actions
  const toggleMealBooking = async (mealSession) => {
    const current = studentMeals[mealSession];
    const isNowBooked = !current?.booked;
    const tokenStr = isNowBooked ? `TK-${mealSession.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}` : null;

    setStudentMeals((prev) => ({
      ...prev,
      [mealSession]: {
        ...prev[mealSession],
        booked: isNowBooked,
        status: isNowBooked ? 'Booked' : 'Not Booked',
        token: tokenStr,
      },
    }));

    setCurrentUser((prev) => ({
      ...prev,
      meals_booked: isNowBooked ? prev.meals_booked + 1 : Math.max(0, prev.meals_booked - 1),
      co2_avoided_kg: isNowBooked ? Math.round((prev.co2_avoided_kg + 0.3) * 10) / 10 : prev.co2_avoided_kg,
    }));

    try {
      await studentApi.toggleBooking(mealSession);
    } catch (err) {
      // Handled gracefully
    }
  };

  const publishSurplus = async (item) => {
    const newItem = {
      id: `surplus-${Date.now()}`,
      title: item.title,
      meals: Number(item.meals) || 20,
      hostel: item.hostel || 'Hostel A',
      location_detail: item.location_detail || 'Counter 1',
      distance_km: 2.3,
      pickup_deadline: item.pickup_deadline || '5:00 PM',
      time_remaining: '3h left',
      status: 'Published',
      temp_celsius: Number(item.temp_celsius) || 68,
      storage_condition: item.storage_condition || 'Insulated Warmer',
      food_type: item.food_type || 'Fresh Cooked Food',
      dietary: item.dietary || 'Vegetarian',
      image_url: item.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80',
      pickup_otp: String(Math.floor(1000 + Math.random() * 9000)),
    };

    setSurplusListings((prev) => [newItem, ...prev]);
    setAdminStats((prev) => ({
      ...prev,
      today_stats: {
        ...prev.today_stats,
        surplus: prev.today_stats.surplus + newItem.meals,
      },
    }));

    // Record immediately into Batch Production Logs!
    const surplusLog = {
      id: `prod-surplus-${newItem.id}`,
      date: `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      menu: newItem.title,
      prepared: (Number(newItem.meals) || 20) + 30,
      served: 30,
      surplus: Number(newItem.meals) || 20,
      waste: Number(((Number(newItem.meals) || 20) * 0.04).toFixed(1)),
      p: (Number(newItem.meals) || 20) + 30,
      s: 30,
      sur: Number(newItem.meals) || 20,
      w: Number(((Number(newItem.meals) || 20) * 0.04).toFixed(1)),
      status: 'Surplus Queue Active',
      isSurplus: true,
      surplusId: newItem.id,
      notes: `Added from Surplus Food Queue • ${newItem.location_detail} • Pickup by ${newItem.pickup_deadline}`,
    };
    recordProductionLog(surplusLog);

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'SURPLUS_PUBLISHED',
          surplus: newItem,
          productionLog: surplusLog,
        });
        bc.close();
      }
    } catch {}

    try {
      await adminApi.publishSurplus(newItem);
    } catch (e) {}

    return newItem;
  };

  const requestSurplus = async (surplusId, details) => {
    const surplus = surplusListings.find((s) => s.id === surplusId);
    if (!surplus) return;

    const plateMatch = (details.vehicle || '').match(/\(([^)]+)\)/);
    const licensePlate = plateMatch ? plateMatch[1] : 'DL 3S PR 9021';
    const riderName = details.volunteer_name || 'Volunteer Driver';
    const reqOtp = surplus.pickup_otp || '7412';

    setSurplusListings((prev) =>
      prev.map((s) => (s.id === surplusId ? { ...s, status: 'Requested', requested_by_ngo: 'Helping Hands NGO' } : s))
    );

    const newReq = {
      id: `req-${Date.now()}`,
      surplus_id: surplus.id,
      food_title: surplus.title,
      meals: surplus.meals,
      hostel: surplus.hostel || 'Hostel A',
      volunteer_name: riderName,
      vehicle: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
      requested_at: 'Just now',
      status: 'Approved',
      pickup_time_estimated: details.eta || 'Within 15 mins',
      otp: reqOtp,
    };

    const newDispatch = {
      id: `GR-DISP-${Date.now().toString().slice(-4)}`,
      surplusId: surplus.id,
      surplus_id: surplus.id,
      batchTitle: surplus.title,
      batch_title: surplus.title,
      portions: surplus.meals,
      foodType: surplus.food_type || 'Fresh Cooked Surplus',
      food_type: surplus.food_type || 'Fresh Cooked Surplus',
      hostel: surplus.hostel || 'Hostel A (Aryabhatta)',
      pickupLocation: surplus.location_detail || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      pickup_location: surplus.location_detail || 'Central Mess Dispatch Bay 2 (Gate 4 Ramp)',
      targetNgo: 'Helping Hands NGO',
      target_ngo: 'Helping Hands NGO',
      distanceKm: surplus.distance_km || 1.2,
      distance_km: surplus.distance_km || 1.2,
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
        vehicleType: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
        vehicle_type: details.vehicle || 'Electric Scooter (DL 3S PR 9021)',
        licensePlate: licensePlate,
        license_plate: licensePlate,
        batteryPercent: 92,
        battery_percent: 92,
      },
      otp: reqOtp,
      otpVerified: false,
      status: 'arriving',
      etaMinutes: 3,
      eta_minutes: 3,
      timeline: [
        { step: 'searching', title: 'Searching Partner', desc: 'Broadcast matched with Helping Hands NGO', time: 'Just now' },
        { step: 'assigned', title: 'Rider Assigned', desc: `${riderName} confirmed dispatch order`, time: 'Just now' },
        { step: 'arriving', title: 'Arriving at Mess', desc: `Approaching Mess Dispatch Bay 2 (${details.eta || 'Within 15 mins'})`, time: 'In transit' },
        { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'Pending OTP handover verification', time: 'Est. in 10 mins' },
      ],
      temperatureLogged: `${surplus.temp_celsius || 68}°C (Insulated Casseroles)`,
      pickupDeadline: surplus.pickup_deadline || '5:00 PM',
    };

    setNgoRequests((prev) => [newReq, ...prev]);
    setGreenrouteDispatches((prev) => [newDispatch, ...prev]);

    try {
      const existingDispatches = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      localStorage.setItem('messwise_greenroute_dispatches', JSON.stringify([newDispatch, ...existingDispatches.filter(d => d.id !== newDispatch.id)]));

      const existingReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
      localStorage.setItem('messwise_ngo_requests', JSON.stringify([newReq, ...existingReqs.filter(r => r.id !== newReq.id)]));

      window.dispatchEvent(new CustomEvent('messwise-dispatch-updated', { detail: newDispatch }));
    } catch {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'RIDER_ASSIGNED',
          claim: newReq,
          dispatch: newDispatch,
          riderName: riderName,
          vehicle: details.vehicle,
          surplusId: surplus.id,
        });
        bc.close();
      }
    } catch {}

    try {
      await ngoApi.requestSurplus(surplusId, details);
    } catch (e) {}

    return { ...newReq, dispatch: newDispatch };
  };

  const approveRequest = async (requestId) => {
    setNgoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Approved' } : r))
    );
    try {
      await adminApi.approveRequest(requestId);
    } catch (e) {}
  };

  const confirmHandover = async (requestId, otp) => {
    const req = ngoRequests.find((r) => r.id === requestId);
    if (!req) return { success: false, message: 'Request not found' };

    if (req.otp !== otp.trim()) {
      return { success: false, message: 'Incorrect OTP! Verification failed.' };
    }

    setNgoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Collected' } : r))
    );

    setSurplusListings((prev) =>
      prev.map((s) => (s.id === req.surplus_id ? { ...s, status: 'PickedUp' } : s))
    );

    setGreenrouteDispatches((prev) =>
      prev.map((d) =>
        (d.surplusId === req.surplus_id || d.id === req.id || d.otp === req.otp)
          ? { ...d, status: 'handed_over', otpVerified: true, etaMinutes: 0 }
          : d
      )
    );

    try {
      const localDisps = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      const updatedDisps = localDisps.map((d) =>
        (d.surplusId === req.surplus_id || d.id === req.id || d.otp === req.otp)
          ? { ...d, status: 'handed_over', otpVerified: true, etaMinutes: 0 }
          : d
      );
      localStorage.setItem('messwise_greenroute_dispatches', JSON.stringify(updatedDisps));

      const localReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
      const updatedReqs = localReqs.map((r) => (r.id === requestId ? { ...r, status: 'Collected' } : r));
      localStorage.setItem('messwise_ngo_requests', JSON.stringify(updatedReqs));

      window.dispatchEvent(new CustomEvent('messwise-dispatch-updated', {
        detail: { id: req.id, surplusId: req.surplus_id, status: 'handed_over', otpVerified: true }
      }));
    } catch {}

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'HANDOVER_VERIFIED',
          requestId,
          surplusId: req.surplus_id,
          otp,
        });
        bc.close();
      }
    } catch {}

    try {
      await adminApi.verifyHandover(requestId, otp);
    } catch (e) {}

    return { success: true, message: `Successfully verified! ${req.meals} meals handed over for redistribution.` };
  };

  const handleLogin = async (role, credentials) => {
    let res;
    if (role === 'student') {
      res = await authApi.loginStudent(credentials.enrollment_no, credentials.father_name);
    } else if (role === 'admin') {
      res = await authApi.loginAdmin(credentials.username, credentials.password);
    } else if (role === 'ngo') {
      res = await authApi.loginNgo(credentials.email, credentials.password);
    } else {
      res = await authApi.login(credentials);
    }

    if (res?.access_token) {
      localStorage.setItem('messwise_jwt_token', res.access_token);
    }

    const userData = res?.user || res?.student || res?.admin || res?.ngo;
    if (userData) {
      setCurrentUser((prev) => ({ ...prev, ...userData, role: role || res?.role || prev.role }));
    }

    await refreshData();
    return res;
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem('messwise_jwt_token');
    setCurrentUser((prev) => ({ ...prev, id: null, role: 'guest' }));
  };

  return (
    <MesswiseContext.Provider
      value={{
        currentUser,
        userRole: currentUser?.role || 'student',
        isAuthenticated: Boolean(localStorage.getItem('messwise_jwt_token')),
        studentMeals,
        adminStats,
        aiPrediction,
        surplusListings,
        ngoRequests,
        ngoStats,
        greenrouteDispatches,
        setGreenrouteDispatches,
        productionLogs,
        setProductionLogs,
        recordProductionLog,
        toggleMealBooking,
        publishSurplus,
        requestSurplus,
        approveRequest,
        confirmHandover,
        handleLogin,
        handleLogout,
        setAiPrediction,
        setAdminStats,
        refreshData,
      }}
    >
      {children}
    </MesswiseContext.Provider>
  );
};

export const useMesswise = () => useContext(MesswiseContext);

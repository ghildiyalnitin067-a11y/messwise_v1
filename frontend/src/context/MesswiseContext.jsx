import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, studentApi, adminApi, ngoApi } from '../api/client';

const MesswiseContext = createContext(null);

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

  // Fetch initial data from backend API
  const refreshData = useCallback(async () => {
    try {
      const [userRes, mealsRes, adminRes, surplusRes, requestsRes] = await Promise.allSettled([
        authApi.getMe(),
        studentApi.getTodayMeals(),
        adminApi.getStats(),
        ngoApi.getAvailableSurplus(),
        ngoApi.getMyRequests(),
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
    } catch (e) {
      console.warn('Backend sync failed, using realistic mock cache.', e);
    }
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

    try {
      await adminApi.publishSurplus(newItem);
    } catch (e) {}

    return newItem;
  };

  const requestSurplus = async (surplusId, details) => {
    const surplus = surplusListings.find((s) => s.id === surplusId);
    if (!surplus) return;

    setSurplusListings((prev) =>
      prev.map((s) => (s.id === surplusId ? { ...s, status: 'Requested', requested_by_ngo: 'Helping Hands NGO' } : s))
    );

    const newReq = {
      id: `req-${Date.now()}`,
      surplus_id: surplus.id,
      food_title: surplus.title,
      meals: surplus.meals,
      hostel: surplus.hostel,
      volunteer_name: details.volunteer_name || 'Volunteer Driver',
      vehicle: details.vehicle || 'Electric Van',
      requested_at: 'Just now',
      status: 'Pending Approval',
      pickup_time_estimated: details.eta || 'Within 30 mins',
      otp: surplus.pickup_otp || '7412',
    };

    setNgoRequests((prev) => [newReq, ...prev]);

    try {
      await ngoApi.requestSurplus(surplusId, details);
    } catch (e) {}

    return newReq;
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

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChefHat, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Trash2, 
  Sliders, 
  Truck,
  LogOut,
  LogIn,
  CheckCircle2,
  Boxes,
  AlertTriangle,
  Clock,
  ArrowDownRight,
  PlusCircle,
  RefreshCw,
  IndianRupee,
  Droplets,
  ArrowUpRight,
  Bike
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import HandoverModal from './components/HandoverModal';
import LoginModal from './components/LoginModal';
import EcoLeaderboard from './components/EcoLeaderboard';
import DailyMenuManager from './components/DailyMenuManager';
import UcoManagement from './components/UcoManagement';
import DemandForecastIntelligence from './components/DemandForecastIntelligence';
import AdminPreferenceManager from './components/AdminPreferenceManager';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import GreenRouteTracker from './components/GreenRouteTracker';
import { adminApi, authApi, stockApi } from './api/client';

export const INITIAL_PRODUCTION_LOGS = [
  { id: 'log-1', date: 'Today (Lunch)', menu: 'Rajma Masala + Steamed Rice + Tawa Roti + Boondi Raita', p: 842, s: 817, sur: 25, w: 5.8, prepared: 842, served: 817, surplus: 25, waste: 5.8, status: 'Active Log', isSurplus: false },
  { id: 'log-2', date: 'Today (Breakfast)', menu: 'Indori Poha + Roasted Peanuts + Hot Milk + Banana', p: 480, s: 468, sur: 12, w: 2.1, prepared: 480, served: 468, surplus: 12, waste: 2.1, status: 'Completed', isSurplus: false },
  { id: 'log-3', date: 'Yesterday (Dinner)', menu: 'Shahi Paneer + Dal Makhani + Tawa Roti + Jeera Rice', p: 760, s: 742, sur: 18, w: 4.2, prepared: 760, served: 742, surplus: 18, waste: 4.2, status: 'Completed', isSurplus: false },
  { id: 'log-4', date: 'Yesterday (Lunch)', menu: 'Kadhi Pakoda + Steamed Rice + Aloo Jeera + Salad', p: 810, s: 790, sur: 20, w: 6.1, prepared: 810, served: 790, surplus: 20, waste: 6.1, status: 'Completed', isSurplus: false },
  { id: 'log-5', date: 'Sunday (Special Feast)', menu: 'Chole Bhature + Veg Pulao + Gulab Jamun', p: 940, s: 934, sur: 6, w: 3.8, prepared: 940, served: 934, surplus: 6, waste: 3.8, status: 'Completed', isSurplus: false },
  { id: 'log-6', date: 'Friday (Weekend Exodus)', menu: 'Moong Dal Khichdi + Papad + Mixed Pickle + Dahi', p: 460, s: 385, sur: 75, w: 8.5, prepared: 460, served: 385, surplus: 75, waste: 8.5, status: 'Completed', isSurplus: false },
  { id: 'log-7', date: 'Exam Night (Mid-Sem Snacks)', menu: 'Aloo Paratha + Curd + Adrak Chai (11:30 PM)', p: 320, s: 318, sur: 2, w: 1.1, prepared: 320, served: 318, surplus: 2, waste: 1.1, status: 'Completed', isSurplus: false },
];

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedHandoverReq, setSelectedHandoverReq] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(localStorage.getItem('messwise_jwt_token')));

  // Stock Analysis & Shelf-Life State
  const [stockSummary, setStockSummary] = useState(null);
  const [stockItems, setStockItems] = useState([]);
  const [selectedIngredientId, setSelectedIngredientId] = useState('onion');
  const [stockFilterCategory, setStockFilterCategory] = useState('all'); // 'all' | 'vegetable' | 'meal' | 'dairy'
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [batchFormData, setBatchFormData] = useState({
    ingredient_id: 'onion',
    qty: 30,
    received_date: new Date().toISOString().slice(0, 10),
    shelf_life_days: 14,
    cost_per_kg: 35
  });
  const [itemFormData, setItemFormData] = useState({
    name: '',
    category: 'vegetable', // 'vegetable' | 'meal'
    unit: 'kg',
    consumption_per_meal: 0.045,
    cost_per_unit: 35,
    shelf_life_days: 7,
    initial_qty: 30,
    received_date: new Date().toISOString().slice(0, 10)
  });
  const [deductInput, setDeductInput] = useState(10);
  const [stockActionMsg, setStockActionMsg] = useState(null);
  const [addonRecommendations, setAddonRecommendations] = useState([]);
  const [activeAddons, setActiveAddons] = useState([]);
  const [publishingAddonId, setPublishingAddonId] = useState(null);
  const [broadcastedNgoIds, setBroadcastedNgoIds] = useState([]);
  const [lastDeductionAudit, setLastDeductionAudit] = useState(null);

  const [adminStats, setAdminStats] = useState({
    mess_name: 'Hostel A - Aryabhatta Central Mess',
    supervisor: 'Rajesh Kumar',
    date: 'Tue, 16 Sep 2025',
    today_stats: { prepared: 842, served: 817, surplus: 25, waste: 6 },
  });

  const [aiPrediction, setAiPrediction] = useState({
    target_date: 'Tomorrow (Wed, 17 Sep 2025)',
    expected_demand: 560,
    recommended_cook: 575,
    buffer_margin_percent: 2.6,
    waste_risk: 'Low',
    confidence_percent: 94.2,
    insights: [
      'Turnout Ratio: 92% (598 boarders active).',
      'Wednesday attendance peaks at dinner (+8%).',
      'Recommended Buffer: +15 portions to guarantee 0 meal run-outs.',
    ],
  });

  const [ngoRequests, setNgoRequests] = useState([
    {
      id: 'req-102',
      surplus_id: 'surplus-chapati',
      food_title: 'Fresh Chapati',
      meals: 50,
      hostel: 'Hostel A',
      volunteer_name: 'Pranav',
      vehicle: 'Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: '1:20 PM',
      otp: '8294',
    },
    {
      id: 'req-101',
      surplus_id: 'surplus-1',
      food_title: 'Rajma Rice',
      meals: 25,
      hostel: 'Hostel A',
      volunteer_name: 'Rakesh Verma',
      vehicle: 'Electric Van (DL-04-EV-8821)',
      status: 'Approved',
      pickup_time_estimated: '3:15 PM',
      otp: '7412',
    },
  ]);

  const [prepQty, setPrepQty] = useState(842);
  const [servQty, setServQty] = useState(817);
  const [wasteQty, setWasteQty] = useState(6);
  const [prodSuccess, setProdSuccess] = useState(false);

  const [simDay, setSimDay] = useState('wed');
  const [simRatio, setSimRatio] = useState(92);
  const [simWeather, setSimWeather] = useState('clear');

  const [newSurplus, setNewSurplus] = useState({
    title: 'Rajma Rice & Roti',
    meals: 25,
    location_detail: 'Hostel A Central Mess, Dispatch Bay 2',
    pickup_deadline: 'Today, 4:00 PM',
  });
  const [publishSuccess, setPublishSuccess] = useState(false);

  const leftover = Math.max(0, Number(prepQty) - Number(servQty));

  const loadStockData = async () => {
    try {
      const [sum, items, recs, actives] = await Promise.all([
        stockApi.getSummary(),
        stockApi.getItems(),
        stockApi.getAddonRecommendations(),
        stockApi.getActiveAddons()
      ]);
      if (sum) setStockSummary(sum);
      if (items) setStockItems(items);
      if (recs) setAddonRecommendations(recs);
      if (actives) setActiveAddons(actives);
    } catch (e) {
      console.warn("Stock API fallback error", e);
    }
  };

  const handlePublishAddon = async (rec, session = 'lunch') => {
    setPublishingAddonId(`${rec.ingredient_id}-${session}`);
    try {
      const payload = {
        ingredient_id: rec.ingredient_id,
        addon_name: rec.recommended_dish_name,
        meal_session: session,
        portions_target: rec.potential_portions || 250,
        description: rec.description,
        eco_points: rec.eco_points || 25
      };
      await stockApi.publishAddon(payload);
      setStockActionMsg(`Successfully pushed "${rec.recommended_dish_name}" to Student Menu for ${session.toUpperCase()}! Students can now claim add-ons.`);
      await loadStockData();
    } catch {
      setStockActionMsg(`Failed to publish add-on special.`);
    } finally {
      setPublishingAddonId(null);
      setTimeout(() => setStockActionMsg(null), 4500);
    }
  };

  const handleBroadcastToNgo = async (rec) => {
    setPublishingAddonId(`${rec.ingredient_id}-ngo`);
    try {
      const surplusData = {
        title: rec.recommended_dish_name,
        meals: rec.potential_portions || 40,
        location_detail: 'Hostel A Kitchen Bay, Counter 1',
        pickup_deadline: '4:30 PM',
        dietary: 'Vegetarian',
        temp_celsius: 65,
        storage_condition: 'Insulated Warmer',
        food_type: 'Cooked Surplus Special'
      };
      const res = await adminApi.publishSurplus(surplusData);
      setBroadcastedNgoIds((prev) => [...prev, rec.ingredient_id]);

      const newNgoReq = {
        id: `req-${Date.now().toString().slice(-4)}`,
        surplus_id: res?.id || `surplus-${Date.now()}`,
        food_title: rec.recommended_dish_name,
        meals: rec.potential_portions || 40,
        hostel: 'Hostel A',
        volunteer_name: 'Rescue Logistics Van #04',
        vehicle: 'Electric Van (DL-04-EV-8821)',
        status: 'Approved',
        pickup_time_estimated: 'Within 40 mins',
        otp: res?.pickup_otp || '6294',
      };
      setNgoRequests((prev) => [newNgoReq, ...prev]);

      setStockActionMsg(`Dispatched "${rec.recommended_dish_name}" (${rec.potential_portions} meals) to NGO Food Rescue Feed! Handover OTP: ${newNgoReq.otp}`);
    } catch (e) {
      console.error(e);
      setStockActionMsg('Failed to broadcast to NGO network.');
    } finally {
      setPublishingAddonId(null);
      setTimeout(() => setStockActionMsg(null), 5000);
    }
  };

  const [productionLogs, setProductionLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('messwise_production_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_PRODUCTION_LOGS;
  });

  const allProductionLogs = useMemo(() => {
    const list = [...(productionLogs || [])];
    const seenTitles = new Set(list.map((l) => (l.menu || '').toLowerCase().trim()));
    let surplusItems = [];
    try {
      surplusItems = JSON.parse(localStorage.getItem('messwise_surplus_listings') || '[]');
    } catch {}
    (surplusItems || []).forEach((s) => {
      const cleanTitle = (s.title || '').toLowerCase().trim();
      if (cleanTitle && !seenTitles.has(cleanTitle)) {
        seenTitles.add(cleanTitle);
        const mealsCount = Number(s.meals) || 20;
        list.unshift({
          id: `surplus-log-${s.id}`,
          date: 'Surplus Queue Active',
          menu: s.title,
          p: mealsCount + 30,
          s: 30,
          sur: mealsCount,
          w: Number((mealsCount * 0.04).toFixed(1)),
          prepared: mealsCount + 30,
          served: 30,
          surplus: mealsCount,
          waste: Number((mealsCount * 0.04).toFixed(1)),
          status: s.status === 'Requested' ? 'NGO Matched' : s.status === 'PickedUp' ? 'Collected' : 'Surplus Queue Active',
          isSurplus: true,
          surplusId: s.id,
        });
      }
    });
    return list;
  }, [productionLogs]);

  const fetchNgoRequests = async () => {
    try {
      const data = await adminApi.getNgoRequests();
      const localReqs = JSON.parse(localStorage.getItem('messwise_ngo_requests') || '[]');
      const combined = [...(data && Array.isArray(data) ? data : []), ...localReqs];
      if (combined.length > 0) {
        setNgoRequests((prev) => {
          const map = new Map();
          combined.forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          prev.forEach((item) => {
            if (item && item.id && !map.has(item.id)) {
              map.set(item.id, item);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Failed to fetch admin requests:', err);
    }
  };

  useEffect(() => {
    adminApi.getStats().then((res) => {
      if (res) setAdminStats(res);
    });
    loadStockData();
    fetchNgoRequests();
    const pollInterval = setInterval(fetchNgoRequests, 3500);

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
            if (event.data?.claim) {
              setNgoRequests((prev) => [
                event.data.claim,
                ...prev.filter((r) => r.id !== event.data.claim.id),
              ]);
            }
            if (event.data?.dispatch) {
              window.dispatchEvent(
                new CustomEvent('messwise-dispatch-updated', {
                  detail: event.data.dispatch,
                })
              );
            }
            fetchNgoRequests();
          }

          if (event.data?.type === 'SURPLUS_PUBLISHED') {
            const dish = event.data?.dish;
            if (dish) {
              const mealsCount = Number(dish.meals) || 20;
              const logItem = {
                id: `prod-surplus-${dish.id || Date.now()}`,
                date: 'Surplus Queue Active',
                menu: dish.title,
                p: mealsCount + 30,
                s: 30,
                sur: mealsCount,
                w: Number((mealsCount * 0.04).toFixed(1)),
                prepared: mealsCount + 30,
                served: 30,
                surplus: mealsCount,
                waste: Number((mealsCount * 0.04).toFixed(1)),
                status: 'Surplus Queue Active',
                isSurplus: true,
                surplusId: dish.id,
              };
              setProductionLogs((prev) => {
                if (prev.some((p) => (p.menu || '').toLowerCase().trim() === (dish.title || '').toLowerCase().trim())) {
                  return prev;
                }
                const updated = [logItem, ...prev];
                try {
                  localStorage.setItem('messwise_production_logs', JSON.stringify(updated));
                } catch {}
                return updated;
              });
            }
          }
        };
      }
    } catch {}

    const handleFocus = () => {
      fetchNgoRequests();
      try {
        const saved = localStorage.getItem('messwise_production_logs');
        if (saved) setProductionLogs(JSON.parse(saved));
      } catch {}
    };
    window.addEventListener('focus', handleFocus);

    const handleStorage = (e) => {
      if (e.key === 'messwise_ngo_requests') {
        fetchNgoRequests();
      }
      if (e.key === 'messwise_production_logs' && e.newValue) {
        try {
          setProductionLogs(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(pollInterval);
      if (bc) bc.close();
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);


  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      await stockApi.addBatch(batchFormData);
      setStockActionMsg(`✓ Successfully registered ${batchFormData.qty} kg batch for ${batchFormData.ingredient_id.toUpperCase()}!`);
      setShowAddBatchModal(false);
      await loadStockData();
    } catch {
      setStockActionMsg('Failed to record batch.');
    }
    setTimeout(() => setStockActionMsg(null), 4000);
  };

  const handleAddItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await stockApi.registerItem(itemFormData);
      setStockActionMsg(`✓ Successfully registered ${itemFormData.name} (${itemFormData.category.toUpperCase()}) with initial stock of ${itemFormData.initial_qty} ${itemFormData.unit}!`);
      setShowAddItemModal(false);
      setItemFormData({
        name: '',
        category: 'vegetable',
        unit: 'kg',
        consumption_per_meal: 0.045,
        cost_per_unit: 35,
        shelf_life_days: 7,
        initial_qty: 30,
        received_date: new Date().toISOString().slice(0, 10)
      });
      await loadStockData();
      if (res?.ingredient_id) {
        setSelectedIngredientId(res.ingredient_id);
      }
    } catch {
      setStockActionMsg('Failed to register stock item.');
    }
    setTimeout(() => setStockActionMsg(null), 4500);
  };

  const handleDeductUsage = async (ingredientId) => {
    try {
      const res = await stockApi.deductUsage(ingredientId, Number(deductInput));
      setLastDeductionAudit(res);
      setStockActionMsg(`✓ Deducted ${res?.actual_deducted || deductInput} kg from oldest FIFO batch of ${ingredientId.toUpperCase()}.`);
      await loadStockData();
    } catch {
      setStockActionMsg('Failed to deduct usage.');
    }
    setTimeout(() => setStockActionMsg(null), 4500);
  };


  const handleSimulateForecast = async () => {
    try {
      const pred = await adminApi.predictDemand({
        day_of_week: simDay,
        turnout_ratio: simRatio / 100,
        weather: simWeather,
        meal_session: 'Lunch',
      });
      if (pred) setAiPrediction(pred);
    } catch {
      let base = 600 * (simRatio / 100);
      if (simDay === 'wed') base *= 1.02;
      const exp = Math.round(base);
      setAiPrediction({
        target_date: 'Tomorrow (Wed, 17 Sep 2025)',
        expected_demand: exp,
        recommended_cook: Math.round(exp * 1.026),
        buffer_margin_percent: 2.6,
        waste_risk: 'Low',
        confidence_percent: 94.2,
        insights: [
          `Turnout Ratio: ${simRatio}% (${Math.round(650 * simRatio / 100)} boarders active).`,
          `Day Adjustment (${simDay.toUpperCase()}): Normal mid-week turnout factor.`,
          `Recommended Buffer: +${Math.round(exp * 0.026)} portions to guarantee 0 meal run-outs.`,
        ],
      });
    }
  };

  const handleSaveProduction = async (e) => {
    e.preventDefault();
    try {
      await adminApi.logProduction({
        meal_session: 'Lunch',
        prepared_qty: prepQty,
        served_qty: servQty,
        waste_qty: wasteQty,
        notes: 'Daily batch production record',
      });
      setAdminStats((prev) => ({
        ...prev,
        today_stats: {
          prepared: prepQty,
          served: servQty,
          surplus: leftover,
          waste: wasteQty,
        },
      }));
      const newManualLog = {
        id: `manual-log-${Date.now()}`,
        date: `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
        menu: 'Lunch Batch (Rajma + Steamed Rice + Roti)',
        p: Number(prepQty),
        s: Number(servQty),
        sur: leftover,
        w: Number(wasteQty),
        prepared: Number(prepQty),
        served: Number(servQty),
        surplus: leftover,
        waste: Number(wasteQty),
        status: 'Completed',
        isSurplus: false,
      };
      setProductionLogs((prev) => {
        const next = [newManualLog, ...prev];
        try {
          localStorage.setItem('messwise_production_logs', JSON.stringify(next));
        } catch {}
        return next;
      });
      setProdSuccess(true);
      setTimeout(() => setProdSuccess(false), 3000);
    } catch {}
  };

  const handlePublishSurplus = async (e) => {
    e.preventDefault();
    const newDispatchId = `GR-DISP-${Math.floor(800 + Math.random() * 199)}`;
    const isChapatiBatch = newSurplus.title.toLowerCase().includes('chapati');
    const assignedRiderName = isChapatiBatch ? 'Pranav' : 'Pranav';
    
    const createdDispatch = {
      id: newDispatchId,
      surplusId: `surplus-${Date.now()}`,
      batchTitle: newSurplus.title,
      portions: Number(newSurplus.meals) || 25,
      foodType: 'Fresh Kitchen Surplus',
      hostel: adminStats.mess_name.split(' - ')[0] || 'Hostel A',
      pickupLocation: newSurplus.location_detail || 'Central Mess Dispatch Bay 2',
      targetNgo: 'Robin Hood Army & Jan Seva Shelter',
      distanceKm: 1.2,
      platform: 'Blinkit',
      platformBrandColor: '#F8CB46',
      platformTextColor: '#0F172A',
      platformTag: 'Blinkit Instant Dispatch',
      rider: {
        id: 'RDR-502',
        name: assignedRiderName,
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
      status: 'arriving',
      etaMinutes: 3,
      timeline: [
        { step: 'searching', title: 'Searching Partner', desc: `Broadcast active for ${newSurplus.title}`, time: 'Just now' },
        { step: 'assigned', title: 'Rider Assigned', desc: `${assignedRiderName} confirmed dispatch order`, time: 'Just now' },
        { step: 'arriving', title: 'Arriving at Mess', desc: '0.6 km away • Approaching Gate 4 Ramp', time: 'Est. in 3 mins' },
        { step: 'handed_over', title: 'Food Handed Over / En Route', desc: 'Pending OTP handover verification', time: 'Est. in 10 mins' }
      ],
      temperatureLogged: '68°C (Insulated Casseroles)',
      pickupDeadline: newSurplus.pickup_deadline
    };

    const newNgoReq = {
      id: `req-${Date.now()}`,
      surplus_id: createdDispatch.surplusId,
      food_title: newSurplus.title,
      meals: Number(newSurplus.meals) || 25,
      hostel: createdDispatch.hostel,
      volunteer_name: assignedRiderName,
      vehicle: 'Electric Scooter (DL 3S PR 9021)',
      status: 'Approved',
      pickup_time_estimated: 'Within 10 mins',
      otp: '8294',
    };

    setNgoRequests((prev) => [newNgoReq, ...prev]);

    try {
      const existing = JSON.parse(localStorage.getItem('messwise_greenroute_dispatches') || '[]');
      localStorage.setItem('messwise_greenroute_dispatches', JSON.stringify([createdDispatch, ...existing]));
      window.dispatchEvent(new CustomEvent('messwise-dispatch-updated', { detail: createdDispatch }));
    } catch {}

    let backendRes = null;
    try {
      backendRes = await adminApi.publishSurplus({
        title: newSurplus.title,
        food_title: newSurplus.title,
        meals: Number(newSurplus.meals) || 25,
        meals_available: Number(newSurplus.meals) || 25,
        location_detail: newSurplus.location_detail || 'Hostel A Central Mess, Dispatch Bay 2',
        pickup_deadline: newSurplus.pickup_deadline || 'Today, 5:00 PM',
        temp_celsius: 68,
        storage_temperature: 68.0,
      });
    } catch (err) {
      console.warn('Publish surplus error:', err);
    }

    const mealsCount = Number(newSurplus.meals) || 25;
    const newSurplusLog = {
      id: `prod-surplus-${Date.now()}`,
      date: `Today (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      menu: newSurplus.title,
      p: mealsCount + 35,
      s: 35,
      sur: mealsCount,
      w: Number((mealsCount * 0.04).toFixed(1)),
      prepared: mealsCount + 35,
      served: 35,
      surplus: mealsCount,
      waste: Number((mealsCount * 0.04).toFixed(1)),
      status: 'Surplus Queue Active',
      isSurplus: true,
      surplusId: backendRes?.id || createdDispatch.surplusId,
    };
    setProductionLogs((prev) => {
      const next = [newSurplusLog, ...prev];
      try {
        localStorage.setItem('messwise_production_logs', JSON.stringify(next));
      } catch {}
      return next;
    });

    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('messwise-surplus-channel');
        bc.postMessage({
          type: 'SURPLUS_PUBLISHED',
          dish: {
            id: backendRes?.id || createdDispatch.surplusId,
            title: newSurplus.title,
            meals: Number(newSurplus.meals) || 25,
            hostel: createdDispatch.hostel,
            location_detail: newSurplus.location_detail || 'Hostel A Central Mess, Dispatch Bay 2',
            pickup_deadline: newSurplus.pickup_deadline || '5:00 PM',
            status: 'Published',
            temp_celsius: 68,
            dietary: 'Vegetarian',
            pickup_otp: backendRes?.pickup_otp || '8294'
          }
        });
        bc.close();
      }
    } catch {}

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setActiveTab('production');
    }, 1200);
  };

  const handleVerifyOtpSubmit = async (requestId, otp) => {
    const req = ngoRequests.find((r) => r.id === requestId);
    if (!req) return;
    if (req.otp !== otp.trim()) {
      alert('Incorrect OTP! Verification failed.');
      return;
    }
    setNgoRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'Collected' } : r))
    );
    try {
      await adminApi.verifyHandover(requestId, otp);
    } catch {}
    alert(`Successfully verified! ${req.meals} meals handed over for redistribution.`);
    setSelectedHandoverReq(null);
  };

  return (
    <div className="portal-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="portal-main">
        {/* Header */}
        <header className="portal-header">
          <div className="header-title">
            <h1>Mess Operations Management</h1>
            <p>
              {adminStats.mess_name} • Supervisor {adminStats.supervisor} • {adminStats.date}
            </p>
          </div>

          <div className="header-actions">
            <span className="badge badge-success">
              <CheckCircle2 size={13} /> Kitchen Online
            </span>
            <button 
              className={`btn ${activeTab === 'greenroute' ? 'btn-primary' : 'btn-secondary'} btn-sm`} 
              onClick={() => setActiveTab('greenroute')}
            >
              <Bike size={14} /> GreenRoute Fleet
            </button>
            <button className="btn btn-warm btn-sm" onClick={() => setActiveTab('surplus')}>
              <Sparkles size={14} /> Broadcast Surplus
            </button>

            {isAuthenticated ? (
              <button
                onClick={async () => {
                  await authApi.logout();
                  setIsAuthenticated(false);
                }}
                className="btn btn-secondary btn-sm"
              >
                <LogOut size={14} /> Log Out
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn btn-primary btn-sm"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}
          </div>
        </header>

        {/* Tab 1: Operations Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Operational Summary KPI Strip */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Prepared Batch</div>
                  <div className="kpi-value">{adminStats.today_stats.prepared} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Thalis</span></div>
                  <div className="kpi-meta">Lunch cycle (~353 kg food total)</div>
                </div>
                <div className="kpi-icon brand">
                  <ChefHat size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Meals Served</div>
                  <div className="kpi-value">{adminStats.today_stats.served} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Thalis</span></div>
                  <div className="kpi-meta">Student turnout (~343 kg eaten)</div>
                </div>
                <div className="kpi-icon brand">
                  <Check size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Available Surplus</div>
                  <div className="kpi-value">{adminStats.today_stats.surplus} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Thalis</span></div>
                  <div className="kpi-meta">Rescue batch (~10.5 kg to NGO)</div>
                </div>
                <div className="kpi-icon warm">
                  <Sparkles size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Plate Waste</div>
                  <div className="kpi-value">{adminStats.today_stats.waste} kg</div>
                  <div className="kpi-meta">0.7% prep ratio (Safe limit &lt;15 kg)</div>
                </div>
                <div className="kpi-icon">
                  <Trash2 size={18} />
                </div>
              </div>

              <div className="kpi-card" onClick={() => setActiveTab('uco')} style={{ cursor: 'pointer', border: '1px solid #bbf7d0', background: 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)' }}>
                <div>
                  <div className="kpi-label" style={{ color: '#166534' }}>Used Cooking Oil</div>
                  <div className="kpi-value" style={{ color: '#15803d' }}>Recycling Active</div>
                  <div className="kpi-meta" style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    Track collection &amp; CO₂e avoided <ArrowUpRight size={12} />
                  </div>
                </div>
                <div className="kpi-icon" style={{ backgroundColor: '#dcfce7', color: '#15803d' }}>
                  <Droplets size={18} />
                </div>
              </div>
            </div>

            {/* Demand Forecast & Kitchen Calibration */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <TrendingUp size={16} />
                  <span>Demand Forecast Recommendation ({aiPrediction.target_date})</span>
                </div>
                <span className="badge badge-success">
                  {aiPrediction.confidence_percent}% Confidence
                </span>
              </div>

              <div className="panel-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Expected Attendance</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0.2rem 0' }}>{aiPrediction.expected_demand}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Based on historical & RSVP patterns</div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--brand-50)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--brand-100)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-900)', fontWeight: 600, textTransform: 'uppercase' }}>Recommended Preparation</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--brand-900)', margin: '0.2rem 0' }}>{aiPrediction.recommended_cook}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--brand-700)' }}>Includes +{aiPrediction.buffer_margin_percent}% safety buffer</div>
                  </div>

                  <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Waste Over-Prep Risk</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-text)', margin: '0.2rem 0' }}>{aiPrediction.waste_risk}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Within optimal target threshold</div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Model Calibration Factors:
                  </div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {aiPrediction.insights?.map((ins, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--brand-900)' }} />
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Batch Production Logger */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <ChefHat size={16} />
                  <span>Daily Batch Production & Wastage Logger</span>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Lunch Session Records
                </span>
              </div>

              <div className="panel-body">
                {prodSuccess && (
                  <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--success-bg)',
                    border: '1px solid var(--success-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--success-text)',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}>
                    <Check size={16} /> Production log recorded into kitchen audit database.
                  </div>
                )}

                <form onSubmit={handleSaveProduction}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Meals Prepared (Portions)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={prepQty}
                        onChange={(e) => setPrepQty(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Meals Served (Turnout)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={servQty}
                        onChange={(e) => setServQty(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Calculated Surplus</label>
                      <input
                        type="text"
                        className="form-control"
                        value={`${leftover} Portions`}
                        disabled
                        style={{ backgroundColor: 'var(--bg-canvas-subtle)', fontWeight: 600 }}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Plate Waste (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        value={wasteQty}
                        onChange={(e) => setWasteQty(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <ChefHat size={14} /> Record Batch Production
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Active NGO Handover Verification Queue */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-header-title">
                  <Truck size={16} />
                  <span>Active NGO Pickup & Handover Requests</span>
                </div>
                <span className="badge badge-neutral">
                  {ngoRequests.length} Active Records
                </span>
              </div>

              <div className="table-container">
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Food Batch</th>
                      <th>Quantity</th>
                      <th>Volunteer Driver</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ngoRequests.map((req) => (
                      <tr key={req.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: '0.82rem' }}>{req.id}</td>
                        <td style={{ fontWeight: 600 }}>{req.food_title}</td>
                        <td>{req.meals} Meals</td>
                        <td>{req.volunteer_name}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{req.vehicle}</td>
                        <td>
                          <span className={`badge ${req.status === 'Collected' ? 'badge-success' : req.status === 'Approved' ? 'badge-info' : 'badge-warning'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="text-right">
                          {req.status !== 'Collected' ? (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => setSelectedHandoverReq(req)}
                            >
                              <ShieldCheck size={13} /> Verify OTP
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.78rem', color: 'var(--success-text)', fontWeight: 600 }}>
                              ✓ Collected
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated GreenRoute Quick-Commerce Fleet Tab */}
        {activeTab === 'greenroute' && (
          <div>
            <GreenRouteTracker 
              ngoRequests={ngoRequests}
              onHandoverSuccess={(disp) => {
                setAdminStats((prev) => ({
                  ...prev,
                  today_stats: {
                    ...prev.today_stats,
                    surplus: Math.max(0, prev.today_stats.surplus - disp.portions),
                  }
                }));
                setNgoRequests((prev) =>
                  prev.map((r) =>
                    (r.surplus_id === disp.surplusId || r.id === disp.id || r.otp === disp.otp)
                      ? { ...r, status: 'Collected' }
                      : r
                  )
                );
              }}
            />
          </div>
        )}

        {/* Tab 2: Batch Production Details */}
        {activeTab === 'production' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <ChefHat size={16} />
                <span>Kitchen Production History & Leftover Calibrations</span>
              </div>
              <span className="badge badge-neutral">
                {allProductionLogs.length} Records Active
              </span>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Date & Session</th>
                    <th>Menu / Dish Item</th>
                    <th className="text-right">Prepared</th>
                    <th className="text-right">Served</th>
                    <th className="text-right">Surplus</th>
                    <th className="text-right">Waste (kg)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allProductionLogs.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td style={{ fontWeight: 600 }}>{row.date}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600 }}>{row.menu}</span>
                          {row.isSurplus && (
                            <span className="badge badge-warning" style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                              Surplus Food Queue
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">{row.prepared ?? row.p}</td>
                      <td className="text-right">{row.served ?? row.s}</td>
                      <td className="text-right" style={{ color: 'var(--accent-warm)', fontWeight: 700 }}>
                        {row.surplus ?? row.sur} Portions
                      </td>
                      <td className="text-right">{row.waste ?? row.w}</td>
                      <td>
                        <span className={`badge ${row.status === 'Completed' ? 'badge-success' : row.status === 'Surplus Queue Active' ? 'badge-warning' : 'badge-info'}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Stock Health & Perishable Inventory Optimization */}
        {activeTab === 'stock' && (
          <div>
            {/* Action & Status Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Perishable Stock & Shelf-Life Analytics
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
                  Demand-Linked FIFO Tracker • Spoilage Risk Mitigation • Procurement Optimizer
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <button className="btn btn-secondary btn-sm" onClick={loadStockData}>
                  <RefreshCw size={14} /> Refresh
                </button>
                <button className="btn btn-warm btn-sm" onClick={() => setShowAddItemModal(true)}>
                  <PlusCircle size={14} /> + Add Meal / Vegetable
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddBatchModal(true)}>
                  <PlusCircle size={14} /> Record Inward Batch
                </button>
              </div>
            </div>

            {stockActionMsg && (
              <div style={{
                padding: '0.75rem 1rem',
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
                <Check size={16} /> {stockActionMsg}
              </div>
            )}

            {/* 4 KPI Strip Cards */}
            <div className="kpi-strip">
              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Active Stock Value</div>
                  <div className="kpi-value">₹{stockSummary?.total_inventory_value_inr ? Number(stockSummary.total_inventory_value_inr).toLocaleString() : '31,225'}</div>
                  <div className="kpi-meta">{stockItems.length || 6} Ingredients tracked</div>
                </div>
                <div className="kpi-icon brand">
                  <Boxes size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Projected Waste Risk</div>
                  <div className="kpi-value">{stockSummary?.projected_waste_risk_kg || 0} kg</div>
                  <div className="kpi-meta">₹{stockSummary?.projected_waste_cost_inr || 0} • {stockSummary?.projected_waste_co2_kg || 0} kg CO₂e</div>
                </div>
                <div className="kpi-icon warm">
                  <AlertTriangle size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Procurement Reduction</div>
                  <div className="kpi-value">{stockSummary?.suggested_order_reductions_kg || 0} kg</div>
                  <div className="kpi-meta">Save ₹{stockSummary?.suggested_procurement_savings_inr || 0} via overstock curb</div>
                </div>
                <div className="kpi-icon brand">
                  <ArrowDownRight size={18} />
                </div>
              </div>

              <div className="kpi-card">
                <div>
                  <div className="kpi-label">Critical Alerts</div>
                  <div className="kpi-value">
                    {(stockSummary?.critical_alerts_count || 0) + (stockSummary?.warning_alerts_count || 0)}
                  </div>
                  <div className="kpi-meta">{stockSummary?.critical_alerts_count || 0} Critical • {stockSummary?.warning_alerts_count || 0} Expiring Soon</div>
                </div>
                <div className="kpi-icon warm">
                  <Clock size={18} />
                </div>
              </div>
            </div>

            {/* Critical Alert Banners */}
            {stockSummary?.critical_alerts && stockSummary.critical_alerts.length > 0 && (
              <div className="panel" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #ea580c' }}>
                <div className="panel-header" style={{ padding: '0.75rem 1.25rem' }}>
                  <div className="panel-header-title">
                    <AlertTriangle size={16} color="#ea580c" />
                    <span style={{ fontWeight: 600 }}>Active Shelf-Life & Overstock Warnings</span>
                  </div>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {stockSummary.critical_alerts.slice(0, 3).map((alert, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: alert.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      border: `1px solid ${alert.severity === 'CRITICAL' ? '#fecaca' : '#fde68a'}`
                    }}>
                      <div>
                        <strong>{alert.title}:</strong> {alert.message}
                      </div>
                      <span className={`badge ${alert.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                        {alert.remaining_days}d left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Perishable Stock Allocation & Rescue Hub (Connected to Student & NGO Portals) */}
            <div className="panel" style={{ marginBottom: '1.25rem' }}>
              <div className="panel-header" style={{ padding: '0.85rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div className="panel-header-title">
                    <Clock size={16} />
                    <span>Perishable Stock Allocation & Surplus Dispatch Hub</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className="badge badge-warning">
                      {addonRecommendations.length} Batches Near Shelf-Life Threshold (&le; 3 Days)
                    </span>
                    <span className="badge badge-neutral">
                      Connected: Student & NGO Portals
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem 1.25rem' }}>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  Perishable batches approaching safe consumption cutoff. Prevent loss by adding items to the <strong>Student Portal Menu</strong> as daily zero-waste specials, or broadcast surplus portions directly to the <strong>NGO Logistics Network</strong> for immediate verified pickup.
                </p>

                {addonRecommendations.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--success-text)', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-subtle)' }}>
                    <CheckCircle2 size={24} style={{ marginBottom: '0.5rem' }} />
                    <div>All perishable stock is currently well within safe shelf-life horizons.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1rem' }}>
                    {addonRecommendations.map((rec) => {
                      const isAct = rec.is_already_published || activeAddons.some(a => a.ingredient_id === rec.ingredient_id);
                      const isBroadcastedNgo = broadcastedNgoIds.includes(rec.ingredient_id);
                      const activeItem = activeAddons.find(a => a.ingredient_id === rec.ingredient_id);
                      const claimedCount = activeItem ? activeItem.portions_claimed : 142;
                      const targetCount = rec.potential_portions || 250;
                      const pct = Math.min(100, Math.round((claimedCount / targetCount) * 100));
                      const isPublishingStudent = publishingAddonId === `${rec.ingredient_id}-lunch` || publishingAddonId === `${rec.ingredient_id}-dinner`;
                      const isPublishingNgo = publishingAddonId === `${rec.ingredient_id}-ngo`;

                      return (
                        <div key={rec.ingredient_id} style={{
                          background: 'var(--bg-surface)',
                          border: isAct ? '1.5px solid var(--brand-700)' : isBroadcastedNgo ? '1.5px solid var(--accent-warm)' : '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: 'var(--shadow-sm)'
                        }}>
                          <div>
                            {/* Header Tag Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                              <div>
                                <span className={`badge ${rec.earliest_expiry_days <= 2 ? 'badge-danger' : 'badge-warning'}`} style={{ marginBottom: '0.25rem' }}>
                                  ⚠️ {rec.expiring_qty} {rec.unit} expiring in {rec.earliest_expiry_days} {rec.earliest_expiry_days === 1 ? 'day' : 'days'}
                                </span>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  Batch Item: {rec.ingredient_name.toUpperCase()} ({rec.category.toUpperCase()})
                                </div>
                              </div>

                              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                                {isAct && (
                                  <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                                    <Check size={12} /> Live on Student Menu
                                  </span>
                                )}
                                {isBroadcastedNgo && (
                                  <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
                                    <Truck size={12} /> Broadcasted to NGO
                                  </span>
                                )}
                                {!isAct && !isBroadcastedNgo && (
                                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>
                                    Action Required
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Dish Title & Description */}
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                              {rec.recommended_dish_name}
                            </div>
                            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '0.85rem' }}>
                              {rec.description}
                            </div>

                            {/* Impact Metrics Grid */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, 1fr)',
                              gap: '0.4rem',
                              background: 'var(--bg-canvas-subtle)',
                              padding: '0.65rem 0.5rem',
                              borderRadius: 'var(--radius-sm)',
                              marginBottom: '0.85rem',
                              border: '1px solid var(--border-subtle)'
                            }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Portions</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>{rec.potential_portions}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Prevented</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--success-text)' }}>{rec.waste_prevented_kg} kg</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Value</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>₹{rec.cost_savings_inr}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Eco Points</div>
                                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-800)' }}>+{rec.eco_points}</div>
                              </div>
                            </div>

                            {/* Student Claim Progress bar if active */}
                            {isAct && (
                              <div style={{ marginBottom: '0.85rem', padding: '0.5rem 0.75rem', background: 'var(--bg-canvas-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.25rem' }}>
                                  <span>Student Claims: {claimedCount} / {targetCount}</span>
                                  <span>{pct}% Consumed</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand-800)', transition: 'width 0.4s ease' }} />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Connected Action Buttons: Student Menu OR NGO Rescue Network */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                              <span>Push to Meal Session:</span>
                              {isAct && <span style={{ color: '#16a34a', fontWeight: 700 }}>✓ Live on Menu</span>}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
                              {[
                                { id: 'breakfast', label: 'Brkfast' },
                                { id: 'lunch', label: 'Lunch' },
                                { id: 'snacks', label: 'Snacks' },
                                { id: 'dinner', label: 'Dinner' },
                              ].map((sess) => {
                                const isThisPublishing = publishingAddonId === `${rec.ingredient_id}-${sess.id}`;
                                const isThisActive = activeAddons.some(a => a.ingredient_id === rec.ingredient_id && a.meal_session === sess.id);
                                return (
                                  <button
                                    key={sess.id}
                                    className={`btn btn-sm ${isThisActive ? 'btn-primary' : 'btn-secondary'}`}
                                    style={{ fontSize: '0.72rem', padding: '0.35rem 0.2rem', whiteSpace: 'nowrap', justifyContent: 'center' }}
                                    disabled={Boolean(publishingAddonId)}
                                    onClick={() => handlePublishAddon(rec, sess.id)}
                                    title={`Push ${rec.recommended_dish_name} to student ${sess.id} menu`}
                                  >
                                    {isThisPublishing ? <RefreshCw size={11} className="spin" /> : sess.label}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              className={`btn btn-sm ${isBroadcastedNgo ? 'btn-secondary' : 'btn-warm'}`}
                              style={{ width: '100%', fontSize: '0.78rem' }}
                              disabled={isPublishingNgo}
                              onClick={() => handleBroadcastToNgo(rec)}
                            >
                              {isPublishingNgo ? (
                                <RefreshCw size={12} className="spin" />
                              ) : isBroadcastedNgo ? (
                                <>
                                  <Check size={13} /> Re-broadcast to NGO Network
                                </>
                              ) : (
                                <>
                                  Broadcast to NGO Food Rescue
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Split View: Perishables Ledger + Detail Deep-Dive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>

              {/* Left: Inventory List */}
              <div className="panel">
                <div className="panel-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="panel-header-title">
                      <Boxes size={16} />
                      <span>Tracked Perishable Inventory & Meals</span>
                    </div>
                    <button
                      className="btn btn-warm btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}
                      onClick={() => setShowAddItemModal(true)}
                    >
                      + Add Item
                    </button>
                  </div>

                  {/* Category Filter Pills */}
                  <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                    {[
                      { id: 'all', label: `All (${stockItems.length})` },
                      { id: 'vegetable', label: `Vegetables (${stockItems.filter(i => i.category === 'vegetable').length})` },
                      { id: 'meal', label: `Cooked Meals (${stockItems.filter(i => i.category === 'meal').length})` },
                      { id: 'dairy', label: `Dairy & Other (${stockItems.filter(i => i.category !== 'vegetable' && i.category !== 'meal').length})` }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setStockFilterCategory(tab.id)}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          border: '1px solid',
                          borderColor: stockFilterCategory === tab.id ? 'var(--brand-800)' : 'var(--border-subtle)',
                          background: stockFilterCategory === tab.id ? 'var(--brand-800)' : 'var(--bg-surface)',
                          color: stockFilterCategory === tab.id ? '#ffffff' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="table-container">
                  <table className="saas-table">
                    <thead>
                      <tr>
                        <th>Item / Dish</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Daily Use</th>
                        <th className="text-right">Days Left</th>
                        <th>Risk</th>
                        <th className="text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockItems
                        .filter(item => {
                          if (stockFilterCategory === 'all') return true;
                          if (stockFilterCategory === 'vegetable') return item.category === 'vegetable';
                          if (stockFilterCategory === 'meal') return item.category === 'meal';
                          return item.category !== 'vegetable' && item.category !== 'meal';
                        })
                        .map((item) => (
                        <tr
                          key={item.ingredient_id}
                          style={{
                            background: selectedIngredientId === item.ingredient_id ? 'var(--brand-50)' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedIngredientId(item.ingredient_id)}
                        >
                          <td style={{ fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <span>{item.name}</span>
                              <span
                                className={`badge ${item.category === 'meal' ? 'badge-info' : item.category === 'dairy' ? 'badge-warning' : 'badge-neutral'}`}
                                style={{ fontSize: '0.62rem', padding: '0.1rem 0.35rem' }}
                              >
                                {item.category?.toUpperCase() || 'VEG'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>₹{item.cost_per_kg}/{item.unit}</div>
                          </td>
                          <td className="text-right" style={{ fontWeight: 600 }}>
                            {item.total_stock} {item.unit}
                          </td>
                          <td className="text-right">{item.avg_daily_usage} {item.unit}</td>
                          <td className="text-right" style={{
                            fontWeight: 700,
                            color: item.days_of_stock_left <= 2 ? 'var(--danger-text)' : item.days_of_stock_left > 10 ? 'var(--warning-text)' : 'var(--text-primary)'
                          }}>
                            {item.days_of_stock_left}d
                          </td>
                          <td>
                            <span className={`badge ${
                              item.overstock_risk === 'high' ? 'badge-danger' : item.overstock_risk === 'medium' ? 'badge-warning' : 'badge-success'
                            }`}>
                              {item.overstock_risk.toUpperCase()}
                            </span>
                          </td>
                          <td className="text-right">
                            <button
                              className={`btn btn-sm ${selectedIngredientId === item.ingredient_id ? 'btn-primary' : 'btn-secondary'}`}
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedIngredientId(item.ingredient_id);
                              }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right: Ingredient Detail & FIFO Optimizer */}
              {(() => {
                const currentItem = stockItems.find((i) => i.ingredient_id === selectedIngredientId) || stockItems[0];
                if (!currentItem) return null;

                return (
                  <div className="panel">
                    <div className="panel-header">
                      <div className="panel-header-title">
                        <TrendingUp size={16} />
                        <span>Demand Optimization: {currentItem.name}</span>
                      </div>
                      <span className={`badge ${currentItem.overstock_risk === 'high' ? 'badge-danger' : currentItem.overstock_risk === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                        {currentItem.days_of_stock_left} Days Inventory
                      </span>
                    </div>

                    <div className="panel-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {/* Linked Forecast Stats */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '0.75rem',
                        background: 'var(--bg-canvas-subtle)',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>7-Day Need (Forecast)</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--brand-900)' }}>
                            {currentItem.predicted_usage_7d} {currentItem.unit}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Current Usable Stock</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {currentItem.total_stock} {currentItem.unit}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expected Waste</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: currentItem.waste_risk_kg > 0 ? 'var(--danger-text)' : 'var(--success-text)' }}>
                            {currentItem.waste_risk_kg} {currentItem.unit}
                          </div>
                        </div>
                      </div>

                      {/* Procurement Recommendation Banner */}
                      <div style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-sm)',
                        background: currentItem.days_of_stock_left > 7 ? 'var(--accent-warm-subtle)' : 'var(--brand-50)',
                        border: `1px solid ${currentItem.days_of_stock_left > 7 ? 'var(--accent-warm-border)' : 'var(--brand-100)'}`
                      }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: currentItem.days_of_stock_left > 7 ? 'var(--accent-warm)' : 'var(--brand-900)', marginBottom: '0.25rem' }}>
                          Procurement Advisory (+10% Safety Buffer)
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {currentItem.days_of_stock_left > 7 ? (
                            <span>
                              <strong>Overstock Alert:</strong> Current stock covers {currentItem.days_of_stock_left} days. Recommendation: <strong>Skip procurement</strong> to prevent ₹{currentItem.waste_risk_cost_inr} spoilage loss.
                            </span>
                          ) : (
                            <span>
                              Recommended Order: <strong>{Math.max(0, Math.round((currentItem.predicted_usage_7d * 1.1) - currentItem.total_stock))} {currentItem.unit}</strong> to sustain upcoming demand.
                            </span>
                          )}
                        </div>
                      </div>

                      {/* FIFO Batch Tracker Table */}
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                          FIFO Batch Breakdown (Oldest First)
                        </div>
                        <div className="table-container">
                          <table className="saas-table" style={{ fontSize: '0.78rem' }}>
                            <thead>
                              <tr>
                                <th>Batch ID</th>
                                <th className="text-right">Qty</th>
                                <th>Received</th>
                                <th>Expiry</th>
                                <th className="text-right">Days Left</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentItem.batches && currentItem.batches.map((b) => (
                                <tr key={b.batch_id}>
                                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{b.batch_id}</td>
                                  <td className="text-right" style={{ fontWeight: 600 }}>{b.qty} {currentItem.unit}</td>
                                  <td>{b.received_date}</td>
                                  <td>{b.expiry_date}</td>
                                  <td className="text-right">
                                    <span className={`badge ${b.remaining_days <= 3 ? 'badge-danger' : b.remaining_days <= 7 ? 'badge-warning' : 'badge-success'}`}>
                                      {b.remaining_days}d
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Interactive FIFO Usage Deduction */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.9rem', marginTop: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem', flexWrap: 'wrap', gap: '0.35rem' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            Log Kitchen Usage (FIFO Deduction)
                          </div>
                          {currentItem.batches && currentItem.batches.length > 0 && currentItem.batches[0] && (
                            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                              Next Batch: {currentItem.batches[0].batch_id} ({currentItem.batches[0].remaining_days}d left)
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 0.65rem 0', lineHeight: 1.45 }}>
                          Deducts consumed kitchen stock from the <strong>earliest expiring batch first</strong> (FEFO/FIFO). Exhausts older batches before touching fresher stock to minimize spoilage risk.
                        </p>

                        {/* Quick amount presets */}
                        <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>Quick Presets:</span>
                          {[5, 10, 20].map(amt => (
                            <button
                              key={amt}
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                              onClick={() => setDeductInput(amt)}
                            >
                              {amt} {currentItem.unit}
                            </button>
                          ))}
                          {currentItem.batches && currentItem.batches[0] && currentItem.batches[0].qty > 0 && (
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}
                              onClick={() => setDeductInput(currentItem.batches[0].qty)}
                            >
                              Exhaust Oldest Batch ({currentItem.batches[0].qty} {currentItem.unit})
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              max={currentItem.total_stock}
                              value={deductInput}
                              onChange={(e) => setDeductInput(e.target.value)}
                              className="form-control"
                              style={{ maxWidth: '120px' }}
                            />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>
                              {currentItem.unit}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="btn btn-warm btn-sm"
                            style={{ padding: '0.45rem 0.95rem', fontWeight: 600 }}
                            disabled={currentItem.total_stock <= 0 || !deductInput || Number(deductInput) <= 0}
                            onClick={() => handleDeductUsage(currentItem.ingredient_id)}
                          >
                            <ArrowDownRight size={14} /> Deduct from FIFO Queue
                          </button>
                        </div>

                        {/* Live Audit Breakdown of last deduction */}
                        {lastDeductionAudit && lastDeductionAudit.ingredient_id === currentItem.ingredient_id && (
                          <div style={{
                            marginTop: '0.85rem',
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: 'var(--radius-sm)',
                            padding: '0.75rem 0.95rem',
                            fontSize: '0.8rem',
                            color: '#14532d'
                          }}>
                            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.35rem' }}>
                              <CheckCircle2 size={15} color="#16a34a" /> {lastDeductionAudit.message}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '1.25rem' }}>
                              {lastDeductionAudit.batches_affected?.map((b, idx) => (
                                <div key={idx} style={{ color: '#166534', fontSize: '0.77rem' }}>
                                  • Batch <strong>{b.batch_id}</strong> (exp {b.expiry_date}): Deducted <strong>{b.deducted_qty} {currentItem.unit}</strong> {b.exhausted ? '➔ (✓ Exhausted!)' : `➔ (${b.remaining_qty} ${currentItem.unit} left)`}
                                </div>
                              ))}
                            </div>
                            <div style={{ marginTop: '0.35rem', fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
                              Updated remaining stock: {lastDeductionAudit.remaining_total_stock} {currentItem.unit}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Tab 3: Demand Forecasting & ML Scenario Intelligence */}
        {activeTab === 'forecast' && (
          <DemandForecastIntelligence />
        )}

        {/* Tab 4: Surplus Broadcast */}
        {activeTab === 'surplus' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <Sparkles size={16} />
                <span>Broadcast Fresh Food Surplus to NGO Shelter Network</span>
              </div>
            </div>

            <div className="panel-body">
              {publishSuccess && (
                <div style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--success-bg)',
                  border: '1px solid var(--success-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--success-text)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <Check size={16} /> Surplus batch published. Verified NGOs notified for dispatch.
                </div>
              )}

              <form onSubmit={handlePublishSurplus}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Food Dish / Item Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.title}
                      onChange={(e) => setNewSurplus({ ...newSurplus, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Available Portions (Meals)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={newSurplus.meals}
                      onChange={(e) => setNewSurplus({ ...newSurplus, meals: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pickup Location Detail</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.location_detail}
                      onChange={(e) => setNewSurplus({ ...newSurplus, location_detail: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Pickup Deadline</label>
                    <input
                      type="text"
                      className="form-control"
                      value={newSurplus.pickup_deadline}
                      onChange={(e) => setNewSurplus({ ...newSurplus, pickup_deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveTab('dashboard')}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-warm btn-sm">
                    <Sparkles size={14} /> Publish Surplus Batch
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 5: Handover Records */}
        {activeTab === 'handovers' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <ShieldCheck size={16} />
                <span>Completed Food Handover & Audit Log</span>
              </div>
            </div>

            <div className="table-container">
              <table className="saas-table">
                <thead>
                  <tr>
                    <th>Request Ref</th>
                    <th>Food Item</th>
                    <th>Quantity</th>
                    <th>Partner Organization</th>
                    <th>Pickup Volunteer</th>
                    <th>OTP Code</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngoRequests.map((req) => (
                    <tr key={req.id}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{req.id}</td>
                      <td style={{ fontWeight: 600 }}>{req.food_title}</td>
                      <td>{req.meals} Meals</td>
                      <td>Helping Hands NGO</td>
                      <td>{req.volunteer_name} ({req.vehicle})</td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--brand-900)' }}>{req.otp}</td>
                      <td>
                        <span className={`badge ${req.status === 'Collected' ? 'badge-success' : 'badge-warning'}`}>
                          {req.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Student Eco Leaderboard */}
        {activeTab === 'leaderboard' && (
          <EcoLeaderboard />
        )}

        {/* Tab: Student Preferences */}
        {activeTab === 'preferences' && (
          <AdminPreferenceManager onMenuOptimized={loadStockData} />
        )}

        {/* Tab: Daily Menu Operations */}
        {activeTab === 'menu' && (
          <div>
            <AdminPreferenceManager onMenuOptimized={loadStockData} />
            <DailyMenuManager onMenuPushed={loadStockData} />
          </div>
        )}

        {/* Tab: Used Cooking Oil Management & Carbon Footprint */}
        {activeTab === 'uco' && (
          <UcoManagement />
        )}

        {/* Tab: Comprehensive Admin Analytics & Sustainability Intelligence Dashboard */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

      </main>

      <HandoverModal
        isOpen={Boolean(selectedHandoverReq)}
        onClose={() => setSelectedHandoverReq(null)}
        request={selectedHandoverReq}
        onVerify={handleVerifyOtpSubmit}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={(user) => {
          setIsAuthenticated(true);
          if (user?.name) setAdminStats((prev) => ({ ...prev, supervisor: user.name }));
          adminApi.getStats().then((res) => {
            if (res) setAdminStats(res);
          });
        }}
      />

      {/* Modal: Record Inward Perishable Batch */}
      {showAddBatchModal && (
        <div className="modal-backdrop" onClick={() => setShowAddBatchModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3>Record Inward Perishable Batch</h3>
              <button className="modal-close-btn" onClick={() => setShowAddBatchModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddBatchSubmit} style={{ padding: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Ingredient</label>
                <select
                  className="form-control"
                  value={batchFormData.ingredient_id}
                  onChange={(e) => setBatchFormData({ ...batchFormData, ingredient_id: e.target.value })}
                >
                  <option value="onion">Onion (Nashik Red)</option>
                  <option value="tomato">Tomato (Hybrid)</option>
                  <option value="potato">Potato (Pahari)</option>
                  <option value="paneer">Fresh Dairy Paneer</option>
                  <option value="green_peas">Green Peas</option>
                  <option value="milk">Full Cream Milk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Batch Quantity (kg or L)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={batchFormData.qty}
                  onChange={(e) => setBatchFormData({ ...batchFormData, qty: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Received Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={batchFormData.received_date}
                  onChange={(e) => setBatchFormData({ ...batchFormData, received_date: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shelf Life (Days)</label>
                <input
                  type="number"
                  className="form-control"
                  value={batchFormData.shelf_life_days}
                  onChange={(e) => setBatchFormData({ ...batchFormData, shelf_life_days: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Cost per Unit (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  value={batchFormData.cost_per_kg}
                  onChange={(e) => setBatchFormData({ ...batchFormData, cost_per_kg: Number(e.target.value) })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddBatchModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Save Inward Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Register New Meal or Vegetable Stock Item */}
      {showAddItemModal && (
        <div className="modal-backdrop" onClick={() => setShowAddItemModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Add Stock Item: Vegetable or Cooked Meal</h3>
              <button className="modal-close-btn" onClick={() => setShowAddItemModal(false)}>×</button>
            </div>
            <form onSubmit={handleAddItemSubmit} style={{ padding: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Item Category</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${itemFormData.category === 'vegetable' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setItemFormData({
                      ...itemFormData,
                      category: 'vegetable',
                      unit: 'kg',
                      consumption_per_meal: 0.045,
                      shelf_life_days: 7,
                      cost_per_unit: 35
                    })}
                  >
                    Raw Vegetable
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${itemFormData.category === 'meal' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setItemFormData({
                      ...itemFormData,
                      category: 'meal',
                      unit: 'portions',
                      consumption_per_meal: 0.85,
                      shelf_life_days: 1,
                      cost_per_unit: 40
                    })}
                  >
                    Prepared Meal / Curry
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Item / Dish Name</label>
                <input
                  type="text"
                  placeholder={itemFormData.category === 'meal' ? "e.g. Paneer Butter Masala, Cooked Dal" : "e.g. Fresh Cauliflower, Capsicum"}
                  className="form-control"
                  value={itemFormData.name}
                  onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Measurement Unit</label>
                  <select
                    className="form-control"
                    value={itemFormData.unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit: e.target.value })}
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="portions">portions (Plate Servings)</option>
                    <option value="L">L (Liters)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {itemFormData.category === 'meal' ? "Serving (portions/diner)" : "Consumption (kg/meal)"}
                  </label>
                  <input
                    type="number"
                    step="0.005"
                    className="form-control"
                    value={itemFormData.consumption_per_meal}
                    onChange={(e) => setItemFormData({ ...itemFormData, consumption_per_meal: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Safe Shelf Life (Days)</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control"
                    value={itemFormData.shelf_life_days}
                    onChange={(e) => setItemFormData({ ...itemFormData, shelf_life_days: Number(e.target.value) })}
                    required
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {itemFormData.category === 'meal' ? 'Cooked meals: 1 day (24h) window' : 'Perishables: 4-14 days'}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Cost per {itemFormData.unit} (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={itemFormData.cost_per_unit}
                    onChange={(e) => setItemFormData({ ...itemFormData, cost_per_unit: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Initial Stock to Log</label>
                  <input
                    type="number"
                    step="0.5"
                    className="form-control"
                    value={itemFormData.initial_qty}
                    onChange={(e) => setItemFormData({ ...itemFormData, initial_qty: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Received / Cooked Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={itemFormData.received_date}
                    onChange={(e) => setItemFormData({ ...itemFormData, received_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.65rem', marginTop: '1.25rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAddItemModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-warm btn-sm">
                  Add to Inventory Engine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

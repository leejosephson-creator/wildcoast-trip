'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronRight, ChevronDown, Check, Circle, Phone, Calendar, Home, Package, List, BookOpen,
  Sparkles, X, Send, Loader2, MessageCircle, WifiOff, DollarSign, Calculator, AlertTriangle,
  Languages, User, Save, Trash2, PhoneCall, MapPin, Plane, Cloud, Share2, Copy, Navigation,
  ExternalLink, BookText, Heart, Target, Plus, Star, Clock
} from 'lucide-react';

// Bump this version number any time you push an app update.
// Users will see an "Update available" banner when their cached version doesn't match.
const APP_VERSION = '2026.04.24.1';

const storage = {
  get: (key) => {
    if (typeof window === 'undefined') return null;
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
  },
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }
};

export default function TripApp() {
  const [activeTab, setActiveTab] = useState('home');
  const [expandedDay, setExpandedDay] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});
  const [notes, setNotes] = useState({});
  const [reservations, setReservations] = useState({});
  const [bigFive, setBigFive] = useState({});
  const [flights, setFlights] = useState({});
  const [journal, setJournal] = useState({});
  const [memories, setMemories] = useState([]);
  const [missionProgress, setMissionProgress] = useState({});
  const [weatherCache, setWeatherCache] = useState({});
  const [weatherFetching, setWeatherFetching] = useState({});
  const [daysUntil, setDaysUntil] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [kidMode, setKidMode] = useState(false);
  const [showCalc, setShowCalc] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showPhrases, setShowPhrases] = useState(false);
  const [showReservationEdit, setShowReservationEdit] = useState(null);
  const [showMaps, setShowMaps] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showFlights, setShowFlights] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showFlightEdit, setShowFlightEdit] = useState(null);
  const [showJournal, setShowJournal] = useState(false);
  const [showJournalEdit, setShowJournalEdit] = useState(null);
  const [showMemories, setShowMemories] = useState(false);
  const [showMemoryAdd, setShowMemoryAdd] = useState(false);
  const [showMissions, setShowMissions] = useState(false);
  const [packingFilter, setPackingFilter] = useState('all');
  const [copiedShare, setCopiedShare] = useState(false);
  const [mapFilter, setMapFilter] = useState('all');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  // Force-reload the page, bypassing all caches. This is the nuclear refresh.
  const forceUpdate = () => {
    if (typeof window === 'undefined') return;
    // Add a cache-buster query string so the server sends fresh HTML
    const url = new URL(window.location.href);
    url.searchParams.set('v', Date.now().toString());
    window.location.href = url.toString();
  };

  // Check for updates by fetching the page with no-cache and reading the version
  const checkForUpdate = async (silent = false) => {
    if (typeof window === 'undefined' || !navigator.onLine) return;
    if (!silent) setCheckingUpdate(true);
    try {
      const res = await fetch(window.location.origin + '/?v=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const text = await res.text();
      // Look for the version string in the HTML
      const match = text.match(/APP_VERSION\s*=\s*['"]([^'"]+)['"]/);
      if (match && match[1] && match[1] !== APP_VERSION) {
        setUpdateAvailable(true);
      }
    } catch (e) {
      // Silent fail - we don't want to bother user if check fails
    } finally {
      if (!silent) setCheckingUpdate(false);
    }
  };

  // Auto-check for updates when the app mounts and when it becomes visible again
  useEffect(() => {
    if (typeof window === 'undefined') return;
    checkForUpdate(true);
    const onVisible = () => { if (document.visibilityState === 'visible') checkForUpdate(true); };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const TRIP_START = new Date('2026-05-31T17:00:00');
  const TRIP_END = new Date('2026-06-15T23:59:00');
  const today = new Date();
  const isDuringTrip = today >= TRIP_START && today <= TRIP_END;
  const tripDayIndex = isDuringTrip ? Math.floor((today - TRIP_START) / (1000 * 60 * 60 * 24)) : null;

  useEffect(() => {
    const k = ['checkedItems','notes','reservations','bigFive','flights','journal','memories','missionProgress','weatherCache'];
    const s = { checkedItems: setCheckedItems, notes: setNotes, reservations: setReservations, bigFive: setBigFive, flights: setFlights, journal: setJournal, memories: setMemories, missionProgress: setMissionProgress, weatherCache: setWeatherCache };
    k.forEach(key => { const v = storage.get(key); if (v) s[key](v); });
  }, []);

  useEffect(() => {
    const update = () => setDaysUntil(Math.max(0, Math.ceil((TRIP_START - new Date()) / (1000 * 60 * 60 * 24))));
    update();
    const t = setInterval(update, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    setIsOnline(navigator.onLine);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  const toggleCheck = (id) => { const next = { ...checkedItems, [id]: !checkedItems[id] }; setCheckedItems(next); storage.set('checkedItems', next); };
  const updateNote = (id, value) => { const next = { ...notes, [id]: value }; setNotes(next); storage.set('notes', next); };
  const saveReservation = (data) => { const next = { ...reservations, [data.id]: data }; setReservations(next); storage.set('reservations', next); };
  const deleteReservation = (id) => { const next = { ...reservations }; delete next[id]; setReservations(next); storage.set('reservations', next); };
  const saveFlight = (data) => { const next = { ...flights, [data.id]: data }; setFlights(next); storage.set('flights', next); };
  const deleteFlight = (id) => { const next = { ...flights }; delete next[id]; setFlights(next); storage.set('flights', next); };
  const toggleBigFive = (a) => { const next = { ...bigFive, [a]: bigFive[a] ? null : new Date().toISOString() }; setBigFive(next); storage.set('bigFive', next); };
  const saveJournalEntry = (dayNum, data) => { const next = { ...journal, [dayNum]: { ...data, updated: new Date().toISOString() } }; setJournal(next); storage.set('journal', next); };
  const addMemory = (m) => { const next = [...memories, { ...m, id: Date.now(), createdAt: new Date().toISOString() }]; setMemories(next); storage.set('memories', next); };
  const deleteMemory = (id) => { const next = memories.filter(m => m.id !== id); setMemories(next); storage.set('memories', next); };
  const toggleMission = (id) => { const next = { ...missionProgress, [id]: !missionProgress[id] }; setMissionProgress(next); storage.set('missionProgress', next); };

  const weatherLocations = [
    { id: 'capetown', name: 'Cape Town', icon: '🏖️', lat: -33.9249, lng: 18.4241, season: 'Winter', tempRange: 'H 62-65°F / L 47-52°F', typical: 'Wet season. Windy.' },
    { id: 'hoedspruit', name: 'Kruger (Hoedspruit)', icon: '🦁', lat: -24.3485, lng: 31.0494, season: 'Dry winter', tempRange: 'H 75-78°F / L 40-45°F', typical: 'Cold mornings, warm days.' },
    { id: 'johannesburg', name: 'Johannesburg', icon: '🏙️', lat: -26.2041, lng: 28.0473, season: 'Dry winter', tempRange: 'H 62-65°F / L 38-42°F', typical: 'High altitude. Clear and dry.' },
    { id: 'atlanta', name: 'Atlanta (layover)', icon: '✈️', lat: 33.7490, lng: -84.3880, season: 'Late spring', tempRange: 'H 82-86°F / L 64-68°F', typical: 'Warm, humid, possible storms.' }
  ];

  const fetchLiveWeather = async (loc) => {
    if (!isOnline) {
      const next = { ...weatherCache, [loc.id]: { error: 'Offline. Connect to data and try again.', fetched: new Date().toISOString() } };
      setWeatherCache(next);
      return;
    }
    setWeatherFetching(prev => ({ ...prev, [loc.id]: true }));
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto&forecast_days=7`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data?.current || !data?.daily) throw new Error('Bad data shape');
      const next = { ...weatherCache, [loc.id]: { live: data, fetched: new Date().toISOString() } };
      setWeatherCache(next);
      storage.set('weatherCache', next);
    } catch (err) {
      const next = { ...weatherCache, [loc.id]: { error: err.message || 'Fetch failed', fetched: new Date().toISOString() } };
      setWeatherCache(next);
    } finally {
      setWeatherFetching(prev => ({ ...prev, [loc.id]: false }));
    }
  };

  const fetchAllWeather = async () => { for (const loc of weatherLocations) await fetchLiveWeather(loc); };

  const wEmoji = (code) => {
    if (code === 0) return '☀️';
    if (code <= 3) return '⛅';
    if (code <= 48) return '🌫️';
    if (code <= 67) return '🌧️';
    if (code <= 77) return '🌨️';
    if (code <= 82) return '🌦️';
    if (code >= 95) return '⛈️';
    return '☁️';
  };
  const wText = (code) => {
    if (code === 0) return 'Clear';
    if (code <= 3) return 'Partly cloudy';
    if (code <= 48) return 'Foggy';
    if (code <= 57) return 'Drizzle';
    if (code <= 67) return 'Rain';
    if (code <= 77) return 'Snow';
    if (code <= 82) return 'Showers';
    if (code >= 95) return 'Storm';
    return 'Cloudy';
  };

  const [calcZAR, setCalcZAR] = useState('');
  const [calcUSD, setCalcUSD] = useState('');
  const [tipPct, setTipPct] = useState(10);
  const RATE = 18;
  const handleZARChange = (v) => { setCalcZAR(v); setCalcUSD(v ? (parseFloat(v) / RATE).toFixed(2) : ''); };
  const handleUSDChange = (v) => { setCalcUSD(v); setCalcZAR(v ? (parseFloat(v) * RATE).toFixed(2) : ''); };
  const tipAmountZAR = calcZAR ? (parseFloat(calcZAR) * tipPct / 100).toFixed(2) : '0';
  const tipAmountUSD = calcZAR ? ((parseFloat(calcZAR) * tipPct / 100) / RATE).toFixed(2) : '0';

  const missions = [
    { id: 'm1', daysBefore: 60, title: 'Book safari lodge (3 nights)', detail: 'Sabi Sabi, MalaMala, Singita. Sells out for June.', category: 'critical' },
    { id: 'm2', daysBefore: 60, title: 'Book CPT to JNB to HDS flights', detail: 'Or charter direct from JNB to lodge airstrip.', category: 'critical' },
    { id: 'm3', daysBefore: 45, title: 'Book MIA to ATL flight (May 31)', detail: 'Must arrive ATL by 7pm to make Delta 210.', category: 'critical' },
    { id: 'm4', daysBefore: 45, title: 'Book shark cage diving (June 8)', detail: 'Marine Dynamics or White Shark Projects.', category: 'critical' },
    { id: 'm5', daysBefore: 42, title: 'Travel doctor', detail: 'Malarone prescription. Vaccines.', category: 'health' },
    { id: 'm6', daysBefore: 30, title: 'Travel insurance', detail: 'Min $100k medical + $500k evacuation.', category: 'logistics' },
    { id: 'm7', daysBefore: 30, title: 'Reserve Chefs Warehouse Beau Constantia', detail: 'June 10 dinner.', category: 'logistics' },
    { id: 'm8', daysBefore: 21, title: 'Book Robben Island ferry (June 6)', detail: 'Morning departure.', category: 'logistics' },
    { id: 'm9', daysBefore: 21, title: 'Reserve Cape Town rental car', detail: 'AUTOMATIC. Jun 2-11.', category: 'logistics' },
    { id: 'm10', daysBefore: 21, title: 'Book Atlantis Dunes sandboarding', detail: 'June 9.', category: 'logistics' },
    { id: 'm11', daysBefore: 14, title: 'Check passports', detail: 'Valid 30+ days past June 15. 2 blank pages.', category: 'critical' },
    { id: 'm12', daysBefore: 14, title: 'Son birth certificate', detail: 'Unabridged. Notarized consent letter.', category: 'critical' },
    { id: 'm13', daysBefore: 14, title: 'Buy safari clothing', detail: 'Khaki/olive/brown. NO bright colors.', category: 'packing' },
    { id: 'm14', daysBefore: 10, title: 'Notify banks', detail: 'Or cards freeze.', category: 'logistics' },
    { id: 'm15', daysBefore: 10, title: 'International Driving Permit', detail: 'AAA, $20.', category: 'logistics' },
    { id: 'm16', daysBefore: 7, title: 'Download offline content', detail: '14h flight!', category: 'packing' },
    { id: 'm17', daysBefore: 7, title: 'Charge power banks', detail: 'Type M adapter packed.', category: 'packing' },
    { id: 'm18', daysBefore: 5, title: 'Start malaria meds', detail: 'Malarone with food.', category: 'health' },
    { id: 'm19', daysBefore: 3, title: 'Confirm reservations', detail: 'All flights, lodge, dinners.', category: 'logistics' },
    { id: 'm20', daysBefore: 2, title: 'Print confirmations', detail: 'Phone dies. Paper does not.', category: 'logistics' },
    { id: 'm21', daysBefore: 1, title: 'Pack carry-on', detail: 'Passports, meds, change of clothes.', category: 'packing' },
    { id: 'm22', daysBefore: 0, title: 'DEPARTURE DAY', detail: 'MIA 2 hrs early. ATL lounge.', category: 'critical' }
  ];

  const getDueMissions = () => {
    if (daysUntil === 0 && !isDuringTrip) return missions.filter(m => m.daysBefore === 0);
    if (isDuringTrip) return [];
    return missions.filter(m => m.daysBefore >= daysUntil - 2 && m.daysBefore <= daysUntil + 2 && !missionProgress[m.id]);
  };
  const missionCategoryColor = (cat) => {
    if (cat === 'critical') return { bg: 'bg-rose-950', border: 'border-rose-800', text: 'text-rose-300', label: 'Critical' };
    if (cat === 'health') return { bg: 'bg-emerald-950', border: 'border-emerald-800', text: 'text-emerald-300', label: 'Health' };
    if (cat === 'logistics') return { bg: 'bg-amber-950', border: 'border-amber-800', text: 'text-amber-300', label: 'Logistics' };
    return { bg: 'bg-sky-950', border: 'border-sky-800', text: 'text-sky-300', label: 'Packing' };
  };

  const days = [
    { num: 0, date: 'Sun, May 31', title: 'MIA to ATL', icon: '✈️', color: 'from-slate-700 to-slate-900', summary: 'Miami to Atlanta layover',
      sections: [
        { title: 'Pre-flight', items: ['Arrive MIA 2 hrs early', 'Passports + birth certificate', 'Carry-on essentials'] },
        { title: 'ATL layover', items: ['Land at ATL', 'Find Delta 210 gate', 'Platinum lounge access', 'Light dinner', '9:00 PM: Delta 210 to Cape Town'] }
      ]},
    { num: 1, date: 'Mon, June 1', title: 'Fly to Cape Town', icon: '🛫', color: 'from-slate-800 to-slate-600', summary: 'Delta 210 overnight to CPT',
      sections: [
        { title: 'On the plane', items: ['Business class lie-flat', 'Hydrate', 'Melatonin after first meal', 'Set watch to SA time (+6 hrs)', 'Try to sleep 6+ hrs'] },
        { title: 'For son', items: ['Offline content downloaded', 'iPad games + movies', 'Headphones', 'Snacks'] }
      ]},
    { num: 2, date: 'Tue, June 2', title: 'Arrive Cape Town', icon: '🏖️', color: 'from-orange-700 to-red-800', summary: 'Land 5:50pm',
      sections: [
        { title: 'Arrival', items: ['Customs', 'Pick up rental car', 'Drive to 9 Soluta St (~25 min)', 'Unpack'] },
        { title: 'Evening', items: ['Light dinner', 'Walk Sunset Beach', 'Bed early'] }
      ]},
    { num: 3, date: 'Wed, June 3', title: 'Beach + Recovery', icon: '🌅', color: 'from-amber-700 to-orange-800', summary: 'Slow first day',
      sections: [
        { title: 'Easy day', items: ['Sleep in', 'Coffee on the beach', 'Walk Sunset Beach'] },
        { title: 'Afternoon', items: ['Lunch at On The Rocks', 'Stop by uncle house'] },
        { title: 'Evening', items: ['Dinner at home', 'Game night', 'Early bed'] }
      ]},
    { num: 4, date: 'Thu, June 4', title: 'Table Mountain + V&A', icon: '⛰️', color: 'from-emerald-800 to-teal-900', summary: 'Cable car, aquarium',
      sections: [
        { title: 'Morning', items: ['Check cableway 7 AM', 'Book online', '2-3 hrs on top'] },
        { title: 'Afternoon', items: ['Tiger Milk for lunch', 'Two Oceans Aquarium', 'Grand Africa Cafe dinner'] }
      ]},
    { num: 5, date: 'Fri, June 5', title: 'Cape Point + Penguins', icon: '🐧', color: 'from-blue-900 to-indigo-900', summary: 'Chapman Peak, Boulders',
      sections: [
        { title: 'Drive south', items: ['8:30 AM depart', 'Via Hout Bay', 'Chapman Peak Drive'] },
        { title: 'Cape Point', items: ['Funicular or hike', 'WINDOWS UP - baboons', 'Two Oceans Restaurant lunch'] },
        { title: 'Boulders', items: ['Penguin colony', 'Boardwalks', 'R180pp'] }
      ]},
    { num: 6, date: 'Sat, June 6', title: 'Robben Island + Bo-Kaap', icon: '🏛️', color: 'from-purple-900 to-slate-800', summary: 'Mandela prison',
      sections: [
        { title: 'Robben Island', items: ['Ferry from V&A', '3.5 hrs', 'Ex-prisoners as guides'] },
        { title: 'Bo-Kaap', items: ['Bo-Kaap Kombuis lunch', 'Painted streets'] },
        { title: 'Sunset', items: ['Camps Bay', 'The Bungalow'] }
      ]},
    { num: 7, date: 'Sun, June 7', title: 'Family Braai', icon: '🔥', color: 'from-amber-800 to-orange-900', summary: 'Braai with family',
      sections: [
        { title: 'Morning', items: ['Sleep in', 'Pick n Pay run'] },
        { title: 'Braai', items: ['Uncle braai', 'Cousins meet son', 'Boerewors, lamb chops'] },
        { title: 'Wind-down', items: ['Beach walk', 'Early bed'] }
      ]},
    { num: 8, date: 'Mon, June 8', title: 'Shark Cage Diving', icon: '🦈', color: 'from-cyan-900 to-blue-950', summary: 'Gansbaai great whites',
      sections: [
        { title: 'Adventure', items: ['Drive to Gansbaai (2 hrs)', 'Marine Dynamics', 'Confirm 12yo allowed'] },
        { title: 'Bring', items: ['Seasickness meds BEFORE', 'Light breakfast only', 'Warm clothes', 'GoPro'] },
        { title: 'Return', items: ['Hermanus detour', 'Dinner back in Cape Town'] }
      ]},
    { num: 9, date: 'Tue, June 9', title: 'Atlantis Dunes', icon: '🏜️', color: 'from-yellow-700 to-amber-900', summary: 'Sandboarding',
      sections: [
        { title: 'Morning', items: ['Drive to Atlantis (~40 min)', 'Sandboard rental', 'Closed shoes', 'Goggles essential'] },
        { title: 'On dunes', items: ['Beginner runs first', 'Take video', 'Hydrate', '2-3 hrs'] },
        { title: 'Afternoon', items: ['Lunch nearby', 'Back to Sunset Beach', 'Wash sand out of everything'] }
      ]},
    { num: 10, date: 'Wed, June 10', title: 'Lions Head + Chefs Warehouse', icon: '🏔️', color: 'from-rose-900 to-orange-800', summary: 'Sunrise hike + dinner',
      sections: [
        { title: 'Sunrise hike', items: ['5:15 AM depart', '2hr round trip', 'Chains near top', 'Coffee on way home'] },
        { title: 'Recovery', items: ['Big breakfast', 'Nap', 'Sea Point Promenade'] },
        { title: 'Dinner', items: ['Chefs Warehouse Beau Constantia', 'RESERVATIONS', 'Smart-casual'] }
      ]},
    { num: 11, date: 'Thu, June 11', title: 'CPT to JNB to Kruger', icon: '🦒', color: 'from-yellow-800 to-amber-900', summary: 'Travel to safari',
      sections: [
        { title: 'Pack out', items: ['Safari neutrals', 'Warm jacket on top', 'Drop rental car at CPT'] },
        { title: 'Flights', items: ['CPT to JNB', 'Connect at JNB', 'JNB to HDS or charter', 'Lodge transfer'] },
        { title: 'Arrival', items: ['Welcome drink', 'Lodge orientation', 'First sunset drive', 'Boma dinner'] }
      ]},
    { num: 12, date: 'Fri, June 12', title: 'Kruger Day 2', icon: '🦁', color: 'from-yellow-900 to-orange-900', summary: 'Full safari rhythm',
      sections: [
        { title: 'Morning', items: ['5:30 AM coffee', '6 AM game drive', '9:30 AM bush breakfast'] },
        { title: 'Afternoon', items: ['12:30 brunch', 'Pool / nap', 'Optional bush walk'] },
        { title: 'Evening', items: ['4 PM sunset drive', 'Sundowners in bush', '7:30 boma dinner'] }
      ]},
    { num: 13, date: 'Sat, June 13', title: 'Kruger Day 3', icon: '🐆', color: 'from-stone-800 to-amber-950', summary: 'Final safari day',
      sections: [
        { title: 'Activities', items: ['Morning drive', 'Optional bush walk', 'Spa or pool'] },
        { title: 'Sunset', items: ['Last drive', 'Big farewell dinner'] },
        { title: 'Tipping (cash)', items: ['Ranger R250-300/day', 'Tracker R150-200/day', 'Staff R100/day'] }
      ]},
    { num: 14, date: 'Sun, June 14', title: 'Kruger to JNB to ATL', icon: '🛬', color: 'from-indigo-900 to-slate-900', summary: 'Final drive + Delta 201',
      sections: [
        { title: 'Morning', items: ['Final game drive', 'Farewell breakfast', 'Lodge transfer'] },
        { title: 'JNB', items: ['Long layover', 'Delta lounge', 'Dinner before boarding'] },
        { title: 'Delta 201', items: ['9:55 PM departure', 'Business class - sleep', '14h 19m to ATL'] }
      ]},
    { num: 15, date: 'Mon, June 15', title: 'ATL to MIA to Home', icon: '🏠', color: 'from-slate-700 to-slate-900', summary: 'Land 8:20am, home 1:04pm',
      sections: [
        { title: 'Arrival ATL', items: ['Land 8:20 AM', 'Customs', 'Recheck bags', 'Lounge breakfast'] },
        { title: 'Final flight', items: ['Delta 1332 - 11:00 AM', 'First class', 'Land MIA 1:04 PM'] },
        { title: 'Home', items: ['Pickup or rideshare', 'Unpack', 'Print favorite photos'] }
      ]}
  ];

  const packingCategories = {
    'Documents (carry-on)': { phase: 'all', items: ['Both passports', 'Son birth certificate (unabridged)', 'Notarized consent letter', 'Delta confirmations', 'Travel insurance', 'Lodge confirmation', 'IDP', 'Cards + cash (USD + ZAR)'] },
    'Health & meds': { phase: 'all', items: ['Malarone', 'Melatonin', 'Seasickness tablets', 'SPF 50+', 'DEET 30%+', 'First aid kit', 'Prescriptions'] },
    'Cape Town (9 days)': { phase: 'capetown', items: ['Warm jacket', 'Rain shell', 'Fleece', 'Long sleeves (3-4)', 'Jeans + warm pants', 'Closed shoes', 'Smart-casual outfit', 'Beanie + gloves'] },
    'Adventure gear': { phase: 'capetown', items: ['Quick-dry shorts', 'Closed shoes for dunes', 'Goggles', 'GoPro mount', 'Towel', 'Change of clothes'] },
    'Safari (NEUTRALS only)': { phase: 'kruger', items: ['Khaki/olive shirts (3-4)', 'Convertible pants', 'Insulated jacket', 'Fleece mid-layer', 'Thermal base', 'Beanie + gloves + buff', 'Walking shoes', 'Wide-brim hat', 'Binoculars'] },
    'Tech': { phase: 'all', items: ['Universal adapter (Type M)', 'Battery pack 10000mAh+', 'Camera + SD cards', 'Chargers', 'Headphones', 'iPad with offline', 'GoPro'] },
    'For son': { phase: 'all', items: ['Books / Kindle', 'Backpack', 'Snacks', 'Journal + pen', 'Offline games', 'Headphones', 'Comfort item'] }
  };
  const filteredPackingList = () => {
    if (packingFilter === 'all') return packingCategories;
    const out = {};
    Object.entries(packingCategories).forEach(([cat, obj]) => { if (obj.phase === 'all' || obj.phase === packingFilter) out[cat] = obj; });
    return out;
  };
  const packingFilters = [
    { id: 'all', label: 'Everything' },
    { id: 'capetown', label: '🏖️ Cape Town' },
    { id: 'kruger', label: '🦁 Kruger' }
  ];

  const bookings = [
    { id: 'b1', task: 'Book MIA to ATL flight (May 31)', urgent: true },
    { id: 'b2', task: 'ATL to CPT - DONE (DL210)', urgent: true },
    { id: 'b3', task: 'Book CPT to JNB to HDS (June 11)', urgent: true },
    { id: 'b4', task: 'Book safari lodge (3 nights)', urgent: true },
    { id: 'b5', task: 'JNB to ATL - DONE (DL201)', urgent: true },
    { id: 'b6', task: 'ATL to MIA - DONE (DL1332)', urgent: true },
    { id: 'b7', task: 'Book shark cage diving (June 8)', urgent: true },
    { id: 'b8', task: 'Travel doctor (malaria meds)', urgent: true },
    { id: 'b9', task: 'Book Robben Island ferry (June 6)', urgent: false },
    { id: 'b10', task: 'Book Table Mountain Cableway', urgent: false },
    { id: 'b11', task: 'Reserve Chefs Warehouse (June 10)', urgent: false },
    { id: 'b12', task: 'Book Atlantis Dunes sandboarding', urgent: false },
    { id: 'b13', task: 'Rental car Cape Town (Jun 2-11)', urgent: false },
    { id: 'b14', task: 'Travel insurance', urgent: false }
  ];

  const flightSlots = [
    { id: 'f1', label: 'MIA → ATL', route: 'Miami to Atlanta', date: 'May 31', preset: { airline: '', number: '', depart: 'MIA TBD', arrive: 'ATL TBD', confirmation: '' } },
    { id: 'f2', label: 'ATL → CPT', route: 'Atlanta to Cape Town', date: 'June 1', preset: { airline: 'Delta', number: 'DL210', depart: 'ATL 9:00 PM', arrive: 'CPT 5:50 PM (+1)', confirmation: '' } },
    { id: 'f3', label: 'CPT → JNB → HDS', route: 'Cape Town to Kruger', date: 'June 11', preset: { airline: '', number: '', depart: 'CPT TBD', arrive: 'HDS TBD', confirmation: '' } },
    { id: 'f4', label: 'JNB → ATL', route: 'Joburg to Atlanta', date: 'June 14', preset: { airline: 'Delta', number: 'DL201', depart: 'JNB 9:55 PM', arrive: 'ATL 8:20 AM (+1)', confirmation: '' } },
    { id: 'f5', label: 'ATL → MIA', route: 'Atlanta to Miami', date: 'June 15', preset: { airline: 'Delta', number: 'DL1332', depart: 'ATL 11:00 AM', arrive: 'MIA 1:04 PM', confirmation: '' } }
  ];
  const getFlightTrackUrl = (n) => n ? `https://www.google.com/search?q=${encodeURIComponent(n + ' flight status')}` : null;

  const emergencyByLocation = {
    capeTown: { label: 'Cape Town', contacts: [
      { label: 'Emergency (mobile)', value: '112', call: '112', urgent: true },
      { label: 'Police', value: '10111', call: '10111', urgent: true },
      { label: 'Ambulance', value: '10177', call: '10177', urgent: true },
      { label: 'Netcare 911', value: '082 911', call: '082911', urgent: true },
      { label: 'US Consulate CT', value: '+27 21 702 7300', call: '+27217027300' }
    ]},
    kruger: { label: 'Kruger', contacts: [
      { label: 'Emergency (mobile)', value: '112', call: '112', urgent: true },
      { label: 'Netcare 911 evac', value: '082 911', call: '082911', urgent: true },
      { label: 'LODGE RECEPTION', value: 'Add on arrival', call: null }
    ]},
    jnb: { label: 'Johannesburg', contacts: [
      { label: 'Emergency (mobile)', value: '112', call: '112', urgent: true },
      { label: 'Netcare 911', value: '082 911', call: '082911', urgent: true },
      { label: 'US Embassy Pretoria', value: '+27 12 431 4000', call: '+27124314000' }
    ]}
  };

  const phrases = [
    { category: 'Greetings', items: [
      { phrase: 'Hallo', meaning: 'Hello', notes: 'HAH-loh' },
      { phrase: 'Goeie môre', meaning: 'Good morning', notes: 'GOO-yah MOH-rer' },
      { phrase: 'Totsiens', meaning: 'Goodbye', notes: '' }
    ]},
    { category: 'Politeness', items: [
      { phrase: 'Asseblief', meaning: 'Please', notes: '' },
      { phrase: 'Dankie', meaning: 'Thank you', notes: 'DUN-key' },
      { phrase: 'Jammer', meaning: 'Sorry', notes: '' }
    ]},
    { category: 'Slang', items: [
      { phrase: 'Lekker', meaning: 'Nice/awesome', notes: '' },
      { phrase: 'Braai', meaning: 'BBQ', notes: '' },
      { phrase: 'Howzit', meaning: 'Hello', notes: '' }
    ]}
  ];

  const bigFiveAnimals = [
    { key: 'lion', emoji: '🦁', name: 'Lion' },
    { key: 'leopard', emoji: '🐆', name: 'Leopard' },
    { key: 'elephant', emoji: '🐘', name: 'Elephant' },
    { key: 'rhino', emoji: '🦏', name: 'Rhino' },
    { key: 'buffalo', emoji: '🐃', name: 'Buffalo' }
  ];
  const bonusAnimals = [
    { key: 'cheetah', emoji: '🐈', name: 'Cheetah' },
    { key: 'giraffe', emoji: '🦒', name: 'Giraffe' },
    { key: 'zebra', emoji: '🦓', name: 'Zebra' },
    { key: 'hippo', emoji: '🦛', name: 'Hippo' }
  ];

  const locations = [
    { id: 'momshouse', name: 'Mom House', address: '9 Soluta Street, Sunset Beach, Milnerton', category: 'home', icon: '🏠' },
    { id: 'mia', name: 'Miami International (MIA)', address: 'Miami, FL', category: 'airport', icon: '✈️' },
    { id: 'atl', name: 'Atlanta Hartsfield (ATL)', address: 'Atlanta, GA', category: 'airport', icon: '✈️' },
    { id: 'cpt', name: 'Cape Town Airport (CPT)', address: 'Cape Town', category: 'airport', icon: '✈️' },
    { id: 'tablemtn', name: 'Table Mountain', address: 'Tafelberg Rd, Cape Town', category: 'attraction', icon: '⛰️' },
    { id: 'vanda', name: 'V&A Waterfront', address: 'Cape Town', category: 'attraction', icon: '⚓' },
    { id: 'capepoint', name: 'Cape of Good Hope', address: 'Cape Point', category: 'attraction', icon: '🌊' },
    { id: 'boulders', name: 'Boulders Penguins', address: 'Simon Town', category: 'attraction', icon: '🐧' },
    { id: 'gansbaai', name: 'Gansbaai (sharks)', address: 'Kleinbaai Harbour', category: 'attraction', icon: '🦈' },
    { id: 'atlantisdunes', name: 'Atlantis Dunes', address: 'Atlantis, Western Cape', category: 'attraction', icon: '🏜️' },
    { id: 'lionshead', name: 'Lions Head', address: 'Signal Hill Rd, Cape Town', category: 'attraction', icon: '🏔️' },
    { id: 'chefswarehouse', name: 'Chefs Warehouse Beau Constantia', address: 'Constantia, Cape Town', category: 'dining', icon: '🍷' },
    { id: 'robben', name: 'Robben Island Ferry', address: 'V&A Waterfront', category: 'attraction', icon: '🏛️' },
    { id: 'bokaap', name: 'Bo-Kaap', address: 'Cape Town', category: 'attraction', icon: '🎨' },
    { id: 'hds', name: 'Hoedspruit Airport (HDS)', address: 'Hoedspruit', category: 'airport', icon: '✈️' },
    { id: 'jnb', name: 'OR Tambo (JNB)', address: 'Johannesburg', category: 'airport', icon: '✈️' }
  ];
  const locationCategories = [
    { id: 'all', label: 'All' },
    { id: 'airport', label: 'Airports' },
    { id: 'dining', label: 'Dining' },
    { id: 'attraction', label: 'Attractions' }
  ];
  const openInMaps = (loc) => {
    const q = encodeURIComponent(`${loc.name}, ${loc.address}`);
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (iOS) { window.open(`maps://?q=${q}`, '_system'); setTimeout(() => window.open(`https://maps.apple.com/?q=${q}`, '_blank'), 100); }
    else window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const TABS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'itinerary', label: 'Days', icon: Calendar },
    { id: 'packing', label: 'Pack', icon: Package },
    { id: 'booking', label: 'Book', icon: List },
    { id: 'info', label: 'Info', icon: BookOpen }
  ];

  const bookingProgress = bookings.filter(b => checkedItems[b.id]).length;
  const pkgList = filteredPackingList();
  const packingTotal = Object.values(pkgList).flatMap(o => o.items).length;
  const packingChecked = Object.entries(pkgList).flatMap(([cat, obj]) => obj.items.map((_, i) => `pack-${cat}-${i}`)).filter(id => checkedItems[id]).length;
  const bigFiveSeen = bigFiveAnimals.filter(a => bigFive[a.key]).length;
  const bonusSeen = bonusAnimals.filter(a => bigFive[a.key]).length;
  const currentDay = (tripDayIndex !== null && tripDayIndex < days.length) ? days[tripDayIndex] : null;
  const dueMissions = getDueMissions();
  const missionsCompleted = missions.filter(m => missionProgress[m.id]).length;
  const journalEntriesCount = Object.keys(journal).length;

  const getTodaysWeather = () => {
    if (!currentDay) return null;
    const map = { 0: 'atlanta', 1: 'atlanta', 2: 'capetown', 3: 'capetown', 4: 'capetown', 5: 'capetown', 6: 'capetown', 7: 'capetown', 8: 'capetown', 9: 'capetown', 10: 'capetown', 11: 'hoedspruit', 12: 'hoedspruit', 13: 'hoedspruit', 14: 'hoedspruit', 15: 'atlanta' };
    const locId = map[currentDay.num];
    const loc = weatherLocations.find(w => w.id === locId);
    if (!loc) return null;
    const cached = weatherCache[locId];
    return { location: loc.name, tempRange: loc.tempRange, locRef: loc, live: cached?.live };
  };
  const todaysWeather = getTodaysWeather();

  const getTodaysReservations = () => {
    if (!currentDay) return [];
    const kw = { 4: ['Table Mountain'], 6: ['Robben'], 8: ['shark'], 9: ['Atlantis'], 10: ['Chefs'], 11: ['lodge', 'HDS'] }[currentDay.num] || [];
    return Object.values(reservations).filter(r => kw.some(k => r.task?.toLowerCase().includes(k.toLowerCase())));
  };
  const todaysRez = getTodaysReservations();

  const generateShareText = () => {
    let text = `Dan & son trip schedule\nMay 31 - June 15, 2026\n\n`;
    days.forEach(d => { text += `${d.date}\n${d.title}\n${d.summary}\n\n`; });
    text += `Mom house: 9 Soluta Street, Sunset Beach, Milnerton\n`;
    return text;
  };
  const copyShareText = async () => {
    try { await navigator.clipboard.writeText(generateShareText()); setCopiedShare(true); setTimeout(() => setCopiedShare(false), 2000); } catch (e) {}
  };

  if (kidMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 text-white pb-20" style={{ fontFamily: 'ui-rounded, system-ui, sans-serif' }}>
        <div className="px-6 pt-10 pb-6 text-center">
          <div className="flex justify-between items-center mb-6">
            <div className="text-xs tracking-widest uppercase opacity-70">Explorer Mode</div>
            <button onClick={() => setKidMode(false)} className="bg-white bg-opacity-10 rounded-full px-3 py-1 text-xs font-semibold">Exit</button>
          </div>
          <div className="text-5xl mb-2">🦁</div>
          <h1 className="text-4xl font-bold mb-1">Hey Explorer!</h1>
          <p className="text-sm opacity-80">{isDuringTrip ? `Trip Day ${tripDayIndex + 1} of 16` : `${daysUntil} days until adventure`}</p>
        </div>
        <div className="px-4 mb-6">
          <div className="bg-black bg-opacity-30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Big Five Hunt</div>
              <div className="text-xl font-bold text-amber-300">{bigFiveSeen}/5</div>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {bigFiveAnimals.map(a => (
                <button key={a.key} onClick={() => toggleBigFive(a.key)} className={`aspect-square rounded-xl flex items-center justify-center text-3xl ${bigFive[a.key] ? 'bg-gradient-to-br from-amber-400 to-orange-500 scale-105 shadow-lg' : 'bg-white bg-opacity-10 opacity-50 grayscale'}`}>{a.emoji}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 mb-6">
          <div className="bg-black bg-opacity-30 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold">Bonus</div>
              <div className="text-xl font-bold text-amber-300">{bonusSeen}/{bonusAnimals.length}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {bonusAnimals.map(a => (
                <button key={a.key} onClick={() => toggleBigFive(a.key)} className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 text-2xl ${bigFive[a.key] ? 'bg-gradient-to-br from-emerald-400 to-teal-500 scale-105' : 'bg-white bg-opacity-10 opacity-50 grayscale'}`}>
                  <span>{a.emoji}</span><span className="text-[10px] font-semibold">{a.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black bg-opacity-50 backdrop-blur">
          <button onClick={() => setKidMode(false)} className="w-full bg-white text-purple-900 rounded-full py-3 font-bold">Back to Dad App</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 pb-20" style={{ fontFamily: 'ui-serif, Georgia, serif' }}>
      {updateAvailable && (
        <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-4 py-3 flex items-center gap-3 sticky top-0 z-40">
          <div className="text-xl">✨</div>
          <div className="flex-1">
            <div className="text-sm font-bold text-white">Update available</div>
            <div className="text-[11px] text-emerald-100 font-sans">Tap to get the latest version</div>
          </div>
          <button onClick={forceUpdate} className="bg-white text-emerald-800 rounded-full px-4 py-1.5 text-xs font-sans font-bold">Update</button>
        </div>
      )}
      {activeTab === 'home' && (
        <div>
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-900 via-rose-900 to-amber-950 px-6 pt-10 pb-8">
            <div className="text-amber-200 text-xs tracking-widest uppercase font-sans font-medium mb-3 opacity-70">Father & Son 2026</div>
            <h1 className="text-4xl font-bold leading-tight mb-1 italic">Miami to the<br/><span className="text-amber-300">Wild Coast</span></h1>
            <p className="text-amber-100 text-sm mt-4 font-sans opacity-70">May 31 — June 15</p>
            {isDuringTrip ? (
              <div className="mt-6">
                <div className="text-xs font-sans opacity-70 uppercase tracking-wider">Trip Day</div>
                <div className="flex items-end gap-3"><div className="text-7xl font-bold text-amber-200 leading-none">{tripDayIndex + 1}</div><div className="text-amber-100 text-sm pb-2 font-sans opacity-60">of 16</div></div>
              </div>
            ) : (
              <div className="mt-8 flex items-end gap-3"><div className="text-7xl font-bold text-amber-200 leading-none">{daysUntil}</div><div className="text-amber-100 text-sm pb-2 font-sans opacity-60">days<br/>to go</div></div>
            )}
          </div>

          {!isDuringTrip && dueMissions.length > 0 && (
            <div className="px-4 py-4">
              <button onClick={() => setShowMissions(true)} className="w-full bg-gradient-to-br from-rose-900 to-amber-900 rounded-xl p-5 border border-rose-700 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-rose-300 bg-opacity-20 rounded-full p-2"><Target size={18} className="text-rose-200" /></div>
                  <div className="flex-1">
                    <div className="font-bold text-rose-100">Missions Due This Week</div>
                    <div className="text-xs text-rose-200 opacity-80 font-sans">{dueMissions.length} tasks · {missionsCompleted}/{missions.length} done</div>
                  </div>
                  <ChevronRight size={18} className="text-rose-300" />
                </div>
                <div className="space-y-1 mt-3">
                  {dueMissions.slice(0, 3).map(m => (
                    <div key={m.id} className="text-sm text-rose-50 font-sans flex items-center gap-2">
                      <span className="text-rose-300">•</span> {m.title}
                    </div>
                  ))}
                </div>
              </button>
            </div>
          )}

          {currentDay && (
            <div className="px-4 py-4">
              <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-stone-900 rounded-xl border border-emerald-700 overflow-hidden">
                <div className="px-5 pt-4 pb-3">
                  <div className="text-xs tracking-widest uppercase text-emerald-300 font-sans font-semibold mb-2">Today Briefing</div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">{currentDay.icon}</div>
                    <div><div className="text-xl font-bold text-stone-50">{currentDay.title}</div><div className="text-sm text-stone-300 font-sans opacity-80">{currentDay.summary}</div></div>
                  </div>
                </div>
                {todaysWeather && (
                  <div className="px-5 py-3 border-t border-emerald-800 bg-black bg-opacity-20">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-xs text-emerald-300 font-sans opacity-80 uppercase tracking-wider font-semibold">Weather Today</div>
                      <button onClick={() => setShowWeather(true)} className="text-[10px] text-sky-300 font-sans font-semibold">Open weather →</button>
                    </div>
                    {todaysWeather.live ? (
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{wEmoji(todaysWeather.live.current.weather_code)}</div>
                        <div>
                          <div className="text-lg font-bold text-stone-50">{Math.round(todaysWeather.live.current.temperature_2m)}°F · {wText(todaysWeather.live.current.weather_code)}</div>
                          <div className="text-xs text-stone-400 font-sans">H {Math.round(todaysWeather.live.daily.temperature_2m_max[0])}° / L {Math.round(todaysWeather.live.daily.temperature_2m_min[0])}° · {Math.round(todaysWeather.live.current.wind_speed_10m)} mph</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-stone-100 font-sans">{todaysWeather.tempRange}</div>
                    )}
                  </div>
                )}
                <div className="flex border-t border-emerald-600">
                  <button onClick={() => { setActiveTab('itinerary'); setExpandedDay(currentDay.num); }} className="flex-1 bg-emerald-700 text-white py-3 text-sm font-sans font-semibold">Open plan</button>
                  <button onClick={() => setShowJournalEdit({ dayNum: currentDay.num, ...(journal[currentDay.num] || {}) })} className="flex-1 bg-emerald-800 text-white py-3 text-sm font-sans font-semibold border-l border-emerald-600">Journal today</button>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 py-2 grid grid-cols-4 gap-2">
            <button onClick={() => setShowMissions(true)} className="bg-gradient-to-br from-amber-900 to-rose-950 rounded-xl p-3 flex flex-col items-center gap-1 border border-amber-800"><Target size={20} className="text-amber-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-200">Missions</div></button>
            <button onClick={() => setShowJournal(true)} className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-indigo-800"><BookText size={20} className="text-indigo-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-indigo-200">Journal</div></button>
            <button onClick={() => setShowMemories(true)} className="bg-gradient-to-br from-pink-900 to-rose-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-pink-800"><Heart size={20} className="text-pink-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pink-200">Memories</div></button>
            <button onClick={() => setShowMaps(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><MapPin size={20} className="text-rose-400" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-rose-300">Maps</div></button>
            <button onClick={() => setShowWeather(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><Cloud size={20} className="text-sky-400" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-sky-300">Weather</div></button>
            <button onClick={() => setShowFlights(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><Plane size={20} className="text-indigo-400" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-indigo-300">Flights</div></button>
            <button onClick={() => setKidMode(true)} className="bg-gradient-to-br from-purple-800 to-pink-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-purple-700"><User size={20} className="text-pink-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pink-200">Kid Mode</div></button>
            <button onClick={() => setShowCalc(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><Calculator size={20} className="text-amber-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-200">Tip / FX</div></button>
            <button onClick={() => setShowPhrases(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><Languages size={20} className="text-teal-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-teal-200">Phrases</div></button>
            <button onClick={() => setShowShare(true)} className="bg-stone-900 rounded-xl p-3 flex flex-col items-center gap-1 border border-stone-800"><Share2 size={20} className="text-emerald-400" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-emerald-300">Share</div></button>
            <button onClick={() => setShowEmergency(true)} className="bg-gradient-to-br from-rose-900 to-red-950 rounded-xl p-3 flex flex-col items-center gap-1 border border-rose-800"><AlertTriangle size={20} className="text-rose-300" /><div className="text-[10px] font-sans font-semibold uppercase tracking-wider text-rose-200">SOS</div></button>
          </div>

          <div className="px-6 py-4 grid grid-cols-4 gap-2">
            <div className="bg-stone-900 rounded-lg p-2 border border-stone-800 text-center"><div className="text-xl font-bold text-amber-300">{missionsCompleted}/{missions.length}</div><div className="text-[10px] text-stone-400 mt-1 font-sans">Missions</div></div>
            <div className="bg-stone-900 rounded-lg p-2 border border-stone-800 text-center"><div className="text-xl font-bold text-emerald-400">{packingChecked}/{packingTotal}</div><div className="text-[10px] text-stone-400 mt-1 font-sans">Packed</div></div>
            <div className="bg-stone-900 rounded-lg p-2 border border-stone-800 text-center"><div className="text-xl font-bold text-indigo-400">{journalEntriesCount}</div><div className="text-[10px] text-stone-400 mt-1 font-sans">Journal</div></div>
            <div className="bg-stone-900 rounded-lg p-2 border border-stone-800 text-center"><div className="text-xl font-bold text-pink-400">{memories.length}</div><div className="text-[10px] text-stone-400 mt-1 font-sans">Memories</div></div>
          </div>
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div>
          <div className="px-6 pt-8 pb-4">
            <div className="text-xs tracking-widest uppercase text-stone-500 font-sans font-medium mb-1">Day-by-Day</div>
            <h2 className="text-3xl font-bold italic">The Journey</h2>
          </div>
          <div className="px-4 space-y-2">
            {days.map((day) => {
              const isToday = tripDayIndex === day.num;
              const hasJournal = !!journal[day.num];
              return (
                <div key={day.num} className={`bg-stone-900 rounded-xl overflow-hidden border ${isToday ? 'border-emerald-500 border-2' : 'border-stone-800'}`}>
                  <div onClick={() => setExpandedDay(expandedDay === day.num ? null : day.num)} className="cursor-pointer">
                    <div className={`bg-gradient-to-r ${day.color} px-4 py-4 flex items-center gap-3`}>
                      <div className="text-3xl">{day.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white font-sans opacity-70 flex items-center gap-2">
                          {day.date}
                          {isToday && <span className="bg-emerald-500 text-white px-1.5 rounded text-[10px] font-bold uppercase">Today</span>}
                          {hasJournal && <span className="bg-indigo-500 text-white px-1.5 rounded text-[10px] font-bold uppercase">Journal</span>}
                        </div>
                        <div className="font-bold text-white text-lg truncate">{day.title}</div>
                      </div>
                      {expandedDay === day.num ? <ChevronDown size={20} className="text-white opacity-80" /> : <ChevronRight size={20} className="text-white opacity-80" />}
                    </div>
                    {expandedDay !== day.num && <div className="px-4 py-3 text-sm text-stone-400 font-sans">{day.summary}</div>}
                  </div>
                  {expandedDay === day.num && (
                    <div className="px-4 py-4 space-y-5">
                      {day.sections.map((section, si) => (
                        <div key={si}>
                          <div className="text-xs tracking-widest uppercase text-amber-400 font-sans font-semibold mb-2">{section.title}</div>
                          <div className="space-y-2">
                            {section.items.map((item, ii) => {
                              const id = `day-${day.num}-${si}-${ii}`;
                              return (
                                <button key={ii} onClick={() => toggleCheck(id)} className="w-full flex items-start gap-3 text-left">
                                  {checkedItems[id] ? <Check size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <Circle size={18} className="text-stone-600 mt-0.5 flex-shrink-0" />}
                                  <span className={`text-sm font-sans leading-relaxed ${checkedItems[id] ? 'text-stone-500 line-through' : 'text-stone-200'}`}>{item}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                      <button onClick={() => setShowJournalEdit({ dayNum: day.num, ...(journal[day.num] || {}) })} className="w-full bg-indigo-900 border border-indigo-700 rounded-lg py-3 text-sm font-sans font-semibold text-indigo-100 flex items-center justify-center gap-2">
                        <BookText size={16} />{journal[day.num] ? 'Edit journal' : 'Add journal entry'}
                      </button>
                      <div>
                        <div className="text-xs tracking-widest uppercase text-amber-400 font-sans font-semibold mb-2">Quick Notes</div>
                        <textarea value={notes[`day-${day.num}`] || ''} onChange={(e) => updateNote(`day-${day.num}`, e.target.value)} placeholder="Times, thoughts..." className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-stone-200 font-sans focus:border-amber-700 focus:outline-none min-h-[80px]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'packing' && (
        <div>
          <div className="px-6 pt-8 pb-4">
            <div className="text-xs tracking-widest uppercase text-stone-500 font-sans font-medium mb-1">The Kit</div>
            <h2 className="text-3xl font-bold italic">Packing</h2>
            <div className="mt-3 bg-stone-900 rounded-lg h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-amber-500 h-full" style={{ width: `${packingTotal > 0 ? (packingChecked / packingTotal) * 100 : 0}%` }} />
            </div>
            <div className="text-xs text-stone-500 font-sans mt-2">{packingChecked} of {packingTotal} packed</div>
          </div>
          <div className="px-4 mb-4 flex gap-2 overflow-x-auto pb-2">
            {packingFilters.map(f => (
              <button key={f.id} onClick={() => setPackingFilter(f.id)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-sans font-semibold ${packingFilter === f.id ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-400'}`}>{f.label}</button>
            ))}
          </div>
          <div className="px-4 space-y-4">
            {Object.entries(pkgList).map(([category, obj]) => {
              const catChecked = obj.items.filter((_, i) => checkedItems[`pack-${category}-${i}`]).length;
              return (
                <div key={category} className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800">
                  <div className="px-4 py-3 bg-gradient-to-r from-stone-800 to-stone-900 border-b border-stone-800 flex items-center justify-between gap-2">
                    <div className="font-bold text-amber-200 flex-1">{category}</div>
                    <div className="text-xs text-stone-500 font-sans">{catChecked}/{obj.items.length}</div>
                  </div>
                  <div className="p-4 space-y-2">
                    {obj.items.map((item, i) => {
                      const id = `pack-${category}-${i}`;
                      return (
                        <button key={i} onClick={() => toggleCheck(id)} className="w-full flex items-start gap-3 text-left">
                          {checkedItems[id] ? <Check size={18} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <Circle size={18} className="text-stone-600 mt-0.5 flex-shrink-0" />}
                          <span className={`text-sm font-sans ${checkedItems[id] ? 'text-stone-500 line-through' : 'text-stone-200'}`}>{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'booking' && (
        <div>
          <div className="px-6 pt-8 pb-4">
            <div className="text-xs tracking-widest uppercase text-stone-500 font-sans font-medium mb-1">Lock It In</div>
            <h2 className="text-3xl font-bold italic">Bookings</h2>
            <div className="mt-3 bg-stone-900 rounded-lg h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-rose-500 to-amber-500 h-full" style={{ width: `${(bookingProgress / bookings.length) * 100}%` }} />
            </div>
            <div className="text-xs text-stone-500 font-sans mt-2">{bookingProgress} of {bookings.length} complete</div>
          </div>
          <div className="px-4">
            {['urgent', 'standard'].map(tier => (
              <div key={tier} className="mb-5">
                <div className={`text-xs tracking-widest uppercase font-sans font-semibold mb-2 px-2 ${tier === 'urgent' ? 'text-rose-400' : 'text-stone-400'}`}>{tier === 'urgent' ? 'Urgent' : 'Standard'}</div>
                <div className="space-y-2">
                  {bookings.filter(b => tier === 'urgent' ? b.urgent : !b.urgent).map((b) => {
                    const r = reservations[b.id];
                    return (
                      <div key={b.id} className={`rounded-lg border ${checkedItems[b.id] ? 'bg-stone-900 border-stone-800' : tier === 'urgent' ? 'bg-rose-950 border-rose-900' : 'bg-stone-900 border-stone-800'}`}>
                        <div className="flex items-start gap-3 p-4">
                          <button onClick={() => toggleCheck(b.id)} className="mt-0.5 flex-shrink-0">
                            {checkedItems[b.id] ? <Check size={20} className="text-emerald-400" /> : <Circle size={20} className={tier === 'urgent' ? 'text-rose-400' : 'text-stone-600'} />}
                          </button>
                          <div className="flex-1">
                            <span className={`text-sm font-sans ${checkedItems[b.id] ? 'text-stone-500 line-through' : tier === 'urgent' ? 'text-rose-50' : 'text-stone-200'}`}>{b.task}</span>
                            {r && (
                              <div className="mt-2 pt-2 border-t border-stone-800 space-y-1 text-xs font-sans">
                                {r.confirmation && <div className="text-amber-300">Conf: <span className="font-mono">{r.confirmation}</span></div>}
                                {r.phone && <a href={`tel:${r.phone.replace(/\s/g,'')}`} className="text-emerald-400 flex items-center gap-1"><Phone size={10} /> {r.phone}</a>}
                                {r.date && <div className="text-stone-400">{r.date}</div>}
                                {r.notes && <div className="text-stone-400 italic">{r.notes}</div>}
                              </div>
                            )}
                          </div>
                        </div>
                        <button onClick={() => setShowReservationEdit({ ...r, id: b.id, task: b.task })} className="w-full text-left px-4 py-2 border-t border-stone-800 text-xs text-stone-400 font-sans flex items-center gap-1">
                          <Save size={12} />{r ? 'Edit details' : 'Add details'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'info' && (
        <div>
          <div className="px-6 pt-8 pb-4">
            <div className="text-xs tracking-widest uppercase text-stone-500 font-sans font-medium mb-1">Need to Know</div>
            <h2 className="text-3xl font-bold italic">Essentials</h2>
          </div>
          <div className="px-4 space-y-3">
            {[
              { onClick: () => setShowMissions(true), icon: <Target size={22} className="text-amber-300" />, title: 'Countdown Missions', sub: `${missionsCompleted}/${missions.length} complete` },
              { onClick: () => setShowJournal(true), icon: <BookText size={22} className="text-indigo-300" />, title: 'Trip Journal', sub: `${journalEntriesCount} entries` },
              { onClick: () => setShowMemories(true), icon: <Heart size={22} className="text-pink-300" />, title: 'Favorite Memories', sub: `${memories.length} saved` },
              { onClick: () => setShowEmergency(true), icon: <AlertTriangle size={22} className="text-rose-300" />, title: 'Emergency SOS', sub: 'Location-aware', gradient: true },
              { onClick: () => setShowMaps(true), icon: <MapPin size={22} className="text-rose-400" />, title: 'Maps & Directions', sub: 'All locations' },
              { onClick: () => setShowWeather(true), icon: <Cloud size={22} className="text-sky-400" />, title: 'Weather', sub: 'Live + climate' },
              { onClick: () => setShowFlights(true), icon: <Plane size={22} className="text-indigo-400" />, title: 'Flight Tracker', sub: 'Save + track' },
              { onClick: () => setShowShare(true), icon: <Share2 size={22} className="text-emerald-400" />, title: 'Share with Mom', sub: 'Copy schedule' },
              { onClick: () => setShowCalc(true), icon: <Calculator size={22} className="text-amber-400" />, title: 'Currency & Tip', sub: 'ZAR / USD' },
              { onClick: () => setShowPhrases(true), icon: <Languages size={22} className="text-teal-400" />, title: 'Phrases', sub: 'Afrikaans' },
              { onClick: () => setKidMode(true), icon: <User size={22} className="text-pink-300" />, title: 'Kid Mode', sub: 'Big Five tracker', purple: true }
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} className={`w-full rounded-xl p-4 border text-left flex items-center gap-3 ${btn.gradient ? 'bg-gradient-to-br from-rose-800 to-red-950 border-rose-600' : btn.purple ? 'bg-gradient-to-br from-purple-900 to-pink-900 border-purple-700' : 'bg-stone-900 border-stone-800'}`}>
                {btn.icon}
                <div className="flex-1"><div className={`font-bold ${btn.gradient ? 'text-rose-100' : btn.purple ? 'text-pink-100' : 'text-stone-100'}`}>{btn.title}</div><div className={`text-xs font-sans ${btn.gradient ? 'text-rose-200' : btn.purple ? 'text-pink-200' : 'text-stone-400'}`}>{btn.sub}</div></div>
                <ChevronRight size={18} className={btn.gradient ? 'text-rose-300' : btn.purple ? 'text-pink-400' : 'text-stone-600'} />
              </button>
            ))}
          </div>
          <div className="px-4 mt-6 mb-4">
            <button onClick={async () => { await checkForUpdate(false); if (!updateAvailable) forceUpdate(); }} disabled={checkingUpdate} className="w-full bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center justify-center gap-2 text-sm font-sans text-stone-300 disabled:opacity-60">
              {checkingUpdate ? <><Loader2 size={16} className="animate-spin" /> Checking…</> : <>🔄 Force refresh app</>}
            </button>
            <div className="text-[10px] text-stone-600 font-sans text-center mt-2">Version {APP_VERSION}</div>
          </div>
        </div>
      )}

      {showWeather && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-sky-900 to-blue-900 px-4 py-4 flex items-center gap-3 border-b border-sky-800">
            <Cloud size={22} className="text-sky-200" />
            <div className="flex-1"><div className="font-bold text-sky-50 text-lg">Weather</div><div className="text-xs text-sky-200 font-sans">Live forecast</div></div>
            <button onClick={() => setShowWeather(false)} className="text-sky-100 p-2"><X size={22} /></button>
          </div>
          {isOnline && (
            <div className="px-4 py-3 bg-stone-900 border-b border-stone-800">
              <button onClick={fetchAllWeather} disabled={Object.values(weatherFetching).some(Boolean)} className="w-full bg-sky-700 disabled:bg-stone-800 disabled:text-stone-600 text-white font-sans font-semibold rounded-lg py-2.5 text-sm flex items-center justify-center gap-2">
                {Object.values(weatherFetching).some(Boolean) ? <><Loader2 size={16} className="animate-spin" /> Loading…</> : <>Refresh all locations</>}
              </button>
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {weatherLocations.map(loc => {
              const cached = weatherCache[loc.id];
              const isLoading = weatherFetching[loc.id];
              const live = cached?.live;
              return (
                <div key={loc.id} className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
                  <div className="bg-gradient-to-r from-sky-950 to-stone-900 px-4 py-3 border-b border-stone-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="text-2xl">{loc.icon}</div>
                      <div className="font-bold text-sky-100 text-lg truncate">{loc.name}</div>
                    </div>
                    <button onClick={() => fetchLiveWeather(loc)} disabled={!isOnline || isLoading} className="text-xs bg-sky-700 disabled:bg-stone-800 disabled:text-stone-600 text-white font-sans font-semibold rounded-full px-3 py-1.5 flex items-center gap-1 flex-shrink-0">
                      {isLoading ? <><Loader2 size={12} className="animate-spin" /> Loading</> : live ? 'Refresh' : 'Get live'}
                    </button>
                  </div>
                  <div className="p-4 space-y-3">
                    {live && (
                      <>
                        <div className="flex items-center gap-4">
                          <div className="text-6xl">{wEmoji(live.current.weather_code)}</div>
                          <div>
                            <div className="text-5xl font-bold text-sky-50">{Math.round(live.current.temperature_2m)}°F</div>
                            <div className="text-sm text-sky-200 font-sans">{wText(live.current.weather_code)}</div>
                            <div className="text-xs text-sky-400 font-sans mt-1">{Math.round(live.current.wind_speed_10m)} mph · {live.current.relative_humidity_2m}%</div>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-stone-800">
                          <div className="grid grid-cols-7 gap-1">
                            {live.daily.weather_code.slice(0, 7).map((code, i) => {
                              const date = new Date(Date.now() + i * 86400000);
                              return (
                                <div key={i} className="text-center">
                                  <div className="text-[10px] text-sky-400 font-sans font-semibold">{i === 0 ? 'Now' : date.toLocaleDateString('en', { weekday: 'short' }).slice(0,3)}</div>
                                  <div className="text-xl my-1">{wEmoji(code)}</div>
                                  <div className="text-[11px] text-sky-100 font-sans font-semibold">{Math.round(live.daily.temperature_2m_max[i])}°</div>
                                  <div className="text-[10px] text-sky-500 font-sans">{Math.round(live.daily.temperature_2m_min[i])}°</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="text-[10px] text-stone-500 font-sans text-right">Updated {new Date(cached.fetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </>
                    )}
                    {cached?.error && (
                      <div className="bg-rose-950 border border-rose-800 rounded-lg p-3">
                        <div className="text-xs text-rose-300 font-sans">{cached.error}</div>
                      </div>
                    )}
                    {!live && !cached?.error && (
                      <div className="text-center py-6 text-xs text-stone-500 font-sans">Tap Get live for current forecast</div>
                    )}
                    <div className="text-[11px] text-stone-500 font-sans italic border-t border-stone-800 pt-2">
                      June typical: {loc.tempRange} · {loc.season.toLowerCase()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showMissions && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-amber-900 to-rose-900 px-4 py-4 flex items-center gap-3 border-b border-amber-800">
            <Target size={22} className="text-amber-200" />
            <div className="flex-1"><div className="font-bold text-amber-50 text-lg">Missions</div><div className="text-xs text-amber-200 font-sans">{missionsCompleted}/{missions.length} · {daysUntil} days</div></div>
            <button onClick={() => setShowMissions(false)} className="text-amber-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {['critical', 'health', 'logistics', 'packing'].map(cat => {
              const catMissions = missions.filter(m => m.category === cat);
              if (catMissions.length === 0) return null;
              const c = missionCategoryColor(cat);
              return (
                <div key={cat}>
                  <div className={`text-xs tracking-widest uppercase font-sans font-semibold mb-2 px-1 ${c.text}`}>{c.label}</div>
                  <div className="space-y-2">
                    {catMissions.map(m => {
                      const done = missionProgress[m.id];
                      const isDueSoon = !done && m.daysBefore >= daysUntil - 2 && m.daysBefore <= daysUntil + 2;
                      const isPast = !done && m.daysBefore > daysUntil + 2;
                      return (
                        <div key={m.id} className={`rounded-lg border overflow-hidden ${done ? 'bg-stone-900 border-stone-800 opacity-60' : isDueSoon ? `${c.bg} ${c.border}` : 'bg-stone-900 border-stone-800'}`}>
                          <button onClick={() => toggleMission(m.id)} className="w-full p-4 flex items-start gap-3 text-left">
                            {done ? <Check size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" /> : <Circle size={20} className={`${isDueSoon ? c.text : 'text-stone-600'} mt-0.5 flex-shrink-0`} />}
                            <div className="flex-1 min-w-0">
                              <div className={`font-semibold text-sm ${done ? 'text-stone-500 line-through' : 'text-stone-100'}`}>{m.title}</div>
                              <div className="text-xs text-stone-400 font-sans mt-1">{m.detail}</div>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock size={10} className="text-stone-500" />
                                <span className={`text-[11px] font-sans ${isDueSoon ? c.text : isPast ? 'text-rose-400' : 'text-stone-500'}`}>
                                  {m.daysBefore === 0 ? 'Day of trip' : `${m.daysBefore} days before`}
                                  {isDueSoon && !done && ' · DUE NOW'}
                                  {isPast && !done && ' · PAST DUE'}
                                </span>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showJournal && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center gap-3 border-b border-indigo-800">
            <BookText size={22} className="text-indigo-200" />
            <div className="flex-1"><div className="font-bold text-indigo-50 text-lg">Trip Journal</div><div className="text-xs text-indigo-200 font-sans">{journalEntriesCount} entries</div></div>
            <button onClick={() => setShowJournal(false)} className="text-indigo-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {days.map(day => {
              const entry = journal[day.num];
              return (
                <button key={day.num} onClick={() => setShowJournalEdit({ dayNum: day.num, ...(entry || {}) })} className={`w-full rounded-xl border text-left p-4 ${entry ? 'bg-stone-900 border-indigo-800' : 'bg-stone-900 border-stone-800'}`}>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{day.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-stone-400 font-sans">{day.date}</div>
                      <div className="font-semibold text-stone-100">{day.title}</div>
                      {entry?.text ? <div className="text-sm text-indigo-300 font-sans mt-2 line-clamp-2">{entry.text}</div> : <div className="text-xs text-stone-500 font-sans mt-2 italic">No entry</div>}
                    </div>
                    {entry && <Check size={16} className="text-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showJournalEdit && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex flex-col">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center gap-3 border-b border-indigo-800">
            <BookText size={22} className="text-indigo-200" />
            <div className="flex-1"><div className="font-bold text-indigo-50 text-lg">{days[showJournalEdit.dayNum]?.title}</div><div className="text-xs text-indigo-200 font-sans">{days[showJournalEdit.dayNum]?.date}</div></div>
            <button onClick={() => setShowJournalEdit(null)} className="text-indigo-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-xs text-stone-400 font-sans uppercase tracking-wider">How was the day?</label>
              <textarea value={showJournalEdit.text || ''} onChange={(e) => setShowJournalEdit({ ...showJournalEdit, text: e.target.value })} placeholder="Best moment..." className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 mt-1 text-stone-100 font-sans text-sm min-h-[150px]" />
            </div>
            <div>
              <label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Quote from son</label>
              <textarea value={showJournalEdit.quote || ''} onChange={(e) => setShowJournalEdit({ ...showJournalEdit, quote: e.target.value })} placeholder="Dad, this is the coolest..." className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 mt-1 text-stone-100 font-sans text-sm min-h-[80px] italic" />
            </div>
            <div>
              <label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Food</label>
              <input type="text" value={showJournalEdit.food || ''} onChange={(e) => setShowJournalEdit({ ...showJournalEdit, food: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" />
            </div>
            <button onClick={() => { saveJournalEntry(showJournalEdit.dayNum, showJournalEdit); setShowJournalEdit(null); }} className="w-full bg-indigo-600 text-white rounded-lg py-3 font-sans font-semibold flex items-center justify-center gap-2"><Save size={16} /> Save entry</button>
          </div>
        </div>
      )}

      {showMemories && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-pink-900 to-rose-900 px-4 py-4 flex items-center gap-3 border-b border-pink-800">
            <Heart size={22} className="text-pink-200" />
            <div className="flex-1"><div className="font-bold text-pink-50 text-lg">Favorite Moments</div><div className="text-xs text-pink-200 font-sans">{memories.length} saved</div></div>
            <button onClick={() => setShowMemoryAdd(true)} className="bg-pink-600 text-white rounded-full p-2"><Plus size={20} /></button>
            <button onClick={() => setShowMemories(false)} className="text-pink-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {memories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-stone-300 font-sans mb-2">No memories yet</div>
                <div className="text-xs text-stone-500 font-sans px-8">Tap + during the trip to capture standout moments.</div>
              </div>
            ) : [...memories].reverse().map(m => (
              <div key={m.id} className="bg-stone-900 rounded-xl border border-pink-900 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {m.rating && [...Array(m.rating)].map((_, i) => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                    </div>
                    <div className="text-[10px] text-stone-500 font-sans">{new Date(m.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
                  </div>
                  {m.title && <div className="font-bold text-pink-100 mb-1">{m.title}</div>}
                  {m.text && <div className="text-sm text-stone-200 font-sans leading-relaxed">{m.text}</div>}
                  {m.tag && <div className="mt-2"><span className="text-[10px] bg-pink-900 text-pink-200 rounded-full px-2 py-0.5 font-sans">{m.tag}</span></div>}
                </div>
                <button onClick={() => deleteMemory(m.id)} className="w-full text-left px-4 py-2 border-t border-stone-800 text-xs text-rose-400 font-sans flex items-center gap-1"><Trash2 size={12} /> Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showMemoryAdd && <MemoryAddForm onSave={(m) => { addMemory(m); setShowMemoryAdd(false); }} onCancel={() => setShowMemoryAdd(false)} currentDay={currentDay} />}

      {showMaps && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-rose-900 to-amber-900 px-4 py-4 flex items-center gap-3 border-b border-rose-800">
            <MapPin size={22} className="text-rose-200" />
            <div className="flex-1"><div className="font-bold text-rose-50 text-lg">Locations</div></div>
            <button onClick={() => setShowMaps(false)} className="text-rose-100 p-2"><X size={22} /></button>
          </div>
          <div className="px-4 py-3 border-b border-stone-800 flex gap-2 overflow-x-auto">
            {locationCategories.map(c => (
              <button key={c.id} onClick={() => setMapFilter(c.id)} className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-sans font-semibold ${mapFilter === c.id ? 'bg-rose-600 text-white' : 'bg-stone-800 text-stone-400'}`}>{c.label}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {locations.filter(l => mapFilter === 'all' || l.category === mapFilter).map(loc => (
              <div key={loc.id} className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">{loc.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-stone-100">{loc.name}</div>
                      <div className="text-xs text-stone-400 font-sans mt-0.5">{loc.address}</div>
                    </div>
                  </div>
                </div>
                <button onClick={() => openInMaps(loc)} className="w-full bg-stone-800 py-3 text-sm font-sans font-semibold text-rose-300 flex items-center justify-center gap-2 border-t border-stone-800">
                  <Navigation size={14} /> Open in Maps
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showFlights && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-indigo-900 to-purple-900 px-4 py-4 flex items-center gap-3 border-b border-indigo-800">
            <Plane size={22} className="text-indigo-200" />
            <div className="flex-1"><div className="font-bold text-indigo-50 text-lg">Flights</div></div>
            <button onClick={() => setShowFlights(false)} className="text-indigo-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {flightSlots.map(slot => {
              const saved = flights[slot.id];
              const f = saved || slot.preset;
              const isPresetOnly = !saved && slot.preset;
              return (
                <div key={slot.id} className={`bg-stone-900 rounded-xl border overflow-hidden ${isPresetOnly && f.airline ? 'border-indigo-800' : 'border-stone-800'}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-bold text-stone-100">{slot.label}</div>
                      <div className="text-xs text-stone-500 font-sans">{slot.date}</div>
                    </div>
                    <div className="text-xs text-stone-400 font-sans mb-3">{slot.route}</div>
                    {f && (f.airline || f.number) && (
                      <div className="space-y-1 pt-2 border-t border-stone-800 text-xs font-sans">
                        {f.airline && <div className="text-stone-300 font-semibold">{f.airline}</div>}
                        {f.number && <a href={getFlightTrackUrl(f.number)} target="_blank" rel="noopener noreferrer" className="text-indigo-400 font-mono flex items-center gap-1">{f.number} <ExternalLink size={10} /></a>}
                        {f.depart && <div className="text-stone-400">Depart: {f.depart}</div>}
                        {f.arrive && <div className="text-stone-400">Arrive: {f.arrive}</div>}
                        {f.confirmation && <div className="text-amber-300 font-mono">Conf: {f.confirmation}</div>}
                        {isPresetOnly && <div className="text-[10px] text-amber-400 italic mt-1">Tap to add confirmation #</div>}
                      </div>
                    )}
                    {(!f || (!f.airline && !f.number)) && (
                      <div className="text-xs text-rose-400 font-sans pt-2 border-t border-stone-800 italic">Not yet booked</div>
                    )}
                  </div>
                  <button onClick={() => setShowFlightEdit({ ...(slot.preset || {}), ...(saved || {}), id: slot.id, label: slot.label })} className="w-full text-left px-4 py-2 border-t border-stone-800 text-xs text-stone-400 font-sans flex items-center gap-1">
                    <Save size={12} />{saved ? 'Edit' : 'Add details'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showFlightEdit && (
        <div className="fixed inset-0 z-[60] bg-black bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md border-t border-stone-700 sm:border">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between"><div className="font-bold text-indigo-200">{showFlightEdit.label}</div><button onClick={() => setShowFlightEdit(null)}><X size={20} className="text-stone-400" /></button></div>
            <div className="p-4 space-y-3">
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Airline</label><input type="text" value={showFlightEdit.airline || ''} onChange={(e) => setShowFlightEdit({ ...showFlightEdit, airline: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Flight number</label><input type="text" value={showFlightEdit.number || ''} onChange={(e) => setShowFlightEdit({ ...showFlightEdit, number: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-mono text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Depart</label><input type="text" value={showFlightEdit.depart || ''} onChange={(e) => setShowFlightEdit({ ...showFlightEdit, depart: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Arrive</label><input type="text" value={showFlightEdit.arrive || ''} onChange={(e) => setShowFlightEdit({ ...showFlightEdit, arrive: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Confirmation</label><input type="text" value={showFlightEdit.confirmation || ''} onChange={(e) => setShowFlightEdit({ ...showFlightEdit, confirmation: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-mono text-sm" /></div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { saveFlight(showFlightEdit); setShowFlightEdit(null); }} className="flex-1 bg-indigo-600 text-white rounded-lg py-3 font-sans font-semibold flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                {flights[showFlightEdit.id] && <button onClick={() => { deleteFlight(showFlightEdit.id); setShowFlightEdit(null); }} className="bg-rose-900 text-rose-100 rounded-lg py-3 px-4"><Trash2 size={16} /></button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShare && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-emerald-900 to-teal-900 px-4 py-4 flex items-center gap-3 border-b border-emerald-800">
            <Share2 size={22} className="text-emerald-200" />
            <div className="flex-1"><div className="font-bold text-emerald-50 text-lg">Share with Mom</div></div>
            <button onClick={() => setShowShare(false)} className="text-emerald-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 mb-4"><pre className="text-xs text-stone-200 font-mono whitespace-pre-wrap leading-relaxed">{generateShareText()}</pre></div>
            <button onClick={copyShareText} className={`w-full rounded-xl py-4 font-sans font-bold flex items-center justify-center gap-2 ${copiedShare ? 'bg-emerald-600 text-white' : 'bg-emerald-700 text-white'}`}>{copiedShare ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy all</>}</button>
          </div>
        </div>
      )}

      {showReservationEdit && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md border-t border-stone-700 sm:border">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between"><div className="font-bold text-amber-200">{showReservationEdit.task}</div><button onClick={() => setShowReservationEdit(null)}><X size={20} className="text-stone-400" /></button></div>
            <div className="p-4 space-y-3">
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Confirmation</label><input type="text" value={showReservationEdit.confirmation || ''} onChange={(e) => setShowReservationEdit({ ...showReservationEdit, confirmation: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-mono text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Phone</label><input type="text" value={showReservationEdit.phone || ''} onChange={(e) => setShowReservationEdit({ ...showReservationEdit, phone: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Date/time</label><input type="text" value={showReservationEdit.date || ''} onChange={(e) => setShowReservationEdit({ ...showReservationEdit, date: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Notes</label><textarea value={showReservationEdit.notes || ''} onChange={(e) => setShowReservationEdit({ ...showReservationEdit, notes: e.target.value })} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm min-h-[60px]" /></div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { saveReservation(showReservationEdit); setShowReservationEdit(null); }} className="flex-1 bg-amber-600 text-white rounded-lg py-3 font-sans font-semibold flex items-center justify-center gap-2"><Save size={16} /> Save</button>
                {reservations[showReservationEdit.id] && <button onClick={() => { deleteReservation(showReservationEdit.id); setShowReservationEdit(null); }} className="bg-rose-900 text-rose-100 rounded-lg py-3 px-4"><Trash2 size={16} /></button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showCalc && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md border-t border-stone-700 sm:border">
            <div className="p-4 border-b border-stone-800 flex items-center justify-between"><div className="flex items-center gap-2"><Calculator size={20} className="text-amber-400" /><div className="font-bold text-amber-200">Currency & Tip</div></div><button onClick={() => setShowCalc(false)}><X size={20} className="text-stone-400" /></button></div>
            <div className="p-5 space-y-5">
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">ZAR</label><div className="flex items-center gap-2 mt-1"><span className="text-amber-300 font-bold text-xl">R</span><input type="number" value={calcZAR} onChange={(e) => handleZARChange(e.target.value)} className="flex-1 bg-stone-950 border border-stone-700 rounded-lg p-3 text-stone-100 text-xl" /></div></div>
              <div className="text-center text-stone-500 text-xs font-sans">1 USD = 18 ZAR</div>
              <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">USD</label><div className="flex items-center gap-2 mt-1"><DollarSign size={22} className="text-emerald-400" /><input type="number" value={calcUSD} onChange={(e) => handleUSDChange(e.target.value)} className="flex-1 bg-stone-950 border border-stone-700 rounded-lg p-3 text-stone-100 text-xl" /></div></div>
              <div className="border-t border-stone-800 pt-5">
                <div className="text-xs text-stone-400 font-sans uppercase tracking-wider mb-2">Tip</div>
                <div className="flex gap-2 mb-3">{[10, 12, 15, 20].map(p => <button key={p} onClick={() => setTipPct(p)} className={`flex-1 py-2 rounded-lg font-sans font-semibold text-sm ${tipPct === p ? 'bg-amber-600 text-white' : 'bg-stone-800 text-stone-300'}`}>{p}%</button>)}</div>
                <div className="bg-stone-950 rounded-lg p-4 space-y-1">
                  <div className="flex justify-between"><span className="text-stone-400 text-sm font-sans">Tip ZAR</span><span className="text-amber-300 font-bold">R {tipAmountZAR}</span></div>
                  <div className="flex justify-between"><span className="text-stone-400 text-sm font-sans">Tip USD</span><span className="text-emerald-300 font-bold">$ {tipAmountUSD}</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEmergency && (
        <div className="fixed inset-0 z-50 bg-rose-950 flex flex-col">
          <div className="bg-gradient-to-b from-red-900 to-rose-950 px-4 py-4 flex items-center gap-3 border-b border-red-800">
            <AlertTriangle size={24} className="text-white" />
            <div className="flex-1"><div className="font-bold text-white text-lg">Emergency SOS</div></div>
            <button onClick={() => setShowEmergency(false)} className="text-rose-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {Object.entries(emergencyByLocation).map(([key, loc]) => (
              <div key={key} className="bg-black bg-opacity-30 rounded-2xl overflow-hidden border border-rose-800">
                <div className="px-4 py-3 bg-black bg-opacity-40 border-b border-rose-800"><div className="font-bold text-rose-100 uppercase tracking-wider text-sm">{loc.label}</div></div>
                <div className="divide-y divide-rose-900">
                  {loc.contacts.map((c, i) => (
                    c.call ? (
                      <a key={i} href={`tel:${c.call}`} className={`block px-4 py-3 ${c.urgent ? 'bg-red-900 bg-opacity-30' : ''}`}>
                        <div className="flex items-center gap-3"><div className={`rounded-full p-2 ${c.urgent ? 'bg-red-600' : 'bg-rose-800'}`}><PhoneCall size={16} className="text-white" /></div><div className="flex-1"><div className="text-xs text-rose-300 font-sans">{c.label}</div><div className="text-white font-semibold font-mono">{c.value}</div></div></div>
                      </a>
                    ) : (
                      <div key={i} className="px-4 py-3"><div className="flex items-center gap-3"><div className="rounded-full p-2 bg-stone-800"><Phone size={16} className="text-stone-400" /></div><div className="flex-1"><div className="text-xs text-rose-300 font-sans">{c.label}</div><div className="text-white font-semibold text-sm">{c.value}</div></div></div></div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showPhrases && (
        <div className="fixed inset-0 z-50 bg-stone-950 flex flex-col">
          <div className="bg-gradient-to-r from-teal-900 to-emerald-900 px-4 py-4 flex items-center gap-3 border-b border-teal-800">
            <Languages size={22} className="text-teal-200" />
            <div className="flex-1"><div className="font-bold text-teal-100 text-lg">Phrases</div></div>
            <button onClick={() => setShowPhrases(false)} className="text-teal-100 p-2"><X size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {phrases.map((cat, ci) => (
              <div key={ci} className="bg-stone-900 rounded-xl overflow-hidden border border-stone-800">
                <div className="px-4 py-3 bg-gradient-to-r from-teal-950 to-stone-900 border-b border-stone-800"><div className="font-bold text-teal-300 uppercase tracking-wider text-sm">{cat.category}</div></div>
                <div className="divide-y divide-stone-800">
                  {cat.items.map((p, pi) => (
                    <div key={pi} className="px-4 py-3">
                      <div className="flex items-baseline justify-between gap-3 mb-1"><div className="font-bold text-stone-100 text-lg">{p.phrase}</div><div className="text-sm text-amber-300 font-sans">{p.meaning}</div></div>
                      {p.notes && <div className="text-xs text-stone-500 font-sans italic">{p.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-stone-950 border-t border-stone-800 px-2 py-2 z-30">
        <div className="flex justify-around max-w-md mx-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setExpandedDay(null); }} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg ${active ? 'text-amber-300' : 'text-stone-500'}`}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-sans font-semibold tracking-wider uppercase">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MemoryAddForm({ onSave, onCancel, currentDay }) {
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [tag, setTag] = useState(currentDay?.title || '');
  const [rating, setRating] = useState(5);
  return (
    <div className="fixed inset-0 z-[60] bg-black bg-opacity-80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full max-w-md border-t border-pink-800 sm:border">
        <div className="p-4 border-b border-pink-900 flex items-center justify-between"><div className="flex items-center gap-2"><Heart size={20} className="text-pink-400" /><div className="font-bold text-pink-200">Capture a Moment</div></div><button onClick={onCancel}><X size={20} className="text-stone-400" /></button></div>
        <div className="p-4 space-y-3">
          <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Title</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
          <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">What happened</label><textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-3 mt-1 text-stone-100 font-sans text-sm min-h-[100px]" /></div>
          <div><label className="text-xs text-stone-400 font-sans uppercase tracking-wider">Tag</label><input type="text" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 mt-1 text-stone-100 font-sans text-sm" /></div>
          <div>
            <label className="text-xs text-stone-400 font-sans uppercase tracking-wider mb-2 block">How special?</label>
            <div className="flex gap-2">{[1, 2, 3, 4, 5].map(n => <button key={n} onClick={() => setRating(n)} className={`flex-1 py-2 rounded-lg ${n <= rating ? 'bg-amber-600' : 'bg-stone-800'}`}><Star size={18} className={`mx-auto ${n <= rating ? 'text-white fill-white' : 'text-stone-600'}`} /></button>)}</div>
          </div>
          <button onClick={() => onSave({ title, text, tag, rating })} disabled={!text && !title} className="w-full bg-pink-600 disabled:bg-stone-800 disabled:text-stone-600 text-white rounded-lg py-3 font-sans font-semibold flex items-center justify-center gap-2"><Save size={16} /> Save moment</button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, MapPin, Navigation, Camera, Sparkles, History, Heart, 
  Coffee, TreePine, Mountain, Plus, Loader2, Send,
  User, Sun, CloudRain, Train, Eye, List, X,
  CalendarDays, LogOut, Bell, PhoneCall, AlertTriangle, ChevronRight, Filter,
  Video, Image as ImageIcon, Paintbrush, PlayCircle, Upload, Film, ArrowLeft, Utensils, Activity, MessageCircle, Lock, Minus, Maximize, Navigation2, RefreshCw,
  Cloud, CloudSnow, CloudLightning, Wind, Thermometer
} from 'lucide-react';

import { TRAILS_DATA } from './data/trailsData';

const isValidLatLng = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return false;
  const fLat = parseFloat(lat);
  const fLng = parseFloat(lng);
  return !isNaN(fLat) && !isNaN(fLng) && isFinite(fLat) && isFinite(fLng);
};

function DynamicLeafletMap({ trails, activeFilter, selectedPin, setSelectedPin, onAddTrip, isActive }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [locError, setLocError] = useState("");

  useEffect(() => {
    let isMounted = true;
    
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { if (isMounted) setIsLoaded(true); };
      document.body.appendChild(script);
    } else {
      if (window.L) setIsLoaded(true);
      else document.getElementById('leaflet-js').addEventListener('load', () => { if (isMounted) setIsLoaded(true); });
    }

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance.current) {
      const L = window.L;
      const map = L.map(mapRef.current, { zoomControl: false }).setView([49.68, 18.85], 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);
      
      L.control.zoom({ position: 'topright' }).addTo(map);
      
      mapInstance.current = map;
      markersLayer.current = L.featureGroup().addTo(map);

      // KLUCZOWA POPRAWKA DLA PWA NA SMARTFONIE:
      // Rozwiązuje problem z białym tłem mapy, gdy kontener jest odkrywany po kliknięciu.
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstance.current) {
          try {
            mapInstance.current.invalidateSize();
          } catch (e) {
            console.warn("Could not invalidate map size inside ResizeObserver:", e);
          }
        }
      });
      resizeObserver.observe(mapRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isLoaded]);

  // --- NAPRAWA BIAŁEGO TŁA NA SMARTFONIE ---
  useEffect(() => {
    if (mapInstance.current) {
        setTimeout(() => {
            if (mapInstance.current) {
                try {
                    mapInstance.current.invalidateSize();
                } catch (e) {
                    console.warn("Could not invalidate map size in setTimeout:", e);
                }
                
                // Automatyczne pozycjonowanie kamery po aktywacji mapy
                if (selectedPin && isValidLatLng(selectedPin.lat, selectedPin.lng)) {
                  try {
                    const pinLat = parseFloat(selectedPin.lat);
                    const pinLng = parseFloat(selectedPin.lng);
                    mapInstance.current.flyTo([pinLat, pinLng], 13.5, { duration: 1.2 });
                  } catch (e) {
                    console.warn("Could not fly to pin in setTimeout:", e);
                  }
                } else if (trails.length > 0 && markersLayer.current && markersLayer.current.getLayers().length > 0) {
                  try {
                    const bounds = markersLayer.current.getBounds();
                    if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
                      const sw = bounds.getSouthWest();
                      const ne = bounds.getNorthEast();
                      if (sw && ne && !isNaN(sw.lat) && !isNaN(sw.lng) && !isNaN(ne.lat) && !isNaN(ne.lng) && isFinite(sw.lat) && isFinite(sw.lng) && isFinite(ne.lat) && isFinite(ne.lng)) {
                        mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
                      }
                    }
                  } catch (e) {
                    console.warn("Could not fit bounds after active transition:", e);
                  }
                }
            }
        }, 350); 
    }
  }, [isActive]);

  // --- DYNAMICZNE RENDEROWANIE TRAS I SZLAKÓW (MARKERY + POLILINIE) ---
  useEffect(() => {
    if (!isLoaded || !mapInstance.current || !markersLayer.current) return;
    const L = window.L;
    
    // Wyczyszczenie starej warstwy
    markersLayer.current.clearLayers();

    trails.forEach(trail => {
      if (!trail || !isValidLatLng(trail.lat, trail.lng)) {
        return;
      }

      // Kolor markera na podstawie trudności szlaku
      const diffColor = 
        trail.difficulty === 'Trudna' ? 'bg-red-500' :
        (trail.difficulty === 'Średnia' ? 'bg-amber-500' : 'bg-emerald-500');

      // Wybór emoji ikony
      let emoji = '⛰️';
      if (trail.name && (trail.name.toLowerCase().includes('schronisko') || trail.food?.toLowerCase().includes('schronisko'))) {
        emoji = '🏠';
      } else if (trail.familyFriendly) {
        emoji = '👶';
      } else if (trail.name && (trail.name.toLowerCase().includes('jezioro') || trail.name.toLowerCase().includes('wodospad'))) {
        emoji = '💧';
      } else if (trail.difficulty === 'Łatwa' || trail.difficulty === 'Spacer') {
        emoji = '🌲';
      }

      // Sprawdzenie czy ten pin jest obecnie zaznaczony
      const isSelected = selectedPin && selectedPin.id === trail.id;

      // Niestandardowy HTML marker
      const displayName = trail.name ? trail.name.split(' ')[0] : 'Szlak';
      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 ${diffColor} text-white rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-indigo-600 scale-125 ring-4 ring-indigo-300' : 'border-white'} shadow-xl transform transition-all duration-300 hover:scale-125 hover:rotate-12 cursor-pointer z-50">
            <span class="text-sm">${emoji}</span>
          </div>
          <div class="absolute top-10 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-md font-bold shadow-md opacity-90 whitespace-nowrap pointer-events-none border border-slate-700 z-50">
            ${displayName}...
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: markerHtml,
        className: 'custom-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([parseFloat(trail.lat), parseFloat(trail.lng)], { icon })
        .on('click', () => {
          setSelectedPin(trail);
        });

      markersLayer.current.addLayer(marker);

      // Renderowanie polilinii ścieżki
      if (trail.path && Array.isArray(trail.path)) {
        const validPath = trail.path
          .filter(coord => Array.isArray(coord) && coord.length === 2 && isValidLatLng(coord[0], coord[1]))
          .map(coord => [parseFloat(coord[0]), parseFloat(coord[1])]);
        if (validPath.length >= 2) {
          let polyColor = '#10b981'; // domyślny zielony
          if (trail.color) {
            if (trail.color.includes('red')) polyColor = '#ef4444';
            else if (trail.color.includes('yellow')) polyColor = '#eab308';
            else if (trail.color.includes('blue')) polyColor = '#3b82f6';
            else if (trail.color.includes('purple')) polyColor = '#8b5cf6';
            else if (trail.color.includes('orange')) polyColor = '#f97316';
            else if (trail.color.includes('slate')) polyColor = '#475569';
            else if (trail.color.includes('emerald')) polyColor = '#10b981';
            else if (trail.color.includes('indigo')) polyColor = '#4f46e5';
            else if (trail.color.includes('teal')) polyColor = '#0d9488';
          }

          const polyline = L.polyline(validPath, {
            color: polyColor,
            weight: isSelected ? 8 : 4,
            opacity: isSelected ? 0.95 : 0.65,
            dashArray: isSelected ? null : '5, 8'
          });

          polyline.on('click', () => {
            setSelectedPin(trail);
          });

          markersLayer.current.addLayer(polyline);
        }
      }
    });

    // Automatyczne pozycjonowanie kamery (tylko jeśli kontener jest widoczny)
    const isVisible = mapRef.current && (mapRef.current.offsetWidth > 0 || mapRef.current.offsetHeight > 0);
    if (isVisible) {
      if (selectedPin && isValidLatLng(selectedPin.lat, selectedPin.lng)) {
        try {
          const pinLat = parseFloat(selectedPin.lat);
          const pinLng = parseFloat(selectedPin.lng);
          mapInstance.current.flyTo([pinLat, pinLng], 13.5, { duration: 1.2 });
        } catch (e) {
          console.warn("Could not fly to pin on transition:", e);
        }
      } else if (trails.length > 0 && markersLayer.current && markersLayer.current.getLayers().length > 0) {
        try {
          const bounds = markersLayer.current.getBounds();
          if (bounds && typeof bounds.isValid === 'function' && bounds.isValid()) {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            if (sw && ne && !isNaN(sw.lat) && !isNaN(sw.lng) && !isNaN(ne.lat) && !isNaN(ne.lng) && isFinite(sw.lat) && isFinite(sw.lng) && isFinite(ne.lat) && isFinite(ne.lng)) {
              mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
            }
          }
        } catch (e) {
          console.warn("Could not fit bounds on load:", e);
        }
      }
    }
  }, [isLoaded, trails, selectedPin, isActive]);

  const locateMe = () => {
    setLocError("");
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        if (isValidLatLng(latitude, longitude)) {
          const locLat = parseFloat(latitude);
          const locLng = parseFloat(longitude);
          mapInstance.current.flyTo([locLat, locLng], 14);
          window.L.marker([locLat, locLng]).addTo(mapInstance.current).bindPopup('Jesteś tutaj!').openPopup();
        } else {
          setLocError("Nieprawidłowa lokalizacja GPS");
          setTimeout(() => setLocError(""), 3000);
        }
      }, () => {
        setLocError("Brak dostępu do GPS");
        setTimeout(() => setLocError(""), 3000);
      });
    } else {
        setLocError("Geolokalizacja nieobsługiwana");
        setTimeout(() => setLocError(""), 3000);
    }
  };

  return (
    <div className="w-full h-full relative z-0">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold z-10 flex-col gap-3">
          <Loader2 className="animate-spin" size={32} />
          Ładowanie interaktywnej mapy...
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }}></div>
      
      {locError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg z-[400]">
              {locError}
          </div>
      )}

      <button 
         onClick={locateMe}
         className="absolute bottom-6 right-4 z-[400] bg-white text-blue-600 p-3 rounded-full shadow-xl border border-slate-200 hover:bg-blue-50 transition"
         title="Znajdź mnie (GPS)"
      >
         <Navigation2 size={24} className="fill-current" />
      </button>
    </div>
  );
}

export default function App() {
  const SECRET_PIN = "BESKIDY2026"; 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState('home'); 
  const [activeFilter, setActiveFilter] = useState('Wszystkie');
  
  const [savedTrips, setSavedTrips] = useState([
    { id: 101, name: "Zdobycie Czantorii", date: "12 Sierpnia 2025", duration: "2h 10m", media: [] }
  ]);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => {
    const savedAuth = localStorage.getItem('beskidyAuth') === 'true';
    if (savedAuth) setIsAuthenticated(true);
  }, []);

  const handleLogin = () => {
    if (passwordInput === SECRET_PIN) {
        setIsAuthenticated(true);
        setAuthError('');
        localStorage.setItem('beskidyAuth', 'true');
    } else {
        setAuthError('Nieprawidłowy kod dostępu!');
        setPasswordInput('');
    }
  };

  const handleAddTrip = (trail) => {
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    const newTrip = { id: Date.now(), name: trail.name, date: today, duration: trail.time, media: [] };
    setSavedTrips(prev => [newTrip, ...prev]);
    setActiveTab('journal'); 
  };

  const handleAddMedia = (tripId, newMediaUrl) => {
    setSavedTrips(prev => prev.map(t => t.id === tripId ? { ...t, media: [...t.media, newMediaUrl] } : t));
    if (activeTrip && activeTrip.id === tripId) {
        setActiveTrip(prev => ({ ...prev, media: [...prev.media, newMediaUrl] }));
    }
  };

  const handleSaveAIPlan = (plan) => {
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    const newTrip = { id: Date.now(), name: plan.title, date: today, duration: `${plan.days.length} dni`, media: [] };
    setSavedTrips(prev => [newTrip, ...prev]);
    setActiveTab('journal');
  };

  const navigateToTrailsWithFilter = (filter) => {
      setActiveFilter(filter);
      setActiveTab('trails');
  }

  // --- ROZWIĄZANIE NA STAŁE DLA AKTUALIZACJI PWA ---
  const forceUpdatePWA = () => {
      if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
              for (let registration of registrations) {
                  registration.unregister();
              }
          });
      }
      if ('caches' in window) {
          caches.keys().then((keyList) => {
              return Promise.all(keyList.map((key) => caches.delete(key)));
          });
      }
      setTimeout(() => {
          window.location.reload(true);
      }, 800);
  };

  if (!isAuthenticated) {
      return (
          <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30">
                  <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" alt="Góry tło" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md relative z-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                      <Lock size={32} className="text-white" />
                  </div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Osobisty Przewodnik</h1>
                  <p className="text-emerald-100/70 text-sm mb-8">Aplikacja wymaga podania kodu autoryzacji do API.</p>
                  
                  {authError && <div className="bg-red-500/20 text-red-200 border border-red-500/50 p-3 rounded-lg mb-4 text-sm">{authError}</div>}

                  <input 
                      type="password" 
                      value={passwordInput} 
                      onChange={(e) => setPasswordInput(e.target.value)}
                      onKeyPress={(e) => { if (e.key === 'Enter') handleLogin(); }}
                      placeholder="Wprowadź PIN..."
                      className="w-full bg-black/30 border border-white/10 text-center text-white rounded-xl px-5 py-4 outline-none mb-4 text-2xl tracking-[0.5em] font-bold uppercase focus:border-emerald-500 transition-colors"
                  />
                  
                  <button 
                      onClick={handleLogin}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95"
                  >
                      Odblokuj
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-72 bg-emerald-900 text-white shadow-2xl relative z-20">
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500 p-2 rounded-xl"><Mountain size={28} className="text-white" /></div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Beskidy<br/>Przewodnik</h1>
            </div>
          </div>
          <p className="text-emerald-300 text-xs font-medium mt-2">Twój osobisty asystent</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<Mountain />} label="Pulpit Główny" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={<MapIcon />} label="Mapa i Szlaki" isActive={activeTab === 'trails'} onClick={() => setActiveTab('trails')} />
          <SidebarItem icon={<CalendarDays />} label="Planer Trasy" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
          <SidebarItem icon={<MessageCircle />} label="Asystent AI" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <SidebarItem icon={<History />} label="Pamiętnik Wypraw" isActive={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setActiveTrip(null); }} />
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <button onClick={forceUpdatePWA} className="w-full mb-3 bg-emerald-700/50 hover:bg-emerald-600 text-emerald-100 text-xs py-2.5 rounded-xl transition font-bold flex justify-center items-center gap-2 shadow-inner">
            <RefreshCw size={16} /> Zaktualizuj Aplikację
          </button>
          <div className="bg-emerald-800/50 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-700 rounded-full flex items-center justify-center"><User size={20} /></div>
            <div className="flex-1">
              <p className="text-sm font-bold">Turysta</p>
              <p className="text-[10px] text-emerald-300">Wersja PRO</p>
            </div>
            <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('beskidyAuth'); }} className="p-2 hover:bg-red-500/20 rounded-lg transition text-red-400" title="Wyloguj">
               <LogOut size={16}/>
            </button>
          </div>
        </div>
      </aside>

      {/* --- MOBILE TOP BAR --- */}
      <div className="md:hidden fixed top-0 w-full bg-emerald-600 text-white p-4 shadow-md z-30 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Mountain size={24} />
          <h1 className="text-xl font-bold tracking-tight">Beskidy AI</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={forceUpdatePWA} className="p-2 bg-emerald-700 rounded-full text-emerald-100 active:scale-95 transition-transform" title="Aktualizuj (Wymusza pobranie)">
            <RefreshCw size={18} />
          </button>
          <button onClick={() => { setIsAuthenticated(false); localStorage.removeItem('beskidyAuth'); }} className="p-2 bg-emerald-700 rounded-full">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* --- GŁÓWNA ZAWARTOŚĆ --- */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 relative scroll-smooth z-10">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} navigateToTrailsWithFilter={navigateToTrailsWithFilter} />}
        {activeTab === 'trails' && <TrailsView onAddTrip={handleAddTrip} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />}
        {activeTab === 'planner' && <AIPlannerView onSavePlan={handleSaveAIPlan} />}
        {activeTab === 'chat' && <ChatAssistantView />}
        {activeTab === 'journal' && <JournalView savedTrips={savedTrips} setSavedTrips={setSavedTrips} isPro={true} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onAddMedia={handleAddMedia} />}
      </main>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        <NavItem icon={<Mountain />} label="Start" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={<MapIcon />} label="Mapa" isActive={activeTab === 'trails'} onClick={() => setActiveTab('trails')} />
        <NavItem icon={<CalendarDays />} label="Planer" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
        <NavItem icon={<MessageCircle />} label="Asystent" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
        <NavItem icon={<History />} label="Pamiętnik" isActive={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setActiveTrip(null); }} />
      </nav>

    </div>
  );
}

function HomeView({ setActiveTab, navigateToTrailsWithFilter }) {
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    // Współrzędne dla Ustronia/Wisły: szerokość 49.72, długość 18.81
    fetch('https://api.open-meteo.com/v1/forecast?latitude=49.72&longitude=18.81&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FWarsaw')
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setLoadingWeather(false);
      })
      .catch(err => {
        console.error("Błąd pobierania pogody:", err);
        setLoadingWeather(false);
      });
  }, []);

  const getWeatherDetails = (code) => {
    // Kody pogodowe WMO (https://open-meteo.com/en/docs)
    if (code === 0) return { label: "Słonecznie", icon: <Sun className="text-yellow-400 animate-pulse" size={40} /> };
    if (code >= 1 && code <= 3) return { label: "Zachmurzenie umiarkowane", icon: <Cloud className="text-teal-200" size={40} /> };
    if (code >= 45 && code <= 48) return { label: "Mgła / Zamglenie", icon: <Cloud className="text-slate-300" size={40} /> };
    if (code >= 51 && code <= 57) return { label: "Mżawka", icon: <CloudRain className="text-cyan-200 animate-bounce" size={40} /> };
    if (code >= 61 && code <= 67) return { label: "Opady deszczu", icon: <CloudRain className="text-cyan-300 animate-bounce" size={40} /> };
    if (code >= 71 && code <= 77) return { label: "Opady śniegu", icon: <CloudSnow className="text-white animate-pulse" size={40} /> };
    if (code >= 80 && code <= 82) return { label: "Przelotny deszcz", icon: <CloudRain className="text-blue-300 animate-bounce" size={40} /> };
    if (code >= 85 && code <= 86) return { label: "Opady śniegu / Krup", icon: <CloudSnow className="text-blue-100" size={40} /> };
    if (code >= 95 && code <= 99) return { label: "Burza z piorunami", icon: <CloudLightning className="text-amber-400 animate-pulse" size={40} /> };
    return { label: "Zmienna aura", icon: <Sun className="text-yellow-300" size={40} /> };
  };

  const getDayName = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pl-PL', { weekday: 'short' });
    } catch (e) {
      return "Jutro";
    }
  };

  const currentCode = weatherData?.current?.weather_code ?? 0;
  const currentTemp = weatherData?.current?.temperature_2m ?? 18;
  const apparentTemp = weatherData?.current?.apparent_temperature ?? 17;
  const humidity = weatherData?.current?.relative_humidity_2m ?? 65;
  const windSpeed = weatherData?.current?.wind_speed_10m ?? 10;
  const weather = getWeatherDetails(currentCode);

  // Inteligentne rekomendacje w zależności od warunków na zewnątrz
  const getRecommendation = (code, temp, wind) => {
    if (code >= 95) {
      return { 
        text: "⚡ Niebezpieczeństwo! Nadciągają burze z piorunami. Pozostań w dolinach, kategorycznie unikaj otwartych grzbietów i metalowych łańcuchów.", 
        type: "danger",
        badge: "ZAGROŻENIE",
        trailId: 3, // Piramidy (bezpieczna dolina)
        trailName: "Piramidy na Zawodziu (Ustroń)"
      };
    }
    if (code >= 61 && code <= 67) {
      return { 
        text: "🌧️ Opady deszczu. Szlaki leśne są śliskie i błotniste. Zabierz odzież membranową, pokrowiec na plecak i dobre buty trekkingowe z protektorem.", 
        type: "warning",
        badge: "DESZCZOWO",
        trailId: 4, // Leśny Park Niespodzianek
        trailName: "Leśny Park Niespodzianek"
      };
    }
    if (code >= 71 && code <= 86) {
      return { 
        text: "❄️ Uwaga na śnieg i oblodzenie! W wyższych partiach warunki zimowe. Niezbędne raczki turystyczne, stuptuty i termos z gorącą herbatą.", 
        type: "warning",
        badge: "WARUNKI ZIMOWE",
        trailId: 14, // Ochodzita (krótkie podejście)
        trailName: "Ochodzita w Koniakowie"
      };
    }
    if (wind > 25) {
      return { 
        text: "💨 Porywisty wiatr na graniach. Temperatura odczuwalna jest znacznie niższa niż rzeczywista. Rekomendujemy osłonięty lasem spacer dolinny.", 
        type: "warning",
        badge: "WICHURA",
        trailId: 16, // Wodospad Szum
        trailName: "Wodospad Szum i Dolina Czadeczki"
      };
    }
    if (temp > 25) {
      return { 
        text: "☀️ Bardzo ciepły dzień! Na nasłonecznionych grzbietach grozi przegrzanie. Weź min. 2 litry płynów, okulary przeciwsłoneczne i nakrycie głowy.", 
        type: "info",
        badge: "UPALNIE",
        trailId: 9, // Jezioro Czerniańskie (blisko wody)
        trailName: "Jezioro Czerniańskie (Wisła)"
      };
    }
    if (temp < 6) {
      return { 
        text: "🥶 Niska temperatura. Ubierz się warstwowo ('na cebulkę') i zaplanuj przerwę na rozgrzanie w schronisku turystycznym.", 
        type: "info",
        badge: "CHŁODNO",
        trailId: 2, // Równica z schroniskiem
        trailName: "Równica z Centrum"
      };
    }
    return { 
      text: "🌲 Doskonała, stabilna pogoda w Beskidach! Świetny czas na zdobywanie najwyższych partii, np. Skrzycznego czy pasma Czantorii.", 
      type: "success",
      badge: "IDEALNE WARUNKI",
      trailId: 1, // Czantoria
      trailName: "Czantoria Wielka z Polany"
    };
  };

  const recommendation = getRecommendation(currentCode, currentTemp, windSpeed);

  // Pobierz polecany szlak na dziś na podstawie rekomendacji pogodowej
  const recommendedTrail = TRAILS_DATA.find(t => t.id === recommendation.trailId) || TRAILS_DATA[0];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Sekcja Pogody Live i Rekomendacji */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Karta pogody */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-800 to-teal-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[280px]">
          <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4">
            <Sun size={220} />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-emerald-700/50 text-emerald-200 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">Warunki Beskidy (Live)</span>
                <h2 className="text-2xl md:text-3xl font-black mt-2">Ustroń / Wisła / Szczyrk</h2>
                <p className="text-emerald-100/80 text-sm mt-1">{weather.label} • Odczuwalna {apparentTemp}°C</p>
              </div>
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                {weather.icon}
              </div>
            </div>

            <div className="flex items-end justify-between flex-wrap gap-4 pt-4 border-t border-emerald-700/50">
              <div className="flex items-end gap-3">
                <span className="text-5xl md:text-6xl font-black">{Math.round(currentTemp)}°C</span>
                <div className="pb-1 text-emerald-200 text-xs font-medium">
                  <p>💨 Wiatr: {windSpeed} km/h</p>
                  <p>💧 Wilgotność: {humidity}%</p>
                </div>
              </div>

              {/* Dynamiczna prognoza 3-dniowa */}
              {weatherData && (
                <div className="flex gap-4 bg-black/10 backdrop-blur-sm p-3 rounded-2xl border border-white/10">
                  {weatherData.daily.time.slice(1, 4).map((time, index) => {
                    const tempMax = weatherData.daily.temperature_2m_max[index + 1];
                    const tempMin = weatherData.daily.temperature_2m_min[index + 1];
                    const code = weatherData.daily.weather_code[index + 1];
                    const dayDetails = getWeatherDetails(code);
                    return (
                      <div key={time} className="flex flex-col items-center text-center px-1">
                        <span className="text-[10px] font-bold text-emerald-300 uppercase">{getDayName(time)}</span>
                        <span className="my-1 scale-75 transform">{dayDetails.icon}</span>
                        <span className="text-xs font-black">{Math.round(tempMax)}°/{Math.round(tempMin)}°</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Karta bezpieczeństwa i GOPR */}
        <div className="flex flex-col gap-4">
          <div className={`rounded-3xl p-5 border flex flex-col justify-between h-full relative overflow-hidden shadow-md transition-all duration-300
            ${recommendation.type === 'danger' ? 'bg-rose-50 border-rose-200 text-rose-950' :
              recommendation.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-950' :
              recommendation.type === 'info' ? 'bg-sky-50 border-sky-200 text-sky-950' :
              'bg-emerald-50 border-emerald-200 text-emerald-950'}`}>
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl text-white ${recommendation.type === 'danger' ? 'bg-rose-600' : recommendation.type === 'warning' ? 'bg-amber-500' : recommendation.type === 'info' ? 'bg-sky-500' : 'bg-emerald-600'}`}>
                <Activity size={20} className="animate-pulse" />
              </div>
              <div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${recommendation.type === 'danger' ? 'bg-rose-200 text-rose-800' : recommendation.type === 'warning' ? 'bg-amber-200 text-amber-800' : recommendation.type === 'info' ? 'bg-sky-200 text-sky-800' : 'bg-emerald-200 text-emerald-800'}`}>
                  {recommendation.badge}
                </span>
                <h4 className="font-bold text-sm uppercase tracking-wider mt-2">Rekomendacja GOPR</h4>
                <p className="text-xs font-medium mt-1 leading-relaxed text-slate-700">{recommendation.text}</p>
              </div>
            </div>
            
            <button 
              onClick={() => navigateToTrailsWithFilter(recommendedTrail.location)}
              className="mt-4 bg-slate-950 text-white hover:bg-slate-800 text-xs py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              Rekomendowany region: {recommendedTrail.location} <ChevronRight size={14} />
            </button>
          </div>

          <div className="bg-rose-50 rounded-3xl p-4 border border-rose-100 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 bg-rose-100 w-20 h-20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-center gap-3 mb-2 relative z-10">
              <AlertTriangle size={24} className="text-red-500" />
              <h3 className="font-bold text-red-900 text-sm">Górskie Pogotowie GOPR</h3>
            </div>
            <p className="text-slate-600 text-xs mb-3 relative z-10 font-medium">Wpisz do telefonu numer ratunkowy w górach:</p>
            <button 
              onClick={() => window.open('tel:601100300')}
              className="bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition shadow-md relative z-10"
            >
              <PhoneCall size={14} /> 601 100 300
            </button>
          </div>
        </div>
      </div>

      {/* Szybkie Menu */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 text-xl flex items-center gap-2">Szybkie menu</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={<CalendarDays />} label="Kreator Trasy" color="bg-emerald-100 text-emerald-700" iconColor="bg-emerald-500" onClick={() => setActiveTab('planner')} />
          <QuickActionButton icon={<MessageCircle />} label="Asystent Chat" color="bg-purple-100 text-purple-700" iconColor="bg-purple-500" onClick={() => setActiveTab('chat')} />
          <QuickActionButton icon={<MapIcon />} label="Mapa Interaktywna" color="bg-blue-100 text-blue-700" iconColor="bg-blue-500" onClick={() => navigateToTrailsWithFilter('Wszystkie')} />
          <QuickActionButton icon={<Utensils />} label="Schroniska" color="bg-amber-100 text-amber-800" iconColor="bg-amber-500" onClick={() => navigateToTrailsWithFilter('🍲 Gastronomia')} />
        </div>
      </div>

      {/* Polecane na dzisiejsze warunki (Dynamiczne!) */}
      <div>
        <h3 className="font-bold text-slate-800 mb-4 text-xl flex items-center gap-2"><Heart size={20} className="text-rose-500 animate-pulse" /> Polecane na dzisiejsze warunki</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Propozycja 1 (Na podstawie pogody) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 md:h-48 bg-slate-200 rounded-2xl mb-4 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-4 z-10">
                   <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-max uppercase tracking-wider mb-2">Wybór Przewodnika na Dziś</span>
                   <span className="text-white font-black text-xl leading-tight">{recommendedTrail.name}</span>
                   <span className="text-slate-300 text-xs flex items-center gap-1 mt-1"><MapPin size={12}/> {recommendedTrail.location}</span>
                 </div>
                 <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" alt="Góry" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">
                {recommendedTrail.description}
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center text-xs text-slate-600 mb-4 font-bold flex-wrap gap-2">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><Navigation size={14} className="text-blue-500"/> {recommendedTrail.distance}</span>
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><History size={14} className="text-amber-500"/> {recommendedTrail.time}</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">{recommendedTrail.difficulty}</span>
              </div>
              <button onClick={() => navigateToTrailsWithFilter(recommendedTrail.location)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition">
                Zobacz na Mapie
              </button>
            </div>
          </div>

          {/* Propozycja 2 (Uniwersalny klasyk z atrakcjami / schroniskiem) */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="h-44 md:h-48 bg-slate-200 rounded-2xl mb-4 overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent flex flex-col justify-end p-4 z-10">
                   <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full w-max uppercase tracking-wider mb-2">Regionalny Klasyk</span>
                   <span className="text-white font-black text-xl leading-tight">Urokliwa Równica z Zbójnicką Chatą</span>
                   <span className="text-slate-300 text-xs flex items-center gap-1 mt-1"><MapPin size={12}/> Ustroń</span>
                 </div>
                 <img src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&q=80&w=800" alt="Góry szlak" className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" />
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">
                Świetny szlak niezależnie od kaprysów pogody. Prowadzi do klimatycznego schroniska, skąd roztacza się niezrównana panorama pasma Czantorii.
              </p>
            </div>
            
            <div>
              <div className="flex justify-between items-center text-xs text-slate-600 mb-4 font-bold flex-wrap gap-2">
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><Navigation size={14} className="text-blue-500"/> 4.2 km</span>
                <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"><History size={14} className="text-amber-500"/> 1h 30m</span>
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-lg">Łatwa</span>
              </div>
              <button onClick={() => navigateToTrailsWithFilter('Ustroń')} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                Zobacz na Mapie
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

function TrailsView({ onAddTrip, activeFilter, setActiveFilter }) {
  const [selectedPin, setSelectedPin] = useState(null);
  const [isMapVisibleOnMobile, setIsMapVisibleOnMobile] = useState(false); 

  const filters = ['Wszystkie', 'Ustroń', 'Wisła', 'Szczyrk', 'Brenna', 'Istebna', 'Bielsko-Biała', '🍲 Gastronomia'];
  
  const filteredTrails = TRAILS_DATA.filter(t => {
      if (activeFilter === 'Wszystkie') return true;
      if (activeFilter === '🍲 Gastronomia') return t.food && t.food !== "Prowiant własny" && !t.food.includes("Brak");
      return t.location === activeFilter;
  });

  return (
    <div className="h-full flex flex-col md:p-6 p-0 max-w-7xl mx-auto relative z-10">
      
      <div className="bg-white md:bg-transparent p-4 md:p-0 border-b md:border-none border-slate-200 shrink-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-2xl text-slate-800">
             {activeFilter === '🍲 Gastronomia' ? 'Schroniska na szlaku' : 'Eksploruj Region'}
          </h2>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => (
            <button 
              key={f} onClick={() => { setActiveFilter(f); setSelectedPin(null); }}
              className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all shadow-sm
                ${activeFilter === f ? (f.includes('Gastro') ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white') : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden md:mt-2 relative">
        
        {/* LEWA KOLUMNA: Lista */}
        <div className={`w-full md:w-1/2 lg:w-4/12 overflow-y-auto p-4 md:p-0 space-y-4 pb-32 md:pb-4 custom-scrollbar ${isMapVisibleOnMobile ? 'hidden md:block' : 'block'}`}>
          {filteredTrails.length === 0 && (
             <div className="text-center p-10 text-slate-400 font-medium">Brak wyników w tej kategorii.</div>
          )}
          {filteredTrails.map(trail => (
            <div key={trail.id} 
              onClick={() => setSelectedPin(trail)}
              className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all cursor-pointer ${selectedPin?.id === trail.id ? 'border-emerald-500 shadow-md scale-[1.02]' : 'border-slate-100 hover:border-slate-300'}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-3 h-14 rounded-full shrink-0 ${trail.color}`}></div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-slate-800 leading-tight">{trail.name}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">{trail.location}</span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${trail.difficulty==='Łatwa' || trail.difficulty==='Bardzo Łatwa' ?'bg-green-100 text-green-700':trail.difficulty==='Średnia'?'bg-orange-100 text-orange-700':'bg-red-100 text-red-700'}`}>{trail.difficulty}</span>
                    {trail.familyFriendly && <span className="text-[10px] font-bold uppercase px-2 py-1 rounded bg-blue-100 text-blue-700">Rodzinny 👶</span>}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 p-3 rounded-2xl">
                <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Dystans</p><p className="font-black text-slate-800 text-sm">{trail.distance}</p></div>
                <div className="text-center border-x border-slate-200"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Czas</p><p className="font-black text-slate-800 text-sm">{trail.time}</p></div>
                <div className="text-center"><p className="text-[10px] text-slate-500 font-bold uppercase mb-1">W górę</p><p className="font-black text-slate-800 text-sm">{trail.elevation}</p></div>
              </div>

              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-start gap-3 bg-blue-50/50 rounded-xl p-3">
                  <Train size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-relaxed"><b>Dojazd:</b> {trail.transport}</p>
                </div>
                <div className={`flex items-start gap-3 rounded-xl p-3 ${activeFilter === '🍲 Gastronomia' ? 'bg-amber-100 border border-amber-200' : 'bg-slate-50 border border-slate-100'}`}>
                  <Utensils size={18} className={`${activeFilter === '🍲 Gastronomia' ? 'text-amber-600' : 'text-slate-400'} shrink-0 mt-0.5`} />
                  <p className="text-xs text-slate-800 leading-relaxed"><b>Jedzenie:</b> {trail.food}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); setIsMapVisibleOnMobile(true); setSelectedPin(trail); }} className="flex-1 bg-slate-100 text-slate-700 hover:bg-slate-200 py-2.5 rounded-xl text-sm font-bold flex md:hidden items-center justify-center gap-2 transition"><MapPin size={16} /> Pokaż na Mapie</button>
                <button onClick={(e) => { e.stopPropagation(); onAddTrip(trail); }} className="flex-1 bg-emerald-600 text-white hover:bg-emerald-500 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"><Plus size={16} /> Zapisz</button>
              </div>
            </div>
          ))}
        </div>

        {/* PRAWA KOLUMNA: Mapka dynamiczna */}
        <div className={`w-full md:w-1/2 lg:w-8/12 relative bg-emerald-50 rounded-none md:rounded-3xl border border-emerald-200 overflow-hidden shadow-inner flex flex-col min-h-[500px] h-full ${!isMapVisibleOnMobile ? 'hidden md:flex' : 'flex'}`}>
          <DynamicLeafletMap 
             trails={filteredTrails} 
             activeFilter={activeFilter} 
             selectedPin={selectedPin} 
             setSelectedPin={setSelectedPin} 
             onAddTrip={onAddTrip} 
             isActive={isMapVisibleOnMobile}
          />
        </div>
      </div>

      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <button 
              onClick={() => setIsMapVisibleOnMobile(!isMapVisibleOnMobile)} 
              className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-2 font-bold hover:scale-105 transition-transform"
          >
              {isMapVisibleOnMobile ? <><List size={18}/> Pokaż Listę</> : <><MapIcon size={18}/> Pokaż Mapę</>}
          </button>
      </div>

    </div>
  );
}

function ChatAssistantView() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([{ role: 'ai', text: 'Cześć! Jestem Twoim przewodnikiem turystycznym po Beskidach. Zapytaj mnie o szlaki na Skrzyczne, albo gdzie zjemy najlepszą kwaśnicę!' }]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSend = async () => {
    if (!msg.trim()) return;
    const newChat = [...chat, { role: 'user', text: msg }];
    setChat(newChat);
    setMsg("");
    setIsLoading(true);

    try {
      const isVercel = window.location.hostname.includes('vercel.app');
      let reply = "";
      
      const contextData = TRAILS_DATA.map(t => `${t.name} (Lokalizacja: ${t.location}, Jedzenie/Schroniska: ${t.food})`).join('; ');
      const systemInstruction = `Jesteś bardzo pomocnym przewodnikiem turystycznym po Beskidach (Wisła, Ustroń, Szczyrk, Brenna, Istebna).
Oto baza wiedzy z Twojej aplikacji: ${contextData}.
WAŻNE OGRANICZENIE: Jesteś tylko czatem tekstowym. NIE MASZ dostępu do klikania na ekranie ani pokazywania miejsc na interaktywnej mapie. 
Jeśli użytkownik prosi "pokaż na mapie", odpowiedz opisowo (np. "Wejdź w zakładkę Szlaki i Mapa, znajdziesz to miejsce obok...").
Zawsze odpowiadaj krótko i przyjaźnie. Pytanie turysty: ${msg}`;

      if (isVercel) {
        const res = await fetch('/api/chat', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ prompt: systemInstruction })
        });
        
        if (!res.ok) throw new Error("Vercel error");
        const data = await res.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || data.choices?.[0]?.message?.content || "Nie zrozumiałem, spróbuj jeszcze raz.";
      } else {
        const apiKey = ""; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
              contents: [{ parts: [{ text: systemInstruction }] }],
              systemInstruction: { parts: [{ text: "Jesteś pomocnym asystentem." }] }
           })
        });
        if (!res.ok) throw new Error("Canvas error");
        const data = await res.json();
        reply = data.candidates[0].content.parts[0].text;
      }

      setChat([...newChat, { role: 'ai', text: reply }]);
    } catch (e) {
      console.error(e);
      setChat([...newChat, { role: 'ai', text: "⚠️ Błąd połączenia z serwerem. Upewnij się, że dodałeś klucz 'OPENAI_API_KEY'!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 max-w-4xl mx-auto relative">
      <div className="bg-purple-900 p-6 text-white shrink-0 shadow-md z-10 flex items-center gap-4">
         <div className="bg-purple-500 p-3 rounded-full"><MessageCircle size={24} /></div>
         <div>
            <h2 className="text-2xl font-black">Asystent Turysty</h2>
            <p className="text-purple-200 text-sm">Zawsze gotowy do pomocy</p>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-28 custom-scrollbar">
        {chat.map((c, i) => (
          <div key={i} className={`flex ${c.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${c.role === 'user' ? 'bg-emerald-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
               {c.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-600" /> <span className="text-slate-500 text-sm">Asystent pisze...</span>
             </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-slate-50 border-t border-slate-200 pb-safe">
        <div className="flex gap-2 bg-white rounded-full p-2 border border-slate-300 shadow-sm">
          <input 
            value={msg} 
            onChange={e => setMsg(e.target.value)} 
            onKeyPress={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent px-4 outline-none text-slate-800" 
            placeholder="Zapytaj asystenta..." 
          />
          <button onClick={handleSend} disabled={isLoading || !msg.trim()} className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-300 text-white p-3 rounded-full transition-colors"><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
}

function AIPlannerView({ onSavePlan }) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState({ days: 1, difficulty: 'easy', companions: 'adults' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const generatePlan = () => {
    setIsGenerating(true);
    setTimeout(() => {
      let selectedTrails = [];
      if (preferences.companions === 'kids') {
        selectedTrails = TRAILS_DATA.filter(t => t.familyFriendly);
      } else if (preferences.difficulty === 'hard') {
        selectedTrails = TRAILS_DATA.filter(t => t.difficulty !== 'Bardzo Łatwa' && t.difficulty !== 'Łatwa');
      } else {
        selectedTrails = TRAILS_DATA;
      }
      
      // TASOWANIE (LOSOWOŚĆ) ABY PLAN BYŁ ZAWSZE INNY
      let shuffledTrails = [...selectedTrails].sort(() => Math.random() - 0.5);
      
      let finalPlan = [];
      while(finalPlan.length < preferences.days) {
          finalPlan = [...finalPlan, ...shuffledTrails];
      }
      finalPlan = finalPlan.slice(0, preferences.days);

      setGeneratedPlan({
        title: `Twój idealny wyjazd (${preferences.days} dni)`,
        description: preferences.companions === 'kids' ? "Wybrałem trasy spacerowe i pełne atrakcji dla najmłodszych." : "Oto optymalny plan obejmujący najciekawsze szlaki i schroniska Beskidu Śląskiego.",
        days: finalPlan
      });
      setIsGenerating(false);
      setStep(3);
    }, 2500);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto h-full flex flex-col pb-24 md:pb-8">
      <div className="bg-emerald-900 rounded-3xl p-6 md:p-10 text-white shadow-xl relative overflow-hidden shrink-0 mb-6">
        <div className="absolute -right-10 -bottom-10 opacity-20"><CalendarDays size={150} /></div>
        <h2 className="text-2xl md:text-4xl font-black mb-2 relative z-10">Kreator Planu Wyjazdu</h2>
        <p className="text-emerald-200 max-w-lg relative z-10">Zamiast przeglądać dziesiątki stron, powiedz mi czego potrzebujesz. Zbuduję harmonogram wycieczek w Beskidy specjalnie dla Ciebie.</p>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 p-6 md:p-10 overflow-y-auto custom-scrollbar">
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><CalendarDays size={20} className="text-emerald-500"/> Ile dni spędzisz w okolicy?</h3>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <button key={num} onClick={() => setPreferences({...preferences, days: num})} className={`py-3 rounded-xl font-bold border-2 transition-all ${preferences.days === num ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-300'}`}>{num}</button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Filter size={20} className="text-emerald-500"/> Z kim podróżujesz?</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button onClick={() => setPreferences({...preferences, companions: 'adults'})} className={`p-4 rounded-xl font-bold border-2 flex flex-col items-center gap-2 transition-all ${preferences.companions === 'adults' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}><User size={24}/> Dorośli</button>
                <button onClick={() => setPreferences({...preferences, companions: 'kids'})} className={`p-4 rounded-xl font-bold border-2 flex flex-col items-center gap-2 transition-all ${preferences.companions === 'kids' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}><Heart size={24}/> Z dziećmi</button>
                <button onClick={() => setPreferences({...preferences, companions: 'dog'})} className={`p-4 rounded-xl font-bold border-2 flex flex-col items-center gap-2 transition-all ${preferences.companions === 'dog' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}><MapIcon size={24}/> Z psem</button>
              </div>
            </div>

            <button onClick={() => setStep(2)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-lg mt-4">Dalej <ChevronRight className="inline" size={20}/></button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
             <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><TreePine size={20} className="text-emerald-500"/> Jaka intensywność?</h3>
              <div className="space-y-3">
                <button onClick={() => setPreferences({...preferences, difficulty: 'easy'})} className={`w-full text-left p-4 rounded-xl font-bold border-2 transition-all ${preferences.difficulty === 'easy' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}>Rekreacyjna (Spacery, doliny, wózki)</button>
                <button onClick={() => setPreferences({...preferences, difficulty: 'medium'})} className={`w-full text-left p-4 rounded-xl font-bold border-2 transition-all ${preferences.difficulty === 'medium' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}>Średnia (Regularnie chodzę po górach)</button>
                <button onClick={() => setPreferences({...preferences, difficulty: 'hard'})} className={`w-full text-left p-4 rounded-xl font-bold border-2 transition-all ${preferences.difficulty === 'hard' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-100 bg-white text-slate-500'}`}>Wysoka (Szukam wyzwań i przewyższeń)</button>
              </div>
            </div>
            
            <div className="flex gap-4">
               <button onClick={() => setStep(1)} className="px-6 py-4 rounded-2xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition">Wróć</button>
               <button onClick={generatePlan} disabled={isGenerating} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-slate-800 transition shadow-lg flex justify-center items-center gap-2">
                 {isGenerating ? <><Loader2 className="animate-spin" size={24}/> Tworzę harmonogram...</> : <><Sparkles size={20}/> Stwórz Plan</>}
               </button>
            </div>
          </div>
        )}

        {step === 3 && generatedPlan && (
          <div className="animate-in zoom-in-95 duration-500 space-y-6">
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
               <h3 className="text-2xl font-black text-emerald-900 mb-2">{generatedPlan.title}</h3>
               <p className="text-emerald-700 font-medium">{generatedPlan.description}</p>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {generatedPlan.days.map((trail, idx) => (
                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-900 text-white font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-md z-10">{idx + 1}</div>
                   
                   <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-white p-5 rounded-2xl shadow-sm border border-slate-200 ml-4 md:ml-0 hover:border-emerald-300 transition-colors">
                     <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Dzień {idx + 1}</span>
                       <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-500">{trail.location}</span>
                     </div>
                     <h4 className="font-bold text-lg text-slate-800 mb-2 leading-tight">{trail.name}</h4>
                     <p className="text-sm text-slate-600 mb-4">{trail.description}</p>
                     
                     <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex items-start gap-2">
                           <Utensils size={14} className="text-amber-600 shrink-0 mt-0.5" />
                           <span className="text-xs text-slate-700 leading-tight"><b>Jedzenie:</b> {trail.food}</span>
                        </div>
                        <div className="flex items-start gap-2">
                           <Train size={14} className="text-blue-600 shrink-0 mt-0.5" />
                           <span className="text-xs text-slate-700 leading-tight"><b>Dojazd:</b> {trail.transport}</span>
                        </div>
                     </div>

                     <div className="flex flex-wrap gap-2">
                       <span className="bg-slate-100 text-xs font-bold text-slate-600 px-2 py-1 rounded flex items-center gap-1"><History size={12}/> {trail.time}</span>
                       <span className="bg-slate-100 text-xs font-bold text-slate-600 px-2 py-1 rounded flex items-center gap-1"><Navigation size={12}/> {trail.distance}</span>
                     </div>
                   </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
               <button onClick={() => onSavePlan(generatedPlan)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-emerald-700 transition shadow-lg flex justify-center items-center gap-2 btn-bounce">
                   <History size={20} /> Zapisz w Pamiętniku
               </button>
               <button onClick={() => setStep(1)} className="w-full bg-slate-100 text-slate-600 py-3 rounded-2xl font-bold hover:bg-slate-200 transition">Nowy plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function JournalView({ savedTrips, activeTrip, setActiveTrip, onAddMedia }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMovie, setShowMovie] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      onAddMedia(activeTrip.id, url);
    });
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    setErrorMsg("");
    
    try {
        const isVercel = window.location.hostname.includes('vercel.app');
        const hiddenInstruction = aiPrompt;
        let data;

        if (isVercel) {
            const payload = { prompt: hiddenInstruction, instances: { prompt: hiddenInstruction }, parameters: { sampleCount: 1 } };
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload, type: 'image' })
            });

            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                throw new Error("Błąd Vercel API. Upewnij się, że STABILITY_API_KEY jest dodany do zmiennych środowiskowych! " + (err.error || ""));
            }
            data = await res.json();
        } else {
            const apiKey = ""; 
            const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
            const localPrompt = `A beautiful artistic masterpiece painting of ${aiPrompt}. Scenic landscape in the Beskidy mountains, vibrant colors, nature.`;
            const fallbackRes = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    instances: [{ prompt: localPrompt }],
                    parameters: { sampleCount: 1 }
                })
            });

            if (!fallbackRes.ok) throw new Error("Błąd serwera testowego");
            data = await fallbackRes.json();
        }

        const base64Image = data.predictions?.[0]?.bytesBase64Encoded || data.artifacts?.[0]?.base64 || data.image; 
        
        if (base64Image) {
            const finalUrl = base64Image.startsWith('data:image') ? base64Image : `data:image/png;base64,${base64Image}`;
            onAddMedia(activeTrip.id, finalUrl);
            setAiPrompt("");
        } else {
            throw new Error("Pusta odpowiedź z serwera grafiki.");
        }
    } catch (e) {
        console.error("Błąd generowania AI", e);
        setErrorMsg(`BŁĄD: ${e.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  if (showMovie && activeTrip) {
      return <MoviePlayer media={activeTrip.media} onClose={() => setShowMovie(false)} title={activeTrip.name} />;
  }

  if (activeTrip) {
      return (
          <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 animate-in slide-in-from-right-8 duration-300 pb-24 md:pb-8">
              <button onClick={() => setActiveTrip(null)} className="flex items-center gap-2 text-emerald-600 font-bold hover:text-emerald-700 transition">
                  <ArrowLeft size={20} /> Powrót do listy
              </button>
              
              <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-start mb-6 flex-wrap gap-4">
                      <div>
                          <h2 className="font-black text-3xl md:text-4xl text-slate-800">{activeTrip.name}</h2>
                          <p className="text-slate-500 flex items-center gap-2 mt-2 font-medium"><CalendarDays size={18}/> {activeTrip.date} • <History size={18}/> {activeTrip.duration}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-3">
                          <button onClick={() => setIsTracking(!isTracking)} className={`px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md border btn-bounce ${isTracking ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                              <Activity size={20} className={isTracking ? "animate-pulse" : ""} />
                              {isTracking ? 'Zatrzymaj GPS' : 'Rejestruj spacer'}
                          </button>
                          
                          {activeTrip.media.length > 0 && (
                              <button onClick={() => setShowMovie(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 hover:bg-slate-800 shadow-xl transition transform hover:scale-105 btn-bounce">
                                  <Film size={20} className="text-emerald-400" /> Zrób Film!
                              </button>
                          )}
                      </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                      {activeTrip.media.map((url, idx) => (
                          <div key={idx} className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative group cursor-pointer">
                              <img src={url} alt="Wspomnienie" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          </div>
                      ))}
                      <div 
                          onClick={() => fileInputRef.current?.click()} 
                          className="aspect-square bg-emerald-50 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center text-emerald-700 cursor-pointer hover:bg-emerald-100 transition shadow-inner"
                      >
                          <Upload size={32} className="mb-2 text-emerald-500" />
                          <span className="text-sm font-bold text-center px-2 leading-tight">Dodaj Zdjęcie<br/>lub Wideo</span>
                          <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*,video/*" onChange={handleFileUpload} />
                      </div>
                  </div>

                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 md:p-8 border border-indigo-100 relative overflow-hidden shadow-inner">
                      <div className="absolute right-0 top-0 opacity-10 translate-x-4 -translate-y-4"><Paintbrush size={160} /></div>
                      <h3 className="font-bold text-indigo-900 mb-2 text-xl flex items-center gap-2 relative z-10"><Sparkles size={24} className="text-indigo-500" /> Malarz z Beskidów (AI)</h3>
                      <p className="text-sm text-indigo-700 mb-6 max-w-xl relative z-10 leading-relaxed">Opisz co widziałeś na szlaku, a sztuczna inteligencja wygeneruje piękny obraz z tej chwili wprost do Twojej galerii!</p>
                      
                      {errorMsg && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg text-sm relative z-10">{errorMsg}</div>}

                      <div className="flex flex-col md:flex-row gap-3 relative z-10">
                          <input 
                              value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} 
                              placeholder="Np. jeleń we mgle na szczycie Czantorii..." 
                              className="flex-1 rounded-xl px-5 py-4 outline-none border border-indigo-200 focus:border-indigo-400 bg-white/80 backdrop-blur font-medium"
                              onKeyPress={e => e.key === 'Enter' && handleGenerateAI()}
                          />
                          <button onClick={handleGenerateAI} disabled={isGenerating || !aiPrompt} className={`px-8 py-4 rounded-xl font-black text-white flex items-center justify-center gap-2 transition-all shadow-lg ${isGenerating ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 btn-bounce'}`}>
                              {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <Paintbrush size={24} />} 
                              <span>{isGenerating ? 'Maluję obraz...' : 'Namaluj'}</span>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <h2 className="font-black text-2xl text-slate-800">Moje Wyprawy</h2>
          <p className="text-slate-500 text-sm mt-1">Zapisane statystyki i wspomnienia z wycieczek.</p>
        </div>
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex flex-col items-center justify-center font-black leading-none">
          <span className="text-xl">{savedTrips.length}</span>
          <span className="text-[10px] uppercase">Wyprawy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savedTrips.map(trip => (
          <div key={trip.id} onClick={() => setActiveTrip(trip)} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition cursor-pointer group">
            <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-emerald-700 transition-colors">{trip.name}</h3>
            <div className="flex items-center gap-4 text-sm text-slate-500 mb-4 font-medium">
              <span className="flex items-center gap-1"><CalendarDays size={16}/> {trip.date}</span>
              <span className="flex items-center gap-1"><History size={16}/> {trip.duration}</span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg"><ImageIcon size={14}/> {trip.media?.length || 0} Zdjęć</span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">Otwórz <ChevronRight size={16}/></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MoviePlayer({ media, onClose, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (media.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % media.length);
    }, 3500); 
    return () => clearInterval(timer);
  }, [media]);

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-500">
      <div className="flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-20">
        <div>
          <h3 className="text-white font-black text-2xl drop-shadow-lg flex items-center gap-3"><Film className="text-emerald-400" /> Pamiątka z Trasy</h3>
          <p className="text-slate-300 text-sm font-medium mt-1">{title}</p>
        </div>
        <button onClick={onClose} className="text-white bg-white/10 hover:bg-white/30 p-3 rounded-full backdrop-blur transition border border-white/20"><X size={24}/></button>
      </div>
      
      <div className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
        {media.map((url, idx) => (
           <img 
             key={idx} 
             src={url} 
             className={`absolute w-full h-full object-contain transition-opacity duration-1000 ${idx === currentIndex ? 'opacity-100 scale-110' : 'opacity-0 scale-100'}`} 
             alt="Slajd z wycieczki" 
             style={{ transitionProperty: 'opacity, transform', transitionDuration: '1s, 4s', transitionTimingFunction: 'ease-out' }}
           />
        ))}
        
        <div className="absolute bottom-10 left-0 w-full flex justify-center gap-3 z-20">
           {media.map((_, idx) => (
              <div key={idx} className={`h-2 rounded-full transition-all duration-500 shadow-md ${idx === currentIndex ? 'w-10 bg-emerald-500' : 'w-3 bg-white/40'}`} />
           ))}
        </div>
      </div>
    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-emerald-800 text-white font-bold shadow-inner' : 'text-emerald-200 hover:bg-emerald-800/50 hover:text-white font-medium'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-[72px] gap-1 transition-colors ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
      <div className={`p-1.5 rounded-full ${isActive ? 'bg-emerald-50 scale-110' : ''} transition-all`}>{icon}</div>
      <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
    </button>
  );
}

function QuickActionButton({ icon, label, color, iconColor, onClick }) {
  return (
    <button onClick={onClick} className={`${color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition-transform shadow-sm`}>
      <div className={`${iconColor} text-white p-3 rounded-full shadow-md`}>{icon}</div>
      <span className="font-bold text-xs text-center leading-tight mt-1">{label}</span>
    </button>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, MapPin, Navigation, Camera, Sparkles, History, Heart, 
  Coffee, TreePine, Mountain, Plus, Loader2, Send,
  User, Sun, CloudRain, Train, Eye, List, X,
  CalendarDays, LogOut, Bell, PhoneCall, AlertTriangle, ChevronRight, Filter,
  Video, Image as ImageIcon, Paintbrush, PlayCircle, Upload, Film, ArrowLeft, Utensils, Activity, MessageCircle, Lock, Minus, Maximize, Navigation2
} from 'lucide-react';

// BAZA DANYCH SZLAKÓW (Beskidy)
export const TRAILS_DATA = [
  { id: 1, location: "Ustroń", name: "Czantoria Wielka z Polany", color: "bg-red-500", distance: "3.5 km", time: "1h 45m", difficulty: "Średnia", elevation: "450 m", transport: "Pociąg do 'Ustroń Polana'.", food: "Koliba na Polanie Stokłosica", description: "Klasyczne podejście na najwyższy szczyt Ustronia.", lat: 49.679, lng: 18.791, pois: ['Polana Stokłosica', 'Koliba'], familyFriendly: false },
  { id: 2, location: "Ustroń", name: "Równica z Centrum", color: "bg-yellow-400", distance: "4.2 km", time: "1h 30m", difficulty: "Łatwa", elevation: "380 m", transport: "Pociąg do 'Ustroń Zdrój'.", food: "Gościniec Równica, Zbójnicka Chata", description: "Przyjemny szlak, idealny dla rodzin z dziećmi.", lat: 49.713, lng: 18.841, pois: ['Leśny Park Niespodzianek'], familyFriendly: true },
  { id: 3, location: "Ustroń", name: "Piramidy na Zawodziu", color: "bg-blue-500", distance: "2.5 km", time: "0h 45m", difficulty: "Bardzo Łatwa", elevation: "120 m", transport: "Pociąg do 'Ustroń Zdrój'.", food: "Karczma Ustronianka", description: "Spacer szlakiem architektury po słynnych ustronskich piramidach.", lat: 49.715, lng: 18.825, pois: ['Pijalnia Wód', 'Punkt Widokowy'], familyFriendly: true },
  { id: 4, location: "Wisła", name: "Barania Góra (Białą Wisełką)", color: "bg-blue-500", distance: "6.5 km", time: "2h 30m", difficulty: "Średnia", elevation: "620 m", transport: "Autobus (Wisła Czarne Fojtula).", food: "Brak gastronomii na szlaku - weź prowiant!", description: "Szlak wzdłuż potoku. Prowadzi przez Kaskady Rodła.", lat: 49.610, lng: 19.000, pois: ['Kaskady Rodła'], familyFriendly: false },
  { id: 5, location: "Wisła", name: "Trzy Kopce Wiślańskie", color: "bg-yellow-400", distance: "4.8 km", time: "1h 45m", difficulty: "Łatwa", elevation: "350 m", transport: "Pociąg do 'Wisła Uzdrowisko'.", food: "Telesforówka (słynne wypieki)", description: "Widokowa trasa z przerwą w Telesforówce.", lat: 49.654, lng: 18.859, pois: ['Telesforówka'], familyFriendly: true },
  { id: 6, location: "Szczyrk", name: "Skrzyczne", color: "bg-blue-500", distance: "5.2 km", time: "2h 15m", difficulty: "Trudna", elevation: "700 m", transport: "Autobus 'Szczyrk Centrum'.", food: "Schronisko PTTK Skrzyczne", description: "Wymagające podejście na najwyższy szczyt Beskidu Śląskiego.", lat: 49.684, lng: 19.030, pois: ['Schronisko PTTK'], familyFriendly: false },
  { id: 7, location: "Szczyrk", name: "Malinowska Skała", color: "bg-red-500", distance: "4.0 km", time: "1h 20m", difficulty: "Łatwa", elevation: "220 m", transport: "Autobus 'Przełęcz Salmopolska'.", food: "Najbliżej: Schronisko na Skrzycznem", description: "Widokowy szlak grzbietowy z formacją skalną.", lat: 49.664, lng: 19.006, pois: ['Malinowska Skała'], familyFriendly: true },
  { id: 8, location: "Brenna", name: "Błatnia z Centrum", color: "bg-green-500", distance: "5.5 km", time: "2h 00m", difficulty: "Średnia", elevation: "500 m", transport: "Autobus do 'Brenna Centrum'.", food: "Ranczo Błatnia, Schronisko PTTK", description: "Spokojniejsza trasa prowadząca na rozległą polanę.", lat: 49.736, lng: 18.914, pois: ['Ranczo Błatnia'], familyFriendly: false },
  { id: 9, location: "Wisła", name: "Soszów Wielki", color: "bg-blue-500", distance: "7.5 km", time: "2h 45m", difficulty: "Średnia", elevation: "450 m", transport: "Pociąg do 'Wisła Jawornik'.", food: "Schronisko na Soszowie, Lepiarzówka", description: "Pętla obok schroniska na Soszowie z pięknymi panoramami.", lat: 49.638, lng: 18.818, pois: ['Schronisko Soszów'], familyFriendly: true },
  { id: 10, location: "Szczyrk", name: "Klimczok przez Szyndzielnię", color: "bg-yellow-400", distance: "6.8 km", time: "2h 30m", difficulty: "Średnia", elevation: "550 m", transport: "Autobus MZK z Bielska.", food: "Schronisko Klimczok, Szyndzielnia", description: "Klasyk z Bielska/Szczyrku z opcją wjazdu gondolą.", lat: 49.733, lng: 19.014, pois: ['Schronisko Klimczok', 'Kolej Szyndzielnia'], familyFriendly: true },
  { id: 11, location: "Istebna", name: "Złoty Groń", color: "bg-yellow-400", distance: "2.2 km", time: "0h 40m", difficulty: "Łatwa", elevation: "150 m", transport: "Autobus do 'Istebna Centrum'.", food: "Karczmy i restauracje w Istebnej", description: "Uroczy spacer grzbietem z widokiem na Trójwieś.", lat: 49.576, lng: 18.895, pois: ['Punkt Widokowy'], familyFriendly: true }
];

function DynamicLeafletMap({ trails, activeFilter, selectedPin, setSelectedPin, onAddTrip }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script'); script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { if (isMounted) setIsLoaded(true); }; document.body.appendChild(script);
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
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);
      mapInstance.current = map;
      markersLayer.current = L.featureGroup().addTo(map);
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current) return;
    const L = window.L;
    markersLayer.current.clearLayers();

    trails.forEach(trail => {
      const isFood = activeFilter === '🍲 Gastronomia';
      const colorMap = { 'bg-red-500': '#ef4444', 'bg-yellow-400': '#eab308', 'bg-blue-500': '#3b82f6', 'bg-green-500': '#22c55e', 'bg-purple-500': '#a855f7' };
      const hexColor = colorMap[trail.color] || '#10b981';
      const isSelected = selectedPin?.id === trail.id;

      const iconHtml = `<div style="background-color: white; padding: 4px; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.4); border: 3px solid ${hexColor}; font-size: 16px; text-align: center; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transform: ${isSelected ? 'scale(1.2)' : 'scale(1)'}; transition: transform 0.2s;">${isFood ? '🍲' : '📍'}</div>`;

      const customIcon = L.divIcon({ className: 'custom-leaflet-pin', html: iconHtml, iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] });
      const marker = L.marker([trail.lat, trail.lng], { icon: customIcon });
      
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `<div class="p-1 font-sans" style="min-width: 200px;"><h3 class="font-bold text-base mb-1 text-slate-800">${trail.name}</h3><p class="text-xs text-slate-500 mb-2">${trail.location} • ${trail.difficulty}</p><p class="text-xs bg-amber-50 p-2 rounded-lg border border-amber-100 mb-3 text-slate-800"><b>🍔 Gastronomia:</b> ${trail.food}</p><button id="save-btn-${trail.id}" style="width: 100%; background-color: #059669; color: white; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: bold; border: none; cursor: pointer;">Zapisz do Pamiętnika</button></div>`;
      
      marker.bindPopup(popupContent);
      marker.on('popupopen', () => document.getElementById(`save-btn-${trail.id}`).addEventListener('click', () => onAddTrip(trail)));
      marker.on('click', () => setSelectedPin(trail));
      markersLayer.current.addLayer(marker);
    });
  }, [trails, activeFilter, selectedPin, onAddTrip]);

  useEffect(() => {
    if (mapInstance.current && selectedPin) mapInstance.current.flyTo([selectedPin.lat, selectedPin.lng], 14, { duration: 1.5 });
  }, [selectedPin]);

  const locateMe = () => {
    if (navigator.geolocation && mapInstance.current) {
      navigator.geolocation.getCurrentPosition(pos => {
        const { latitude, longitude } = pos.coords;
        mapInstance.current.flyTo([latitude, longitude], 14);
        window.L.marker([latitude, longitude]).addTo(mapInstance.current).bindPopup('Jesteś tutaj!').openPopup();
      }, () => alert("Brak dostępu do lokalizacji."));
    }
  };

  return (
    <div className="w-full h-full relative z-0">
      {!isLoaded && <div className="absolute inset-0 flex items-center justify-center bg-emerald-50 text-emerald-800 font-bold z-10 flex-col gap-3"><Loader2 className="animate-spin" size={32} />Ładowanie mapy...</div>}
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 1 }}></div>
      <button onClick={locateMe} className="absolute bottom-6 right-4 z-[400] bg-white text-blue-600 p-3 rounded-full shadow-xl border border-slate-200 hover:bg-blue-50 transition"><Navigation2 size={24} className="fill-current" /></button>
    </div>
  );
}

export default function App() {
  const SECRET_PIN = "BESKIDY2026"; 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('home'); 
  const [activeFilter, setActiveFilter] = useState('Wszystkie');
  const [savedTrips, setSavedTrips] = useState([{ id: 101, name: "Zdobycie Czantorii", date: "12 Sierpnia 2025", duration: "2h 10m", media: [] }]);
  const [activeTrip, setActiveTrip] = useState(null);

  useEffect(() => { if (localStorage.getItem('beskidyAuth') === 'true') setIsAuthenticated(true); }, []);

  const handleLogin = () => {
    if (passwordInput === SECRET_PIN) { setIsAuthenticated(true); localStorage.setItem('beskidyAuth', 'true'); } 
    else { alert('Nieprawidłowy kod dostępu!'); setPasswordInput(''); }
  };

  const handleAddTrip = (trail) => {
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    setSavedTrips(prev => [{ id: Date.now(), name: trail.name, date: today, duration: trail.time, media: [] }, ...prev]);
    setActiveTab('journal'); 
  };

  const handleAddMedia = (tripId, newMediaUrl) => {
    setSavedTrips(prev => prev.map(t => t.id === tripId ? { ...t, media: [...t.media, newMediaUrl] } : t));
    if (activeTrip && activeTrip.id === tripId) setActiveTrip(prev => ({ ...prev, media: [...prev.media, newMediaUrl] }));
  };

  const handleSaveAIPlan = (plan) => {
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    setSavedTrips(prev => [{ id: Date.now(), name: plan.title, date: today, duration: `${plan.days.length} dni`, media: [] }, ...prev]);
    setActiveTab('journal');
  };

  if (!isAuthenticated) {
      return (
          <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30"><img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" alt="Góry" className="w-full h-full object-cover" /></div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md relative z-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]"><Lock size={32} className="text-white" /></div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Osobisty Przewodnik</h1>
                  <p className="text-emerald-100/70 text-sm mb-8">Wymagany jest kod autoryzacji.</p>
                  <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleLogin(); }} placeholder="Wprowadź PIN..." className="w-full bg-black/30 border border-white/10 text-center text-white rounded-xl px-5 py-4 outline-none mb-4 text-2xl tracking-[0.5em] font-bold uppercase focus:border-emerald-500 transition-colors" />
                  <button onClick={handleLogin} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl transition-all shadow-lg active:scale-95">Odblokuj</button>
              </div>
          </div>
      );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="hidden md:flex flex-col w-72 bg-emerald-900 text-white shadow-2xl relative z-20">
        <div className="p-6 border-b border-emerald-800">
          <div className="flex items-center gap-3 mb-2"><div className="bg-emerald-500 p-2 rounded-xl"><Mountain size={28} className="text-white" /></div><div><h1 className="text-xl font-black tracking-tight leading-none">Beskidy<br/>Przewodnik</h1></div></div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<Mountain />} label="Pulpit Główny" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <SidebarItem icon={<MapIcon />} label="Mapa i Szlaki" isActive={activeTab === 'trails'} onClick={() => setActiveTab('trails')} />
          <SidebarItem icon={<CalendarDays />} label="Planer Trasy" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
          <SidebarItem icon={<MessageCircle />} label="Asystent AI" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
          <SidebarItem icon={<History />} label="Pamiętnik Wypraw" isActive={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setActiveTrip(null); }} />
        </nav>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-emerald-600 text-white p-4 shadow-md z-30 flex justify-between items-center">
        <div className="flex items-center gap-2"><Mountain size={24} /><h1 className="text-xl font-bold tracking-tight">Beskidy AI</h1></div>
      </div>

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 relative scroll-smooth z-10">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} navigateToTrailsWithFilter={(f) => {setActiveFilter(f); setActiveTab('trails');}} />}
        {activeTab === 'trails' && <TrailsView onAddTrip={handleAddTrip} activeFilter={activeFilter} setActiveFilter={setActiveFilter} />}
        {activeTab === 'planner' && <AIPlannerView onSavePlan={handleSaveAIPlan} />}
        {activeTab === 'chat' && <ChatAssistantView />}
        {activeTab === 'journal' && <JournalView savedTrips={savedTrips} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onAddMedia={handleAddMedia} />}
      </main>

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
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl flex justify-between items-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 scale-150 transform translate-x-1/4 -translate-y-1/4"><Sun size={200} /></div>
          <div className="relative z-10"><h2 className="text-2xl md:text-4xl font-bold mb-1">Dzień dobry!</h2><p className="text-blue-100 mb-6 text-sm md:text-base">Idealna pogoda na góry.</p></div>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-slate-800 mb-4 text-xl flex items-center gap-2">Szybkie menu</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton icon={<CalendarDays />} label="Kreator Trasy" color="bg-emerald-100 text-emerald-700" iconColor="bg-emerald-500" onClick={() => setActiveTab('planner')} />
          <QuickActionButton icon={<MapIcon />} label="Mapa Szlaków" color="bg-orange-100 text-orange-700" iconColor="bg-orange-500" onClick={() => navigateToTrailsWithFilter('Wszystkie')} />
        </div>
      </div>
    </div>
  );
}

function TrailsView({ onAddTrip, activeFilter, setActiveFilter }) {
  const [selectedPin, setSelectedPin] = useState(null);
  const [isMapVisibleOnMobile, setIsMapVisibleOnMobile] = useState(false); 
  const filters = ['Wszystkie', 'Ustroń', 'Wisła', 'Szczyrk', '🍲 Gastronomia'];
  const filteredTrails = TRAILS_DATA.filter(t => activeFilter === 'Wszystkie' ? true : (activeFilter === '🍲 Gastronomia' ? t.food && t.food !== "Prowiant własny" && !t.food.includes("Brak") : t.location === activeFilter));

  return (
    <div className="h-full flex flex-col md:p-6 p-0 max-w-7xl mx-auto relative z-10">
      <div className="bg-white md:bg-transparent p-4 md:p-0 border-b md:border-none border-slate-200 shrink-0 z-20">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map(f => <button key={f} onClick={() => { setActiveFilter(f); setSelectedPin(null); }} className={`px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap ${activeFilter === f ? 'bg-emerald-600 text-white' : 'bg-white border text-slate-600'}`}>{f}</button>)}
        </div>
      </div>
      <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden md:mt-2 relative">
        <div className={`w-full md:w-1/2 lg:w-4/12 overflow-y-auto p-4 space-y-4 pb-32 custom-scrollbar ${isMapVisibleOnMobile ? 'hidden md:block' : 'block'}`}>
          {filteredTrails.map(trail => (
            <div key={trail.id} onClick={() => setSelectedPin(trail)} className={`bg-white rounded-3xl p-5 shadow-sm border-2 cursor-pointer ${selectedPin?.id === trail.id ? 'border-emerald-500' : 'border-slate-100'}`}>
              <h3 className="font-bold text-lg text-slate-800">{trail.name}</h3>
              <p className="text-sm text-slate-600 my-2">{trail.description}</p>
              <button onClick={(e) => { e.stopPropagation(); onAddTrip(trail); }} className="w-full bg-emerald-600 text-white py-2 rounded-xl text-sm font-bold mt-2">Zapisz do Pamiętnika</button>
            </div>
          ))}
        </div>
        <div className={`w-full md:w-1/2 lg:w-8/12 relative bg-emerald-50 rounded-none md:rounded-3xl border border-emerald-200 overflow-hidden min-h-[500px] h-full ${!isMapVisibleOnMobile ? 'hidden md:flex' : 'flex'}`}>
          <DynamicLeafletMap trails={filteredTrails} activeFilter={activeFilter} selectedPin={selectedPin} setSelectedPin={setSelectedPin} onAddTrip={onAddTrip} />
        </div>
      </div>
      <div className="md:hidden fixed bottom-20 left-1/2 -translate-x-1/2 z-40">
          <button onClick={() => setIsMapVisibleOnMobile(!isMapVisibleOnMobile)} className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-bold">{isMapVisibleOnMobile ? 'Pokaż Listę' : 'Pokaż Mapę'}</button>
      </div>
    </div>
  );
}

function ChatAssistantView() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([{ role: 'ai', text: 'Cześć! O co chcesz zapytać?' }]);
  const handleSend = async () => {
    if (!msg.trim()) return;
    setChat([...chat, { role: 'user', text: msg }, { role: 'ai', text: 'Funkcja chatu z AI wymaga podłączenia z serwerem.' }]);
    setMsg("");
  };
  return (
    <div className="flex flex-col h-full bg-slate-50 p-4"><div className="flex-1 overflow-y-auto space-y-4 pb-20">{chat.map((c, i) => (<div key={i} className={`p-4 rounded-xl max-w-[85%] text-sm ${c.role === 'user' ? 'bg-emerald-600 text-white ml-auto' : 'bg-white border text-slate-800'}`}>{c.text}</div>))}</div><div className="absolute bottom-0 w-full p-4 bg-slate-50 border-t flex gap-2"><input value={msg} onChange={e => setMsg(e.target.value)} className="flex-1 rounded-full px-4 border outline-none" placeholder="Pytaj..." /><button onClick={handleSend} className="bg-purple-600 text-white p-3 rounded-full"><Send size={18}/></button></div></div>
  );
}

function AIPlannerView({ onSavePlan }) {
  const [step, setStep] = useState(1);
  return (
    <div className="p-8 max-w-4xl mx-auto"><div className="bg-emerald-900 rounded-3xl p-10 text-white mb-6"><h2 className="text-3xl font-black mb-2">Kreator Planu Wyjazdu</h2></div><div className="bg-white rounded-3xl border p-10"><button onClick={() => setStep(3)} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-lg">Stwórz Przykładowy Plan</button>{step === 3 && <div className="mt-8"><p>Przykładowy wygenerowany plan...</p><button onClick={() => onSavePlan({title: "Nowy Plan", days: [1,2]})} className="mt-4 bg-slate-900 text-white px-6 py-2 rounded-xl">Zapisz w Pamiętniku</button></div>}</div></div>
  );
}

function JournalView({ savedTrips, activeTrip, setActiveTrip, onAddMedia }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => onAddMedia(activeTrip.id, URL.createObjectURL(file)));
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    
    try {
        const isVercel = window.location.hostname.includes('vercel.app');
        // Wysyłamy do serwera tylko sam obiekt (np. sarna na polanie)
        const rawPrompt = aiPrompt;
        let data;

        if (isVercel) {
            const payload = { prompt: rawPrompt, instances: { prompt: rawPrompt }, parameters: { sampleCount: 1 } };
            const res = await fetch('/api/gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payload, type: 'image' })
            });

            if (!res.ok) throw new Error("Błąd Vercel API.");
            data = await res.json();
        } else {
            throw new Error("Wgraj aplikację na Vercel, by używać AI.");
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
        alert(`BŁĄD: ${e.message}`);
    } finally {
        setIsGenerating(false);
    }
  };

  if (activeTrip) {
      return (
          <div className="p-4 space-y-4">
              <button onClick={() => setActiveTrip(null)} className="text-emerald-600 font-bold mb-4 flex items-center gap-1"><ArrowLeft size={16}/> Powrót</button>
              <h2 className="text-2xl font-bold">{activeTrip.name}</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                  {activeTrip.media?.map((m, i) => <img key={i} src={m} className="rounded-xl w-full h-32 object-cover" />)}
                  <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-xl h-32 flex items-center justify-center cursor-pointer"><Upload /></div>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
              </div>
              <div className="bg-indigo-50 p-6 rounded-2xl">
                 <h3 className="font-bold mb-2">Malarz AI</h3>
                 <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="Opisz obiekt (np. sarna na polanie)..." className="w-full p-3 rounded-lg mb-3" />
                 <button onClick={handleGenerateAI} disabled={isGenerating} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">{isGenerating ? "Maluję..." : "Namaluj"}</button>
              </div>
          </div>
      );
  }
  
  return (
    <div className="p-4 space-y-4">
        {savedTrips.map(trip => (
            <div key={trip.id} onClick={() => setActiveTrip(trip)} className="bg-white p-4 rounded-xl shadow border cursor-pointer">
                <h3 className="font-bold">{trip.name}</h3>
            </div>
        ))}
    </div>
  );
}

function SidebarItem({ icon, label, isActive, onClick }) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200 hover:bg-emerald-800/50'}`}>{icon} <span>{label}</span></button>; }
function NavItem({ icon, label, isActive, onClick }) { return <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>{icon} <span className="text-[10px] font-bold">{label}</span></button>; }
function QuickActionButton({ icon, label, color, iconColor, onClick }) { return <button onClick={onClick} className={`${color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition shadow-sm`}><div className={`${iconColor} text-white p-3 rounded-full shadow-md`}>{icon}</div><span className="font-bold text-xs text-center leading-tight mt-1">{label}</span></button>; }

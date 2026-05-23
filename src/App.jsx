import React, { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, MapPin, Navigation, Camera, Sparkles, History, Heart, 
  Coffee, TreePine, Mountain, Plus, Loader2, Send,
  User, Sun, CloudRain, Train, Eye, List, X,
  CalendarDays, LogOut, Bell, PhoneCall, AlertTriangle, ChevronRight, Filter,
  Video, Image as ImageIcon, Paintbrush, PlayCircle, Upload, Film, ArrowLeft, Utensils, Activity, MessageCircle, Lock, Minus, Maximize, Navigation2
} from 'lucide-react';

// --- BAZA DANYCH SZLAKÓW (BESKID ŚLĄSKI) ---
const TRAILS_DATA = [
  { id: 1, location: "Ustroń", name: "Czantoria Wielka z Polany", color: "bg-red-500", distance: "3.5 km", time: "1h 45m", difficulty: "Średnia", elevation: "450 m", transport: "Pociąg do 'Ustroń Polana'.", food: "Koliba na Polanie Stokłosica", description: "Klasyczne podejście na najwyższy szczyt Ustronia.", mapX: "30%", mapY: "40%", pois: ['Polana Stokłosica', 'Koliba'], familyFriendly: false },
  { id: 2, location: "Ustroń", name: "Równica z Centrum", color: "bg-yellow-400", distance: "4.2 km", time: "1h 30m", difficulty: "Łatwa", elevation: "380 m", transport: "Pociąg do 'Ustroń Zdrój'.", food: "Gościniec Równica, Zbójnicka Chata", description: "Przyjemny szlak, idealny dla rodzin z dziećmi.", mapX: "40%", mapY: "30%", pois: ['Leśny Park Niespodzianek'], familyFriendly: true },
  { id: 3, location: "Ustroń", name: "Piramidy na Zawodziu", color: "bg-blue-500", distance: "2.5 km", time: "0h 45m", difficulty: "Bardzo Łatwa", elevation: "120 m", transport: "Pociąg do 'Ustroń Zdrój'.", food: "Karczma Ustronianka", description: "Spacer szlakiem architektury po słynnych ustronskich piramidach.", mapX: "35%", mapY: "25%", pois: ['Pijalnia Wód', 'Punkt Widokowy'], familyFriendly: true },
  { id: 4, location: "Wisła", name: "Barania Góra (Białą Wisełką)", color: "bg-blue-500", distance: "6.5 km", time: "2h 30m", difficulty: "Średnia", elevation: "620 m", transport: "Autobus (Wisła Czarne Fojtula).", food: "Brak gastronomii na szlaku - weź prowiant!", description: "Szlak wzdłuż potoku. Prowadzi przez Kaskady Rodła.", mapX: "60%", mapY: "80%", pois: ['Kaskady Rodła'], familyFriendly: false },
  { id: 5, location: "Wisła", name: "Trzy Kopce Wiślańskie", color: "bg-yellow-400", distance: "4.8 km", time: "1h 45m", difficulty: "Łatwa", elevation: "350 m", transport: "Pociąg do 'Wisła Uzdrowisko'.", food: "Telesforówka (słynne wypieki)", description: "Widokowa trasa z przerwą w Telesforówce.", mapX: "50%", mapY: "65%", pois: ['Telesforówka'], familyFriendly: true },
  { id: 6, location: "Szczyrk", name: "Skrzyczne", color: "bg-blue-500", distance: "5.2 km", time: "2h 15m", difficulty: "Trudna", elevation: "700 m", transport: "Autobus 'Szczyrk Centrum'.", food: "Schronisko PTTK Skrzyczne", description: "Wymagające podejście na najwyższy szczyt Beskidu Śląskiego.", mapX: "80%", mapY: "45%", pois: ['Schronisko PTTK'], familyFriendly: false },
  { id: 7, location: "Szczyrk", name: "Malinowska Skała", color: "bg-red-500", distance: "4.0 km", time: "1h 20m", difficulty: "Łatwa", elevation: "220 m", transport: "Autobus 'Przełęcz Salmopolska'.", food: "Najbliżej: Schronisko na Skrzycznem", description: "Widokowy szlak grzbietowy z formacją skalną.", mapX: "70%", mapY: "60%", pois: ['Malinowska Skała'], familyFriendly: true },
  { id: 8, location: "Brenna", name: "Błatnia z Centrum", color: "bg-green-500", distance: "5.5 km", time: "2h 00m", difficulty: "Średnia", elevation: "500 m", transport: "Autobus do 'Brenna Centrum'.", food: "Ranczo Błatnia, Schronisko PTTK", description: "Spokojniejsza trasa prowadząca na rozległą polanę.", mapX: "55%", mapY: "20%", pois: ['Ranczo Błatnia'], familyFriendly: false },
  { id: 9, location: "Wisła", name: "Soszów Wielki", color: "bg-blue-500", distance: "7.5 km", time: "2h 45m", difficulty: "Średnia", elevation: "450 m", transport: "Pociąg do 'Wisła Jawornik'.", food: "Schronisko na Soszowie, Lepiarzówka", description: "Pętla obok schroniska na Soszowie z pięknymi panoramami.", mapX: "40%", mapY: "60%", pois: ['Schronisko Soszów'], familyFriendly: true },
  { id: 10, location: "Szczyrk", name: "Klimczok przez Szyndzielnię", color: "bg-yellow-400", distance: "6.8 km", time: "2h 30m", difficulty: "Średnia", elevation: "550 m", transport: "Autobus MZK z Bielska.", food: "Schronisko Klimczok, Szyndzielnia", description: "Klasyk z Bielska/Szczyrku z opcją wjazdu gondolą.", mapX: "75%", mapY: "25%", pois: ['Schronisko Klimczok', 'Kolej Szyndzielnia'], familyFriendly: true },
  { id: 11, location: "Istebna", name: "Złoty Groń", color: "bg-yellow-400", distance: "2.2 km", time: "0h 40m", difficulty: "Łatwa", elevation: "150 m", transport: "Autobus do 'Istebna Centrum'.", food: "Karczmy i restauracje w Istebnej", description: "Uroczy spacer grzbietem z widokiem na Trójwieś.", mapX: "35%", mapY: "85%", pois: ['Punkt Widokowy'], familyFriendly: true },
  { id: 12, location: "Wisła", name: "Stożek Wielki z Łabajowa", color: "bg-green-500", distance: "3.8 km", time: "1h 30m", difficulty: "Średnia", elevation: "420 m", transport: "Pociąg do 'Wisła Głębce'.", food: "Schronisko PTTK na Stożku", description: "Dojście do najstarszego schroniska w Beskidzie Śląskim.", mapX: "25%", mapY: "65%", pois: ['Schronisko'], familyFriendly: false }
];

export default function App() {
  const SECRET_PIN = "BESKIDY2026"; 
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState('home'); 
  const [savedTrips, setSavedTrips] = useState([
    { id: 101, name: "Zdobycie Czantorii", date: "12 Sierpnia 2025", duration: "2h 10m", media: [] }
  ]);
  const [activeTrip, setActiveTrip] = useState(null);

  const handleLogin = () => {
    if (passwordInput === SECRET_PIN) {
        setIsAuthenticated(true);
        localStorage.setItem('beskidyAuth', 'true');
    } else {
        alert('Nieprawidłowy kod dostępu!');
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

  if (!isAuthenticated) {
      return (
          <div className="h-screen w-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-30"><img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1920" alt="Góry" className="w-full h-full object-cover" /></div>
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-3xl w-full max-w-md relative z-10 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.5)]"><Lock size={32} className="text-white" /></div>
                  <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Beskidy Przewodnik</h1>
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
          <SidebarItem icon={<Map />} label="Mapa i Szlaki" isActive={activeTab === 'trails'} onClick={() => setActiveTab('trails')} />
          <SidebarItem icon={<Sparkles />} label="Planer AI" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
          <SidebarItem icon={<History />} label="Pamiętnik Wypraw" isActive={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setActiveTrip(null); }} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 pb-20 md:pb-0 relative scroll-smooth z-10">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'trails' && <TrailsView onAddTrip={handleAddTrip} />}
        {activeTab === 'planner' && <AIPlannerView onSavePlan={handleSaveAIPlan} />}
        {activeTab === 'journal' && <JournalView savedTrips={savedTrips} activeTrip={activeTrip} setActiveTrip={setActiveTrip} onAddMedia={handleAddMedia} />}
      </main>

      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around p-2 pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-40">
        <NavItem icon={<Mountain />} label="Start" isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <NavItem icon={<Map />} label="Szlaki" isActive={activeTab === 'trails'} onClick={() => setActiveTab('trails')} />
        <NavItem icon={<Sparkles />} label="Planer" isActive={activeTab === 'planner'} onClick={() => setActiveTab('planner')} />
        <NavItem icon={<History />} label="Pamiętnik" isActive={activeTab === 'journal'} onClick={() => { setActiveTab('journal'); setActiveTrip(null); }} />
      </nav>
    </div>
  );
}

function HomeView({ setActiveTab }) {
  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
        <h2 className="text-3xl font-bold mb-2">Beskidy czekają!</h2>
        <p className="text-blue-100">Wybierz cel swojej dzisiejszej wyprawy.</p>
      </div>
      <button onClick={() => setActiveTab('trails')} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold">Zobacz mapę szlaków</button>
    </div>
  );
}

function TrailsView({ onAddTrip }) {
  return (
    <div className="p-4 space-y-4">
      <h2 className="font-bold text-xl">Szlaki Beskidu Śląskiego</h2>
      {TRAILS_DATA.map(trail => (
        <div key={trail.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold">{trail.name}</h3>
            <p className="text-sm text-slate-500">{trail.distance} • {trail.time}</p>
          </div>
          <button onClick={() => onAddTrip(trail)} className="bg-emerald-600 text-white p-2 rounded-lg"><Plus /></button>
        </div>
      ))}
    </div>
  );
}

function AIPlannerView({ onSavePlan }) {
  const [step, setStep] = useState(1);
  return (
      <div className="p-4">
          <h2 className="text-2xl font-black mb-4">Kreator Trasy AI</h2>
          <button onClick={() => onSavePlan({title: "Trasa Beskidzka", days: [1,2]})} className="bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold">Stwórz i zapisz plan</button>
      </div>
  );
}

function JournalView({ savedTrips, activeTrip, setActiveTrip, onAddMedia }) {
  const fileInputRef = useRef(null);
  
  if (activeTrip) {
      return (
          <div className="p-4 space-y-4">
              <button onClick={() => setActiveTrip(null)} className="text-emerald-600 font-bold mb-4 flex items-center gap-1"><ArrowLeft size={16}/> Powrót</button>
              <h2 className="text-2xl font-bold">{activeTrip.name}</h2>
              <div className="grid grid-cols-2 gap-4">
                  {activeTrip.media?.map((m, i) => <img key={i} src={m} className="rounded-xl w-full h-32 object-cover" />)}
                  <div onClick={() => fileInputRef.current.click()} className="border-2 border-dashed rounded-xl h-32 flex items-center justify-center cursor-pointer">
                      <Upload />
                      <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => onAddMedia(activeTrip.id, URL.createObjectURL(e.target.files[0]))} />
                  </div>
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

function SidebarItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? 'bg-emerald-800 text-white font-bold' : 'text-emerald-200 hover:bg-emerald-800/50'}`}>
      {icon} <span>{label}</span>
    </button>
  );
}

function NavItem({ icon, label, isActive, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 gap-1 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
      {icon} <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function QuickActionButton({ icon, label, color, iconColor, onClick }) {
  return (
    <button onClick={onClick} className={`${color} p-4 rounded-2xl flex flex-col items-center justify-center gap-2 hover:scale-105 transition shadow-sm`}>
      <div className={`${iconColor} text-white p-3 rounded-full shadow-md`}>{icon}</div>
      <span className="font-bold text-xs text-center leading-tight mt-1">{label}</span>
    </button>
  );
}

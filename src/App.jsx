import React, { useState, useEffect } from 'react';
import { User, Settings, LogOut, MapPin, Sun, X, Bell, Moon, Trash2, Coffee, CheckCircle2 } from 'lucide-react';
import BottomNav from './components/BottomNav';

import HomeView from './views/HomeView';
import TrailsView from './views/TrailsView';
import HarmonogramView from './views/HarmonogramView';
import AIAsystentView from './views/AIAsystentView';
import JournalView from './views/JournalView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // STAN WERSJI PRO (zapisywany w pamięci telefonu)
  const [isPro, setIsPro] = useState(() => localStorage.getItem('ustron_is_pro') === 'true');

  const [savedTrips, setSavedTrips] = useState(() => {
    try { 
      const localData = JSON.parse(localStorage.getItem('ustron_trips_v5')); 
      return Array.isArray(localData) ? localData : []; 
    } catch (e) { return []; }
  });

  useEffect(() => { localStorage.setItem('ustron_trips_v5', JSON.stringify(savedTrips)); }, [savedTrips]);
  useEffect(() => { localStorage.setItem('ustron_is_pro', isPro); }, [isPro]);

  const handleAddTrip = (trail) => {
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    const newTrip = { id: Date.now(), name: trail.name, loc: trail.loc, date: today, dist: trail.dist, photos: [] };
    setSavedTrips([newTrip, ...savedTrips]);
    setActiveTab('journal'); 
  };

  // Symulacja Płatności
  const handleBuyPro = () => {
    setIsPro(true);
    alert("Sukces! Płatność 14,99 zł zrealizowana (wersja testowa). Wersja PRO odblokowana!");
  };

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white h-screen flex flex-col relative overflow-hidden shadow-2xl sm:rounded-3xl sm:h-[90vh] sm:my-auto sm:border-[8px] sm:border-gray-900">
        
        <header className="bg-emerald-600 text-white p-4 pt-8 rounded-b-2xl shadow-md z-20 relative">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Szlak Ustroński AI</h1>
              <p className="text-emerald-100 text-sm flex items-center gap-1">
                Konto: {isPro ? <span className="bg-yellow-400 text-yellow-900 px-1.5 rounded text-[10px] font-bold">PRO</span> : "Darmowe"}
              </p>
            </div>
            <button onClick={() => setShowProfile(!showProfile)} className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition ${isPro ? 'bg-yellow-400 border-yellow-300 text-yellow-900 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'bg-emerald-500 border-emerald-300 hover:bg-emerald-400'}`}>
              <User size={20}/>
            </button>
          </div>
          
          {showProfile && (
            <div className="absolute top-full right-4 mt-2 w-56 bg-white rounded-2xl shadow-xl overflow-hidden text-gray-800 z-50 animate-in slide-in-from-top-2 border border-gray-100">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                 <p className="font-bold">Witaj, Turysto!</p>
                 {isPro && <span className="bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded text-[10px] font-bold">PRO</span>}
              </div>
              <div className="p-2">
                <button onClick={() => {setShowSettings(true); setShowProfile(false);}} className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 rounded-xl flex gap-2 items-center font-bold text-emerald-700 transition"><Settings size={18}/> Ustawienia i PRO</button>
                <button onClick={() => setShowProfile(false)} className="w-full text-left px-3 py-2.5 hover:bg-gray-50 rounded-xl flex gap-2 items-center mt-1 font-medium text-gray-500"><LogOut size={18}/> Ukryj menu</button>
              </div>
            </div>
          )}
        </header>
        
        {showProfile && <div className="absolute inset-0 z-10" onClick={() => setShowProfile(false)} />}

        {showSettings && (
          <div className="absolute inset-0 bg-gray-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-6 w-full shadow-2xl space-y-6 animate-in zoom-in-95 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="font-black text-2xl text-gray-800">Ustawienia</h3>
                <button onClick={() => setShowSettings(false)} className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition"><X size={20} className="text-gray-600"/></button>
              </div>

              {/* ZŁOTA SEKCJA PREMIUM */}
              {!isPro ? (
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                   <div className="absolute -right-4 -top-4 opacity-20"><Coffee size={120} /></div>
                   <div className="relative z-10">
                     <h4 className="font-black text-2xl mb-2 leading-tight">Postaw Twórcy Kawę ☕</h4>
                     <p className="text-sm font-medium opacity-95 mb-5 leading-relaxed">Przejdź na wersję PRO (płatność jednorazowa) i odblokuj potężny 5-dniowy Planer AI oraz generowanie pamiątkowych filmów Wideo.</p>
                     <button onClick={handleBuyPro} className="w-full bg-white text-orange-600 font-black py-4 rounded-xl shadow-md hover:scale-[1.02] transition-transform text-lg">Kup PRO za 14,99 zł</button>
                   </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl p-6 text-white shadow-lg flex items-center gap-4">
                   <div className="bg-white/20 p-3 rounded-full"><CheckCircle2 size={32} /></div>
                   <div>
                     <h4 className="font-black text-xl mb-1">Jesteś użytkownikiem PRO!</h4>
                     <p className="text-xs font-medium opacity-90">Dziękujemy za wsparcie. Wszystkie funkcje aplikacji są dla Ciebie odblokowane.</p>
                   </div>
                </div>
              )}
              
              <div className="space-y-5 pt-2">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                     <div className="bg-blue-50 p-2.5 rounded-xl text-blue-600"><Bell size={20}/></div>
                     <div><p className="font-bold text-gray-800 text-sm">Powiadomienia</p><p className="text-[10px] text-gray-500 font-medium">Pogoda i alerty ze szlaków</p></div>
                  </div>
                  <input type="checkbox" className="toggle w-12 h-6 bg-emerald-500 rounded-full appearance-none cursor-pointer checked:bg-emerald-600" defaultChecked />
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                     <div className="bg-gray-100 p-2.5 rounded-xl text-gray-600"><Moon size={20}/></div>
                     <div><p className="font-bold text-gray-800 text-sm">Tryb Ciemny</p><p className="text-[10px] text-gray-500 font-medium">Oszczędza baterię w górach</p></div>
                  </div>
                  <input type="checkbox" className="toggle w-12 h-6 bg-gray-300 rounded-full appearance-none cursor-pointer" />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button onClick={() => { if(window.confirm("Na pewno usunąć wszystkie wyprawy z Pamiętnika?")) setSavedTrips([]); setShowSettings(false); }} className="w-full py-4 bg-red-50 text-red-600 font-bold rounded-2xl flex justify-center items-center gap-2 hover:bg-red-100 transition"><Trash2 size={18}/> Wyczyść dane aplikacji</button>
              </div>
            </div>
          </div>
        )}

        {/* PRZEKAZUJEMY 'isPro' DO MODUŁÓW, ŻEBY WIEDZIAŁY, CZY ODBLOKOWAĆ FUNKCJE */}
        <main className="flex-1 overflow-y-auto pb-24 bg-gray-50 z-0 relative scrollbar-hide">
          {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} savedTrips={savedTrips} />}
          {activeTab === 'trails' && <TrailsView onAddTrip={(t) => { setSavedTrips([{id:Date.now(), name:t.name, loc:t.loc, date:new Date().toLocaleDateString('pl-PL'), dist:t.dist, photos: []}, ...savedTrips]); setActiveTab('journal');}} />}
          {activeTab === 'kalendarz' && <HarmonogramView isPro={isPro} />}
          {activeTab === 'ai' && <AIAsystentView />}
          {activeTab === 'journal' && <JournalView savedTrips={savedTrips} setSavedTrips={setSavedTrips} isPro={isPro} />}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </div>
  );
}
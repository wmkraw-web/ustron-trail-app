import React, { useState, useEffect } from 'react';
import { MapPin, Sun, Mountain, Camera, Sparkles, ChevronRight, Compass, Flame, Map, CalendarDays, Coffee, Navigation } from 'lucide-react';

export default function HomeView({ setActiveTab, savedTrips }) {
  const [temp, setTemp] = useState("--");
  const [weatherDesc, setWeatherDesc] = useState("Pobieram...");

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=49.72&longitude=18.81&current_weather=true')
      .then(r=>r.json())
      .then(d => {
        setTemp(Math.round(d.current_weather.temperature));
        setWeatherDesc(d.current_weather.temperature > 15 ? "Idealnie na szlak" : "Rześko w górach");
      })
      .catch(()=>{ setTemp("18"); setWeatherDesc("Słonecznie"); });
  }, []);

  const totalKm = savedTrips.reduce((s, t) => s + parseFloat(t.dist || 0), 0).toFixed(1);

  return (
    <div className="pb-10 animate-in fade-in bg-gray-50">
      {/* NOWY HERO SECTION */}
      <div className="bg-emerald-600 rounded-b-[2.5rem] p-6 pt-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1542224566-6e85f2e6772f?q=80&w=800')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-200 text-sm font-bold flex items-center gap-1 mb-1"><MapPin size={14}/> Beskid Śląski</p>
              <h2 className="text-3xl font-black text-white leading-tight">Gotowy na<br/>przygodę?</h2>
            </div>
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-3 border border-white/20 text-center shadow-inner">
              <Sun className="text-yellow-300 mx-auto mb-1" size={28}/>
              <p className="text-2xl font-black text-white">{temp}°C</p>
              <p className="text-[10px] text-white font-medium uppercase tracking-wider">{weatherDesc}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-1 flex shadow-lg">
            <button onClick={() => setActiveTab('kalendarz')} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold shadow-md transition-transform active:scale-95">Zaplanuj z AI</button>
            <button onClick={() => setActiveTab('trails')} className="flex-1 bg-transparent text-gray-700 py-3 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">Mapa Szlaków</button>
          </div>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* STATYSTYKI */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center gap-3">
            <div className="bg-emerald-50 p-3 rounded-2xl text-emerald-600"><Navigation size={20}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Dystans</p>
              <p className="text-xl font-black text-gray-800">{totalKm} <span className="text-xs text-gray-500 font-medium">km</span></p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 flex items-center gap-3">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600"><Mountain size={20}/></div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase">Wyprawy</p>
              <p className="text-xl font-black text-gray-800">{savedTrips.length}</p>
            </div>
          </div>
        </div>

        {/* INSPIRACJE - KARUZELA */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2"><Flame className="text-orange-500" size={18}/> Popularne dzisiaj</h3>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <div onClick={() => setActiveTab('trails')} className="min-w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 transition">
              <div className="bg-blue-50 p-3 rounded-full text-blue-500"><Mountain size={24}/></div>
              <p className="font-bold text-sm text-gray-800">Szczyty</p>
            </div>
            <div onClick={() => setActiveTab('ai')} className="min-w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 transition">
              <div className="bg-orange-50 p-3 rounded-full text-orange-500"><Coffee size={24}/></div>
              <p className="font-bold text-sm text-gray-800">Schroniska</p>
            </div>
            <div onClick={() => setActiveTab('trails')} className="min-w-[140px] bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-emerald-300 transition">
              <div className="bg-emerald-50 p-3 rounded-full text-emerald-500"><Compass size={24}/></div>
              <p className="font-bold text-sm text-gray-800">Spacerowe</p>
            </div>
          </div>
        </div>

        {/* SZYBKIE AKCJE */}
        <div>
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">Odkrywaj Beskidy</h3>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setActiveTab('kalendarz')} className="bg-orange-50 rounded-3xl p-4 text-left border border-orange-100 hover:bg-orange-100 transition group">
              <CalendarDays className="text-orange-500 mb-3" size={28}/>
              <p className="font-bold text-gray-800 text-sm">Planer AI</p>
              <p className="text-[10px] text-gray-500 mt-1">Ułóż 5-dniowy wyjazd</p>
            </button>
            <button onClick={() => setActiveTab('ai')} className="bg-emerald-50 rounded-3xl p-4 text-left border border-emerald-100 hover:bg-emerald-100 transition group">
              <Sparkles className="text-emerald-500 mb-3" size={28}/>
              <p className="font-bold text-gray-800 text-sm">Zapytaj AI</p>
              <p className="text-[10px] text-gray-500 mt-1">Gdzie zjeść obiad?</p>
            </button>
          </div>
        </div>

        {/* BANER PAMIĘTNIKA */}
        <div onClick={() => setActiveTab('journal')} className="bg-gray-900 rounded-3xl p-5 shadow-xl text-white relative overflow-hidden cursor-pointer hover:bg-gray-800 transition">
          <div className="absolute right-0 bottom-0 opacity-20 -translate-x-2 translate-y-4"><Camera size={100}/></div>
          <h3 className="font-bold mb-1 flex items-center gap-2 text-lg"><Camera className="text-emerald-400" size={20}/> Twoje Wspomnienia</h3>
          <p className="text-sm text-gray-400 mb-4 pr-12">Dodawaj zdjęcia i twórz z nich pamiątkowe wideo AI.</p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold">Otwórz Pamiętnik <ChevronRight size={14}/></div>
        </div>
      </div>
    </div>
  );
}
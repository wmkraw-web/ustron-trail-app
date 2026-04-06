import React, { useState } from 'react';
import { CalendarDays, Coffee, Mountain, Sparkles, Loader2, Info, Navigation, Train, LogOut, Lock } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';

export default function HarmonogramView({ isPro }) {
  const [activeDay, setActiveDay] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [planData, setPlanData] = useState([]);

  const generatePlan = () => {
    if (!isPro) {
      alert("Odblokuj wersję PRO w Ustawieniach, aby ułożyć 5-dniowy plan!");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      setPlanData([
        { day: 1, title: 'Ustroń: Równica', center: [49.715, 18.825], events: [
          { time: '09:00', title: 'Śniadanie na mieście', type: 'food', color: '#f97316', lat: 49.722, lng: 18.810 },
          { time: '10:30', title: 'Szlak na Równicę', type: 'hike', color: '#10b981', lat: 49.712, lng: 18.845 },
          { time: '14:30', title: 'Obiad: Zbójnicka Chata', type: 'food', color: '#f97316', lat: 49.713, lng: 18.843 },
          { time: '16:30', title: 'Leśny Park Niespodzianek', type: 'attraction', color: '#3b82f6', lat: 49.710, lng: 18.820 },
          { time: '19:00', title: 'Kolacja: Karczma Ustrońska', type: 'food', color: '#f97316', lat: 49.718, lng: 18.815 },
          { time: '20:30', title: 'Relaks w Parku Kuracyjnym', type: 'attraction', color: '#8b5cf6', lat: 49.725, lng: 18.805 }
        ]},
        { day: 2, title: 'Ustroń: Czantoria', center: [49.69, 18.81], events: [
          { time: '09:00', title: 'Solidne Śniadanie', type: 'food', color: '#f97316', lat: 49.720, lng: 18.810 },
          { time: '10:30', title: 'Kolejka Linowa', type: 'attraction', color: '#3b82f6', lat: 49.704, lng: 18.820 },
          { time: '11:30', title: 'Czantoria Wielka', type: 'hike', color: '#10b981', lat: 49.679, lng: 18.804 },
          { time: '14:30', title: 'Obiad (Koliba)', type: 'food', color: '#f97316', lat: 49.680, lng: 18.805 },
          { time: '17:00', title: 'Pijalnia Wód', type: 'attraction', color: '#3b82f6', lat: 49.720, lng: 18.815 },
          { time: '19:30', title: 'Wieczorny spacer i Kolacja', type: 'food', color: '#f97316', lat: 49.722, lng: 18.818 }
        ]},
        { day: 3, title: 'Wisła: Dolina Wisełki', center: [49.61, 18.98], events: [
          { time: '09:00', title: 'Kawa i wczesne śniadanie', type: 'food', color: '#f97316', lat: 49.650, lng: 18.860 },
          { time: '10:00', title: 'Dojazd do Wisły Czarnego', type: 'attraction', color: '#3b82f6', lat: 49.620, lng: 18.940 },
          { time: '11:00', title: 'Szlak na Baranią Górę', type: 'hike', color: '#10b981', lat: 49.606, lng: 19.010 },
          { time: '15:00', title: 'Przysłop (Obiad)', type: 'food', color: '#f97316', lat: 49.605, lng: 18.995 },
          { time: '18:00', title: 'Powrót do Wisły Centrum', type: 'attraction', color: '#3b82f6', lat: 49.652, lng: 18.858 },
          { time: '20:30', title: 'Kolacja w góralskiej chacie', type: 'food', color: '#f97316', lat: 49.655, lng: 18.865 }
        ]},
        { day: 4, title: 'Wisła: Trzy Kopce', center: [49.65, 18.88], events: [
          { time: '09:30', title: 'Późne Śniadanie', type: 'food', color: '#f97316', lat: 49.650, lng: 18.860 },
          { time: '11:00', title: 'Szlak: Trzy Kopce', type: 'hike', color: '#10b981', lat: 49.660, lng: 18.895 },
          { time: '14:30', title: 'Obiad w Telesforówce', type: 'food', color: '#f97316', lat: 49.662, lng: 18.890 },
          { time: '17:30', title: 'Bulwary nad Wisłą', type: 'attraction', color: '#3b82f6', lat: 49.650, lng: 18.860 },
          { time: '20:00', title: 'Uroczysta kolacja', type: 'food', color: '#f97316', lat: 49.658, lng: 18.862 }
        ]},
        { day: 5, title: 'Koniaków i Powrót', center: [49.55, 18.93], events: [
          { time: '09:00', title: 'Śniadanie pożegnalne', type: 'food', color: '#f97316', lat: 49.550, lng: 18.940 },
          { time: '10:30', title: 'Punkt widokowy: Ochodzita', type: 'hike', color: '#10b981', lat: 49.540, lng: 18.948 },
          { time: '12:30', title: 'Zakupy serów', type: 'food', color: '#f97316', lat: 49.545, lng: 18.950 },
          { time: '14:30', title: 'Ostatni Górski Obiad', type: 'food', color: '#f97316', lat: 49.548, lng: 18.945 },
          { time: '16:30', title: 'Spacer po Istebnej', type: 'attraction', color: '#3b82f6', lat: 49.565, lng: 18.915 },
          { time: '20:00', title: 'Wyjazd do domu', type: 'attraction', color: '#ef4444', lat: 49.600, lng: 18.850 }
        ]}
      ]);
      setIsGenerating(false);
    }, 1500);
  };

  const day = planData.find(p => p.day === activeDay);

  return (
    <div className="p-4 space-y-4 pb-10">
      <h2 className="font-bold text-2xl text-gray-800 mb-2">Twój Planer AI</h2>
      
      {planData.length === 0 ? (
        <div className="mt-8 border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center bg-white shadow-sm relative overflow-hidden">
          {!isPro && (
             <div className="absolute top-4 right-4 bg-orange-100 text-orange-600 p-2 rounded-full shadow-sm">
                <Lock size={18} />
             </div>
          )}
          <div className="bg-emerald-100 p-5 rounded-full mb-4 text-emerald-600 inline-block">
            {isGenerating ? <Loader2 className="animate-spin" size={32}/> : <CalendarDays size={32}/>}
          </div>
          <h3 className="font-bold text-xl mb-2 text-gray-800">{isGenerating ? "AI układa plan..." : "Brak Planu"}</h3>
          <p className="text-sm text-gray-500 mb-6 font-medium">
            {isPro ? "Sztuczna inteligencja przygotuje dla Ciebie 5-dniowy, pełny plan od śniadania do kolacji." : "Planer 5-dniowy to funkcja premium. Odblokuj go, aby AI stworzyło idealny wyjazd."}
          </p>
          <button onClick={generatePlan} disabled={isGenerating} className={`w-full py-3.5 rounded-xl font-bold transition flex items-center justify-center gap-2 ${isPro ? 'bg-gray-900 text-white hover:bg-gray-800 shadow-md' : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg hover:shadow-xl'}`}>
            {isPro ? "Generuj Plan 5-dniowy" : <><Lock size={16}/> Wymagana Wersja PRO</>}
          </button>
        </div>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {/* POPRAWKA: Dodane słowo "Dzień" na przycisku */}
            {planData.map(d => (
              <button key={d.day} onClick={() => setActiveDay(d.day)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeDay === d.day ? 'bg-gray-900 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600'}`}>
                Dzień {d.day}
              </button>
            ))}
          </div>

          <div className="bg-emerald-600 rounded-3xl p-5 text-white shadow-md mb-6 animate-in fade-in">
            <h3 className="font-black text-xl">{day.title}</h3>
          </div>

          <div className="h-48 w-full rounded-3xl overflow-hidden shadow-md z-0 border-2 border-white">
             <MapContainer key={activeDay} center={day.center} zoom={13} className="w-full h-full">
               <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
               {day.events.map((e, i) => (
                 <CircleMarker key={i} center={[e.lat, e.lng]} pathOptions={{ color: e.color, fillColor: e.color, fillOpacity: 0.8 }} radius={8}>
                    <Popup>{e.time} - {e.title}</Popup>
                 </CircleMarker>
               ))}
             </MapContainer>
          </div>

          <div className="space-y-4">
            {day.events.map((e, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border flex items-center gap-3 animate-in slide-in-from-bottom-2" style={{ animationDelay: `${i * 50}ms` }}>
                <div className="bg-gray-50 p-3 rounded-2xl">{e.type==='food'?<Coffee className="text-orange-500" size={18}/>:e.type==='hike'?<Mountain className="text-emerald-500" size={18}/>:<Info className="text-blue-500" size={18}/>}</div>
                <div><p className="font-bold text-gray-800 leading-tight">{e.title}</p><p className="text-sm font-bold" style={{color: e.color}}>{e.time}</p></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { ChevronRight, Mountain, Camera, Film, Trash2, Download, Loader2, Image as ImageIcon, MapPin, Plus, Sparkles, Play, Lock } from 'lucide-react';

export default function JournalView({ savedTrips, setSavedTrips, isPro }) {
  const [selected, setSelected] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customDist, setCustomDist] = useState("");

  const handlePhotoUpload = (e, tripId) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSavedTrips(prev => prev.map(t => {
          if(t.id === tripId) {
            const updatedPhotos = [...(t.photos || []), reader.result];
            setSelected({ ...t, photos: updatedPhotos });
            return { ...t, photos: updatedPhotos };
          }
          return t;
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addDemoPhoto = (tripId) => {
    const demoImgUrl = "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80";
    setSavedTrips(prev => prev.map(t => {
      if(t.id === tripId) {
        const updatedPhotos = [...(t.photos || []), demoImgUrl];
        setSelected({ ...t, photos: updatedPhotos });
        return { ...t, photos: updatedPhotos };
      }
      return t;
    }));
  };

  const handleExportVideo = () => {
    if (!isPro) {
      alert("Funkcja montażu Wideo AI jest dostępna tylko w wersji PRO! Odblokuj w Ustawieniach.");
      return;
    }
    if (!selected.photos || selected.photos.length === 0) {
      alert("Dodaj minimum jedno zdjęcie z tej wyprawy, aby wygenerować wideo!");
      return;
    }
    setIsExporting(true);
    setExportComplete(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportComplete(true);
    }, 2500);
  };

  const handleSaveCustomTrip = () => {
    if(!customName) return;
    const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });
    const newTrip = { id: Date.now(), name: customName, loc: "Własna trasa", date: today, dist: customDist || "-", photos: [] };
    setSavedTrips([newTrip, ...savedTrips]);
    setShowCustomModal(false);
    setCustomName(""); setCustomDist("");
  };

  if (selected) {
    return (
      <div className="p-4 space-y-4 relative min-h-full animate-in slide-in-from-right-4 pb-10">
        <button onClick={() => {setSelected(null); setExportComplete(false);}} className="flex items-center gap-2 text-emerald-600 font-bold mb-4 hover:text-emerald-700 transition">
          <ChevronRight className="rotate-180" /> Wróć do listy
        </button>
        
        {isExporting && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center rounded-3xl text-center p-6 border border-gray-100 animate-in fade-in">
             <Loader2 size={56} className="animate-spin text-orange-500 mb-6" />
             <h3 className="font-black text-2xl text-gray-800 mb-2">Montuję Rolkę AI...</h3>
             <p className="text-gray-500 font-medium">Asystent analizuje zdjęcia z "{selected.name}", dopasowuje dynamikę i muzykę.</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black text-gray-800 leading-tight mb-2">{selected.name}</h2>
          <div className="flex gap-2 mb-6">
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-md text-xs font-bold uppercase">{selected.date}</span>
            <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-md text-xs font-bold uppercase">{selected.dist} km</span>
          </div>

          {exportComplete && isPro ? (
            <div className="mb-8 bg-black rounded-2xl overflow-hidden shadow-2xl relative animate-in zoom-in-95 border-2 border-gray-900">
               <video src="https://cdn.pixabay.com/video/2020/05/25/40141-424754714_tiny.mp4" autoPlay loop muted playsInline className="w-full h-56 object-cover opacity-90"></video>
               <div className="absolute top-3 left-3 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-sm"><Sparkles size={12}/> AI</div>
            </div>
          ) : (
            <div className={`border rounded-3xl p-5 mb-8 shadow-sm ${isPro ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100' : 'bg-gray-50 border-gray-200 opacity-80'}`}>
               <div className="flex justify-between items-start mb-2">
                 <h3 className={`font-black flex items-center gap-2 ${isPro ? 'text-orange-800' : 'text-gray-500'}`}><Film size={20}/> Wygeneruj Wideo</h3>
                 {!isPro && <Lock size={18} className="text-gray-400" />}
               </div>
               <p className={`text-xs mb-4 font-medium leading-relaxed ${isPro ? 'text-orange-700' : 'text-gray-500'}`}>
                 {isPro ? "Asystent zmontuje profesjonalny film pod muzykę z Twoich zdjęć z tej trasy." : "Odblokuj wersję PRO, aby zamienić zdjęcia w piękne, zmontowane wideo z muzyką i mapami."}
               </p>
               <button onClick={handleExportVideo} className={`w-full py-3.5 rounded-xl text-sm font-bold shadow-md transition-all flex justify-center items-center gap-2 ${isPro ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-500'}`}>
                  {isPro ? <><Play size={16} fill="currentColor"/> Stwórz Wideo Pamiątkę</> : <><Lock size={16}/> Funkcja PRO</>}
               </button>
            </div>
          )}

          <div className="flex justify-between items-center mb-4">
             <p className="font-bold text-gray-800 text-lg">Twoja Galeria ({selected.photos?.length || 0})</p>
             <button onClick={() => addDemoPhoto(selected.id)} className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-1 rounded font-bold hover:bg-emerald-100 transition">+ Testowe zdjęcie</button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {(selected.photos || []).map((photo, i) => (
              <img key={i} src={photo} alt="Pamiątka" className="aspect-square w-full object-cover rounded-2xl border border-gray-200 shadow-sm" />
            ))}
            
            <label className="aspect-square w-full bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 hover:text-emerald-600 transition-all shadow-sm group">
              <Camera size={32} className="mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-center px-2">Aparat / Dysk</span>
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoUpload(e, selected.id)} />
            </label>
          </div>

          <button onClick={() => { setSavedTrips(savedTrips.filter(t => t.id !== selected.id)); setSelected(null); }} className="w-full text-red-500 text-sm py-3.5 hover:bg-red-50 rounded-xl flex items-center justify-center gap-2 transition font-bold border border-transparent"><Trash2 size={18}/> Usuń tę wyprawę</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 animate-in fade-in relative h-full">
      <div className="flex justify-between items-center">
        <h2 className="font-black text-3xl text-gray-800">Pamiętnik</h2>
        <span className="bg-gray-900 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-md">{savedTrips.length} wpisów</span>
      </div>
      
      <div className="space-y-4 pb-4">
        <button onClick={() => setShowCustomModal(true)} className="w-full border-2 border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 rounded-3xl p-5 flex items-center justify-center gap-2 font-bold hover:bg-emerald-100 transition shadow-sm text-lg">
          <MapPin size={24} /> Dodaj własny spacer
        </button>

        {savedTrips.length === 0 && (
          <div className="bg-white rounded-3xl p-8 text-center mt-6 shadow-sm border border-gray-100">
            <div className="bg-gray-50 p-5 rounded-full mb-4 text-gray-400 inline-block"><ImageIcon size={40} /></div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Brak Wypraw</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed">Użyj zielonego przycisku wyżej, aby zapisać spacer z psem, lub dodaj oficjalny szlak z zakładki "Szlaki".</p>
          </div>
        )}

        {savedTrips.map(trip => (
          <div key={trip.id} onClick={() => setSelected(trip)} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-emerald-100 transition group">
            <h3 className="font-bold text-xl text-gray-800 leading-tight group-hover:text-emerald-700 transition-colors">{trip.name}</h3>
            <p className="text-sm text-gray-500 font-medium mt-1 mb-4">{trip.date} • {trip.dist} km</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {trip.photos?.length > 0 ? (
                   <span className="bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"><ImageIcon size={14}/> {trip.photos.length} zdjęć</span>
                ) : (
                   <span className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"><Camera size={14}/> Brak zdjęć</span>
                )}
              </div>
              <div className="bg-gray-50 p-2 rounded-full group-hover:bg-emerald-50"><ChevronRight className="text-gray-400 group-hover:text-emerald-600 transition-colors" size={18} /></div>
            </div>
          </div>
        ))}
      </div>

      {showCustomModal && (
        <div className="absolute inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-6 w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <h3 className="font-black text-2xl text-gray-800">Nowy Spacer</h3>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-2">Nazwa</label>
               <input value={customName} onChange={e=>setCustomName(e.target.value)} placeholder="np. Spacer w lesie" className="w-full bg-gray-50 mt-1 p-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-gray-800 border border-gray-200" />
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase ml-2">Dystans w km</label>
               <input value={customDist} onChange={e=>setCustomDist(e.target.value)} type="number" placeholder="np. 4.5" className="w-full bg-gray-50 mt-1 p-4 rounded-2xl outline-none font-bold text-lg text-gray-800 border border-gray-200" />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setShowCustomModal(false)} className="flex-1 p-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition">Anuluj</button>
              <button onClick={handleSaveCustomTrip} className="flex-1 p-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:bg-emerald-500 transition">Zapisz do Pamiętnika</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from 'react';
import { Map as MapIcon, Navigation, Plus, List, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { TRAILS_DATA } from '../data/trailsData';

const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

export default function TrailsView({ onAddTrip }) {
  const [viewMode, setViewMode] = useState('list');
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeFilter, setActiveFilter] = useState('Wszystkie');
  
  const filters = ['Wszystkie', 'Ustroń', 'Wisła', 'Szczyrk', 'Brenna', 'Istebna', 'Bielsko-Biała'];
  const filteredTrails = activeFilter === 'Wszystkie' ? TRAILS_DATA : TRAILS_DATA.filter(t => t.loc === activeFilter);

  return (
    <div className="p-4 space-y-4 h-full flex flex-col animate-in fade-in">
      <div className="flex justify-between items-center">
        <h2 className="font-bold text-2xl text-gray-800">Szlaki i Mapy</h2>
        <div className="bg-gray-200 p-1 rounded-xl flex gap-1">
          <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}><List size={18} /></button>
          <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-lg ${viewMode === 'map' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'}`}><MapIcon size={18} /></button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
        {filters.map(f => (
          <span key={f} onClick={() => { setActiveFilter(f); setSelectedPin(null); }} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap cursor-pointer transition-all ${activeFilter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>{f}</span>
        ))}
      </div>

      {viewMode === 'map' ? (
        <div className="flex-1 rounded-3xl overflow-hidden border-4 border-white shadow-lg relative z-0 min-h-[400px]">
          <MapContainer center={[49.65, 18.9]} zoom={11} className="w-full h-full z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredTrails.map(t => (
              <React.Fragment key={t.id}>
                <Marker position={[t.lat, t.lng]} icon={customIcon} eventHandlers={{ click: () => setSelectedPin(t) }} />
                <Polyline positions={t.path} pathOptions={{ color: t.lineColor, weight: 6, opacity: 0.8 }} />
              </React.Fragment>
            ))}
          </MapContainer>
          
          <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl shadow-md z-[1000] text-[10px] font-bold text-gray-700">
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-red-500"></div> Główny</div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-blue-500"></div> Długi</div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-yellow-500"></div> Łącznik</div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-green-500"></div> Dojściowy</div>
            <div className="flex items-center gap-1"><div className="w-3 h-1 bg-gray-800"></div> Krótki</div>
          </div>

          {selectedPin && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 z-[1000] animate-in slide-in-from-bottom-4">
              <h3 className="font-bold text-gray-800 text-lg leading-tight">{selectedPin.name}</h3>
              <p className="text-xs text-gray-500 mb-3">{selectedPin.dist} km • {selectedPin.time}</p>
              <button onClick={() => onAddTrip(selectedPin)} className="w-full bg-emerald-600 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-md hover:bg-emerald-500"><Plus size={16}/> Dodaj do Pamiętnika</button>
              <button onClick={() => setSelectedPin(null)} className="absolute top-3 right-3 p-1.5 bg-gray-100 rounded-full text-gray-400 hover:bg-gray-200"><X size={14}/></button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-4 overflow-y-auto">
          {filteredTrails.length === 0 && <p className="text-center text-gray-500 mt-8 font-medium">Brak szlaków dla tego filtru.</p>}
          {filteredTrails.map(t => (
            <div key={t.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-2">
              <h3 className="font-bold text-xl text-gray-800 leading-tight">{t.name}</h3>
              <div className="flex items-center gap-2 mt-2 mb-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white bg-gray-800`}>{t.diff}</span>
                <span className="text-sm font-bold text-gray-600">{t.dist} km</span>
              </div>
              <button onClick={() => onAddTrip(t)} className="w-full bg-gray-50 text-gray-800 py-3 rounded-xl text-sm font-bold flex justify-center items-center gap-2 hover:bg-gray-200 transition"><Plus size={16}/> Dodaj do Pamiętnika</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
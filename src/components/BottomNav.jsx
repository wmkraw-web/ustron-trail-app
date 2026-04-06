import React from 'react';
import { Mountain, Map, CalendarDays, Sparkles, History } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const NavItem = ({ icon, label, id }) => {
    const isActive = activeTab === id;
    return (
      <button onClick={() => setActiveTab(id)} className={`flex flex-col items-center justify-center w-[4.5rem] gap-1 transition-colors ${isActive ? 'text-emerald-600' : 'text-gray-400'}`}>
        <div className={`p-1 rounded-full ${isActive ? 'bg-emerald-50' : ''}`}>{icon}</div>
        <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
      </button>
    );
  };

  return (
    <nav className="absolute bottom-0 w-full bg-white border-t flex justify-between px-2 p-3 pb-6 sm:pb-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <NavItem id="home" icon={<Mountain />} label="Start" />
      <NavItem id="trails" icon={<Map />} label="Szlaki" />
      <NavItem id="kalendarz" icon={<CalendarDays />} label="Kalendarz" />
      <NavItem id="ai" icon={<Sparkles />} label="Asystent" />
      <NavItem id="journal" icon={<History />} label="Pamiętnik" />
    </nav>
  );
}
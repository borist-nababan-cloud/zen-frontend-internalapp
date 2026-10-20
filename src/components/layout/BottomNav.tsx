import React from 'react';
import { Home, Clock, Users, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'attendance', label: 'Presensi', icon: Clock },
    { id: 'rooms', label: 'Ruang/Terapis', icon: Users },
    { id: 'profile', label: 'Profil Saya', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zen-paper/95 backdrop-blur-lg border-t border-zen-border px-2 py-1.5 safe-area-pb shadow-lg">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? 'text-zen-matcha font-bold'
                  : 'text-zen-charcoal/60 hover:text-zen-charcoal'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-zen-matcha/15 scale-110' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-zen-matcha' : 'text-zen-charcoal/70'}`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

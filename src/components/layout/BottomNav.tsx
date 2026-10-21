import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, User } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { profile } = useAuth();
  const canManageUsers = profile?.role_user === 8 || profile?.role_user === 6;

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    ...(canManageUsers ? [{ id: 'user-management', label: 'Staf & User', icon: Users }] : []),
    { id: 'profile', label: 'Profil Saya', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zen-paper/95 backdrop-blur-lg border-t border-zen-border px-4 py-2 safe-area-pb shadow-lg">
      <div className={`grid ${tabs.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2 max-w-sm mx-auto`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all ${
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

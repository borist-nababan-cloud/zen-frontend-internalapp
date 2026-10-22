import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Home, Users, User, Wallet, CalendarCheck } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { canManageUsers, canViewPayroll, canViewAttendance } = useAuth();

  const tabs = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    ...(canManageUsers ? [{ id: 'user-management', label: 'Staf & User', icon: Users }] : []),
    ...(canViewPayroll ? [{ id: 'payroll', label: 'Payroll', icon: Wallet }] : []),
    ...(canViewAttendance ? [{ id: 'attendance', label: 'Absensi', icon: CalendarCheck }] : []),
    { id: 'profile', label: 'Profil Saya', icon: User },
  ];

  const gridColsClass =
    tabs.length === 5
      ? 'grid-cols-5'
      : tabs.length === 4
      ? 'grid-cols-4'
      : tabs.length === 3
      ? 'grid-cols-3'
      : 'grid-cols-2';

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-zen-paper/95 backdrop-blur-lg border-t border-zen-border px-3 py-2 safe-area-pb shadow-lg">
      <div className={`grid ${gridColsClass} gap-1 max-w-md mx-auto`}>
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
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[65px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Layers, Users, Home, Wallet, CalendarCheck } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const { profile, isSuperuser, canManageUsers, canViewPayroll, canViewAttendance } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zen-border bg-zen-paper min-h-[calc(100vh-4rem)] p-4 justify-between">
      {/* Navigation Groups */}
      <div className="space-y-6">
        {/* Main Workspace Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2">
            Ruang Kerja
          </p>
          <button
            onClick={() => onTabChange('dashboard')}
            className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              currentTab === 'dashboard'
                ? 'bg-zen-matcha text-white shadow-xs'
                : 'text-zen-charcoal hover:bg-zen-linen'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Beranda Operasional</span>
          </button>
        </div>

        {/* Administration Section (Role 8 & Role 6 only) */}
        {canManageUsers && (
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2 flex items-center justify-between">
              <span>Administrasi</span>
              <span className="text-[10px] text-zen-moss font-semibold">
                {isSuperuser ? 'Superuser' : `Gerai ${profile?.kode_outlet}`}
              </span>
            </p>
            <button
              onClick={() => onTabChange('user-management')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                currentTab === 'user-management'
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'text-zen-charcoal hover:bg-zen-linen'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Manajemen User</span>
            </button>
          </div>
        )}

        {/* Operational Modules Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2">
            Modul Operasional
          </p>

          {canViewPayroll && (
            <button
              onClick={() => onTabChange('payroll')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                currentTab === 'payroll'
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'text-zen-charcoal hover:bg-zen-linen'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>View Payroll</span>
            </button>
          )}

          {canViewAttendance && (
            <button
              onClick={() => onTabChange('attendance')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                currentTab === 'attendance'
                  ? 'bg-zen-matcha text-white shadow-xs'
                  : 'text-zen-charcoal hover:bg-zen-linen'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Lihat Absensi</span>
            </button>
          )}

          {!canViewPayroll && !canViewAttendance && (
            <div className="px-3 py-5 rounded-2xl bg-zen-linen/80 border border-dashed border-zen-border text-center space-y-1.5">
              <Layers className="w-4 h-4 text-zen-moss/50 mx-auto" />
              <p className="text-xs font-semibold text-zen-charcoal/70">Modul Operasional</p>
              <p className="text-[10px] text-zen-charcoal/50 leading-relaxed">
                {isSuperuser
                  ? 'Superuser mengelola sistem secara terpusat.'
                  : 'Tautkan kode karyawan untuk membuka modul slip gaji & absensi.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-zen-linen border border-zen-border/70">
        <div className="flex items-center space-x-2 text-zen-moss mb-1">
          <Sparkles className="w-4 h-4" />
          <span className="text-xs font-bold">Zen Super-App PWA</span>
        </div>
        <p className="text-[11px] text-zen-charcoal/70 leading-relaxed">
          Dirancang khusus untuk operasional staf gerai & holding Zen Family Spa.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;

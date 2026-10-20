import React from 'react';
import {
  Home,
  Clock,
  Users,
  Package,
  Star,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Beranda Ops', icon: Home, badge: 'Live' },
    { id: 'attendance', label: 'Presensi Staff', icon: Clock },
    { id: 'rooms', label: 'Ruang & Terapis', icon: Users },
    { id: 'inventory', label: 'Gudang & Bahan', icon: Package },
    { id: 'feedback', label: 'Rating & Tamu', icon: Star },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zen-border bg-zen-paper min-h-[calc(100vh-4rem)] p-4 justify-between">
      {/* Navigation Links */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2">
            Modul Operasional
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-zen-matcha text-white shadow-sm'
                      : 'text-zen-charcoal hover:bg-zen-sand/20 hover:text-zen-charcoal'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zen-charcoal/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-zen-matcha/15 text-zen-moss'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Links / External Apps */}
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2">
            Ekosistem Zen
          </p>
          <div className="space-y-1">
            <a
              href="https://zendashboard.nababancloud.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zen-charcoal/80 hover:bg-zen-sand/15 transition-colors"
            >
              <span>Zen Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5 text-zen-charcoal/40" />
            </a>
            <a
              href="https://zenwhms.nababancloud.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-zen-charcoal/80 hover:bg-zen-sand/15 transition-colors"
            >
              <span>Warehouse (WHMS)</span>
              <ExternalLink className="w-3.5 h-3.5 text-zen-charcoal/40" />
            </a>
          </div>
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

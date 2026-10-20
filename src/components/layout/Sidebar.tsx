import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-zen-border bg-zen-paper min-h-[calc(100vh-4rem)] p-4 justify-between">
      {/* Navigation Header */}
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 mb-2">
            Modul Operasional
          </p>
          <div className="px-3 py-6 rounded-2xl bg-zen-linen/80 border border-dashed border-zen-border text-center space-y-2">
            <Layers className="w-5 h-5 text-zen-moss/50 mx-auto" />
            <p className="text-xs font-semibold text-zen-charcoal/70">
              Menyiapkan Modul
            </p>
            <p className="text-[11px] text-zen-charcoal/50 leading-relaxed">
              Modul operasional akan diimplementasikan satu per satu pada tahap berikutnya.
            </p>
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

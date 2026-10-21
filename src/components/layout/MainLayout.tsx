import React from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

interface MainLayoutProps {
  children: React.ReactNode;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentTab,
  onTabChange,
}) => {
  return (
    <div className="min-h-screen bg-zen-linen text-zen-charcoal flex flex-col">
      {/* 1. Sticky Header */}
      <Header currentTab={currentTab} onTabChange={onTabChange} />

      {/* 2. Body: Desktop Sidebar + Scrollable Main Content Frame */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar */}
        <Sidebar currentTab={currentTab} onTabChange={onTabChange} />

        {/* Scrollable Main Content Frame */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* 3. Mobile Bottom Navigation */}
      <BottomNav currentTab={currentTab} onTabChange={onTabChange} />
    </div>
  );
};

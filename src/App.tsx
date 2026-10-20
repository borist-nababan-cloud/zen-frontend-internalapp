import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import {
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-zen-linen flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-zen-matcha/20 flex items-center justify-center animate-bounce mb-4">
          <img
            src="/Logo150x150.png"
            alt="Zen Logo"
            className="w-12 h-12 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>
        <p className="text-sm font-semibold text-zen-charcoal animate-pulse">
          Memuat Zen Internal Super-App...
        </p>
      </div>
    );
  }

  // 1. If not logged in (first time / no token in localStorage), show simple Login Page
  if (!user) {
    return <LoginPage />;
  }

  // 2. Authenticated Application Shell
  return (
    <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      <div className="space-y-6">
        {/* Welcome Staff Banner */}
        <div className="bg-gradient-to-r from-white via-white to-zen-linen p-5 sm:p-6 rounded-3xl border border-zen-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zen-matcha shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zen-matcha text-white font-bold text-lg flex items-center justify-center shadow-xs">
                  {profile?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
                Selamat Datang, {profile?.full_name}!
              </h2>
              <p className="text-xs text-zen-charcoal/60 mt-0.5">
                {profile?.email} • Outlet: <span className="font-semibold text-zen-moss">{profile?.kode_outlet || '111 (Holding)'}</span>
              </p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zen-matcha/15 text-zen-moss border border-zen-matcha/30">
                <ShieldCheck className="w-3 h-3 mr-1" />
                Role {profile?.role_user ?? 12} (OPERATIONAL_STAFF)
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
            <div className="px-3 py-1.5 rounded-xl bg-zen-sand/20 border border-zen-sand/30 text-xs font-medium text-zen-charcoal flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-zen-moss" />
              <span>Shift Aktif (WIB)</span>
            </div>
          </div>
        </div>

        {/* Modular Workspace Frame */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zen-border shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zen-linen flex items-center justify-center mx-auto text-zen-matcha border border-zen-border/70">
            <Layers className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-zen-charcoal font-serif">
              Ruang Kerja Operasional Zen
            </h3>
            <p className="text-xs sm:text-sm text-zen-charcoal/60 max-w-md mx-auto leading-relaxed">
              Struktur dasar layout mobile-adaptive dan autentikasi telah siap. Modul operasional akan diimplementasikan satu per satu pada langkah berikutnya.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-semibold text-zen-moss">
            <Sparkles className="w-4 h-4" />
            <span>Siap untuk integrasi modul presensi & operasional gerai</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;

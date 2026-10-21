import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import { EmployeeLinkScreen } from './components/auth/EmployeeLinkScreen';
import { PendingApprovalScreen } from './components/auth/PendingApprovalScreen';
import { RejectedScreen } from './components/auth/RejectedScreen';
import { UserManagementPage } from './components/admin/UserManagementPage';
import {
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Users,
  PowerOff,
  RefreshCw,
  LogOut,
  Building2,
  Briefcase,
  Hash,
  Shield,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, refreshProfile, signOut } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  // 1. Loading state
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

  // 2. Unauthenticated: show LoginPage
  if (!user) {
    return <LoginPage />;
  }

  // 3. Approval Workflow Gates:
  // Step A: Not linked to employee code
  if (profile?.approval_status === 'UNLINKED') {
    return <EmployeeLinkScreen />;
  }

  // Step B: Linked, waiting for admin approval
  if (profile?.approval_status === 'PENDING') {
    return <PendingApprovalScreen />;
  }

  // Step C: Rejected by admin
  if (profile?.approval_status === 'REJECTED') {
    return <RejectedScreen />;
  }

  // Step D: Approved, but deactivated / inactive
  if (profile?.approval_status === 'APPROVED' && !profile.is_active) {
    return (
      <div className="min-h-screen bg-zen-linen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <header className="max-w-xl w-full mx-auto flex items-center justify-between py-2">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-zen-matcha flex items-center justify-center p-1 shadow-xs">
              <img
                src="/Logo150x150.png"
                alt="Zen Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-zen-charcoal text-sm sm:text-base">ZEN INTERNAL</h1>
              <p className="text-[11px] text-zen-charcoal/60">Status Akun</p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            className="text-xs font-medium text-zen-charcoal/70 hover:text-red-600 flex items-center space-x-1.5 px-3 py-1.5 rounded-xl hover:bg-white transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </header>

        <main className="max-w-md w-full mx-auto my-auto py-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-neutral-500 mx-auto">
              <PowerOff className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
                Akun Dinonaktifkan
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zen-charcoal font-serif">
                Akses Dinonaktifkan Sementara
              </h2>
              <p className="text-xs sm:text-sm text-zen-charcoal/70 max-w-sm mx-auto leading-relaxed">
                Akun Anda saat ini sedang dinonaktifkan oleh Admin Gerai atau Superuser. Hubungi Admin Outlet Anda untuk mengaktifkan kembali akun ini.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={async () => {
                  setRefreshing(true);
                  await refreshProfile();
                  setTimeout(() => setRefreshing(false), 500);
                }}
                disabled={refreshing}
                className="w-full py-3.5 px-4 rounded-2xl bg-zen-matcha hover:bg-zen-moss text-white font-semibold text-sm shadow-md shadow-zen-matcha/20 transition-all flex items-center justify-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Memeriksa...' : 'Cek Status Akun'}</span>
              </button>
            </div>
          </div>
        </main>

        <footer className="max-w-xl w-full mx-auto text-center py-2 text-[11px] text-zen-charcoal/50">
          Zen Family Spa & Reflexology • Internal Operational Ecosystem
        </footer>
      </div>
    );
  }

  // 4. Authenticated & Approved Application Shell
  const isSuperuser = profile?.role_user === 8;
  const isOutletAdmin = profile?.role_user === 6;
  const canManageUsers = isSuperuser || isOutletAdmin;

  return (
    <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      {/* Tab: User Management (Role 8 & Role 6 only) */}
      {currentTab === 'user-management' && canManageUsers ? (
        <UserManagementPage />
      ) : currentTab === 'profile' ? (
        /* Tab: Profile View */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-xs space-y-6">
            <div className="flex items-center space-x-4 pb-6 border-b border-zen-border/70">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-zen-matcha shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-zen-matcha text-white font-bold text-xl flex items-center justify-center">
                  {profile?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
              )}
              <div>
                <h2 className="text-lg font-bold text-zen-charcoal font-serif">{profile?.full_name}</h2>
                <p className="text-xs text-zen-charcoal/60">{profile?.email}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zen-matcha/15 text-zen-moss">
                  Role {profile?.role_user} ({isSuperuser ? 'SUPERUSER' : isOutletAdmin ? 'OUTLET_ADMIN' : 'OPERATIONAL_STAFF'})
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Hash className="w-3 h-3 mr-1 text-zen-moss" />
                  Kode Karyawan
                </span>
                <p className="font-mono font-bold text-zen-charcoal">{profile?.kodekaryawan || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Building2 className="w-3 h-3 mr-1 text-zen-moss" />
                  Gerai / Outlet
                </span>
                <p className="font-bold text-zen-charcoal">Outlet {profile?.kode_outlet || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Briefcase className="w-3 h-3 mr-1 text-zen-moss" />
                  Departemen
                </span>
                <p className="font-bold text-zen-charcoal">{profile?.departemen || '-'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-zen-linen/60 border border-zen-border/60 space-y-1">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Shield className="w-3 h-3 mr-1 text-zen-moss" />
                  Status Akun
                </span>
                <p className="font-bold text-emerald-600">Aktif & Terverifikasi</p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => signOut()}
                className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar dari Akun</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Tab: Dashboard / Operational Workspace */
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
                  {profile?.email} • Outlet: <span className="font-semibold text-zen-moss">{profile?.kode_outlet || 'Pusat'}</span>
                  {profile?.kodekaryawan && (
                    <span className="ml-2 font-mono text-[11px] bg-zen-sand/20 px-2 py-0.5 rounded-md">
                      ID: {profile.kodekaryawan}
                    </span>
                  )}
                </p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zen-matcha/15 text-zen-moss border border-zen-matcha/30">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Role {profile?.role_user ?? 12} ({isSuperuser ? 'SUPERUSER' : isOutletAdmin ? 'OUTLET_ADMIN' : 'OPERATIONAL_STAFF'})
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
              {canManageUsers && (
                <button
                  onClick={() => setCurrentTab('user-management')}
                  className="px-3.5 py-2 rounded-xl bg-zen-matcha hover:bg-zen-moss text-white text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition-all active:scale-95"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Manajemen User</span>
                </button>
              )}
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
                Struktur otorisasi dua langkah dan verifikasi kode karyawan HRD telah terpasang dengan aman. Modul operasional akan diimplementasikan satu per satu pada langkah berikutnya.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-semibold text-zen-moss">
              <Sparkles className="w-4 h-4" />
              <span>Sistem siap untuk penambahan modul operasional gerai</span>
            </div>
          </div>
        </div>
      )}
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

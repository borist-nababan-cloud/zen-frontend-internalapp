import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './components/auth/LoginPage';
import { UserManagementPage } from './components/admin/UserManagementPage';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { PublicRoute } from './components/routing/PublicRoute';
import { PWAInstallBanner } from './components/pwa/PWAInstallBanner';
import {
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
  Users,
  LogOut,
  Building2,
  Briefcase,
  Hash,
  Shield,
} from 'lucide-react';

/**
 * Dashboard View
 */
const DashboardView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const isSuperuser = profile?.role_user === 8 || profile?.user_role === 8;
  const isOutletAdmin = profile?.role_user === 6 || profile?.user_role === 6;
  const canManageUsers = isSuperuser || isOutletAdmin;

  return (
    <div className="space-y-6">
      {/* Welcome Staff Banner */}
      <div className="bg-gradient-to-r from-white via-white to-zen-linen p-5 sm:p-6 rounded-3xl border border-zen-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.namakaryawan || profile.full_name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zen-matcha shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-zen-matcha text-white font-bold text-lg flex items-center justify-center shadow-xs">
                {(profile?.namakaryawan || profile?.full_name)?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
              <div className="w-3 h-3 bg-emerald-500 rounded-full" />
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
              Selamat Datang, {profile?.namakaryawan || profile?.full_name}!
            </h2>
            <p className="text-xs text-zen-charcoal/60 mt-0.5">
              {profile?.email} • Outlet:{' '}
              <span className="font-semibold text-zen-moss">
                {profile?.kode_outlet
                  ? `Outlet ${profile.kode_outlet} ${profile.name_outlet ? `• ${profile.name_outlet}` : ''}`
                  : 'Pusat / Holding'}
              </span>
              {profile?.kodekaryawan && (
                <span className="ml-2 font-mono text-[11px] bg-zen-sand/20 px-2 py-0.5 rounded-md text-zen-charcoal">
                  ID: {profile.kodekaryawan}
                </span>
              )}
            </p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-zen-matcha/15 text-zen-moss border border-zen-matcha/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Role {profile?.user_role || profile?.role_user} (
              {profile?.role_name
                ? profile.role_name.toUpperCase()
                : isSuperuser
                ? 'SUPERUSER'
                : isOutletAdmin
                ? 'OUTLET_ADMIN'
                : 'OPERATIONAL_STAFF'}
              )
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-stretch sm:self-auto justify-end">
          {canManageUsers && (
            <button
              onClick={() => navigate('/user-management')}
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
            Struktur otorisasi dua langkah dan verifikasi kode karyawan HRD telah terpasang dengan aman.
            Modul operasional akan diimplementasikan satu per satu pada langkah berikutnya.
          </p>
        </div>
        <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-semibold text-zen-moss">
          <Sparkles className="w-4 h-4" />
          <span>Sistem siap untuk penambahan modul operasional gerai</span>
        </div>
      </div>
    </div>
  );
};

/**
 * Profile View
 */
const ProfileView: React.FC = () => {
  const { profile, signOut } = useAuth();
  const isSuperuser = profile?.role_user === 8 || profile?.user_role === 8;
  const isOutletAdmin = profile?.role_user === 6 || profile?.user_role === 6;

  return (
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
            <h2 className="text-lg font-bold text-zen-charcoal font-serif">
              {profile?.namakaryawan || profile?.full_name}
            </h2>
            <p className="text-xs text-zen-charcoal/60">{profile?.email}</p>
            <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-zen-matcha/15 text-zen-moss">
              Role {profile?.user_role || profile?.role_user} (
              {profile?.role_name
                ? profile.role_name.toUpperCase()
                : isSuperuser
                ? 'SUPERUSER'
                : isOutletAdmin
                ? 'OUTLET_ADMIN'
                : 'OPERATIONAL_STAFF'}
              )
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
            <p className="font-bold text-zen-charcoal">
              {profile?.kode_outlet
                ? `Outlet ${profile.kode_outlet} ${profile.name_outlet ? `• ${profile.name_outlet}` : ''}`
                : 'Pusat / Holding'}
            </p>
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
  );
};

/**
 * Authenticated App Shell with Responsive Navigation
 */
const AppShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Derive currentTab from path
  const currentTab = location.pathname.replace(/^\//, '') || 'dashboard';

  const handleTabChange = (tab: string) => {
    navigate(`/${tab}`);
  };

  return (
    <MainLayout currentTab={currentTab} onTabChange={handleTabChange}>
      {children}
      {/* PWA Cross-Platform Install Prompt & Guidance */}
      <PWAInstallBanner />
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Route: Login Page */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected Routes: Authenticated Application Shell */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppShellLayout>
                  <DashboardView />
                </AppShellLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AppShellLayout>
                  <ProfileView />
                </AppShellLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/user-management"
            element={
              <ProtectedRoute allowedRoles={[8, 6]}>
                <AppShellLayout>
                  <UserManagementPage />
                </AppShellLayout>
              </ProtectedRoute>
            }
          />

          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Catch-all Wildcard Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

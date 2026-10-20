import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import {
  Sparkles,
  LogIn,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  UserCheck,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, profile, loading, signInWithGoogle } = useAuth();
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

  // Unauthenticated Welcome View
  if (!user) {
    return (
      <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
        <div className="max-w-2xl mx-auto py-6 sm:py-12 text-center space-y-8">
          {/* Hero Branding */}
          <div className="space-y-4">
            <div className="inline-flex p-3 rounded-2xl bg-zen-matcha/10 border border-zen-matcha/20 text-zen-moss mb-2">
              <Sparkles className="w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-zen-charcoal tracking-tight font-serif">
              Zen Operational Super-App
            </h1>
            <p className="text-sm sm:text-base text-zen-charcoal/70 max-w-lg mx-auto leading-relaxed">
              Portal internal staf dan manajemen <span className="font-semibold text-zen-moss">Zen Family Spa & Reflexology</span>.
              Akses cepat jadwal shift, kehadiran harian, dan monitoring operasional.
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-sm space-y-6 text-left">
            <div className="flex items-center space-x-3 pb-4 border-b border-zen-border/60">
              <div className="p-2 rounded-xl bg-zen-matcha text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-zen-charcoal text-base">
                  Autentikasi Aman Akun Zen
                </h3>
                <p className="text-xs text-zen-charcoal/60">
                  Login menggunakan Google OAuth resmi organisasi Zen Family Spa.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-xs sm:text-sm text-zen-charcoal/80">
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-zen-matcha shrink-0" />
                <span>Otomatis terhubung dengan database Supabase Cloud</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-zen-matcha shrink-0" />
                <span>Penugasan otomatis ke <strong>Role 12 (OPERATIONAL_STAFF)</strong></span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-zen-matcha shrink-0" />
                <span>PWA responsif siap diinstall di smartphone Android & iOS</span>
              </li>
            </ul>

            <button
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-6 rounded-2xl bg-zen-matcha hover:bg-zen-moss text-white font-bold text-sm shadow-md transition-all active:scale-[0.99]"
            >
              <LogIn className="w-5 h-5" />
              <span>Masuk dengan Google (Sign In)</span>
            </button>
          </div>

          {/* Quick Info Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
            <div className="bg-white/60 p-3.5 rounded-2xl border border-zen-border/60">
              <Building className="w-4 h-4 text-zen-matcha mb-1" />
              <div className="font-bold text-xs text-zen-charcoal">Multi-Outlet</div>
              <div className="text-[10px] text-zen-charcoal/60">10 Gerai Terintegrasi</div>
            </div>
            <div className="bg-white/60 p-3.5 rounded-2xl border border-zen-border/60">
              <Clock className="w-4 h-4 text-zen-matcha mb-1" />
              <div className="font-bold text-xs text-zen-charcoal">Real-time</div>
              <div className="text-[10px] text-zen-charcoal/60">Biometrik & Presensi</div>
            </div>
            <div className="col-span-2 sm:col-span-1 bg-white/60 p-3.5 rounded-2xl border border-zen-border/60">
              <Layers className="w-4 h-4 text-zen-matcha mb-1" />
              <div className="font-bold text-xs text-zen-charcoal">PWA Offline</div>
              <div className="text-[10px] text-zen-charcoal/60">Fast Caching & ServiceWorker</div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Authenticated Application View
  return (
    <MainLayout currentTab={currentTab} onTabChange={setCurrentTab}>
      <div className="space-y-6">
        {/* Welcome Staff Banner */}
        <div className="bg-gradient-to-r from-white via-white to-zen-linen p-5 sm:p-6 rounded-3xl border border-zen-border shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-zen-matcha shadow-sm"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-zen-matcha text-white font-bold text-lg flex items-center justify-center shadow-sm">
                  {profile?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
                  Selamat Datang, {profile?.full_name}!
                </h2>
              </div>
              <p className="text-xs text-zen-charcoal/60 mt-0.5">
                {profile?.email} • Outlet Default: <span className="font-semibold text-zen-moss">111 (Holding)</span>
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
              <span>Shift Pagi (WIB)</span>
            </div>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs">
                <div className="flex items-center justify-between text-zen-charcoal/60 text-xs font-medium mb-1">
                  <span>Kehadiran Hari Ini</span>
                  <UserCheck className="w-4 h-4 text-zen-matcha" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-zen-charcoal">
                  94.2%
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" />
                  +2.1% dari kemarin
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs">
                <div className="flex items-center justify-between text-zen-charcoal/60 text-xs font-medium mb-1">
                  <span>Terapis On-Duty</span>
                  <Clock className="w-4 h-4 text-zen-moss" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-zen-charcoal">
                  18 / 22
                </div>
                <div className="text-[11px] text-zen-charcoal/60 mt-1">
                  4 Istirahat / Selesai Shift
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs">
                <div className="flex items-center justify-between text-zen-charcoal/60 text-xs font-medium mb-1">
                  <span>Okupansi Ruangan</span>
                  <Building className="w-4 h-4 text-zen-sand" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-zen-charcoal">
                  78%
                </div>
                <div className="text-[11px] text-zen-moss font-semibold mt-1">
                  14 Kamar Terisi (BM & RF)
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-zen-border shadow-xs">
                <div className="flex items-center justify-between text-zen-charcoal/60 text-xs font-medium mb-1">
                  <span>Sync Database</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-xl sm:text-2xl font-extrabold text-emerald-600">
                  Aktif
                </div>
                <div className="text-[11px] text-zen-charcoal/60 mt-1">
                  Supabase Cloud Parity
                </div>
              </div>
            </div>

            {/* Operational Action Shortcuts */}
            <div className="bg-white p-5 rounded-3xl border border-zen-border shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-zen-charcoal text-base font-serif">
                    Aksi Cepat Operasional
                  </h3>
                  <p className="text-xs text-zen-charcoal/60">
                    Pintasan tugas harian staf gerai & holding
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => setCurrentTab('attendance')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zen-linen hover:bg-zen-sand/20 border border-zen-border/70 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-zen-matcha text-white">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zen-charcoal">
                        Log Presensi Staff
                      </div>
                      <div className="text-xs text-zen-charcoal/60">
                        Cek scan fingerprint harian
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zen-charcoal/40 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentTab('rooms')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zen-linen hover:bg-zen-sand/20 border border-zen-border/70 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-zen-moss text-white">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zen-charcoal">
                        Kapasitas Ruangan
                      </div>
                      <div className="text-xs text-zen-charcoal/60">
                        Body Massage & Reflexology
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zen-charcoal/40 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setCurrentTab('inventory')}
                  className="flex items-center justify-between p-4 rounded-2xl bg-zen-linen hover:bg-zen-sand/20 border border-zen-border/70 transition-all text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-zen-sand text-zen-charcoal">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-zen-charcoal">
                        Bahan & Linen
                      </div>
                      <div className="text-xs text-zen-charcoal/60">
                        Cek stok minyak & kain spa
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zen-charcoal/40 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Attendance */}
        {currentTab === 'attendance' && (
          <div className="bg-white p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
            <h3 className="font-bold text-zen-charcoal text-lg font-serif">
              Presensi & Biometrik Karyawan
            </h3>
            <p className="text-xs text-zen-charcoal/60">
              Data tersinkronisasi otomatis dari mesin fingerprint lokal ke Supabase table <code className="bg-zen-linen px-1.5 py-0.5 rounded text-zen-moss">ot_hrd_absen_harian</code>.
            </p>
            <div className="p-4 rounded-2xl bg-zen-linen border border-zen-border/70 text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-zen-border/40">
                <span className="font-semibold text-zen-charcoal">Shift Aktif:</span>
                <span>Pagi & Sore (WIB, UTC+7)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zen-border/40">
                <span className="font-semibold text-zen-charcoal">Aturan Shift Selesai:</span>
                <span>(fp_out - fp_in) &ge; 2 jam</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-semibold text-zen-charcoal">Status Akun Anda:</span>
                <span className="text-emerald-600 font-bold">Terverifikasi Role 12</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Rooms & Therapist */}
        {currentTab === 'rooms' && (
          <div className="bg-white p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
            <h3 className="font-bold text-zen-charcoal text-lg font-serif">
              Status Ruangan & Roster Terapis
            </h3>
            <p className="text-xs text-zen-charcoal/60">
              Monitoring ketersediaan kamar perawatan Body Massage (BM) dan Reflexology (RF) terhubung langsung ke tabel <code className="bg-zen-linen px-1.5 py-0.5 rounded text-zen-moss">ot_master_room</code>.
            </p>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-zen-linen border border-zen-border/70">
                <div className="text-2xl font-bold text-zen-charcoal">12</div>
                <div className="text-xs text-zen-charcoal/70 mt-1">Kamar Body Massage (BM)</div>
              </div>
              <div className="p-4 rounded-2xl bg-zen-linen border border-zen-border/70">
                <div className="text-2xl font-bold text-zen-charcoal">8</div>
                <div className="text-xs text-zen-charcoal/70 mt-1">Kursi Reflexology (RF)</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Inventory / Warehouse */}
        {currentTab === 'inventory' && (
          <div className="bg-white p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
            <h3 className="font-bold text-zen-charcoal text-lg font-serif">
              Bahan Baku & Konsumsi Layanan
            </h3>
            <p className="text-xs text-zen-charcoal/60">
              Integrasi langsung dengan modul WHMS (<code className="bg-zen-linen px-1.5 py-0.5 rounded text-zen-moss">frontend\warehousemanagement</code>) dan konsumsi produk <code className="bg-zen-linen px-1.5 py-0.5 rounded text-zen-moss">BP</code> vs layanan <code className="bg-zen-linen px-1.5 py-0.5 rounded text-zen-moss">BJ</code>.
            </p>
            <div className="p-4 rounded-2xl bg-zen-linen border border-zen-border/70 text-xs">
              Minyak Massage Aroma Lavender, Scrub Lemongrass, dan Linen Bersih termonitor per shift.
            </div>
          </div>
        )}

        {/* Tab: Profile */}
        {currentTab === 'profile' && (
          <div className="bg-white p-6 rounded-3xl border border-zen-border shadow-xs space-y-4">
            <h3 className="font-bold text-zen-charcoal text-lg font-serif">
              Informasi Profil & Keamanan
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-zen-border/50">
                <span className="text-zen-charcoal/60">UID Akun:</span>
                <span className="font-mono text-zen-charcoal">{user.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zen-border/50">
                <span className="text-zen-charcoal/60">Nama Lengkap:</span>
                <span className="font-semibold text-zen-charcoal">{profile?.full_name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zen-border/50">
                <span className="text-zen-charcoal/60">Email:</span>
                <span className="text-zen-charcoal">{profile?.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zen-border/50">
                <span className="text-zen-charcoal/60">Peran Sistem:</span>
                <span className="font-bold text-zen-moss">Role {profile?.role_user} (OPERATIONAL_STAFF)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zen-charcoal/60">Sinkronisasi Database:</span>
                <span className="text-emerald-600 font-semibold">Tersinkron di public.profiles & public.users_profile</span>
              </div>
            </div>
          </div>
        )}
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

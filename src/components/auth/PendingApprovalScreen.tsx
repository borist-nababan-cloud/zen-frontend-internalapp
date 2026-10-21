import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, RefreshCw, LogOut, CheckCircle2, Building2, Briefcase, Hash, User } from 'lucide-react';

export const PendingApprovalScreen: React.FC = () => {
  const { profile, refreshProfile, resetEmployeeLink, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <div className="min-h-screen bg-zen-linen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between py-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-zen-matcha flex items-center justify-center p-1 shadow-sm">
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
            <p className="text-[11px] text-zen-charcoal/60">Status Verifikasi</p>
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

      {/* Main Content */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-sm space-y-6 text-center">
          {/* Animated Status Icon */}
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-full bg-amber-400/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-50 to-amber-100/80 border-2 border-amber-300 flex items-center justify-center text-amber-600 shadow-sm">
              <Clock className="w-10 h-10" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
              Menunggu Persetujuan Admin
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-zen-charcoal font-serif">
              Data Karyawan Terverifikasi
            </h2>
            <p className="text-xs sm:text-sm text-zen-charcoal/70 max-w-sm mx-auto leading-relaxed">
              Kode Karyawan Anda telah terverifikasi di HRD. Saat ini akun Anda menunggu persetujuan dari <strong>Admin Gerai ({profile?.kode_outlet || 'Outlet'})</strong> atau <strong>Superuser</strong>.
            </p>
          </div>

          {/* Employee Info Card */}
          <div className="rounded-2xl bg-zen-linen/80 border border-zen-border/80 p-4 text-left space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zen-charcoal/50 pb-1 border-b border-zen-border/50">
              Rincian Tautan Akun
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <User className="w-3 h-3 mr-1 text-zen-moss" />
                  Nama Terdaftar
                </span>
                <p className="font-bold text-zen-charcoal truncate">{profile?.full_name}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Hash className="w-3 h-3 mr-1 text-zen-moss" />
                  Kode Karyawan
                </span>
                <p className="font-mono font-bold text-zen-moss">{profile?.kodekaryawan || '-'}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Building2 className="w-3 h-3 mr-1 text-zen-moss" />
                  Gerai / Outlet
                </span>
                <p className="font-bold text-zen-charcoal">Outlet {profile?.kode_outlet || '-'}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[11px] text-zen-charcoal/50 flex items-center">
                  <Briefcase className="w-3 h-3 mr-1 text-zen-moss" />
                  Departemen
                </span>
                <p className="font-bold text-zen-charcoal">{profile?.departemen || '-'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full py-3.5 px-4 rounded-2xl bg-zen-matcha hover:bg-zen-moss disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-zen-matcha/20 transition-all flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Memeriksa Status...' : 'Cek Status Persetujuan'}</span>
            </button>

            <button
              onClick={() => resetEmployeeLink()}
              className="w-full py-2.5 px-4 rounded-2xl bg-zen-sand/20 hover:bg-zen-sand/40 text-zen-charcoal text-xs font-medium transition-all"
            >
              Ganti / Batalkan Tautan Kode Karyawan
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl w-full mx-auto text-center py-2 text-[11px] text-zen-charcoal/50">
        Zen Family Spa & Reflexology • Internal Operational Ecosystem
      </footer>
    </div>
  );
};

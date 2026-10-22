import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { PowerOff, RefreshCw, LogOut } from 'lucide-react';

export const DeactivatedScreen: React.FC = () => {
  const { signOut, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

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
};

export default DeactivatedScreen;

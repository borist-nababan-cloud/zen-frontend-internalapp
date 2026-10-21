import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { BadgeCheck, ShieldAlert, Sparkles, LogOut, ArrowRight, HelpCircle, Loader2 } from 'lucide-react';

export const EmployeeLinkScreen: React.FC = () => {
  const { user, profile, linkEmployeeCode, signOut } = useAuth();
  const [kodekaryawan, setKodekaryawan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = kodekaryawan.trim();
    if (!cleaned) {
      setErrorMessage('Silakan masukkan Kode Karyawan Anda.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await linkEmployeeCode(cleaned);
    if (!res.success) {
      setErrorMessage(res.message);
      setSubmitting(false);
    }
    // On success, AuthContext triggers refreshProfile() and approval_status changes to PENDING
  };

  return (
    <div className="min-h-screen bg-zen-linen flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Header / Branding */}
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
            <p className="text-[11px] text-zen-charcoal/60">Verifikasi Karyawan</p>
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

      {/* Main Card */}
      <main className="max-w-md w-full mx-auto my-auto py-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-sm space-y-6">
          {/* User Profile Badge */}
          <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-zen-linen/80 border border-zen-border/70">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-12 h-12 rounded-xl object-cover ring-2 ring-zen-matcha shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-zen-matcha text-white font-bold text-sm flex items-center justify-center">
                {profile?.full_name?.slice(0, 2).toUpperCase() || 'ST'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs text-zen-charcoal/50 font-medium">Akun Google Terhubung</p>
              <h2 className="text-sm font-bold text-zen-charcoal truncate">{profile?.full_name}</h2>
              <p className="text-xs text-zen-charcoal/60 truncate">{user?.email}</p>
            </div>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <BadgeCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h3 className="text-lg sm:text-xl font-bold text-zen-charcoal font-serif">
              Tautkan Kode Karyawan Zen
            </h3>
            <p className="text-xs text-zen-charcoal/70 leading-relaxed">
              Untuk mengaktifkan akun operasional Anda, masukkan <strong>Nomor Induk / Kode Karyawan</strong> yang terdaftar di database HRD Zen Family Spa.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start space-x-3 text-red-700 text-xs animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Verifikasi Gagal</p>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form Input */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="kodekaryawan" className="block text-xs font-semibold text-zen-charcoal mb-1.5">
                Kode Karyawan HRD
              </label>
              <div className="relative">
                <input
                  id="kodekaryawan"
                  type="text"
                  value={kodekaryawan}
                  onChange={(e) => setKodekaryawan(e.target.value.toUpperCase())}
                  placeholder="Contoh: 1030001002"
                  disabled={submitting}
                  className="w-full px-4 py-3 text-sm font-mono tracking-wider font-semibold rounded-2xl border border-zen-border focus:border-zen-matcha focus:ring-2 focus:ring-zen-matcha/20 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-zen-charcoal/30 bg-zen-linen/30 disabled:opacity-60"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-zen-charcoal/50 mt-1.5">
                Masukkan kode karyawan sesuai yang tercatat pada ID Card / HRD.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting || !kodekaryawan.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-zen-matcha hover:bg-zen-moss disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-zen-matcha/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi Database HRD...</span>
                </>
              ) : (
                <>
                  <span>Verifikasi & Tautkan Akun</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Help Accordion */}
          <div className="border-t border-zen-border/70 pt-4">
            <button
              type="button"
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-between text-xs text-zen-charcoal/60 hover:text-zen-charcoal font-medium transition-colors"
            >
              <span className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-zen-moss" />
                <span>Di mana menemukan Kode Karyawan saya?</span>
              </span>
              <span className="text-zen-matcha font-bold text-xs">{showHelp ? 'Tutup' : 'Lihat'}</span>
            </button>

            {showHelp && (
              <div className="mt-3 p-3.5 rounded-xl bg-zen-linen/60 border border-zen-border/50 text-[11px] text-zen-charcoal/70 space-y-1.5 leading-relaxed">
                <p>• <strong>ID Card / Seragam</strong>: Kode karyawan tertera di kartu tanda pengenal.</p>
                <p>• <strong>Admin Gerai</strong>: Anda dapat menanyakan kode karyawan Anda langsung kepada Outlet Admin atau Supervisor di gerai Anda.</p>
                <p>• <strong>HRD Pusat</strong>: Pastikan status kepegawaian Anda telah aktif di sistem HRD Zen Family Spa.</p>
              </div>
            )}
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

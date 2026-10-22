import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  BadgeCheck,
  ShieldAlert,
  LogOut,
  ArrowRight,
  HelpCircle,
  Loader2,
  Building2,
  Briefcase,
  Hash,
  User,
  CheckCircle2,
  RotateCcw,
  AlertCircle
} from 'lucide-react';

interface PreviewKaryawan {
  kodekaryawan: string;
  namakaryawan: string;
  kode_outlet: string;
  name_outlet?: string;
  departemen: string;
}

export const EmployeeLinkScreen: React.FC = () => {
  const { user, profile, previewEmployeeCode, linkEmployeeCode, signOut } = useAuth();
  const [kodekaryawan, setKodekaryawan] = useState('');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [previewKaryawan, setPreviewKaryawan] = useState<PreviewKaryawan | null>(null);

  // Step 1: Search & Preview Employee Info from HRD
  const handleSearchPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = kodekaryawan.trim();
    if (!cleaned) {
      setErrorMessage('Silakan masukkan Kode Karyawan Anda.');
      return;
    }

    setSearching(true);
    setErrorMessage(null);

    const res = await previewEmployeeCode(cleaned);
    if (!res.success) {
      setErrorMessage(res.message || 'Kode Karyawan tidak ditemukan atau tidak aktif di database HRD.');
      setPreviewKaryawan(null);
    } else if (res.karyawan) {
      setPreviewKaryawan(res.karyawan);
    }
    setSearching(false);
  };

  // Step 2: Confirm & Link Account
  const handleConfirmLink = async () => {
    if (!previewKaryawan) return;
    setSubmitting(true);
    setErrorMessage(null);

    const res = await linkEmployeeCode(previewKaryawan.kodekaryawan);
    if (!res.success) {
      setErrorMessage(res.message);
      setSubmitting(false);
    }
    // On success, AuthContext triggers refreshProfile() and approval_status updates to PENDING
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
              Masukkan Nomor Induk / Kode Karyawan Anda. Sistem akan memeriksa data resmi di database HRD terlebih dahulu untuk konfirmasi Anda.
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200/80 flex items-start space-x-3 text-red-700 text-xs animate-in fade-in">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Pemeriksaan Gagal</p>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Step 1: Input Code (Active when NOT previewing) */}
          {!previewKaryawan ? (
            <form onSubmit={handleSearchPreview} className="space-y-4">
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
                    disabled={searching}
                    className="w-full px-4 py-3 text-sm font-mono tracking-wider font-semibold rounded-2xl border border-zen-border focus:border-zen-matcha focus:ring-2 focus:ring-zen-matcha/20 outline-none transition-all placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-zen-charcoal/30 bg-zen-linen/30 disabled:opacity-60"
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-zen-charcoal/50 mt-1.5">
                  Masukkan kode karyawan sesuai tanda pengenal / slip HRD Anda.
                </p>
              </div>

              <button
                type="submit"
                disabled={searching || !kodekaryawan.trim()}
                className="w-full py-3.5 px-4 rounded-2xl bg-zen-matcha hover:bg-zen-moss disabled:opacity-50 disabled:pointer-events-none text-white font-semibold text-sm shadow-md shadow-zen-matcha/20 transition-all active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                {searching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mencari di Database HRD...</span>
                  </>
                ) : (
                  <>
                    <span>Periksa & Konfirmasi Data</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: Confirmation Preview Card */
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/90 p-4 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 pb-2 border-b border-emerald-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Data Karyawan Ditemukan
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[11px] text-zen-charcoal/60 flex items-center">
                      <User className="w-3 h-3 mr-1 text-zen-moss" />
                      Nama Resmi HRD:
                    </span>
                    <p className="text-sm font-bold text-zen-charcoal font-serif mt-0.5">
                      {previewKaryawan.namakaryawan}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[11px] text-zen-charcoal/60 flex items-center">
                        <Hash className="w-3 h-3 mr-1 text-zen-moss" />
                        Kode Karyawan:
                      </span>
                      <p className="font-mono font-bold text-zen-moss mt-0.5">
                        {previewKaryawan.kodekaryawan}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] text-zen-charcoal/60 flex items-center">
                        <Briefcase className="w-3 h-3 mr-1 text-zen-moss" />
                        Departemen:
                      </span>
                      <p className="font-bold text-zen-charcoal mt-0.5">
                        {previewKaryawan.departemen || '-'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-zen-charcoal/60 flex items-center">
                      <Building2 className="w-3 h-3 mr-1 text-zen-moss" />
                      Gerai / Outlet Penempatan:
                    </span>
                    <p className="font-bold text-zen-charcoal mt-0.5">
                      Outlet {previewKaryawan.kode_outlet} {previewKaryawan.name_outlet ? `• ${previewKaryawan.name_outlet}` : ''}
                    </p>
                  </div>
                </div>

                {/* Gentle Confirmation Question */}
                <div className="pt-2 border-t border-emerald-200/60 text-[11px] text-zen-charcoal/80 flex items-start space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-zen-moss shrink-0 mt-0.5" />
                  <span>
                    Pastikan nama dan gerai di atas <strong>benar merupakan data diri Anda</strong> sebelum menautkan akun.
                  </span>
                </div>
              </div>

              {/* Confirmation Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-2xl bg-zen-matcha hover:bg-zen-moss disabled:opacity-60 text-white font-semibold text-sm shadow-md shadow-zen-matcha/20 transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Menautkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Ya, Ini Benar Data Saya (Tautkan)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewKaryawan(null);
                    setErrorMessage(null);
                  }}
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-2xl bg-zen-linen hover:bg-zen-sand/30 text-zen-charcoal text-xs font-semibold border border-zen-border transition-all flex items-center justify-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-zen-charcoal/60" />
                  <span>Bukan Saya / Masukkan Kode Lain</span>
                </button>
              </div>
            </div>
          )}

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

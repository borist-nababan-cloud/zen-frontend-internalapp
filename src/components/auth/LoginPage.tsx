import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  Mail,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  LogIn,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, signInWithEmailOtp, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showAlternative, setShowAlternative] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [emailStatus, setEmailStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({ type: 'idle', message: '' });

  const appName = import.meta.env.VITE_APP_NAME || 'Zen Internal';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setEmailStatus({
        type: 'error',
        message: 'Masukkan alamat email yang valid.',
      });
      return;
    }

    setEmailStatus({ type: 'loading', message: 'Mengirim tautan masuk...' });
    const { error } = await signInWithEmailOtp(emailInput.trim());

    if (error) {
      setEmailStatus({
        type: 'error',
        message: error.message || 'Gagal mengirim tautan masuk. Silakan coba lagi.',
      });
    } else {
      setEmailStatus({
        type: 'success',
        message: 'Tautan masuk telah dikirim ke email Anda! Silakan cek kotak masuk atau folder spam.',
      });
      setEmailInput('');
    }
  };

  return (
    <div className="min-h-screen bg-zen-linen flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 safe-area-pt safe-area-pb">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-zen-border">
            <img
              src="/Logo150x150.png"
              alt="Zen Family Spa Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zen-charcoal tracking-tight font-serif">
              {appName}
            </h1>
            <p className="text-xs text-zen-charcoal/60 mt-1">
              Zen Family Spa & Reflexology • v{appVersion}
            </p>
          </div>
        </div>

        {/* Login / Register Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zen-border shadow-sm space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zen-linen rounded-2xl border border-zen-border/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setEmailStatus({ type: 'idle', message: '' });
              }}
              className={`flex items-center justify-center py-2.5 rounded-xl transition-all ${
                authMode === 'login'
                  ? 'bg-white text-zen-charcoal shadow-xs'
                  : 'text-zen-charcoal/60 hover:text-zen-charcoal'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 mr-1.5" />
              <span>Masuk (Login)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setEmailStatus({ type: 'idle', message: '' });
              }}
              className={`flex items-center justify-center py-2.5 rounded-xl transition-all ${
                authMode === 'register'
                  ? 'bg-white text-zen-charcoal shadow-xs'
                  : 'text-zen-charcoal/60 hover:text-zen-charcoal'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              <span>Daftar (Register)</span>
            </button>
          </div>

          {/* Context Explainer */}
          <div className="text-center space-y-1">
            <h2 className="text-base sm:text-lg font-bold text-zen-charcoal font-serif">
              {authMode === 'login'
                ? 'Masuk ke Portal Operasional'
                : 'Pendaftaran Akun Baru Staf'}
            </h2>
            <p className="text-xs text-zen-charcoal/60 leading-relaxed">
              {authMode === 'login'
                ? 'Gunakan akun Google Anda untuk mengakses aplikasi secara instan.'
                : 'Daftar dengan Google untuk mendapatkan akses Role 12 (OPERATIONAL_STAFF).'}
            </p>
          </div>

          {/* Primary Action: Google OAuth Button */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => signInWithGoogle()}
              className="w-full flex items-center justify-center space-x-3 py-3.5 px-4 rounded-2xl bg-white hover:bg-zen-linen/80 text-zen-charcoal font-bold text-sm border-2 border-zen-border shadow-xs hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-50"
            >
              {/* Google Official Color Logo */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>
                {authMode === 'login'
                  ? 'Masuk dengan Akun Google'
                  : 'Daftar Baru dengan Google'}
              </span>
            </button>

            {authMode === 'register' && (
              <div className="p-3 rounded-2xl bg-zen-matcha/10 border border-zen-matcha/20 text-[11px] text-zen-charcoal/80 space-y-1">
                <div className="flex items-center text-zen-moss font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1 shrink-0" />
                  <span>Role 12 (OPERATIONAL_STAFF) Otomatis</span>
                </div>
                <p className="text-zen-charcoal/70">
                  Data nama dan foto akun Google akan langsung disinkronkan ke profil staf Zen.
                </p>
              </div>
            )}
          </div>

          {/* Section Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-zen-border/70 w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-zen-charcoal/40 font-semibold">
              atau
            </span>
          </div>

          {/* Non-Google Account Suggestion & Fallback */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setShowAlternative(!showAlternative)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-zen-linen hover:bg-zen-sand/20 border border-zen-border/70 text-xs font-semibold text-zen-charcoal transition-colors"
            >
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-zen-moss" />
                <span>Tidak memiliki akun Google?</span>
              </div>
              <span className="text-[10px] text-zen-moss font-bold">
                {showAlternative ? 'Tutup' : 'Lihat Solusi'}
              </span>
            </button>

            {showAlternative && (
              <div className="p-4 rounded-2xl bg-zen-linen/80 border border-zen-border space-y-4 animate-in fade-in duration-150">
                <div className="space-y-1 text-xs">
                  <p className="font-bold text-zen-charcoal">
                    Masuk Menggunakan Email Apapun (Magic Link)
                  </p>
                  <p className="text-zen-charcoal/60 text-[11px] leading-relaxed">
                    Masukkan email Anda (Yahoo, Outlook, iCloud, dsb). Kami akan mengirimkan tautan login sekali klik tanpa perlu password.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-2">
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zen-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zen-border bg-white text-xs text-zen-charcoal placeholder:text-zen-charcoal/40 focus:outline-hidden focus:ring-2 focus:ring-zen-matcha"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={emailStatus.type === 'loading'}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-zen-moss hover:bg-zen-matcha text-white font-bold text-xs shadow-xs transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {emailStatus.type === 'loading'
                        ? 'Mengirim...'
                        : 'Kirim Tautan Masuk ke Email'}
                    </span>
                  </button>
                </form>

                {/* Email Status Message */}
                {emailStatus.type === 'success' && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{emailStatus.message}</span>
                  </div>
                )}

                {emailStatus.type === 'error' && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{emailStatus.message}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-zen-border/60 text-[11px] text-zen-charcoal/60">
                  <p>
                    <strong>Saran Manajemen:</strong> Hubungi Admin Holding/Supervisor untuk mendapatkan email resmi <code>@zenfamilyspa.id</code>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security & Multi-Outlet Notice */}
        <div className="text-center space-y-1">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-zen-moss font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Terhubung ke Supabase Cloud Hybrid Zen</span>
          </div>
          <p className="text-[11px] text-zen-charcoal/50">
            Aman • Terenkripsi • Khusus Staf Zen Family Spa
          </p>

          {/* Legal Links for Google OAuth Verification */}
          <div className="flex items-center justify-center space-x-3 text-[11px] text-zen-charcoal/60 pt-2">
            <a
              href="https://tos.zenfamilyspa.id/privacy-policy.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zen-moss underline transition-colors"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="https://tos.zenfamilyspa.id/terms-of-service.html"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zen-moss underline transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

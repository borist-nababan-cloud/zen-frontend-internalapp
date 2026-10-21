import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogIn, LogOut, Shield, ChevronDown, Users, Home } from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onTabChange }) => {
  const { user, profile, loading, signInWithGoogle, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navbarTitle = import.meta.env.VITE_NAVBAR_TITLE || 'ZEN OPERATIONAL';
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  const canManageUsers = profile?.role_user === 8 || profile?.role_user === 6;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getRoleLabel = () => {
    if (profile?.role_user === 8) return 'SUPERUSER (Role 8)';
    if (profile?.role_user === 6) return `ADMIN GERAI (Outlet ${profile.kode_outlet || ''})`;
    if (profile?.role_user === 1) return 'ADMIN HOLDING (Role 1)';
    return `OPERATIONAL STAFF (Role ${profile?.role_user ?? 12})`;
  };

  return (
    <header className="sticky top-0 z-40 bg-zen-paper/95 backdrop-blur-md border-b border-zen-border shadow-xs safe-area-pt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Branding & Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange?.('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-zen-matcha flex items-center justify-center shadow-xs overflow-hidden p-1">
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
            <div className="flex items-center space-x-2">
              <h1 className="font-bold text-zen-charcoal tracking-wide text-base sm:text-lg font-serif">
                {navbarTitle}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-zen-matcha/15 text-zen-moss rounded-full">
                v{appVersion}
              </span>
            </div>
            <p className="text-xs text-zen-charcoal/60 hidden xs:block">
              Zen Family Spa & Reflexology
            </p>
          </div>
        </div>

        {/* Right: User Profile or Sign In */}
        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-8 w-24 bg-zen-sand/20 animate-pulse rounded-lg" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 p-1.5 sm:px-3 sm:py-1.5 rounded-xl hover:bg-zen-sand/20 transition-all border border-zen-border/60"
              >
                {/* Avatar with fallback */}
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-zen-matcha"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-zen-matcha text-white font-semibold text-xs flex items-center justify-center ring-2 ring-zen-matcha/50">
                      {profile?.full_name ? getInitials(profile.full_name) : 'ST'}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>

                {/* Name & Role (Desktop) */}
                <div className="hidden sm:block text-left">
                  <div className="text-sm font-semibold text-zen-charcoal truncate max-w-[130px]">
                    {profile?.full_name || 'Staff Member'}
                  </div>
                  <div className="text-[10px] font-medium text-zen-moss flex items-center">
                    <Shield className="w-2.5 h-2.5 mr-0.5" />
                    Role {profile?.role_user ?? 12}
                  </div>
                </div>

                <ChevronDown className="w-4 h-4 text-zen-charcoal/50" />
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-zen-border shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-zen-border/60">
                      <p className="text-sm font-semibold text-zen-charcoal">
                        {profile?.full_name}
                      </p>
                      <p className="text-xs text-zen-charcoal/60 truncate">
                        {profile?.email}
                      </p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-zen-matcha/15 text-zen-moss">
                        {getRoleLabel()}
                      </div>
                      {profile?.kodekaryawan && (
                        <p className="text-[11px] text-zen-charcoal/60 mt-1">
                          Kode: <span className="font-mono font-semibold">{profile.kodekaryawan}</span>
                        </p>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onTabChange?.('dashboard');
                        }}
                        className={`w-full flex items-center px-4 py-2.5 text-xs font-semibold hover:bg-zen-linen transition-colors ${
                          currentTab === 'dashboard' ? 'text-zen-moss bg-zen-linen/60' : 'text-zen-charcoal'
                        }`}
                      >
                        <Home className="w-4 h-4 mr-2.5 text-zen-moss" />
                        Beranda Operasional
                      </button>

                      {canManageUsers && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            onTabChange?.('user-management');
                          }}
                          className={`w-full flex items-center px-4 py-2.5 text-xs font-semibold hover:bg-zen-linen transition-colors ${
                            currentTab === 'user-management' ? 'text-zen-moss bg-zen-linen/60' : 'text-zen-charcoal'
                          }`}
                        >
                          <Users className="w-4 h-4 mr-2.5 text-zen-moss" />
                          Manajemen User & Staf
                        </button>
                      )}
                    </div>

                    <div className="border-t border-zen-border/60 pt-1">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2.5" />
                        Keluar (Sign Out)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => signInWithGoogle()}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zen-matcha hover:bg-zen-moss text-white font-medium text-xs sm:text-sm shadow-xs transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Login Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  role: string;
  role_user: number;
  user_role: number;
  role_name?: string;
  kodekaryawan?: string;
  namakaryawan?: string;
  idkaryawan?: string;
  kode_outlet?: string;
  name_outlet?: string;
  departemen?: string;
  approval_status: 'UNLINKED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  rejected_reason?: string | null;
  approved_at?: string | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  loading: boolean; // Backward compatibility alias
  isAuthenticated: boolean;
  isSuperuser: boolean;
  isOutletAdmin: boolean;
  canManageUsers: boolean;
  canViewPayroll: boolean;
  canViewAttendance: boolean;
  canViewCommission: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  linkEmployeeCode: (kodekaryawan: string) => Promise<{ success: boolean; message: string; karyawan?: any }>;
  previewEmployeeCode: (kodekaryawan: string) => Promise<{ success: boolean; message?: string; karyawan?: any }>;
  resetEmployeeLink: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isInitialCheckDone = useRef<boolean>(false);

  const fetchProfile = useCallback(async (currentUser: User) => {
    try {
      // 1. Fetch from public.users_profile (primary profile store)
      const { data: uProfData, error: uProfError } = await supabase
        .from('users_profile')
        .select(`
          *,
          role_info:user_role ( id, role_name ),
          outlet_info:kode_outlet ( kode_outlet, name_outlet )
        `)
        .eq('uid', currentUser.id)
        .maybeSingle();

      if (uProfData && !uProfError) {
        let namakaryawan: string | undefined = undefined;
        let idkaryawan: string | undefined = undefined;
        let empDepartemen: string | undefined = undefined;

        if (uProfData.kodekaryawan) {
          const { data: empData } = await supabase
            .from('ot_hrd_karyawan_info')
            .select('namakaryawan, idkaryawan, departemen')
            .eq('kodekaryawan', uProfData.kodekaryawan)
            .maybeSingle();
          if (empData) {
            if (empData.namakaryawan) namakaryawan = empData.namakaryawan;
            if (empData.idkaryawan) idkaryawan = empData.idkaryawan;
            if (empData.departemen) empDepartemen = empData.departemen;
          }
        }

        const roleUserNum = uProfData.user_role ?? uProfData.role_user ?? 12;
        const roleNameStr = (uProfData.role_info as any)?.role_name || undefined;
        const nameOutletStr = (uProfData.outlet_info as any)?.name_outlet || undefined;

        setProfile({
          id: uProfData.uid,
          email: uProfData.email || currentUser.email || '',
          full_name:
            namakaryawan ||
            uProfData.full_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            'Staff Member',
          avatar_url:
            uProfData.avatar_url ||
            currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture ||
            '',
          role: roleNameStr || 'operational_staff',
          role_user: roleUserNum,
          user_role: roleUserNum,
          role_name: roleNameStr,
          kodekaryawan: uProfData.kodekaryawan || undefined,
          namakaryawan: namakaryawan,
          idkaryawan: idkaryawan || undefined,
          kode_outlet: uProfData.kode_outlet || undefined,
          name_outlet: nameOutletStr,
          departemen: empDepartemen || uProfData.departemen || undefined,
          approval_status: (uProfData.approval_status as any) || 'UNLINKED',
          is_active: !!uProfData.is_active,
          rejected_reason: uProfData.rejected_reason,
          approved_at: uProfData.approved_at,
        });
        return;
      }

      // 2. Fallback to public.profiles
      const { data: profData, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (profData && !profError) {
        setProfile({
          id: profData.id,
          email: profData.email || currentUser.email || '',
          full_name:
            profData.full_name ||
            currentUser.user_metadata?.full_name ||
            currentUser.user_metadata?.name ||
            'Staff Member',
          avatar_url:
            profData.avatar_url ||
            currentUser.user_metadata?.avatar_url ||
            currentUser.user_metadata?.picture ||
            '',
          role: profData.role || 'operational_staff',
          role_user: profData.role_user || 12,
          user_role: profData.role_user || 12,
          kodekaryawan: profData.kodekaryawan || undefined,
          departemen: profData.departemen || undefined,
          approval_status: (profData.approval_status as any) || 'UNLINKED',
          is_active: !!profData.is_active,
          rejected_reason: profData.rejected_reason,
          approved_at: profData.approved_at,
        });
        return;
      }

      // 3. Graceful fallback from session user metadata (Google OAuth)
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name:
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          currentUser.email?.split('@')[0] ||
          'Staff Member',
        avatar_url:
          currentUser.user_metadata?.avatar_url ||
          currentUser.user_metadata?.picture ||
          '',
        role: 'operational_staff',
        role_user: 12,
        user_role: 12,
        approval_status: 'UNLINKED',
        is_active: false,
      });
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name:
          currentUser.user_metadata?.full_name ||
          currentUser.user_metadata?.name ||
          'Staff Member',
        avatar_url:
          currentUser.user_metadata?.avatar_url ||
          currentUser.user_metadata?.picture ||
          '',
        role: 'operational_staff',
        role_user: 12,
        user_role: 12,
        approval_status: 'UNLINKED',
        is_active: false,
      });
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // 1. Initial Session Check to prevent initial UI flicker
    const initializeSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Session retrieval error:', error.message);
        }

        if (isMounted) {
          if (initialSession?.user) {
            setSession(initialSession);
            setUser(initialSession.user);
            await fetchProfile(initialSession.user);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (e) {
        console.error('Initial session check failed:', e);
      } finally {
        if (isMounted) {
          isInitialCheckDone.current = true;
          setIsLoading(false);
        }
      }
    };

    initializeSession();

    // 2. Real-time auth state listener (LOGIN, SIGN_OUT, TOKEN_REFRESHED)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, currentSession: Session | null) => {
      if (!isMounted) return;

      // Handle specific auth lifecycle events
      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED':
        case 'USER_UPDATED':
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          if (currentSession?.user) {
            await fetchProfile(currentSession.user);
          }
          break;

        case 'SIGNED_OUT':
          setSession(null);
          setUser(null);
          setProfile(null);
          break;

        case 'INITIAL_SESSION':
          // If already handled by initializeSession, do not overwrite unless session changed
          if (currentSession?.user && (!user || user.id !== currentSession.user.id)) {
            setSession(currentSession);
            setUser(currentSession.user);
            await fetchProfile(currentSession.user);
          }
          break;

        default:
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          break;
      }

      if (isInitialCheckDone.current) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) {
      console.error('Google Sign-In Error:', error.message);
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithEmailOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign Out Error:', error.message);
      }
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const linkEmployeeCode = async (kodekaryawan: string) => {
    try {
      const { data, error } = await supabase.rpc('link_employee_code', {
        p_kodekaryawan: kodekaryawan.trim(),
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Gagal memverifikasi kode karyawan.',
        };
      }

      if (data && data.success) {
        await refreshProfile();
        return {
          success: true,
          message: data.message,
          karyawan: data.karyawan,
        };
      }

      return {
        success: false,
        message: data?.message || 'Kode karyawan tidak dapat diverifikasi.',
      };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan sistem saat menghubungi server.',
      };
    }
  };

  const previewEmployeeCode = async (kodekaryawan: string) => {
    try {
      const { data, error } = await supabase.rpc('preview_employee_code', {
        p_kodekaryawan: kodekaryawan.trim(),
      });

      if (error) {
        return {
          success: false,
          message: error.message || 'Gagal memeriksa kode karyawan.',
        };
      }

      return data as { success: boolean; message?: string; karyawan?: any };
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Terjadi kesalahan sistem saat menghubungi server.',
      };
    }
  };

  const resetEmployeeLink = async () => {
    if (!user) return;
    try {
      await supabase
        .from('users_profile')
        .update({
          approval_status: 'UNLINKED',
          kodekaryawan: null,
          kode_outlet: null,
          departemen: null,
          rejected_reason: null,
          updated_at: new Date().toISOString(),
        })
        .eq('uid', user.id);

      await refreshProfile();
    } catch (e) {
      console.error('Error resetting employee link:', e);
    }
  };

  // Centralized Permissions Single Source of Truth:
  // Role 8: SUPERUSER, Role 6: OUTLET_ADMIN
  const isSuperuser = profile?.role_user === 8 || profile?.user_role === 8;
  const isOutletAdmin = profile?.role_user === 6 || profile?.user_role === 6;
  const canManageUsers = isSuperuser || isOutletAdmin;

  // View Payroll, Attendance & Commission Rules:
  // Superuser (Role 8) does NOT see "View Payroll", "Lihat Absensi", and "Lihat Komisi".
  // Other roles (including Outlet Admin Role 6, Staff Role 12, etc.) can access if they have kodekaryawan and approval_status = 'APPROVED'.
  const canViewPayroll = !isSuperuser && profile?.approval_status === 'APPROVED' && !!profile?.kodekaryawan;
  const canViewAttendance = canViewPayroll;
  const canViewCommission = canViewPayroll;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        loading: isLoading, // Backward compatibility alias
        isAuthenticated: !!user && !!session,
        isSuperuser,
        isOutletAdmin,
        canManageUsers,
        canViewPayroll,
        canViewAttendance,
        canViewCommission,
        signInWithGoogle,
        signInWithEmailOtp,
        signOut,
        refreshProfile,
        linkEmployeeCode,
        previewEmployeeCode,
        resetEmployeeLink,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

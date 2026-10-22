import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  kode_outlet?: string;
  name_outlet?: string;
  departemen?: string;
  approval_status: 'UNLINKED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  rejected_reason?: string | null;
  approved_at?: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
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
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (currentUser: User) => {
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
        if (uProfData.kodekaryawan) {
          const { data: empData } = await supabase
            .from('ot_hrd_karyawan_info')
            .select('namakaryawan')
            .eq('kodekaryawan', uProfData.kodekaryawan)
            .maybeSingle();
          if (empData?.namakaryawan) {
            namakaryawan = empData.namakaryawan;
          }
        }

        const roleUserNum = uProfData.user_role ?? uProfData.role_user ?? 12;
        const roleNameStr = (uProfData.role_info as any)?.role_name || undefined;
        const nameOutletStr = (uProfData.outlet_info as any)?.name_outlet || undefined;

        setProfile({
          id: uProfData.uid,
          email: uProfData.email || currentUser.email || '',
          full_name: namakaryawan || uProfData.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Staff Member',
          avatar_url: uProfData.avatar_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
          role: roleNameStr || 'operational_staff',
          role_user: roleUserNum,
          user_role: roleUserNum,
          role_name: roleNameStr,
          kodekaryawan: uProfData.kodekaryawan || undefined,
          namakaryawan: namakaryawan,
          kode_outlet: uProfData.kode_outlet || undefined,
          name_outlet: nameOutletStr,
          departemen: uProfData.departemen || undefined,
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
          full_name: profData.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Staff Member',
          avatar_url: profData.avatar_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
          role: profData.role || 'operational_staff',
          role_user: profData.role_user || 12,
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
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || currentUser.email?.split('@')[0] || 'Staff Member',
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
        role: 'operational_staff',
        role_user: 12,
        approval_status: 'UNLINKED',
        is_active: false,
      });
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Staff Member',
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
        role: 'operational_staff',
        role_user: 12,
        approval_status: 'UNLINKED',
        is_active: false,
      });
    }
  };

  useEffect(() => {
    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      }
      setLoading(false);
    });

    // Real-time auth state changes listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
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
      setLoading(false);
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
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign Out Error:', error.message);
    }
    setUser(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
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

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
  kode_outlet?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProfile = async (currentUser: User) => {
    try {
      // 1. Try public.profiles first
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
        });
        return;
      }

      // 2. Fallback to public.users_profile
      const { data: uProfData, error: uProfError } = await supabase
        .from('users_profile')
        .select('*')
        .eq('uid', currentUser.id)
        .maybeSingle();

      if (uProfData && !uProfError) {
        setProfile({
          id: uProfData.uid,
          email: uProfData.email || currentUser.email || '',
          full_name: uProfData.full_name || currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Staff Member',
          avatar_url: uProfData.avatar_url || currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
          role: 'operational_staff',
          role_user: uProfData.role_user || uProfData.user_role || 12,
          kode_outlet: uProfData.kode_outlet || '111',
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
      });
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      // Fallback
      setProfile({
        id: currentUser.id,
        email: currentUser.email || '',
        full_name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'Staff Member',
        avatar_url: currentUser.user_metadata?.avatar_url || currentUser.user_metadata?.picture || '',
        role: 'operational_staff',
        role_user: 12,
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

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        signInWithGoogle,
        signOut,
        refreshProfile,
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

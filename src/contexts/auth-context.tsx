'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { getUserProfile, isAdmin, isImobiliaria } from '@/lib/auth';
import { toast } from 'sonner';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  profile: any | null;
  isAdmin: boolean;
  isImobiliaria: boolean;
  isLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);
  const [isUserImobiliaria, setIsUserImobiliaria] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile();
      } else {
        setIsLoading(false);
      }
    });

    // Monitorar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile();
        } else {
          setProfile(null);
          setIsUserAdmin(false);
          setIsUserImobiliaria(false);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const loadUserProfile = async () => {
    setIsLoading(true);
    try {
      const { profile: userProfile } = await getUserProfile();
      setProfile(userProfile);
      
      const admin = await isAdmin();
      setIsUserAdmin(admin);
      
      const imobiliaria = await isImobiliaria();
      setIsUserImobiliaria(imobiliaria);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar dados do perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await loadUserProfile();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isAdmin: isUserAdmin,
        isImobiliaria: isUserImobiliaria,
        isLoading,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

interface SignUpData {
  name: string;
  role: string;
  company?: string;
}

interface UpdateProfileData {
  name?: string;
  role?: string;
  company?: string;
  phone?: string;
  whatsappNumber?: string;
  description?: string;
  website?: string;
  location?: string;
  image?: string;
}

type AuthContextType = {
  user: User | null;
  userProfile: Database['public']['Tables']['users']['Row'] | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, userData: SignUpData) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Database['public']['Tables']['users']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Fetch user profile from our users table
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        setUserProfile(profile);
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile from our users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error: error.message };
      }
      
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, userData: SignUpData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            company: userData.company,
          }
        }
      });
      
      if (error) {
        return { error: error.message };
      }
      
      // Create user profile in our users table
      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: email,
            name: userData.name,
            role: userData.role,
            company: userData.company,
            password_hash: '', // Supabase handles password
            email_verified: false,
          });
        
        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }
      
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      if (!user) {
        return { error: 'No user logged in' };
      }
      
      const { error } = await supabase
        .from('users')
        .update(data)
        .eq('id', user.id);
      
      if (error) {
        return { error: error.message };
      }
      
      // Refresh user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      setUserProfile(profile);
      
      return {};
    } catch {
      return { error: 'An unexpected error occurred' };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


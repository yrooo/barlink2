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
        const { data: profile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
        } else if (profile) {
          // Map snake_case database fields to camelCase for consistency
          const mappedProfile = {
            ...profile,
            whatsappNumber: profile.whatsapp_number,
            whatsappVerified: profile.whatsapp_verified,
            whatsappVerifiedAt: profile.whatsapp_verified_at,
            emailVerified: profile.email_verified,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at,
          };
          setUserProfile(mappedProfile as any);
        } else {
          setUserProfile(null);
        }
      }
      
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile from our users table
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error('Error fetching user profile:', error);
            setUserProfile(null);
          } else if (profile) {
            // Map snake_case database fields to camelCase for consistency
            const mappedProfile = {
              ...profile,
              whatsappNumber: profile.whatsapp_number,
              whatsappVerified: profile.whatsapp_verified,
              whatsappVerifiedAt: profile.whatsapp_verified_at,
              emailVerified: profile.email_verified,
              createdAt: profile.created_at,
              updatedAt: profile.updated_at,
            };
            setUserProfile(mappedProfile as any);
          } else {
            setUserProfile(null);
          }
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
        console.error('Supabase auth signin error:', error);
        return { error: error.message };
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected signin error:', error);
      return { error: 'An unexpected error occurred during signin' };
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
        console.error('Supabase auth signup error:', error);
        return { error: error.message };
      }
      
      // User profile will be created automatically by database trigger
      // The trigger reads user metadata and creates the profile
      console.log('User signed up successfully:', data.user?.id);
      console.log('Profile will be created automatically by database trigger');
      
      return {};
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error: 'An unexpected error occurred during signup' };
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
      
      // Map camelCase fields to snake_case for database
      const dbData: any = { ...data };
      if (data.whatsappNumber !== undefined) {
        dbData.whatsapp_number = data.whatsappNumber;
        delete dbData.whatsappNumber;
      }
      
      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', user.id);
      
      if (error) {
        return { error: error.message };
      }
      
      // Refresh user profile
      const { data: profile, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated profile:', fetchError);
      } else if (profile) {
        // Map snake_case database fields to camelCase for consistency
        const mappedProfile = {
          ...profile,
          whatsappNumber: profile.whatsapp_number,
          whatsappVerified: profile.whatsapp_verified,
          whatsappVerifiedAt: profile.whatsapp_verified_at,
          emailVerified: profile.email_verified,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
        setUserProfile(mappedProfile as any);
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected updateProfile error:', error);
      return { error: 'An unexpected error occurred during profile update' };
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


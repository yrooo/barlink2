'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import sessionManager from '@/lib/session-manager';

// Types for our auth context
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'pelamar_kerja' | 'pencari_kandidat';
  company?: string;
  phone?: string;
  whatsappNumber?: string;
  description?: string;
  website?: string;
  location?: string;
  cvFileName?: string;
  cvUploadedAt?: string;
  cvUrl?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SignUpData {
  name: string;
  email: string;
  password: string;
  role: 'pelamar_kerja' | 'pencari_kandidat';
  company?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (data: SignUpData) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  refreshProfile: () => Promise<void>;
}

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  // Fetch user profile from our custom users table
  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          company,
          email_verified,
          created_at,
          updated_at,
          phone,
          whatsapp_number,
          description,
          website,
          location,
          cv_file_name,
          cv_uploaded_at,
          cv_url
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!data) return null;

      // Transform the data to match our interface
      const userProfile: UserProfile = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        company: data.company,
        emailVerified: data.email_verified,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        phone: data.phone,
        whatsappNumber: data.whatsapp_number,
        description: data.description,
        website: data.website,
        location: data.location,
        cvFileName: data.cv_file_name,
        cvUploadedAt: data.cv_uploaded_at,
        cvUrl: data.cv_url,
      };

      return userProfile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  }, [supabase]);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const initialSession = await sessionManager.getSession();
        
        if (initialSession?.user) {
          setUser(initialSession.user);
          setSession(initialSession);
          const userProfile = await fetchUserProfile(initialSession.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to session changes through session manager
    const unsubscribe = sessionManager.onSessionChange(
      async (session) => {
        console.log('Auth state changed:', session?.user?.id);
        
        if (session?.user) {
          setUser(session.user);
          setSession(session);
          const userProfile = await fetchUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      sessionManager.cleanup();
    };
  }, [supabase, fetchUserProfile]);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Email not confirmed')) {
          return { error: 'EmailNotVerified' };
        }
        return { error: error.message };
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user.id);
        if (!userProfile?.emailVerified) {
          await supabase.auth.signOut();
          return { error: 'EmailNotVerified' };
        }
      }

      return {};
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'An error occurred during sign in' };
    }
  };

  // Sign up function
  const signUp = async (data: SignUpData) => {
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            company: data.company,
          },
        },
      });

      if (authError) {
        return { error: authError.message };
      }

      return {};
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: 'An error occurred during sign up' };
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await sessionManager.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Update user table
      const userUpdates: Record<string, string> = {};
      if (data.name) userUpdates.name = data.name;
      if (data.company) userUpdates.company = data.company;

      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', user.id);

        if (userError) {
          return { error: userError.message };
        }
      }

      // Update users table with profile data
      const profileUpdates: Record<string, string | undefined> = {};
      if (data.phone !== undefined) profileUpdates.phone = data.phone;
      if (data.whatsappNumber !== undefined) profileUpdates.whatsapp_number = data.whatsappNumber;
      if (data.description !== undefined) profileUpdates.description = data.description;
      if (data.website !== undefined) profileUpdates.website = data.website;
      if (data.location !== undefined) profileUpdates.location = data.location;
      if (data.cvFileName !== undefined) profileUpdates.cv_file_name = data.cvFileName;
      if (data.cvUploadedAt !== undefined) profileUpdates.cv_uploaded_at = data.cvUploadedAt;
      if (data.cvUrl !== undefined) profileUpdates.cv_url = data.cvUrl;

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('users')
          .update(profileUpdates)
          .eq('id', user.id);

        if (profileError) {
          return { error: profileError.message };
        }
      }

      // Refresh profile data
      await refreshProfile();
      return {};
    } catch (error) {
      console.error('Update profile error:', error);
      return { error: 'An error occurred while updating profile' };
    }
  };

  // Refresh profile function
  const refreshProfile = async () => {
    if (!user) return;
    
    const userProfile = await fetchUserProfile(user.id);
    setProfile(userProfile);
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}


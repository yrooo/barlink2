'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session, User } from '@supabase/supabase-js';

class SessionManager {
  private supabase = createClientComponentClient();
  private refreshTimer: NodeJS.Timeout | null = null;
  private listeners: ((session: Session | null) => void)[] = [];

  constructor() {
    this.initializeSessionRefresh();
  }

  // Initialize automatic session refresh
  private async initializeSessionRefresh() {
    const { data: { session } } = await this.supabase.auth.getSession();
    
    if (session) {
      this.scheduleRefresh(session);
    }

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.scheduleRefresh(session);
      } else if (event === 'SIGNED_OUT') {
        this.clearRefreshTimer();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.scheduleRefresh(session);
      }
      
      // Notify listeners
      this.listeners.forEach(listener => listener(session));
    });
  }

  // Schedule token refresh before expiration
  private scheduleRefresh(session: Session) {
    this.clearRefreshTimer();
    
    const expiresAt = session.expires_at;
    if (!expiresAt) return;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt - now;
    
    // Refresh 5 minutes before expiry, or immediately if already expired
    const refreshIn = Math.max(0, (timeUntilExpiry - 300) * 1000);
    
    this.refreshTimer = setTimeout(async () => {
      try {
        await this.supabase.auth.refreshSession();
      } catch (error) {
        console.error('Failed to refresh session:', error);
        // If refresh fails, sign out the user
        await this.supabase.auth.signOut();
      }
    }, refreshIn);
  }

  // Clear the refresh timer
  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // Get current session
  async getSession(): Promise<Session | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session;
  }

  // Get current user
  async getUser(): Promise<User | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  // Get user profile with caching
  async getUserProfile(userId?: string) {
    const session = await this.getSession();
    const targetUserId = userId || session?.user?.id;
    
    if (!targetUserId) return null;
    
    const { data: profile, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', targetUserId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return profile;
  }

  // Subscribe to session changes
  onSessionChange(callback: (session: Session | null) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Sign out and clear session
  async signOut() {
    this.clearRefreshTimer();
    await this.supabase.auth.signOut();
  }

  // Refresh session manually
  async refreshSession() {
    const { data, error } = await this.supabase.auth.refreshSession();
    if (error) {
      console.error('Failed to refresh session:', error);
      throw error;
    }
    return data.session;
  }

  // Check if session is about to expire (within 5 minutes)
  async isSessionExpiringSoon(): Promise<boolean> {
    const session = await this.getSession();
    if (!session?.expires_at) return false;
    
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = session.expires_at - now;
    
    return timeUntilExpiry <= 300; // 5 minutes
  }

  // Store session data in localStorage for persistence
  private storeSessionData(session: Session) {
    try {
      localStorage.setItem('supabase_session', JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        user: session.user
      }));
    } catch (error) {
      console.error('Failed to store session data:', error);
    }
  }

  // Clear stored session data
  private clearStoredSessionData() {
    try {
      localStorage.removeItem('supabase_session');
    } catch (error) {
      console.error('Failed to clear session data:', error);
    }
  }

  // Cleanup when component unmounts
  cleanup() {
    this.clearRefreshTimer();
    this.listeners = [];
  }
}

// Create singleton instance
const sessionManager = new SessionManager();

export default sessionManager;

// Export types for convenience
export type { Session, User } from '@supabase/supabase-js';
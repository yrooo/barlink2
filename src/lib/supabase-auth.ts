import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { 
  createAuthenticationError, 
  createDatabaseError, 
  createAuthorizationError,
  AppError 
} from './error-handler';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side Supabase client with service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Server-side Supabase client for user operations
export const createServerSupabaseClient = async () => {
  const cookieStore = await cookies();
  
  return createClient(supabaseUrl, process.env.SUPABASE_ANON_KEY!, {
    auth: {
      storage: {
        getItem: (key: string) => {
          return cookieStore.get(key)?.value || null;
        },
        setItem: (key: string, value: string) => {
          cookieStore.set(key, value);
        },
        removeItem: (key: string) => {
          cookieStore.delete(key);
        },
      },
    },
  });
};

// Get authenticated user from request
export async function getAuthenticatedUser() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get the session from Supabase
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw createAuthenticationError('Invalid session');
    }
    
    if (!session?.user) {
      return null;
    }

    // Get user profile from our database
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      throw createDatabaseError('Failed to fetch user profile', profileError);
    }

    // Get additional profile data
    const { data: userProfile, error: userProfileError } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', session.user.id)
      .single();

    if (userProfileError && userProfileError.code !== 'PGRST116') {
      console.error('Error fetching user profile data:', userProfileError);
      // Don't throw error for missing profile data, just log it
    }

    return {
      user: session.user,
      profile,
      userProfile: userProfile || null,
      session
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error in getAuthenticatedUser:', error);
    throw createAuthenticationError('Authentication failed');
  }
}

// Middleware to check authentication and return user data
export async function requireAuth() {
  try {
    const authData = await getAuthenticatedUser();
    
    if (!authData) {
      throw createAuthenticationError('Authentication required');
    }
    
    return {
      user: authData.user,
      profile: authData.profile,
      userProfile: authData.userProfile,
      session: authData.session
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        error: error.message,
        status: error.statusCode,
        type: error.type
      };
    }
    return {
      error: 'Authentication failed',
      status: 500,
      type: 'INTERNAL_ERROR'
    };
  }
}

// Check if user has specific role
export async function requireRole(role: string) {
  try {
    const authData = await getAuthenticatedUser();
    
    if (!authData) {
      throw createAuthenticationError('Authentication required');
    }
    
    if (authData.profile.role !== role) {
      throw createAuthorizationError(`Role '${role}' required`);
    }
    
    return {
      user: authData.user,
      profile: authData.profile,
      userProfile: authData.userProfile,
      session: authData.session
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        error: error.message,
        status: error.statusCode,
        type: error.type
      };
    }
    return {
      error: 'Authorization failed',
      status: 500,
      type: 'INTERNAL_ERROR'
    };
  }
}

// Admin client for server-side operations that require elevated permissions
export { supabaseAdmin };

// Helper function to create response with proper error handling
export function createAuthResponse(data: Record<string, unknown>, status: number = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

// Helper to get user ID from session
export async function getUserId(): Promise<string | null> {
  const authData = await getAuthenticatedUser();
  return authData?.user?.id || null;
}

// Helper to get user profile
export async function getUserProfile() {
  const authData = await getAuthenticatedUser();
  return authData?.profile || null;
}
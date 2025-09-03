'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UserProfile {
  phone?: string;
  description?: string;
  website?: string;
  location?: string;
  cvFileName?: string;
  cvUploadedAt?: string;
  cvUrl?: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  company?: string;
  image?: string;
  profile?: UserProfile;
}

interface UseUserDataReturn {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const { data: session, status } = useSession();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`/api/users/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch user data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    
    if (session?.user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [session?.user?.id, status, fetchUserData]);

  const refetch = async () => {
    await fetchUserData();
  };

  return {
    userData,
    loading,
    error,
    refetch
  };
}
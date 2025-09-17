'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface UserProfile {
  phone?: string;
  whatsappNumber?: string;
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
  whatsappNumber?: string;
  whatsappVerified?: boolean;
  whatsappVerifiedAt?: Date;
  profile?: UserProfile;
}

interface UseUserDataReturn {
  userData: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserData(): UseUserDataReturn {
  const { user, userProfile } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      setUserData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      if (userProfile) {
        console.log('Setting user data from userProfile:', userProfile);
        setUserData({
          id: user.id,
          name: userProfile.name || '',
          email: user.email || '',
          role: userProfile.role || '',
          company: userProfile.company,
          image: userProfile.image,
          whatsappNumber: userProfile.whatsappNumber,
          whatsappVerified: userProfile.whatsappVerified,
          whatsappVerifiedAt: userProfile.whatsappVerifiedAt ? new Date(userProfile.whatsappVerifiedAt) : undefined,
          profile: {
            phone: userProfile.phone,
            whatsappNumber: userProfile.whatsappNumber,
            description: userProfile.description,
            website: userProfile.website,
            location: userProfile.location,
            cvFileName: userProfile.cvFileName,
            cvUploadedAt: userProfile.cvUploadedAt,
            cvUrl: userProfile.cvUrl,
          }
        });
      } else {
        console.log('No userProfile available, user:', user);
        setUserData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching user data:', err);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, userProfile]);

  useEffect(() => {
    if (user?.id) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchUserData]);

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
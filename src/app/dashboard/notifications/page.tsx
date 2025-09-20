'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useLoading } from '@/components/LoadingProvider';

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setLoading } = useLoading();

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true, 'Loading notifications...');
      return;
    }
    setLoading(false);
    if (!session) {
      router.push('/auth/signin');
      return;
    }
  }, [session, status, router, setLoading]);

  if (status === 'loading') {
    return null; // Loading is handled by LoadingProvider
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Notification system coming soon...</p>
      </div>
    </div>
  );
}
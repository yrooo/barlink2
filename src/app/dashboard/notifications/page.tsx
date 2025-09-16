'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NotificationsPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
  }, [user, router]);

  if (!user) {
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
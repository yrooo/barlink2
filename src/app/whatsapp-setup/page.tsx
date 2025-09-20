'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function WhatsAppSetup() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string>('');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Check authentication and admin access
  useEffect(() => {
    if (authLoading) return; // Still loading
    
    if (!user) {
      router.push('/auth/signin?callbackUrl=/whatsapp-setup');
      return;
    }

    // Check if user is admin (you can adjust this logic based on your user model)
    const userEmail = user.email;
    const isAdmin = userEmail === process.env.ADMIN_EMAIL
    
    if (!isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [user, profile, authLoading, router]);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/whatsapp/qr');
      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setIsReady(data.isReady);
      } else {
        setError(data.message || 'Failed to get QR code');
        setIsReady(data.isReady || false);
      }
    } catch {
      setError('Failed to fetch QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch QR code if user is authenticated and admin
    if (user && !authLoading) {
      fetchQRCode();
      
      // Poll for QR code updates every 5 seconds
      const interval = setInterval(fetchQRCode, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user, authLoading]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  // Check admin access
  const userEmail = user?.email;
  const isAdmin = userEmail === process.env.ADMIN_EMAIL
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            WhatsApp Setup
          </h1>
          
          {isReady ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="text-green-800">
                <h2 className="text-xl font-semibold mb-2">✅ WhatsApp Connected!</h2>
                <p>Your WhatsApp is successfully connected and ready to send OTP messages.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Connect Your WhatsApp
              </h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading QR Code...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800">{error}</p>
                </div>
              ) : qrCode ? (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Scan this QR code with your WhatsApp mobile app:
                  </p>
                  <div className="flex justify-center mb-4">
                    <Image 
                      src={qrCode} 
                      alt="WhatsApp QR Code" 
                      width={256}
                      height={256}
                      className="border-4 border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="text-sm text-gray-500">
                    <p>1. Open WhatsApp on your phone</p>
                    <p>2. Go to Settings → Linked Devices</p>
                    <p>3. Tap &ldquo;Link a Device&rdquo;</p>
                    <p>4. Scan this QR code</p>
                  </div>
                </div>
              ) : null}
              
              <div className="mt-6">
                <Button 
                  onClick={fetchQRCode}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh QR Code'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
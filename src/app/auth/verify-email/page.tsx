'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function VerifyEmail() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setMessage('Kami telah mengirimkan link verifikasi ke email Anda. Silakan cek kotak masuk Anda (termasuk folder spam) untuk melanjutkan.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage(data.message);
          // Optionally redirect to sign-in page after a delay
          setTimeout(() => {
            router.push('/auth/signin?message=Email Anda berhasil diverifikasi. Silakan masuk.');
          }, 3000);
        } else if (response.status === 400 && data.error === 'Token has expired or is invalid.') {
          setMessage('Link verifikasi telah kadaluarsa atau tidak valid. Silakan daftar ulang atau minta link baru.');
        } else {
          setMessage(data.error || 'Verifikasi email gagal.');
        }
      } catch (error) {
        setMessage('An error occurred during verification.');
        console.error('Verification error:', error);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md text-center">
        <h1 className="text-4xl font-black text-black mb-4">Verifikasi Email Anda</h1>
        {loading && token ? (
          <p className="text-gray-700">Verifying your email...</p>
        ) : (
          <>
            <p className="text-gray-700 mb-4">{message}</p>
            {!loading && message.includes('berhasil diverifikasi') && (
              <p className="text-gray-700">Redirecting to sign-in page...</p>
            )}
            {!loading && !message.includes('berhasil diverifikasi') && (
              <Link href="/auth/signin" className="text-main font-bold hover:underline">
                Kembali ke Halaman Masuk
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
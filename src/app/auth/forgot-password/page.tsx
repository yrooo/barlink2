'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');   

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setSubmitted(true);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-8 relative">
      <Link href="/auth/signin" className="absolute top-4 left-4">
        <Button variant="default" size="icon" className="bg-white text-black">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </Link>
      
      <div className="bg-white p-8 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-2">Lupa Password</h1>
          <p className="text-gray-600">
            {submitted 
              ? 'Kami telah mengirim instruksi reset password ke email Anda'
              : 'Masukkan email Anda untuk menerima link reset password'
            }
          </p>
        </div>

        {!submitted ? (
          <>
            {error && (
              <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="masukkan@email.com"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full text-lg py-3"
              >
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </Button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Ingat password Anda?{' '}
                <Link href="/auth/signin" className="text-main font-bold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </>
        ) : (
          <>
            {message && (
              <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {message}
              </div>
            )}

            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Periksa kotak masuk email Anda dan klik link yang kami kirim untuk mereset password.
                </p>
                <p className="text-sm text-gray-500">
                  Tidak menerima email? Periksa folder spam atau coba kirim ulang.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                    setMessage('');
                    setError('');
                  }}
                  variant="neutral"
                  className="flex-1"
                >
                  Kirim Ulang
                </Button>
                
                <Button
                  asChild
                  className="flex-1"
                >
                  <Link href="/auth/signin">Kembali ke Login</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
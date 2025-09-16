'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn, userProfile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn(email, password);

      if (result.error) {
        if (result.error.includes('Email not confirmed')) {
          router.push('/auth/verify-email');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Wait a moment for userProfile to be set
        setTimeout(() => {
          if (userProfile?.role === 'pencari_kandidat') {
            router.push('/dashboard');
          } else {
            router.push('/job?type=seek');
          }
        }, 500);
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-4 sm:p-8 relative">
      <Link href="/" className="absolute top-4 left-4 z-10">
        <Button variant="default" size="icon" className="bg-white text-black touch-target">
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </Link>
      <div className="bg-white content-padding rounded-responsive border-responsive border-black shadow-responsive w-full max-w-md mx-4">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-2">Masuk ke Barlink</h1>
          <p className="text-sm sm:text-base text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-base sm:text-lg font-bold mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="touch-target"
              placeholder="masukkan@email.com"
            />
          </div>

          <div>
            <label className="block text-base sm:text-lg font-bold mb-2">Kata Sandi</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="touch-target"
              placeholder="Masukkan kata sandi"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-base sm:text-lg py-3 sm:py-4 touch-target"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        <div className="text-center mt-6 space-y-3">
          <p className="text-gray-600">
            <Link href="/auth/forgot-password" className="text-main font-bold hover:underline">
              Lupa password?
            </Link>
          </p>
          <p className="text-gray-600">
            Belum punya akun?{' '}
            <Link href="/auth/signup" className="text-main font-bold hover:underline">
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


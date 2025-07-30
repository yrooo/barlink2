'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === 'EmailNotVerified') {
          router.push('/auth/verify-email');
        } else {
          setError('Invalid email or password');
        }
      } else {
        // Get session to check user role
        const session = await getSession();
        if (session?.user?.role === 'pencari_kandidat') {
          router.push('/dashboard');
        } else {
          router.push('/job?type=seek');
        }
      }
    } catch (_error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-2">Masuk ke Barlink</h1>
          <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
        </div>

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

          <div>
            <label className="block text-lg font-bold mb-2">Kata Sandi</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="Masukkan kata sandi"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-3"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </Button>
        </form>

        <div className="text-center mt-6">
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


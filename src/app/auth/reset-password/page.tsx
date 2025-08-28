'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token reset tidak ditemukan');
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setTokenValid(true);
        } else {
          setError(data.error || 'Token tidak valid atau sudah kedaluwarsa');
        }
      } catch {
        setError('Terjadi kesalahan saat memvalidasi token');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password harus minimal 6 karakter');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || 'Terjadi kesalahan');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-2xl font-bold">Memvalidasi token...</div>
      </div>
    );
  }

  if (!tokenValid && !success) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-8 relative">
        <Link href="/auth/signin" className="absolute top-4 left-4">
          <Button variant="default" size="icon" className="bg-white text-black">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        
        <div className="bg-white p-8 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-black mb-2">Token Tidak Valid</h1>
            <p className="text-gray-600">Token reset password tidak valid atau sudah kedaluwarsa</p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">Minta Link Reset Baru</Link>
            </Button>
            
            <Button asChild variant="neutral" className="w-full">
              <Link href="/auth/signin">Kembali ke Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center p-8 relative">
        <Link href="/auth/signin" className="absolute top-4 left-4">
          <Button variant="default" size="icon" className="bg-white text-black">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        
        <div className="bg-white p-8 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-black mb-2">Password Berhasil Direset</h1>
            <p className="text-gray-600">Password Anda telah berhasil diperbarui</p>
          </div>

          <div className="bg-green-100 border-2 border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            Password Anda telah berhasil direset. Silakan login dengan password baru Anda.
          </div>

          <Button asChild className="w-full">
            <Link href="/auth/signin">Login Sekarang</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-8 relative">
      <Link href="/auth/signin" className="absolute top-4 left-4">
        <Button variant="default" size="icon" className="bg-white text-black">
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </Link>
      
      <div className="bg-white p-8 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-2">Reset Password</h1>
          <p className="text-gray-600">Masukkan password baru Anda</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-2">Password Baru</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main pr-12"
                placeholder="Masukkan password baru"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Minimal 6 karakter</p>
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main pr-12"
                placeholder="Konfirmasi password baru"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-3"
          >
            {loading ? 'Mereset Password...' : 'Reset Password'}
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
      </div>
    </div>
  );
}
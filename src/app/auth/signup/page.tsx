'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    company: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate password length
    if (formData.password.length < 8) {
      setError('Kata sandi minimal 8 karakter');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi tidak cocok');
      setLoading(false);
      return;
    }
    
    // Validate company for employer role
    if (formData.role === 'pencari_kandidat' && !formData.company) {
      setError('Nama perusahaan wajib diisi untuk pencari kandidat');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          company: formData.company,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/verify-email?message=Akun berhasil dibuat. Silakan cek email Anda untuk verifikasi.');
      } else {
        setError(data.error || 'Terjadi kesalahan saat mendaftar');
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-black mb-2">Daftar ke Barlink</h1>
          <p className="text-sm sm:text-base text-gray-600">Buat akun baru untuk memulai</p>
        </div>
        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-responsive mb-4 text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
              placeholder="masukkan@email.com"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Saya ingin menjadi</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
            >
              <option value="">Pilih peran</option>
              <option value="pelamar_kerja">Pelamar Kerja</option>
              <option value="pencari_kandidat">Pencari Kandidat (Perusahaan)</option>
            </select>
          </div>

          {formData.role === 'pencari_kandidat' && (
            <div>
              <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Nama Perusahaan</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
                placeholder="Masukkan nama perusahaan"
              />
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
              placeholder="Masukkan kata sandi"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-lg font-bold mb-1 sm:mb-2">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full p-2 sm:p-3 border-responsive border-black rounded-responsive focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
              placeholder="Konfirmasi kata sandi"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-sm sm:text-lg py-2 sm:py-3 touch-target"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </Button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-sm sm:text-base text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/signin" className="text-main font-bold hover:underline touch-target">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


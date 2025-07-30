'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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
    } catch (_error) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-black mb-2">Daftar ke Barlink</h1>
          <p className="text-gray-600">Buat akun baru untuk memulai</p>
        </div>

        {error && (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-bold mb-2">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="Masukkan nama lengkap"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="masukkan@email.com"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Saya ingin menjadi</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
            >
              <option value="">Pilih peran</option>
              <option value="pelamar_kerja">Pelamar Kerja</option>
              <option value="pencari_kandidat">Pencari Kandidat (Perusahaan)</option>
            </select>
          </div>

          {formData.role === 'pencari_kandidat' && (
            <div>
              <label className="block text-lg font-bold mb-2">Nama Perusahaan</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                required
                className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                placeholder="Masukkan nama perusahaan"
              />
            </div>
          )}

          <div>
            <label className="block text-lg font-bold mb-2">Kata Sandi</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="Masukkan kata sandi"
            />
          </div>

          <div>
            <label className="block text-lg font-bold mb-2">Konfirmasi Kata Sandi</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
              placeholder="Konfirmasi kata sandi"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full text-lg py-3"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </Button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            Sudah punya akun?{' '}
            <Link href="/auth/signin" className="text-main font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}


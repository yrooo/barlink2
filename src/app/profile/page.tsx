'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    description: '',
    website: '',
    location: '',
    phone: '',
  });

  useEffect(() => {
    if (status === 'loading') {
      // Still loading session information
      return;
    }
    
    if (!session) {
      // No session, redirect to signin
      router.push('/auth/signin');
      return;
    }

    // Session exists, initialize form data for any role
    const initialFormData: Record<string, string> = {
      name: session.user.name || '',
      email: session.user.email || '',
      phone: session.user.phone || '', // Make sure session.user.phone is part of your session type
    };

    if (session.user.role === 'pencari_kandidat') {
      initialFormData.company = session.user.company || '';
      initialFormData.description = session.user.description || '';
      initialFormData.website = session.user.website || '';
      initialFormData.location = session.user.location || '';
    }
    setFormData(initialFormData);

  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Profil berhasil diperbarui!');
      } else {
        alert('Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!session) { // If no session (after loading), render nothing or a message.
    return null; // Or a message like <p>Please sign in to view your profile.</p>
  }

  // All logged-in users can see the profile page.
  // We will conditionally render fields based on role.

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button asChild variant="neutral">
              {session.user.role === 'pencari_kandidat' ? (
                <Link href="/dashboard">← Kembali ke Dashboard</Link>
              ) : (
                <Link href="/">← Kembali ke Beranda</Link>
              )}
            </Button>
            <h1 className="text-3xl font-black">Edit Profil</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold border-b-2 border-black pb-2">Informasi Dasar</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                    required
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">Email tidak dapat diubah</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> {/* Changed to 1 col for phone */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="081234567890"
                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                  />
                </div>
              </div>

              {/* Fields for 'pencari_kandidat' role */}
              {session.user.role === 'pencari_kandidat' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Nama Perusahaan *
                      </label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Lokasi Perusahaan
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="Jakarta, Indonesia"
                        className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      Website Perusahaan
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://www.perusahaan.com"
                      className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                    />
                  </div>
                  
                  {/* Company Description */}
                  <div className="space-y-4 pt-4"> {/* Added pt-4 for spacing */}
                    <h2 className="text-2xl font-bold border-b-2 border-black pb-2">Tentang Perusahaan</h2>
                    <div>
                      <label className="block text-sm font-bold mb-2">
                        Deskripsi Perusahaan
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={6}
                        placeholder="Ceritakan tentang perusahaan Anda, visi, misi, dan budaya kerja..."
                        className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-6 border-t-2 border-black">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              
              <Button
                type="button"
                variant="neutral"
                asChild
                className="flex-1"
              >
                {session.user.role === 'pencari_kandidat' ? (
                  <Link href="/dashboard">Batal</Link>
                ) : (
                  <Link href="/">Batal</Link>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Additional Settings - consider if these should be role-specific too */}
        <div className="mt-6 bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Pengaturan Akun</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg">
              <div>
                <h3 className="font-bold">Ubah Password</h3>
                <p className="text-sm text-gray-600">Perbarui password akun Anda</p>
              </div>
              <Button variant="neutral" size="sm">
                Ubah Password
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-red-200 rounded-lg">
              <div>
                <h3 className="font-bold text-red-600">Hapus Akun</h3>
                <p className="text-sm text-gray-600">Hapus akun dan semua data Anda secara permanen</p>
              </div>
              <Button variant="destructive" size="sm">
                Hapus Akun
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


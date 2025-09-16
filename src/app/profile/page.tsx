'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUserData } from '@/hooks/useUserData';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function ProfilePage() {
  const { user } = useAuth();
  const { userData, loading: userDataLoading, refetch } = useUserData();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    description: '',
    website: '',
    location: '',
    phone: '',
    whatsappNumber: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [cvDeleting, setCvDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentCv, setCurrentCv] = useState<{
    fileName: string;
    uploadedAt: string;
    url: string;
  } | null>(null);
  
  // WhatsApp OTP verification states
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);

  useEffect(() => {
    if (userDataLoading) {
      // Still loading user data
      return;
    }
    
    if (!user) {
      // No user, redirect to signin
      router.push('/auth/signin');
      return;
    }

    if (!userData) {
      // No user data available
      return;
    }

    // Only initialize form data once when user data first loads
    if (!isFormInitialized) {
      const initialFormData = {
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.profile?.phone || '',
        whatsappNumber: userData.profile?.whatsappNumber || userData.whatsappNumber || '',
        company: userData.company || '',
        description: userData.profile?.description || '',
        website: userData.profile?.website || '',
        location: userData.profile?.location || '',
      };
      setFormData(initialFormData);
      setIsFormInitialized(true);
    }

    // Initialize CV data for job seekers
    if (userData.role === 'pelamar_kerja' && userData.profile?.cvFileName) {
      setCurrentCv({
        fileName: userData.profile.cvFileName,
        uploadedAt: userData.profile.cvUploadedAt?.toString() || '',
        url: userData.profile.cvUrl || '',
      });
    }

  }, [userData, userDataLoading, user, router, isFormInitialized]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Hanya file PDF, DOC, dan DOCX yang diperbolehkan.');
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }
      
      setCvFile(file);
    }
  };

  const handleCvUpload = async () => {
    if (!cvFile) return;
    
    setCvUploading(true);
    try {
      const formData = new FormData();
      formData.append('cv', cvFile);
      
      const response = await fetch('/api/users/cv', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        setCurrentCv({
          fileName: result.fileName,
          uploadedAt: new Date().toISOString(),
          url: result.cvUrl,
        });
        setCvFile(null);
        toast.success('CV berhasil diunggah!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal mengunggah CV');
      }
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Terjadi kesalahan saat mengunggah CV');
    } finally {
      setCvUploading(false);
    }
  };

  const handleCvDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmCvDelete = async () => {
    setShowDeleteModal(false);
    setCvDeleting(true);
    try {
      const response = await fetch('/api/users/cv', {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCurrentCv(null);
        toast.success('CV berhasil dihapus!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Gagal menghapus CV');
      }
    } catch (error) {
      console.error('Error deleting CV:', error);
      toast.error('Terjadi kesalahan saat menghapus CV');
    } finally {
      setCvDeleting(false);
    }
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
        // Refetch user data from database to get latest changes
        await refetch();
        toast.success('Profil berhasil diperbarui!');
      } else {
        toast.error('Gagal memperbarui profil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // WhatsApp OTP verification functions
  const handleSendOtp = async () => {
    if (!formData.whatsappNumber) {
      toast.error('Masukkan nomor WhatsApp terlebih dahulu');
      return;
    }

    setOtpSending(true);
    try {
      const response = await fetch('/api/whatsapp/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: formData.whatsappNumber }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpSent(true);
        toast.success('Kode OTP telah dikirim ke WhatsApp Anda');
      } else {
        toast.error(data.error || 'Gagal mengirim OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Terjadi kesalahan saat mengirim OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      toast.error('Masukkan kode OTP');
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await fetch('/api/whatsapp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          phoneNumber: formData.whatsappNumber, 
          otpCode 
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOtpSent(false);
        setOtpCode('');
        await refetch(); // Refresh user data to show verified status
        toast.success('Nomor WhatsApp berhasil diverifikasi!');
      } else {
        toast.error(data.error || 'Kode OTP tidak valid');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      toast.error('Terjadi kesalahan saat verifikasi OTP');
    } finally {
      setOtpVerifying(false);
    }
  };

  if (userDataLoading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user || !userData) { // If no user or user data (after loading), render nothing or a message.
    return null; // Or a message like <p>Please sign in to view your profile.</p>
  }

  // All logged-in users can see the profile page.
  // We will conditionally render fields based on role.

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
              {userData.role === 'pencari_kandidat' ? (
                <Link href="/dashboard" className="absolute top-4 left-4 z-10">
                  <Button variant="default" size="icon" className="bg-main text-black touch-target">
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </Link>
              ) : (
                <Link href="/" className="absolute top-4 left-4 z-10">
                  <Button variant="default" size="icon" className="bg-main text-black touch-target">
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </Button>
                </Link>
              )}
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

              <div className="grid grid-cols-1 md:grid-cols-1 gap-4"> {/* Changed to 1 col for whatsapp */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleInputChange}
                    placeholder="081234567890"
                    className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                  />
                  {userData.whatsappVerified ? (
                    <p className="text-xs text-green-600 mt-1">✓ Nomor WhatsApp terverifikasi</p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      <p className="text-xs text-orange-600">⚠ Nomor WhatsApp belum terverifikasi</p>
                      
                      {!otpSent ? (
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpSending || !formData.whatsappNumber}
                          className="w-full bg-green-500 hover:bg-green-600 text-white"
                        >
                          {otpSending ? 'Mengirim...' : 'Kirim Kode Verifikasi'}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="Masukkan kode OTP"
                            className="w-full p-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                            maxLength={6}
                          />
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={otpVerifying || !otpCode}
                              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              {otpVerifying ? 'Memverifikasi...' : 'Verifikasi'}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => {
                                setOtpSent(false);
                                setOtpCode('');
                              }}
                              variant="noShadow"
                              className="flex-1"
                            >
                              Batal
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* CV Section for job seekers */}
              {userData.role === 'pelamar_kerja' && (
                <div className="space-y-4 pt-4">
                  <h2 className="text-2xl font-bold border-b-2 border-black pb-2">Curriculum Vitae (CV)</h2>
                  
                  {currentCv ? (
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-green-600">✓ CV Sudah Diunggah</p>
                          <p className="text-sm text-gray-600">File: {currentCv.fileName}</p>
                          {currentCv.uploadedAt && (
                            <p className="text-xs text-gray-500">
                              Diunggah: {new Date(currentCv.uploadedAt).toLocaleDateString('id-ID')}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant="neutral"
                            size="sm"
                            onClick={() => window.open(currentCv.url, '_blank')}
                          >
                            Lihat CV
                          </Button>
                          <div className="pt-1">
                          <Button
                            type="button"
                            variant="reverse"
                            size="sm"
                            onClick={handleCvDelete}
                            disabled={cvDeleting}
                          >
                            {cvDeleting ? 'Menghapus...' : 'Hapus'}
                          </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold mb-2">
                          Unggah CV *
                        </label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleCvFileChange}
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-main"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Format yang didukung: PDF (Maksimal 5MB)
                        </p>
                      </div>
                      
                      {cvFile && (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                          <p className="text-sm font-bold text-blue-600">File dipilih: {cvFile.name}</p>
                          <p className="text-xs text-blue-500">Ukuran: {(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button
                            type="button"
                            onClick={handleCvUpload}
                            disabled={cvUploading}
                            className="mt-2"
                            size="sm"
                          >
                            {cvUploading ? 'Mengunggah...' : 'Unggah CV'}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Fields for 'pencari_kandidat' role */}
              {userData.role === 'pencari_kandidat' && (
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
                {userData.role === 'pencari_kandidat' ? (
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
            </div>
          </div>
      </div>
      
      {/* CV Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi Hapus CV</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus CV? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="neutral"
            onClick={() => setShowDeleteModal(false)}
            disabled={cvDeleting}
          >
            Batal
          </Button>
          <Button
            variant="default"
            className='bg-red-500 text-white'
            onClick={confirmCvDelete}
            disabled={cvDeleting}
          >
            {cvDeleting ? 'Menghapus...' : 'Hapus CV'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  );
}


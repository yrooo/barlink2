'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomQuestion } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CreateJob() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    type: '',
    gender: '',
    age: '',
    degree: '',
  });
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([
    {
      question: 'Nama Lengkap',
      type: 'text',
      required: true,
    },
    {
      question: 'Nama Lengkap',
      type: 'text',
      required: true,
    },
    {
      question: 'Jenis Kelamin',
      type: 'select',
      options: ['Laki-laki', 'Perempuan'],
      required: true,
    },
  ]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (user.role !== 'pencari_kandidat') {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'salary') {
      // Remove all non-digit characters except for the hyphen
      let formattedValue = value.replace(/[^\d-]/g, '');

      // Handle range input (e.g., "1000000 - 2000000")
      const parts = formattedValue.split('-');
      const formattedParts = parts.map(part => {
        // Remove leading zeros unless the number is '0'
        const num = part.replace(/^0+(?!$)/, '');
        // Add thousands separator
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      });
      formattedValue = formattedParts.join(' - ');

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const addCustomQuestion = () => {
    if (customQuestions.length >= 5) {
      alert('Maksimal 5 pertanyaan khusus yang dapat ditambahkan.');
      return;
    }
    setCustomQuestions([
      ...customQuestions,
      {
        question: '',
        type: 'text',
        required: false,
        options: [],
      },
    ]);
  };

  const updateCustomQuestion = (index: number, field: keyof CustomQuestion, value: string | boolean | string[]) => {
    const updated = [...customQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setCustomQuestions(updated);
  };

  const removeCustomQuestion = (index: number) => {
    setCustomQuestions(customQuestions.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options = [...(updated[questionIndex].options || []), ''];
    setCustomQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...customQuestions];
    updated[questionIndex].options![optionIndex] = value;
    setCustomQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...customQuestions];
    updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
    setCustomQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          customQuestions,
        }),
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Terjadi kesalahan saat membuat lowongan');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'pencari_kandidat') {
    return null;
  }

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Buat Lowongan Baru</h1>
            <p className="text-gray-600">Tambahkan detail lowongan dan pertanyaan khusus</p>
          </div>
          <Button asChild variant="neutral">
            <Link href="/dashboard">Kembali</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Job Information */}
          <div className="bg-white p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">Informasi Lowongan</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2">Judul Lowongan *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Lokasi</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="e.g. Jakarta, Remote, Hybrid"
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Gaji</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-700 z-10">
                    Rp
                  </span>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-12 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                    placeholder="10.000.000 - 15.000.000"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">Gunakan tanda &quot;-&quot; untuk rentang gaji (contoh: 10.000.000 - 15.000.000)</p>
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Tipe Pekerjaan</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="freelance">Freelance</option>
                  <option value="magang">Magang</option>
                  <option value="kontrak">Kontrak</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Jenis Kelamin</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                >
                  <option value="Laki-laki & Perempuan">Laki-laki & Perempuan</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Deskripsi Lowongan *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="Jelaskan detail pekerjaan, requirements, dan benefit..."
                />
              </div>
            </div>
          </div>

          {/* Custom Questions */}
          <div className="bg-white p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black">Pertanyaan Khusus</h2>
                <p className="text-sm text-gray-600">{customQuestions.length}/5 pertanyaan</p>
              </div>
              <Button 
                type="button"
                onClick={addCustomQuestion}
                variant="default"
                disabled={customQuestions.length >= 5}
                className={customQuestions.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}
              >
                + Tambah Pertanyaan
              </Button>
            </div>

            {customQuestions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">❓</div>
                <p>Belum ada pertanyaan khusus. Tambahkan pertanyaan untuk mendapatkan informasi lebih detail dari pelamar.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {customQuestions.map((question, index) => (
                  <div key={index} className="border-2 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Pertanyaan {index + 1}</h3>
                      <Button
                        type="button"
                        onClick={() => removeCustomQuestion(index)}
                        size="sm"
                        className="bg-red"
                      >
                        Hapus
                      </Button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block font-bold mb-2">Pertanyaan</label>
                        <input
                          type="text"
                          value={question.question}
                          onChange={(e) => updateCustomQuestion(index, 'question', e.target.value)}
                          className="w-full p-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                          placeholder="Masukkan pertanyaan..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold mb-2">Tipe Jawaban</label>
                          <select
                            value={question.type}
                            onChange={(e) => updateCustomQuestion(index, 'type', e.target.value)}
                            className="w-full p-3 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                          >
                            <option value="text">Teks Pendek</option>
                            <option value="textarea">Teks Panjang</option>
                            <option value="select">Pilihan Dropdown</option>
                            <option value="radio">Pilihan Radio</option>
                            <option value="checkbox">Checkbox</option>
                          </select>
                        </div>

                        <div className="flex items-center">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateCustomQuestion(index, 'required', e.target.checked)}
                              className="w-4 h-4"
                            />
                            <span className="font-bold">Wajib diisi</span>
                          </label>
                        </div>
                      </div>

                      {(question.type === 'select' || question.type === 'radio' || question.type === 'checkbox') && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block font-bold">Pilihan</label>
                            <Button
                              type="button"
                              onClick={() => addOption(index)}
                              size="sm"
                              variant="neutral"
                            >
                              + Tambah Pilihan
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => updateOption(index, optionIndex, e.target.value)}
                                  className="flex-1 p-2 border-2 border-gray-300 rounded"
                                  placeholder={`Pilihan ${optionIndex + 1}`}
                                />
                                <Button
                                  type="button"
                                  onClick={() => removeOption(index, optionIndex)}
                                  size="sm"
                                  variant="neutral"
                                >
                                  Hapus
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CV Requirement Section */}
          <div className="bg-white p-6 rounded-md border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">📄 CV Pelamar</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold mb-3">Apakah Anda butuh CV pelamar?</label>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 mb-2">
                    💡 <strong>Informasi:</strong> Pelamar wajib mengupload CV ke profil mereka sebelum melamar pekerjaan.
                  </p>
                  <p className="text-sm text-blue-700">
                    Anda dapat melihat dan mengunduh CV pelamar nanti di dashboard aplikasi.
                  </p>
                </div>
                <div className="mt-4 flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requireCV"
                      value="yes"
                      defaultChecked
                      className="w-4 h-4 text-main border-2 border-black focus:ring-main"
                    />
                    <span className="font-semibold">Ya, CV diperlukan</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="requireCV"
                      value="no"
                      className="w-4 h-4 text-main border-2 border-black focus:ring-main"
                    />
                    <span className="font-semibold">Tidak perlu CV</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button"
              onClick={() => router.push('/dashboard')}
              variant="neutral"
            >
              Batal
            </Button>
            <Button 
              type="submit"
              disabled={loading}
              className="px-8"
            >
              {loading ? 'Membuat...' : 'Buat Lowongan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


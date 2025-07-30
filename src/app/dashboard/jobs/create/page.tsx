'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CustomQuestion } from '@/types';
import Link from 'next/link';

export default function CreateJob() {
  const { data: session, status } = useSession();
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
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'pencari_kandidat') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addCustomQuestion = () => {
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
        alert(data.error || 'Terjadi kesalahan saat membuat lowongan');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
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

  if (!session || session.user.role !== 'pencari_kandidat') {
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
          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
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
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                  placeholder="e.g. Rp 10.000.000 - Rp 15.000.000"
                />
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
          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Pertanyaan Khusus</h2>
              <Button 
                type="button"
                onClick={addCustomQuestion}
                variant=""
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

          {/* Media Upload Section */}
          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-6">Upload Media</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold mb-2">Upload CV (PDF, DOCX)</label>
                <input
                  type="file"
                  name="cvUpload"
                  accept=".pdf,.doc,.docx"
                  className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                />
                <p className="text-sm text-gray-500 mt-2">Max file size: 5MB</p>
              </div>
              {/* You can add more file inputs here for other media types if needed */}
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


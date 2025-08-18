'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Job, CustomQuestion } from '@/types';

interface JobApplicationProps {
  job: Job;
  onClose: () => void;
}

const JobApplication = ({ job, onClose }: JobApplicationProps) => {
  const { data: session } = useSession();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      alert('Silakan login terlebih dahulu');
      return;
    }

    if (session.user.role !== 'pelamar_kerja') {
      alert('Hanya pelamar kerja yang dapat melamar pekerjaan');
      return;
    }

    setLoading(true);

    try {
      // Format answers for submission
      const formattedAnswers = job.customQuestions.map((question, index) => ({
        questionId: question._id || index.toString(),
        question: question.question,
        answer: answers[question._id || index.toString()] || ''
      }));

      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId: job._id,
          answers: formattedAnswers,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Lamaran berhasil dikirim!');
        onClose();
      } else {
        alert(data.error || 'Terjadi kesalahan saat mengirim lamaran');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionInput = (question: CustomQuestion, index: number) => {
    const questionId = question._id || index.toString();
    const value = answers[questionId] || '';

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            required={question.required}
            rows={4}
            className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
            placeholder="Masukkan jawaban Anda..."
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            required={question.required}
            className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
          >
            <option value="">Pilih jawaban</option>
            {question.options?.map((option, optionIndex) => (
              <option key={optionIndex} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  required={question.required}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={option}
                  checked={Array.isArray(value) && value.includes(option)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    if (e.target.checked) {
                      handleAnswerChange(questionId, [...currentValues, option]);
                    } else {
                      handleAnswerChange(questionId, currentValues.filter(v => v !== option));
                    }
                  }}
                  className="w-4 h-4"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            required={question.required}
            className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
            placeholder="Masukkan jawaban Anda..."
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black">Lamar Pekerjaan</h2>
            <Button onClick={onClose} variant="neutral" size="sm">
              Tutup
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold">{job.title}</h3>
            <p className="text-gray-600">{job.company}</p>
            {job.location && <p className="text-gray-600">📍 {job.location}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {job.customQuestions.length > 0 ? (
              <>
                <div className="border-t-2 border-gray-200 pt-6">
                  <h4 className="text-lg font-bold mb-4">Pertanyaan Tambahan</h4>
                  <div className="space-y-6">
                    {job.customQuestions.map((question, index) => (
                      <div key={question._id || index}>
                        <label className="block text-lg font-bold mb-2">
                          {question.question}
                          {question.required && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {renderQuestionInput(question, index)}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Tidak ada pertanyaan tambahan untuk posisi ini.</p>
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200">
              <Button 
                type="button"
                onClick={onClose}
                variant="neutral"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Mengirim...' : 'Kirim Lamaran'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JobPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const type = searchParams.get('type');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (type === 'seek') {
      fetchJobs();
    } else if (type === 'list') {
      // Redirect to appropriate page based on authentication
      if (!session) {
        router.push('/auth/signin');
      } else if (session.user.role === 'pencari_kandidat') {
        router.push('/dashboard/jobs/create');
      } else {
        alert('Hanya pencari kandidat yang dapat memposting lowongan');
        router.push('/');
      }
    }
  }, [type, session, router]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.description.toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (type !== 'seek') {
    return null;
  }

  return (
    <div className="min-h-screen bg-main">
      <div className="">
        <Navbar />
      </div>
      
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-black mb-8 text-black bg-white p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow[12px_12px_0px_0px_rgba(0,0,0,1)] duration-300 border-2 border-black inline-block">
            Cari Pekerjaan Impianmu
          </h1>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                placeholder="Cari berdasarkan posisi, perusahaan, atau deskripsi..."
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-2xl font-bold">Loading...</div>
              </div>
            ) : (
              <div>
                {filteredJobs.length === 0 ? (
                  <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl text-gray-600">
                      {searchTerm ? 'Tidak ada lowongan yang sesuai dengan pencarian Anda' : 'Belum ada lowongan tersedia'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {filteredJobs.map((job) => (
                      <div key={job._id} className="bg-white p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:transform hover:translate-y-[-4px] transition-transform">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h2 className="text-xl font-bold mb-2">{job.title}</h2>
                            <p className="text-lg mb-2 text-blue-600">{job.company}</p>
                            {job.location && <p className="text-sm mb-2 text-gray-600">📍 {job.location}</p>}
                            {job.salary && <p className="text-sm mb-2 text-green-600">💰 {job.salary}</p>}
                            <p className="text-sm mb-4 text-gray-700">
                              {job.description.length > 80 
                                ? `${job.description.substring(0, 80)}...` 
                                : job.description
                              }
                            </p>
                            
                            {job.customQuestions.length > 0 && (
                              <div className="mb-4">
                                <p className="text-xs text-gray-500">
                                  📝 {job.customQuestions.length} pertanyaan tambahan
                                </p>
                              </div>
                            )}
                            
                            <div className="mb-4">
                              <p className="text-xs text-gray-400">
                                Diposting: {new Date(job.createdAt).toLocaleDateString('id-ID')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {job.applicationsCount} pelamar
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-auto">
                            <Button 
                              onClick={() => window.open(`/job/${job._id}`, '_blank')}
                              className="w-full px-4 py-2 text-sm"
                            >
                              Lihat Detail
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


    </div>
  );
};

const JobPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobPageContent />
    </Suspense>
  );
};

export default JobPage;


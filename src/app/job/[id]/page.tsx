'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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

const JobDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const jobId = params.id as string;

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/jobs/${jobId}`, {
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          setJob(data);
        } else {
          console.error('Job not found');
        }
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const handleApply = (job: Job) => {
    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'pelamar_kerja') {
      alert('Hanya pelamar kerja yang dapat melamar pekerjaan. Silakan daftar sebagai pelamar kerja.');
      return;
    }

    setSelectedJob(job);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main">
        <Navbar />
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="text-2xl font-bold">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-main">
        <Navbar />
        <div className="p-8">
          <div className="max-w-4xl mx-auto text-center py-12">
            <div className="text-2xl font-bold mb-4">Pekerjaan tidak ditemukan</div>
            <Button onClick={() => router.push('/job?type=seek')}>Kembali ke Daftar Pekerjaan</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      <Navbar />
      
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              onClick={() => router.push('/job?type=seek')}
              variant="neutral"
              className="mb-4"
            >
              ← Kembali ke Daftar Pekerjaan
            </Button>
          </div>

          <div className="bg-white p-8 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-8">
              <h1 className="text-4xl font-black mb-4">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <p className="text-2xl text-blue-600 font-bold">{job.company}</p>
                {job.location && <p className="text-lg text-gray-600">📍 {job.location}</p>}
                {job.salary && <p className="text-lg text-green-600 font-semibold">💰 {job.salary}</p>}
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                <p>Diposting: {new Date(job.createdAt).toLocaleDateString('id-ID')}</p>
                <p>{job.applicationsCount} pelamar</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Deskripsi Pekerjaan</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {job.customQuestions.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">Pertanyaan Tambahan</h2>
                <div className="bg-gray-50 p-4 rounded border-2 border-gray-200">
                  <p className="text-gray-600 mb-2">Posisi ini memiliki {job.customQuestions.length} pertanyaan tambahan yang perlu dijawab saat melamar:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {job.customQuestions.map((question, index) => (
                      <li key={question._id || index} className="text-gray-700">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-6 border-t-2 border-gray-200">
              <Button 
                onClick={() => handleApply(job)}
                className="px-8 py-3 text-lg"
                size="lg"
              >
                Lamar Sekarang
              </Button>
            </div>
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobApplication 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
};

export default JobDetailPage;
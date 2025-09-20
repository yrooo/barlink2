'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Job, CustomQuestion } from '@/types';
import { toast } from 'sonner';
import { useLoading } from '@/components/LoadingProvider';

interface JobApplicationProps {
  job: Job;
  onClose: () => void;
}

const JobApplication = ({ job, onClose }: JobApplicationProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { setLoading: setGlobalLoading } = useLoading();
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [loading, setLocalLoading] = useState(false);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      toast.error('Silakan login terlebih dahulu');
      return;
    }

    if (session.user.role !== 'pelamar_kerja') {
      toast.error('Hanya pelamar kerja yang dapat melamar pekerjaan');
      return;
    }

    setLocalLoading(true);

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
        toast.success('Lamaran berhasil dikirim!');
        onClose();
      } else {
        if (data.error === 'CV_REQUIRED') {
          toast.error(data.message || 'Tambahkan CV anda sebelum lamar pekerjaan');
          onClose();
          router.push('/profile');
        } else {
          toast.error(data.error || 'Terjadi kesalahan saat mengirim lamaran');
        }
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLocalLoading(false);
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
            className="w-full p-3 border-responsive rounded focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
            placeholder="Masukkan jawaban Anda..."
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
            required={question.required}
            className="w-full p-3 border-responsive rounded focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
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
              <label key={optionIndex} className="flex items-center space-x-2 touch-target">
                <input
                  type="radio"
                  name={questionId}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                  required={question.required}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="text-sm sm:text-base">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className="space-y-2">
            {question.options?.map((option, optionIndex) => (
              <label key={optionIndex} className="flex items-center space-x-2 touch-target">
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
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <span className="text-sm sm:text-base">{option}</span>
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
            className="w-full p-3 border-responsive rounded focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base touch-target"
            placeholder="Masukkan jawaban Anda..."
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-responsive border-responsive shadow-responsive w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="content-padding">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black">Lamar Pekerjaan</h2>
          </div>

          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-bold">{job.title}</h3>
            <p className="text-sm sm:text-base text-gray-600">{job.company}</p>
            {job.location && <p className="text-sm sm:text-base text-gray-600">📍 {job.location}</p>}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {job.customQuestions.length > 0 ? (
              <>
                <div className="border-t-responsive border-gray-200 pt-4 sm:pt-6">
                  <h4 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">Pertanyaan Tambahan</h4>
                  <div className="space-y-4 sm:space-y-6">
                    {job.customQuestions.map((question, index) => (
                      <div key={question._id || index}>
                        <label className="block text-sm sm:text-lg font-bold mb-2">
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
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <p className="text-sm sm:text-base">Tidak ada pertanyaan tambahan untuk posisi ini.</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-responsive border-gray-200">
              <Button 
                type="button"
                onClick={onClose}
                variant="neutral"
                className="touch-target w-full sm:w-auto order-2 sm:order-1"
              >
                Batal
              </Button>
              <Button 
                type="submit"
                disabled={loading}
                className="touch-target w-full sm:w-auto order-1 sm:order-2"
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
  const { setLoading } = useLoading();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLocalLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const jobId = params.id as string;

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true, 'Loading job details...');
      setLocalLoading(true);
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
        setLocalLoading(false);
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
      toast.error('Hanya pelamar kerja yang dapat melamar pekerjaan. Silakan daftar sebagai pelamar kerja.');
      return;
    }

    setSelectedJob(job);
  };

  if (loading) {
    return null; // Loading is handled by LoadingProvider
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-main">
        <Navbar />
        <div className="section-padding">
          <div className="container-responsive text-center py-8 sm:py-12">
            <div className="text-xl sm:text-2xl font-bold mb-4">Pekerjaan tidak ditemukan</div>
            <Button onClick={() => router.push('/job?type=seek')} className="touch-target">Kembali ke Daftar Pekerjaan</Button>
          </div>
        </div>
      </div>
    );
  }

  if (job.status !== 'active') {
    return (
      <div className="min-h-screen bg-main">
        <Navbar />
        <div className="section-padding">
          <div className="container-responsive text-center py-8 sm:py-12">
            <div className="text-xl sm:text-2xl font-bold mb-4">Pekerjaan ini tidak tersedia</div>
            <p className="text-gray-600 mb-6">Maaf, lowongan pekerjaan ini sudah tidak aktif.</p>
            <Button onClick={() => router.push('/job?type=seek')} className="touch-target">Kembali ke Daftar Pekerjaan</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-main">
      <Navbar />
      
      <div className="section-padding">
        <div className="container-responsive">
          <div className="mb-4 sm:mb-6">
            <Button 
              onClick={() => router.push('/job?type=seek')}
              variant="neutral"
              className="mb-4 touch-target text-sm sm:text-base"
            >
              ← Kembali ke Daftar Pekerjaan
            </Button>
          </div>

          <div className="bg-white content-padding rounded-responsive border-responsive shadow-responsive">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 sm:mb-4">{job.title}</h1>
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                <p className="text-lg sm:text-xl lg:text-2xl text-blue-600 font-bold">{job.company}</p>
                {job.location && <p className="text-sm sm:text-base lg:text-lg text-gray-600">📍 {job.location}</p>}
                {job.salary && <p className="text-sm sm:text-base lg:text-lg text-green-600 font-semibold">💰 {job.salary}</p>}
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <p>Diposting: {new Date(job.createdAt).toLocaleDateString('id-ID')}</p>
                <p>{job.applicationsCount} pelamar</p>
              </div>
            </div>

            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Deskripsi Pekerjaan</h2>
              <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-wrap">{job.description}</p>
              </div>
            </div>

            {job.syarat && job.syarat.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Persyaratan</h2>
                <div className="flex flex-wrap gap-2">
                  {job.syarat.map((syarat: string, index: number) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-2 text-sm font-semibold bg-main text-white border-2 border-black rounded"
                    >
                      {syarat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {job.customQuestions.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Pertanyaan Tambahan</h2>
                <div className="bg-gray-50 content-padding rounded-responsive border-responsive">
                  <p className="text-sm sm:text-base text-gray-600 mb-2">Posisi ini memiliki {job.customQuestions.length} pertanyaan tambahan yang perlu dijawab saat melamar:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {job.customQuestions.map((question, index) => (
                      <li key={question._id || index} className="text-xs sm:text-sm text-gray-700">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex justify-center pt-4 sm:pt-6 border-t-responsive border-gray-200">
              <Button 
                onClick={() => handleApply(job)}
                className="px-6 sm:px-8 py-3 text-base sm:text-lg touch-target w-full sm:w-auto"
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
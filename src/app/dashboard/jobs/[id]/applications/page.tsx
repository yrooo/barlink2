'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Application, Job } from '@/types';
import Link from 'next/link';

export default function JobApplications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);

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

    fetchJobAndApplications();
  }, [session, status, router, jobId]);

  const fetchJobAndApplications = async () => {
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`);
      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJob(jobData);
      }

      // Fetch applications for this job
      const applicationsResponse = await fetch(`/api/jobs/${jobId}/applications`);
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, notes }),
      });

      if (response.ok) {
        // Refresh applications
        fetchJobAndApplications();
      } else {
        alert('Gagal mengupdate status lamaran');
      }
    } catch (error) {
      console.error('Error updating application:', error);
      alert('Terjadi kesalahan saat mengupdate status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'accepted':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return status;
    }
  };

  if (status === 'loading' || loading) {
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
  <>
    <div className="min-h-screen bg-main">
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">Pelamar untuk: {job?.title}</h1>
            <p className="text-gray-600">{job?.company}</p>
          </div>
          <Button asChild variant="neutral">
            <Link href="/dashboard">Kembali ke Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {applications.length === 0 ? (
          <div className="bg-white p-12 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold mb-4">Belum Ada Pelamar</h2>
            <p className="text-gray-600">Belum ada yang melamar untuk posisi ini.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold">Total Pelamar: {applications.length}</h2>
            </div>

            {applications.map((application: any) => (
              <div 
                key={application._id} 
                className="bg-white p-4 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedApplication(application)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{application.applicantId?.name}</h3>
                    <p className="text-gray-600 text-sm">{application.applicantId?.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(application.status)}`}>
                    {getStatusText(application.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-black">{selectedApplication.applicantId?.name}</h2>
                    {selectedApplication.applicantId?.email && (
                      <p className="text-gray-600 text-sm mt-1">{selectedApplication.applicantId.email}</p>
                    )}
                  </div>
                  <Button 
                    onClick={() => setSelectedApplication(null)}
                    variant="neutral" 
                    size="sm"
                  >
                    Tutup
                  </Button>
                </div>

                <div className="border-t-2 border-gray-200 pt-6">
                  <h3 className="text-xl font-bold mb-4">Jawaban Pelamar</h3>
                  <div className="space-y-4">
                    {selectedApplication.answers?.map((answer, index) => (
                      <div key={index} className="border-b pb-4">
                        <h4 className="text-md font-semibold mb-1">{answer.question}</h4>
                        <p className="text-gray-700">{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200 mt-6">
                  <Button 
                    variant="neutral"
                    onClick={() => {
                      updateApplicationStatus(selectedApplication._id, 'rejected', 'Maaf, Anda belum memenuhi kriteria');
                      setSelectedApplication(null);
                    }}
                  >
                    Tolak
                  </Button>
                  <Button 
                    onClick={() => {
                      updateApplicationStatus(selectedApplication._id, 'accepted', 'Selamat! Anda diterima');
                      setSelectedApplication(null);
                    }}
                  >
                    Terima
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </>
  );
}


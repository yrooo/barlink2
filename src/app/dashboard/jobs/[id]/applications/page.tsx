'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Application, Job, User } from '@/types';
import Link from 'next/link';
import InterviewScheduler from '@/components/InterviewScheduler';
import { Calendar, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export default function JobApplications() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInterviewSchedulerOpen, setIsInterviewSchedulerOpen] = useState(false);
  const [currentApplicationForInterview, setCurrentApplicationForInterview] = useState<Application | null>(null);

  const fetchJobAndApplications = useCallback(async () => {
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
  }, [jobId]);

  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'pencari_kandidat') {
      router.push('/');
      return;
    }

    fetchJobAndApplications();
  }, [session, status, router, jobId, fetchJobAndApplications]);

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {applications.map((application: Application) =>(
                <div 
                  key={application._id} 
                  className="bg-white p-4 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                  
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold">{(application.applicantId as User)?.name}</h3>
                      <p className="text-gray-600 text-sm">{(application.applicantId as User)?.email}</p>
                      {(application.applicantId as User)?.profile?.cvUrl && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                          📄 CV Tersedia
                        </span>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(application.status)}`}>
                      {getStatusText(application.status)}
                    </span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="noShadow"
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Lihat Detail
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-black">{(application.applicantId as User)?.name}</DialogTitle>
                          {(application.applicantId as User)?.email && (
                            <p className="text-gray-600 text-sm mt-1">{(application.applicantId as User).email}</p>
                          )}
                        </DialogHeader>

                        {/* CV Section */}
                        {(application.applicantId as User)?.profile?.cvUrl && (
                          <div className="border-t-2 border-gray-200 pt-6">
                            <h3 className="text-xl font-bold mb-4">Curriculum Vitae</h3>
                            <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-bold text-green-600">✓ CV Tersedia</p>
                                  <p className="text-sm text-gray-600">
                                    File: {(application.applicantId as User)?.profile?.cvFileName || 'CV.pdf'}
                                  </p>
                                  {(application.applicantId as User)?.profile?.cvUploadedAt && (
                                    <p className="text-xs text-gray-500">
                                      Diunggah: {new Date((application.applicantId as User).profile.cvUploadedAt).toLocaleDateString('id-ID')}
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => window.open((application.applicantId as User)?.profile?.cvUrl, '_blank')}
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  Lihat CV
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="border-t-2 border-gray-200 pt-6">
                           <h3 className="text-xl font-bold mb-4">Jawaban Pelamar</h3>
                           <div className="space-y-4">
                             {application.answers?.map((answer, index) => (
                               <div key={index} className="border-b pb-4">
                                 <h4 className="text-md font-semibold mb-1">{answer.question}</h4>
                                 <p className="text-gray-700">{Array.isArray(answer.answer) ? answer.answer.join(', ') : answer.answer}</p>
                               </div>
                             ))}
                           </div>
                         </div>

                         <div className="border-t-2 border-gray-200 pt-6">
                           <h3 className="text-xl font-bold mb-4">Status Lamaran</h3>
                           <div className="flex items-center justify-between mb-4">
                             <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(application.status)}`}>
                               {getStatusText(application.status)}
                             </span>
                             <div className="text-sm text-gray-500">
                               Dilamar pada: {new Date(application.createdAt).toLocaleDateString('id-ID')}
                             </div>
                           </div>

                           {application.status === 'pending' && (
                             <div className="flex gap-2">
                               <Button
                                 onClick={() => updateApplicationStatus(application._id, 'accepted')}
                                 className="bg-green-500 hover:bg-green-600"
                               >
                                 Terima
                               </Button>
                               <Button
                                 onClick={() => updateApplicationStatus(application._id, 'rejected')}
                                 variant="neutral"
                               >
                                 Tolak
                               </Button>
                             </div>
                           )}

                           {application.notes && (
                             <div className="mt-4">
                               <h4 className="font-semibold mb-2">Catatan:</h4>
                               <p className="text-gray-700 bg-gray-50 p-3 rounded border">{application.notes}</p>
                             </div>
                           )}
                         </div>
                      </DialogContent>
                    </Dialog>
                    {application.status === 'accepted' && (
                      <Button
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 flex-1 text-xs"
                        onClick={() => {
                          setCurrentApplicationForInterview(application);
                          setIsInterviewSchedulerOpen(true);
                        }}
                      >
                        <Calendar className="w-4 h-4 mr-2" />
                        Jadwalkan Interview
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {currentApplicationForInterview && isInterviewSchedulerOpen && (
          <InterviewScheduler
            applicationId={currentApplicationForInterview._id}
            candidateName={(currentApplicationForInterview.applicantId as User)?.name || ''}
            position={job?.title || ''}
            isOpen={isInterviewSchedulerOpen}
            setIsOpen={setIsInterviewSchedulerOpen}
            onScheduled={() => {
              setIsInterviewSchedulerOpen(false);
              setCurrentApplicationForInterview(null);
              fetchJobAndApplications();
            }}
          />
        )}
      </div>
    </div>
  </>
  );
}


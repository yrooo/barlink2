'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
 

export default function Dashboard() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    if (userProfile?.role !== 'pencari_kandidat') {
      router.push('/');
      return;
    }

    fetchJobs();
  }, [user, userProfile, router]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs/employer');
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

  const handleToggleJobStatus = (jobId: string, currentStatus: string) => {
    if (currentStatus === 'active') {
      setSelectedJobId(jobId);
      setShowDeactivateModal(true);
    }
    // Don't allow reactivation of inactive jobs
  };

  const confirmDeactivateJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${selectedJobId}/toggle-status`, {
        method: 'PATCH',
      });
      
      if (response.ok) {
        // Refresh jobs list
        fetchJobs();
        setShowDeactivateModal(false);
        setSelectedJobId('');
      } else {
        toast.error('Gagal mengubah status lowongan');
      }
    } catch (error) {
      console.error('Error toggling job status:', error);
      toast.error('Terjadi kesalahan saat mengubah status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-main flex items-center justify-center">
        <div className="text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'pencari_kandidat') {
    return null;
  }

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-main rounded-full border-4 border-black flex items-center justify-center flex-shrink-0">
                <span className="text-lg sm:text-2xl font-black">{userProfile?.company?.[0] || 'C'}</span>
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">Welcome Back! 👋</h1>
                <p className="text-gray-600 text-sm sm:text-base truncate">{userProfile?.company}</p>
              </div>
            </div>
            <div className="flex space-x-2 sm:space-x-4 w-full sm:w-auto">
              <Button 
                asChild
                variant="neutral"
                className="flex-1 sm:flex-none"
              >
                <Link href="/">Keluar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            {/* Mobile: Show buttons in a row, Desktop: Show stacked */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
              <div className="bg-white p-4 sm:p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Button 
                  asChild
                  className="w-full text-sm sm:text-lg py-3 sm:py-4"
                >
                  <Link href="/dashboard/jobs/create">+ Buat Lowongan</Link>
                </Button>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <Button 
                  asChild
                  variant="neutral"
                  className="w-full text-sm sm:text-lg py-3 sm:py-4"
                >
                  <Link href="/profile">Edit Profil</Link>
                </Button>
              </div>
            </div>

            {/* Stats Box */}
            <div className="bg-white p-4 sm:p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Statistik</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Total Lowongan:</span>
                  <span className="font-bold">{jobs.length}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Lowongan Aktif:</span>
                  <span className="font-bold">{jobs.filter(job => job.status === 'active').length}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span>Total Pelamar:</span>
                  <span className="font-bold">{jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Job Listings */}
            <div className="bg-white p-4 sm:p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                <h2 className="text-xl sm:text-2xl font-black">Lowonganmu</h2>
                <Button asChild size="sm" className="w-full sm:w-auto">
                  <Link href="/dashboard/jobs/create">+ Tambah</Link>
                </Button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">📝</div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2">Belum ada lowongan</h3>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base px-4">Mulai dengan membuat lowongan pertamamu</p>
                  <Button asChild className="w-full sm:w-auto">
                    <Link href="/dashboard/jobs/create">Buat Lowongan</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job._id}
                      className="border-2 border-black rounded-sm p-3 sm:p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                        <div className="flex-1 lg:pr-4">
                          <h3 className="text-lg sm:text-xl font-bold mb-2">{job.title}</h3>
                          <p className="text-gray-600 mb-2 text-sm sm:text-base">{job.location}</p>
                          <p className="text-xs sm:text-sm text-gray-500 mb-3">
                            {job.description.length > 80 
                              ? `${job.description.substring(0, 80)}...` 
                              : job.description
                            }
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              job.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {job.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                            <span className="whitespace-nowrap">{job.applicationsCount} pelamar</span>
                            <span className="whitespace-nowrap">{new Date(job.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 xl:space-y-0 xl:space-x-2 lg:min-w-0 xl:min-w-max">
                          {job.status === 'active' && (
                            <Button 
                              onClick={() => handleToggleJobStatus(job._id, job.status)}
                              size="sm"
                              variant="neutral"
                              className="w-full sm:w-auto lg:w-full xl:w-auto text-xs sm:text-sm"
                            >
                              Nonaktifkan
                            </Button>
                          )}
                          <Button 
                            asChild
                            size="sm"
                            variant="neutral"
                            className="w-full sm:w-auto lg:w-full xl:w-auto text-xs sm:text-sm"
                          >
                            <Link href={`/dashboard/jobs/${job._id}/applications`}>
                              Lihat Pelamar
                            </Link>
                          </Button>
                          <Button 
                            asChild
                            size="sm"
                            className="w-full sm:w-auto lg:w-full xl:w-auto text-xs sm:text-sm"
                          >
                            <Link href={`/dashboard/jobs/${job._id}/edit`}>
                              Edit
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white p-4 sm:p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Pelamar Terbaru</h2>
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <div className="text-3xl sm:text-4xl mb-2">�</div>
                <p className="text-sm sm:text-base px-4">They can check the applicants profile, like their name, CV&apos;s, or other things depends on the application form.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deactivate Job Confirmation Modal */}
      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Nonaktifkan Lowongan</DialogTitle>
            <DialogDescription>
              Apakah anda yakin untuk menonaktifkan pekerjaan ini?
              <br />
              <strong>Anda tidak bisa mengaktifkan lagi</strong> setelah lowongan dinonaktifkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="neutral" 
              onClick={() => setShowDeactivateModal(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={confirmDeactivateJob}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Iya, Nonaktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


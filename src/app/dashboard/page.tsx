'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';
import Link from 'next/link';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchJobs();
  }, [session, status, router]);

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
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-main rounded-full border-4 border-black flex items-center justify-center">
              <span className="text-2xl font-black">{session.user.company?.[0] || 'C'}</span>
            </div>
            <div>
              <h1 className="text-3xl font-black">Welcome Back! 👋</h1>
              <p className="text-gray-600">{session.user.company}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            {/* <Button asChild>
              <Link href="/dashboard/profile">Edit Profil</Link>
            </Button> */}
            <Button 
              onClick={() => signOut()}
              variant="neutral"
            >
              Keluar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Button 
                asChild
                className="w-full text-lg py-4"
              >
                <Link href="/dashboard/jobs/create">+ Buat Lowongan</Link>
              </Button>
            </div>

            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <Button 
                asChild
                variant="neutral"
                className="w-full text-lg py-4"
              >
                <Link href="/profile">Edit Profil</Link>
              </Button>
            </div>

            {/* Stats Box */}
            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="text-xl font-bold mb-4">Statistik</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Lowongan:</span>
                  <span className="font-bold">{jobs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lowongan Aktif:</span>
                  <span className="font-bold">{jobs.filter(job => job.status === 'active').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Pelamar:</span>
                  <span className="font-bold">{jobs.reduce((sum, job) => sum + job.applicationsCount, 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Listings */}
            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black">Lowonganmu</h2>
                <Button asChild size="sm">
                  <Link href="/dashboard/jobs/create">+ Tambah</Link>
                </Button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold mb-2">Belum ada lowongan</h3>
                  <p className="text-gray-600 mb-4">Mulai dengan membuat lowongan pertamamu</p>
                  <Button asChild>
                    <Link href="/dashboard/jobs/create">Buat Lowongan</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <div 
                      key={job._id}
                      className="border-2 border-black rounded-lg p-4 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                          <p className="text-gray-600 mb-2">{job.location}</p>
                          <p className="text-sm text-gray-500 mb-2">
                            {job.description.length > 100 
                              ? `${job.description.substring(0, 100)}...` 
                              : job.description
                            }
                          </p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`px-2 py-1 rounded ${
                              job.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {job.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                            </span>
                            <span>{job.applicationsCount} pelamar</span>
                            <span>{new Date(job.createdAt).toLocaleDateString('id-ID')}</span>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 ml-4">
                          <Button 
                            asChild
                            size="sm"
                            variant="neutral"
                            className="w-full sm:w-auto"
                          >
                            <Link href={`/dashboard/jobs/${job._id}/applications`}>
                              Lihat Pelamar
                            </Link>
                          </Button>
                          <Button 
                            asChild
                            size="sm"
                            className="w-full sm:w-auto"
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
            <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-6">Pelamar Terbaru</h2>
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">👥</div>
                <p>They can check the applicants profile, like their name, CV&apos;s, or other things depends on the application form.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


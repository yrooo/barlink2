'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ApplicationWithJobDetails } from '@/types';
import Link from 'next/link';
import { useLoading } from '@/components/LoadingProvider';


export default function MyApplicationsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const { setLoading } = useLoading();
  const [applications, setApplications] = useState<ApplicationWithJobDetails[]>([]);
  const [loading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === 'loading') {
      return; // Wait for session to load
    }

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (session.user.role !== 'pelamar_kerja') {
      // Redirect to home or another appropriate page if not a job seeker
      router.push('/');
      return;
    }

    const fetchUserApplications = async () => {
      setLoading(true, 'Loading your applications...');
      setLocalLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/applications/my');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch applications: ${response.status}`);
        }
        const data: ApplicationWithJobDetails[] = await response.json();
        setApplications(data);
      } catch (err: unknown) {
        console.error("Error fetching applications:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
        setLocalLoading(false);
      }
    };

    if (session && session.user.role === 'pelamar_kerja') {
      fetchUserApplications();
    }
  }, [session, sessionStatus, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': // Assuming 'reviewed' might be a status from employer side
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
        return 'Menunggu Diproses';
      case 'reviewed':
        return 'Sedang Direview';
      case 'accepted':
        return 'Diterima';
      case 'rejected':
        return 'Ditolak';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (sessionStatus === 'loading' || loading) {
    return null; // Loading is handled by LoadingProvider
  }

  if (!session || session.user.role !== 'pelamar_kerja') {
    // This will likely be handled by the redirect, but as a fallback
    return null;
  }

  // Initial render structure
  return (
    <div className="min-h-screen bg-main flex flex-col">
      <Navbar />
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <h1 className="text-3xl font-black text-black">Lamaran Saya</h1>
            <p className="text-gray-600 mt-1">Lihat status semua pekerjaan yang telah Anda lamar.</p>
          </div>

          {/* Application list will be rendered here */}
          {!loading && !error && applications.length > 0 && (
            <div className="space-y-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white p-6 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-blue-600">{app.jobId.title}</h2>
                    <span
                      className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}
                    >
                      {getStatusText(app.status)}
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 mb-1">{app.jobId.company}</p>
                  {app.jobId.location && (
                    <p className="text-sm text-gray-500 mb-1">📍 {app.jobId.location}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Dilamar pada: {new Date(app.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {/* Optionally, add a link to the job details page if one exists */}
                  {/* <Link href={`/jobs/${app.jobId._id}`} className="text-blue-500 hover:underline mt-2 inline-block">Lihat Detail Lowongan</Link> */}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && applications.length === 0 && (
            <div className="bg-white p-12 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-6xl mb-4">📄</div>
              <h2 className="text-2xl font-bold mb-2">Belum Ada Lamaran</h2>
              <p className="text-gray-600 mb-6">Anda belum melamar pekerjaan apapun.</p>
              <Button asChild>
                <Link href="/job?type=seek">Cari Pekerjaan</Link>
              </Button>
            </div>
          )}

          {!loading && error && (
             <div className="bg-white p-12 rounded-lg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">Terjadi Kesalahan</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

        </div>
      </main>
      {/* Footer could go here if needed */}
    </div>
  );
}

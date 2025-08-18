'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Job } from '@/types';

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


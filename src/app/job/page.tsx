'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Job, JobFilters } from '@/types';
import { ChevronDown, Filter, X } from 'lucide-react';
import { toast } from 'sonner';

const JobPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const type = searchParams.get('type');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    salaryRange: '',
    company: '',
    datePosted: ''
  });

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
        toast.error('Hanya pencari kandidat yang dapat memposting lowongan');
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

  // Generate filter options from jobs data
  const filterOptions = useMemo(() => {
    const locations = [...new Set(jobs.map(job => job.location).filter(Boolean))];
    const companies = [...new Set(jobs.map(job => job.company))];
    
    return {
      locations: locations.map(loc => ({ value: loc!, label: loc! })),
      companies: companies.map(comp => ({ value: comp, label: comp })),
      salaryRanges: [
        { value: '0-5000000', label: 'Under 5 Million' },
        { value: '5000000-10000000', label: '5-10 Million' },
        { value: '10000000-15000000', label: '10-15 Million' },
        { value: '15000000+', label: 'Above 15 Million' }
      ],
      datePosted: [
        { value: '1', label: 'Last 24 hours' },
        { value: '7', label: 'Last 7 days' },
        { value: '30', label: 'Last 30 days' },
        { value: 'all', label: 'All time' }
      ]
    };
  }, [jobs]);

  // Filter jobs based on search term and filters
  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    // Apply search term filter
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }

    // Apply company filter
    if (filters.company) {
      filtered = filtered.filter(job => job.company === filters.company);
    }

    // Apply salary range filter
    if (filters.salaryRange) {
      filtered = filtered.filter(job => {
        if (!job.salary) return false;
        const salary = parseInt(job.salary.replace(/[^0-9]/g, ''));
        
        switch (filters.salaryRange) {
          case '0-5000000':
            return salary < 5000000;
          case '5000000-10000000':
            return salary >= 5000000 && salary < 10000000;
          case '10000000-15000000':
            return salary >= 10000000 && salary < 15000000;
          case '15000000+':
            return salary >= 15000000;
          default:
            return true;
        }
      });
    }

    // Apply date posted filter
    if (filters.datePosted && filters.datePosted !== 'all') {
      const daysAgo = parseInt(filters.datePosted);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      
      filtered = filtered.filter(job => {
        const jobDate = new Date(job.createdAt);
        return jobDate >= cutoffDate;
      });
    }

    return filtered;
  }, [searchTerm, jobs, filters]);

  // Filter management functions
  const handleFilterChange = (filterType: keyof JobFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      salaryRange: '',
      company: '',
      datePosted: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  if (type !== 'seek') {
    return null;
  }

  return (
    <div className="min-h-screen bg-main">
      <div className="">
        <Navbar />
      </div>
      
      <div className="section-padding">
        <div className="container-responsive">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-6 sm:mb-8 text-black bg-white content-padding shadow-responsive hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] duration-300 border-responsive inline-block">
            Cari Pekerjaan Impianmu
          </h1>

          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white content-padding border-responsive shadow-responsive">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 p-3 border-responsive rounded focus:outline-none focus:ring-2 focus:ring-main text-sm sm:text-base"
                  placeholder="Cari berdasarkan posisi, perusahaan, atau deskripsi..."
                />
                <Button 
                  onClick={() => setShowFilters(!showFilters)}
                  variant="default"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-responsive rounded hover:bg-gray-50 touch-target w-full sm:w-auto text-sm sm:text-base"
                >
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                  {hasActiveFilters && (
                    <span className="bg-main text-white text-xs rounded-full px-2 py-1">
                      {Object.values(filters).filter(f => f !== '').length}
                    </span>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="bg-gray-50 content-padding border-responsive">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-black">Filter Pekerjaan</h3>
                    {hasActiveFilters && (
                      <Button
                        onClick={clearFilters}
                        variant="default"
                        className="text-sm text-gray-600 hover:text-gray-900 touch-target w-full sm:w-auto"
                      >
                        Hapus Semua
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Location Filter */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Lokasi
                      </label>
                      <select
                        value={filters.location}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className="w-full px-3 py-2 border-responsive rounded focus:ring-2 focus:ring-main focus:border-transparent text-sm touch-target"
                      >
                        <option value="">Semua Lokasi</option>
                        {filterOptions.locations.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Company Filter */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Perusahaan
                      </label>
                      <select
                        value={filters.company}
                        onChange={(e) => handleFilterChange('company', e.target.value)}
                        className="w-full px-3 py-2 border-responsive rounded focus:ring-2 focus:ring-main focus:border-transparent text-sm touch-target"
                      >
                        <option value="">Semua Perusahaan</option>
                        {filterOptions.companies.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Salary Range Filter */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Rentang Gaji
                      </label>
                      <select
                        value={filters.salaryRange}
                        onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                        className="w-full px-3 py-2 border-responsive rounded focus:ring-2 focus:ring-main focus:border-transparent text-sm touch-target"
                      >
                        <option value="">Semua Gaji</option>
                        {filterOptions.salaryRanges.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Date Posted Filter */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Tanggal Posting
                      </label>
                      <select
                        value={filters.datePosted}
                        onChange={(e) => handleFilterChange('datePosted', e.target.value)}
                        className="w-full px-3 py-2 border-responsive rounded focus:ring-2 focus:ring-main focus:border-transparent text-sm touch-target"
                      >
                        <option value="">Kapan Saja</option>
                        {filterOptions.datePosted.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Active Filters Display */}
                  {hasActiveFilters && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                          if (!value) return null;
                          
                          let displayValue = value;
                          if (key === 'salaryRange') {
                            const option = filterOptions.salaryRanges.find(opt => opt.value === value);
                            displayValue = option?.label || value;
                          } else if (key === 'datePosted') {
                            const option = filterOptions.datePosted.find(opt => opt.value === value);
                            displayValue = option?.label || value;
                          }
                          
                          return (
                            <span
                              key={key}
                              className="inline-flex items-center gap-1 px-3 py-1 bg-main text-white text-sm rounded-full"
                            >
                              {key.charAt(0).toUpperCase() + key.slice(1)}: {displayValue}
                              <button
                                onClick={() => handleFilterChange(key as keyof JobFilters, '')}
                                className="ml-1 hover:text-gray-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Results Summary */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm text-gray-600 mt-4">
                <span>
                  Menampilkan {filteredJobs.length} dari {jobs.length} pekerjaan
                  {hasActiveFilters && ' (terfilter)'}
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-main hover:text-blue-800 underline text-left sm:text-right touch-target"
                  >
                    Hapus semua filter
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-2xl font-bold">Loading...</div>
              </div>
            ) : (
              <div>
                {filteredJobs.length === 0 ? (
                  <div className="bg-white content-padding border-responsive shadow-responsive text-center">
                    <div className="text-4xl sm:text-6xl mb-4">🔍</div>
                    <p className="text-lg sm:text-xl text-gray-600">
                      {searchTerm ? 'Tidak ada lowongan yang sesuai dengan pencarian Anda' : 'Belum ada lowongan tersedia'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredJobs.map((job) => (
                      <div key={job._id} className="bg-white content-padding border-responsive shadow-responsive  hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 hover:-translate-y-1">
                        <div className="flex flex-col h-full">
                          <div className="flex-1">
                            <h2 className="text-lg sm:text-xl font-bold mb-2">{job.title}</h2>
                            <p className="text-base sm:text-lg mb-2 text-blue-600">{job.company}</p>
                            {job.location && <p className="text-xs sm:text-sm mb-2 text-gray-600">📍 {job.location}</p>}
                            {job.salary && <p className="text-xs sm:text-sm mb-2 text-green-600">💰 Rp {job.salary}</p>}
                            <p className="text-xs sm:text-sm mb-4 text-gray-700">
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
                              className="w-full px-4 py-2 text-sm touch-target"
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


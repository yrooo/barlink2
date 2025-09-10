'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const EditJobPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [id, setId] = useState<string>('');
  const router = useRouter();
  // Removed react-hook-form as we're using controlled components
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'salary') {
      // Remove all non-digit characters except for the hyphen
      let formattedValue = value.replace(/[^\d-]/g, '');

      // Handle range input (e.g., "1000000 - 2000000")
      const parts = formattedValue.split('-');
      const formattedParts = parts.map(part => {
        // Remove leading zeros unless the number is '0'
        const num = part.replace(/^0+(?!$)/, '');
        // Add thousands separator
        return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      });
      formattedValue = formattedParts.join(' - ');

      setFormData({
        ...formData,
        [name]: formattedValue,
      });
      // Value is already set in formData state
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
      // Value is already set in formData state
    }
  };

  useEffect(() => {
    // Get the id from params and fetch job details
    const initializeComponent = async () => {
      try {
        const resolvedParams = await params;
        const jobId = resolvedParams.id;
        setId(jobId);
        
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const job = await response.json();
          setFormData({
            title: job.title,
            description: job.description,
            location: job.location,
            salary: job.salary,
          });
        } else {
          toast.error('Failed to fetch job details');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('An error occurred while fetching job details');
      }
    };

    initializeComponent();
  }, [params]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.description || !formData.location || !formData.salary) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Job updated successfully');
        router.push('/dashboard');
      } else {
        toast.error('Failed to update job');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('An error occurred while updating the job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main">
      {/* Header */}
      <div className="bg-white border-b-4 border-black p-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">✏️ Edit Job Posting</h1>
            <p className="text-gray-600">Update your job listing details</p>
          </div>
          <Button asChild variant="neutral">
            <Link href="/dashboard">Kembali</Link>
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white p-6 rounded-sm border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black mb-6">Job Information</h2>

          <form onSubmit={onSubmit} className="space-y-6">
            {/* Job Title */}
            <div>
              <label htmlFor="title" className="block text-lg font-bold mb-2">
                📝 Job Title *
              </label>
              <input
                 id="title"
                 name="title"
                 type="text"
                 value={formData.title}
                 onChange={handleInputChange}
                 className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                 placeholder="e.g. Senior Frontend Developer"
                 required
               />
            </div>

            {/* Job Description */}
            <div>
              <label htmlFor="description" className="block text-lg font-bold mb-2">
                📄 Job Description *
              </label>
              <textarea
                 id="description"
                 name="description"
                 value={formData.description}
                 onChange={handleInputChange}
                 rows={6}
                 className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                 placeholder="Describe the job responsibilities, requirements, and qualifications..."
                 required
               />
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-lg font-bold mb-2">
                📍 Location
              </label>
              <input
                 id="location"
                 name="location"
                 type="text"
                 value={formData.location}
                 onChange={handleInputChange}
                 className="w-full p-3 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                 placeholder="e.g. Jakarta, Indonesia or Remote"
               />
            </div>

            {/* Salary */}
            <div>
              <label htmlFor="salary" className="block text-lg font-bold mb-2">
                💰 Salary
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-700 z-10">
                  Rp
                </span>
                <input
                   id="salary"
                   name="salary"
                   type="text"
                   value={formData.salary}
                   onChange={handleInputChange}
                   className="w-full p-3 pl-12 border-4 border-black rounded focus:outline-none focus:ring-2 focus:ring-main"
                   placeholder="10.000.000 - 15.000.000"
                 />
              </div>
              <p className="text-sm text-gray-600 mt-1">Use "-" for salary range (example: 10.000.000 - 15.000.000)</p>
            </div>

          </form>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end space-x-4 mt-8">
          <Button 
            type="button"
            onClick={() => router.push('/dashboard')}
            variant="neutral"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={loading}
            className="px-8"
          >
            {loading ? '💾 Saving Changes...' : '💾 Save Changes'}
          </Button>
          <Link href={`/job/${id}`}>
            <Button variant="neutral" className="bg-blue-500 text-white border-blue-600">
              View Applications
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
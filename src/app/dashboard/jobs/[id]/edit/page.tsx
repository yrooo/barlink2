'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

const EditJobPage = ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const router = useRouter();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch job details to prefill the form
    const fetchJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${id}`);
        if (response.ok) {
          const job = await response.json();
          setValue('title', job.title);
          setValue('description', job.description);
          setValue('location', job.location);
          setValue('salary', job.salary);
        } else {
          toast.error('Failed to fetch job details');
        }
      } catch (error) {
        console.error('Error fetching job details:', error);
        toast.error('An error occurred while fetching job details');
      }
    };

    fetchJobDetails();
  }, [id, setValue]);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
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
    <div className='bg-main'>
    <div className="container-responsive section-padding">
      <h1 className="text-2xl font-bold mb-8 ">Edit Job</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-secondary-background p-6 rounded-responsive border-2 border-border shadow-[var(--shadow)]">
          {['title', 'description', 'location', 'salary'].map((field) => (
            <div key={field} className="mb-6 last:mb-0">
              <label htmlFor={field} className="block font-medium mb-2 font-bold capitalize">
                {field}
              </label>
              {field === 'description' ? (
                <textarea
                  id={field}
                  {...register(field, { required: `${field} is required` })}
                  className="w-full border-2 border-border p-3 rounded-responsive bg-background hover:border-main focus:border-main focus:outline-none transition-colors min-h-[120px]"
                />
              ) : (
                <input
                  id={field}
                  type={field === 'salary' ? 'number' : 'text'}
                  {...register(field, { required: `${field} is required` })}
                  className="w-full border-2 border-border p-3 rounded-responsive bg-background hover:border-main focus:border-main focus:outline-none transition-colors"
                />
              )}
              {errors[field] && (
                <p className="text-red-500 text-sm mt-2 font-bold">
                  {String(errors[field]?.message)}
                </p>
              )}
            </div>
          ))}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-main text-main-foreground border-2 border-border p-3 rounded-responsive shadow-[var(--shadow)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-background"
          >
            <span className="font-bold">
              {loading ? 'Saving...' : 'Save Changes'}
            </span>
          </Button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default EditJobPage;
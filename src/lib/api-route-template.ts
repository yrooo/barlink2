import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createSuccessResponse, 
  withErrorHandling,
  checkRateLimit,
  createRateLimitError,
  createValidationError
} from './error-handler';
import { requireAuth, requireRole, createServerSupabaseClient } from './supabase-auth';

/**
 * Enhanced API Route Template with comprehensive error handling
 * 
 * This template demonstrates best practices for:
 * - Input validation
 * - Authentication/Authorization
 * - Rate limiting
 * - Database operations
 * - Error handling
 * - Response formatting
 */

// Example validation schema using Zod
const CreateJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  company: z.string().min(1, 'Company name is required'),
  location: z.string().optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  employment_type: z.enum(['full-time', 'part-time', 'contract', 'internship']).optional(),
  experience_level: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
  skills: z.array(z.string()).optional(),
  requirements: z.string().optional(),
  benefits: z.string().optional(),
  expires_at: z.string().datetime().optional()
}).refine(data => {
  if (data.salary_min && data.salary_max) {
    return data.salary_min <= data.salary_max;
  }
  return true;
}, {
  message: 'Minimum salary cannot be greater than maximum salary',
  path: ['salary_min']
});

// GET endpoint example
export const GET = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting (100 requests per hour per IP)
  const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
  if (!checkRateLimit(clientIP, 100, 60 * 60 * 1000)) {
    throw createRateLimitError('Too many requests. Please try again later.');
  }

  // Optional authentication for GET requests
  const authResult = await requireAuth();
  // Check if user is authenticated for optional features
  const isAuthenticated = !('error' in authResult);
  console.log('User authenticated:', isAuthenticated);

  const supabase = await createServerSupabaseClient();
  const url = new URL(request.url);
  
  // Parse query parameters
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);
  const search = url.searchParams.get('search');
  const location = url.searchParams.get('location');
  const employmentType = url.searchParams.get('employment_type');
  
  // Validate pagination parameters
  if (page < 1 || limit < 1) {
    throw createValidationError('Invalid pagination parameters');
  }

  // Build query
  let query = supabase
    .from('jobs')
    .select('*', { count: 'exact' })
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  // Apply filters
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (location) {
    query = query.ilike('location', `%${location}%`);
  }
  if (employmentType) {
    query = query.eq('employment_type', employmentType);
  }

  const { data: jobs, error, count } = await query;

  if (error) {
    throw error;
  }

  return createSuccessResponse({
    jobs,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    filters: {
      search,
      location,
      employmentType
    }
  });
});

// POST endpoint example
export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting (10 job posts per hour per user)
  const authResult = await requireRole('pencari_kandidat');
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const { user } = authResult;
  
  if (!checkRateLimit(`job_post_${user.id}`, 10, 60 * 60 * 1000)) {
    throw createRateLimitError('Too many job posts. Please wait before posting again.');
  }

  // Parse and validate request body
  const body = await request.json();
  const validatedData = CreateJobSchema.parse(body);

  const supabase = await createServerSupabaseClient();

  // Create job posting
  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      ...validatedData,
      employer_id: user.id,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return createSuccessResponse(
    job, 
    'Job posted successfully', 
    201
  );
});

// PATCH endpoint example
export const PATCH = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireRole('pencari_kandidat');
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const { user } = authResult;
  const { id } = await context.params;
  
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    throw createValidationError('Invalid job ID format');
  }

  const body = await request.json();
  const validatedData = CreateJobSchema.partial().parse(body);

  const supabase = await createServerSupabaseClient();

  // Verify job ownership
  const { data: existingJob, error: fetchError } = await supabase
    .from('jobs')
    .select('employer_id')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  if (existingJob.employer_id !== user.id) {
    throw new Error('You can only update your own job postings');
  }

  // Update job
  const { data: updatedJob, error: updateError } = await supabase
    .from('jobs')
    .update(validatedData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return createSuccessResponse(
    updatedJob,
    'Job updated successfully'
  );
});

// DELETE endpoint example
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) => {
  const authResult = await requireRole('pencari_kandidat');
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const { user } = authResult;
  const { id } = await context.params;

  const supabase = await createServerSupabaseClient();

  // Verify job ownership and check for applications
  const { data: job, error: fetchError } = await supabase
    .from('jobs')
    .select(`
      employer_id,
      applications(count)
    `)
    .eq('id', id)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  if (job.employer_id !== user.id) {
    throw new Error('You can only delete your own job postings');
  }

  // Soft delete if there are applications, hard delete otherwise
  if (job.applications && job.applications.length > 0) {
    const { error: updateError } = await supabase
      .from('jobs')
      .update({ status: 'closed' })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse(
      null,
      'Job posting closed due to existing applications'
    );
  } else {
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (deleteError) {
      throw deleteError;
    }

    return createSuccessResponse(
      null,
      'Job posting deleted successfully'
    );
  }
});

// Helper function for file upload validation
export function validateFileUpload(file: File, allowedTypes: string[], maxSize: number) {
  if (!allowedTypes.includes(file.type)) {
    throw createValidationError(
      `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
      { allowedTypes, receivedType: file.type }
    );
  }

  if (file.size > maxSize) {
    throw createValidationError(
      `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`,
      { maxSize, receivedSize: file.size }
    );
  }
}

// Helper function for database transaction
export async function withTransaction<T>(
  supabase: unknown,
  operations: (client: unknown) => Promise<T>
): Promise<T> {
  try {
    const result = await operations(supabase);
    return result;
  } catch (error) {
    // In a real implementation, you would rollback the transaction here
    // Supabase doesn't have explicit transaction support in the client library
    // You would need to use the database functions or stored procedures
    throw error;
  }
}

// Example of a complex operation with multiple database calls
export const complexOperation = withErrorHandling(async () => {
  const authResult = await requireAuth();
  
  if ('error' in authResult) {
    return NextResponse.json(
      { success: false, error: authResult.error },
      { status: authResult.status }
    );
  }

  const supabase = await createServerSupabaseClient();
  
  return withTransaction(supabase, async (client) => {
    // Multiple database operations here
    // If any fails, the entire operation should be rolled back
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: step1 } = await (client as any).from('table1').insert({}).select().single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: step2 } = await (client as any).from('table2').insert({ ref_id: step1.id }).select().single();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: step3 } = await (client as any).from('table3').update({ status: 'completed' }).eq('id', step2.ref_id);
    
    return createSuccessResponse({
      step1,
      step2,
      step3
    }, 'Complex operation completed successfully');
  });
});
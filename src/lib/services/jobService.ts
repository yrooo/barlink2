import { supabaseAdmin } from '@/lib/supabase'
import { Job, JobInsert, JobUpdate } from '@/lib/supabase'

interface CustomQuestion {
  question: string;
  type?: string;
  required?: boolean;
  options?: string[];
}

interface JobStats {
  totalJobs: number;
  activeJobs: number;
  draftJobs: number;
  closedJobs: number;
  totalApplications: number;
}

export class JobService {
  /**
   * Get all active jobs with employer information
   */
  static async getActiveJobs(): Promise<Job[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select(`
          *,
          employer:users!employer_id(id, name, company, location),
          custom_questions(
            id,
            question,
            type,
            required,
            custom_question_options(option_text, sort_order)
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching active jobs:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getActiveJobs:', error)
      return []
    }
  }
  
  /**
   * Get job by ID with full details
   */
  static async getJobById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select(`
          *,
          employer:users!employer_id(id, name, company, location, email),
          custom_questions(
            id,
            question,
            type,
            required,
            custom_question_options(option_text, sort_order)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching job by ID:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getJobById:', error)
      return null
    }
  }
  
  /**
   * Get jobs by employer ID
   */
  static async getJobsByEmployer(employerId: string): Promise<Job[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select('*')
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching jobs by employer:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getJobsByEmployer:', error)
      return []
    }
  }
  
  /**
   * Create a new job
   */
  static async createJob(jobData: JobInsert, customQuestions?: CustomQuestion[]): Promise<Job | null> {
    try {
      // Create the job
      const { data: job, error: jobError } = await supabaseAdmin
        .from('jobs')
        .insert({
          ...jobData,
          status: 'active',
          applications_count: 0
        })
        .select()
        .single()
      
      if (jobError) {
        console.error('Error creating job:', jobError)
        return null
      }
      
      // Create custom questions if provided
      if (customQuestions && customQuestions.length > 0) {
        const questionsToInsert = customQuestions.map((q: CustomQuestion) => ({
          job_id: job.id,
          question: q.question,
          type: q.type || 'text',
          required: q.required || false
        }))
        
        const { data: questions, error: questionsError } = await supabaseAdmin
          .from('custom_questions')
          .insert(questionsToInsert)
          .select()
        
        if (questionsError) {
          console.error('Error creating custom questions:', questionsError)
          // Don't fail the job creation, just log the error
        }
        
        // Create question options if any
        if (questions) {
          for (let i = 0; i < questions.length; i++) {
            const question = questions[i]
            const originalQuestion = customQuestions[i]
            
            if (originalQuestion.options && originalQuestion.options.length > 0) {
              const optionsToInsert = originalQuestion.options.map((option: string, index: number) => ({
                question_id: question.id,
                option_text: option,
                sort_order: index
              }))
              
              const { error: optionsError } = await supabaseAdmin
                .from('custom_question_options')
                .insert(optionsToInsert)
              
              if (optionsError) {
                console.error('Error creating question options:', optionsError)
              }
            }
          }
        }
      }
      
      return job
    } catch (error) {
      console.error('Error in createJob:', error)
      return null
    }
  }
  
  /**
   * Update job
   */
  static async updateJob(id: string, updates: JobUpdate): Promise<Job | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating job:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateJob:', error)
      return null
    }
  }
  
  /**
   * Update job status
   */
  static async updateJobStatus(id: string, status: 'active' | 'inactive' | 'closed'): Promise<Job | null> {
    try {
      return await this.updateJob(id, { status })
    } catch (error) {
      console.error('Error in updateJobStatus:', error)
      return null
    }
  }
  
  /**
   * Increment applications count
   */
  static async incrementApplicationsCount(id: string): Promise<Job | null> {
    try {
      // First get current count
      const job = await this.getJobById(id)
      if (!job) {
        return null
      }
      
      return await this.updateJob(id, {
        applications_count: (job.applications_count || 0) + 1
      })
    } catch (error) {
      console.error('Error in incrementApplicationsCount:', error)
      return null
    }
  }
  
  /**
   * Search jobs by title, company, or location
   */
  static async searchJobs(query: string): Promise<Job[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .select(`
          *,
          employer:users!employer_id(id, name, company, location)
        `)
        .eq('status', 'active')
        .or(`title.ilike.%${query}%,company.ilike.%${query}%,location.ilike.%${query}%`)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error searching jobs:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in searchJobs:', error)
      return []
    }
  }
  
  /**
   * Delete job
   */
  static async deleteJob(id: string): Promise<boolean> {
    try {
      // First delete related custom questions and their options
      const { data: questions } = await supabaseAdmin
        .from('custom_questions')
        .select('id')
        .eq('job_id', id)
      
      if (questions && questions.length > 0) {
        const questionIds = questions.map(q => q.id)
        
        // Delete question options
        await supabaseAdmin
          .from('custom_question_options')
          .delete()
          .in('question_id', questionIds)
        
        // Delete questions
        await supabaseAdmin
          .from('custom_questions')
          .delete()
          .eq('job_id', id)
      }
      
      // Delete the job
      const { error } = await supabaseAdmin
        .from('jobs')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting job:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteJob:', error)
      return false
    }
  }
  
  /**
   * Get job statistics for employer
   */
  static async getJobStats(employerId: string): Promise<JobStats> {
    try {
      const { data: jobs, error } = await supabaseAdmin
        .from('jobs')
        .select('status, applications_count')
        .eq('employer_id', employerId)
      
      if (error) {
        console.error('Error fetching job stats:', error)
        return {
          totalJobs: 0,
          activeJobs: 0,
          draftJobs: 0,
          closedJobs: 0,
          totalApplications: 0
        }
      }
      
      const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === 'active').length,
        draftJobs: jobs.filter(j => j.status === 'draft').length,
        closedJobs: jobs.filter(j => j.status === 'closed').length,
        totalApplications: jobs.reduce((sum, job) => sum + (job.applications_count || 0), 0)
      }
      
      return stats
    } catch (error) {
      console.error('Error in getJobStats:', error)
      return {
        totalJobs: 0,
        activeJobs: 0,
        draftJobs: 0,
        closedJobs: 0,
        totalApplications: 0
      }
    }
  }
}
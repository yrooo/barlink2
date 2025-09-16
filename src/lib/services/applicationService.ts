import { supabaseAdmin } from '@/lib/supabase'
import { Application, ApplicationInsert, ApplicationUpdate } from '@/lib/supabase'
import { JobService } from './jobService'

export class ApplicationService {
  /**
   * Get application by ID with full details
   */
  static async getApplicationById(id: string): Promise<Application | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          job:jobs(id, title, company, location),
          applicant:users!applicant_id(id, name, email, phone),
          employer:users!employer_id(id, name, company, email),
          application_answers(
            id,
            question_id,
            answer,
            custom_questions(question, type)
          )
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching application by ID:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getApplicationById:', error)
      return null
    }
  }
  
  /**
   * Get applications by job ID
   */
  static async getApplicationsByJob(jobId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          applicant:users!applicant_id(id, name, email, phone),
          application_answers(
            id,
            question_id,
            answer,
            custom_questions(question, type)
          )
        `)
        .eq('job_id', jobId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching applications by job:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getApplicationsByJob:', error)
      return []
    }
  }
  
  /**
   * Get applications by applicant ID
   */
  static async getApplicationsByApplicant(applicantId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          job:jobs(id, title, company, location, status),
          employer:users!employer_id(id, name, company)
        `)
        .eq('applicant_id', applicantId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching applications by applicant:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getApplicationsByApplicant:', error)
      return []
    }
  }
  
  /**
   * Get applications by employer ID
   */
  static async getApplicationsByEmployer(employerId: string): Promise<Application[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          job:jobs(id, title, company),
          applicant:users!applicant_id(id, name, email, phone)
        `)
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching applications by employer:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getApplicationsByEmployer:', error)
      return []
    }
  }
  
  /**
   * Check if user has already applied to a job
   */
  static async hasUserApplied(jobId: string, applicantId: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('job_id', jobId)
        .eq('applicant_id', applicantId)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return false // No application found
        }
        console.error('Error checking if user applied:', error)
        return false
      }
      
      return !!data
    } catch (error) {
      console.error('Error in hasUserApplied:', error)
      return false
    }
  }
  
  /**
   * Create a new application
   */
  static async createApplication(
    applicationData: ApplicationInsert,
    answers?: { questionId: string; answer: string }[]
  ): Promise<Application | null> {
    try {
      // Check if user has already applied
      const hasApplied = await this.hasUserApplied(
        applicationData.job_id,
        applicationData.applicant_id
      )
      
      if (hasApplied) {
        console.error('User has already applied to this job')
        return null
      }
      
      // Create the application
      const { data: application, error: applicationError } = await supabaseAdmin
        .from('applications')
        .insert({
          ...applicationData,
          status: 'pending'
        })
        .select()
        .single()
      
      if (applicationError) {
        console.error('Error creating application:', applicationError)
        return null
      }
      
      // Create application answers if provided
      if (answers && answers.length > 0) {
        const answersToInsert = answers.map(answer => ({
          application_id: application.id,
          question_id: answer.questionId,
          answer: answer.answer
        }))
        
        const { error: answersError } = await supabaseAdmin
          .from('application_answers')
          .insert(answersToInsert)
        
        if (answersError) {
          console.error('Error creating application answers:', answersError)
          // Don't fail the application creation, just log the error
        }
      }
      
      // Increment job applications count
      await JobService.incrementApplicationsCount(applicationData.job_id)
      
      return application
    } catch (error) {
      console.error('Error in createApplication:', error)
      return null
    }
  }
  
  /**
   * Update application status
   */
  static async updateApplicationStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected',
    notes?: string
  ): Promise<Application | null> {
    try {
      const updates: ApplicationUpdate = {
        status,
        updated_at: new Date().toISOString()
      }
      
      if (notes !== undefined) {
        updates.notes = notes
      }
      
      const { data, error } = await supabaseAdmin
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating application status:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error)
      return null
    }
  }
  
  /**
   * Update application notes
   */
  static async updateApplicationNotes(id: string, notes: string): Promise<Application | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .update({
          notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating application notes:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateApplicationNotes:', error)
      return null
    }
  }
  
  /**
   * Delete application
   */
  static async deleteApplication(id: string): Promise<boolean> {
    try {
      // First delete application answers
      await supabaseAdmin
        .from('application_answers')
        .delete()
        .eq('application_id', id)
      
      // Delete the application
      const { error } = await supabaseAdmin
        .from('applications')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting application:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteApplication:', error)
      return false
    }
  }
  
  /**
   * Get application statistics for employer
   */
  static async getApplicationStats(employerId: string): Promise<{ total: number; pending: number; reviewed: number; accepted: number; rejected: number }> {
    try {
      const { data: applications, error } = await supabaseAdmin
        .from('applications')
        .select('status')
        .eq('employer_id', employerId)
      
      if (error) {
        console.error('Error fetching application stats:', error)
        return {
          total: 0,
          pending: 0,
          reviewed: 0,
          accepted: 0,
          rejected: 0
        }
      }
      
      const stats = {
        total: applications.length,
        pending: applications.filter(a => a.status === 'pending').length,
        reviewed: applications.filter(a => a.status === 'reviewed').length,
        accepted: applications.filter(a => a.status === 'accepted').length,
        rejected: applications.filter(a => a.status === 'rejected').length
      }
      
      return stats
    } catch (error) {
      console.error('Error in getApplicationStats:', error)
      return {
        total: 0,
        pending: 0,
        reviewed: 0,
        accepted: 0,
        rejected: 0
      }
    }
  }
  
  /**
   * Get recent applications for employer dashboard
   */
  static async getRecentApplications(employerId: string, limit: number = 10): Promise<Application[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          job:jobs(id, title),
          applicant:users!applicant_id(id, name, email)
        `)
        .eq('employer_id', employerId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (error) {
        console.error('Error fetching recent applications:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getRecentApplications:', error)
      return []
    }
  }
}
import { supabaseAdmin } from '@/lib/supabase'
import { Interview, InterviewInsert, InterviewUpdate } from '@/lib/supabase'

export class InterviewService {
  /**
   * Get interview by ID with full details
   */
  static async getInterviewById(id: string): Promise<Interview | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .select(`
          *,
          application:applications(
            id,
            status,
            job:jobs(id, title, company),
            applicant:users!applicant_id(id, name, email, phone)
          ),
          employer:users!employer_id(id, name, email)
        `)
        .eq('id', id)
        .single()
      
      if (error) {
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching interview by ID:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in getInterviewById:', error)
      return null
    }
  }
  
  /**
   * Get interviews by application ID
   */
  static async getInterviewsByApplication(applicationId: string): Promise<Interview[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .select(`
          *,
          employer:users!employer_id(id, name, email)
        `)
        .eq('application_id', applicationId)
        .order('scheduled_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching interviews by application:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getInterviewsByApplication:', error)
      return []
    }
  }
  
  /**
   * Get interviews by interviewer ID
   */
  static async getInterviewsByInterviewer(interviewerId: string): Promise<Interview[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .select(`
          *,
          application:applications(
            id,
            job:jobs(id, title, company),
            applicant:users!applicant_id(id, name, email, phone)
          )
        `)
        .eq('employer_id', interviewerId)
      .order('scheduled_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching interviews by interviewer:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getInterviewsByInterviewer:', error)
      return []
    }
  }
  
  /**
   * Get upcoming interviews for a user (interviewer or applicant)
   */
  static async getUpcomingInterviews(userId: string, userType: 'interviewer' | 'applicant'): Promise<Interview[]> {
    try {
      let query = supabaseAdmin
        .from('interviews')
        .select(`
          *,
          application:applications(
            id,
            job:jobs(id, title, company),
            applicant:users!applicant_id(id, name, email, phone)
          ),
          employer:users!employer_id(id, name, email)
        `)
        .gte('scheduled_date', new Date().toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
      
      if (userType === 'interviewer') {
        query = query.eq('employer_id', userId)
      } else {
        // For applicants, we need to join through applications
        query = query.eq('application.applicant_id', userId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error fetching upcoming interviews:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getUpcomingInterviews:', error)
      return []
    }
  }
  
  /**
   * Create a new interview
   */
  static async createInterview(interviewData: InterviewInsert): Promise<Interview | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .insert({
          ...interviewData,
          status: 'scheduled'
        })
        .select()
        .single()
      
      if (error) {
        console.error('Error creating interview:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in createInterview:', error)
      return null
    }
  }
  
  /**
   * Update interview details
   */
  static async updateInterview(id: string, updates: InterviewUpdate): Promise<Interview | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating interview:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateInterview:', error)
      return null
    }
  }
  
  /**
   * Update interview status
   */
  static async updateInterviewStatus(
    id: string,
    status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show',
    notes?: string
  ): Promise<Interview | null> {
    try {
      const updates: InterviewUpdate = {
        status: status as 'scheduled' | 'completed' | 'cancelled' | 'rescheduled',
        updated_at: new Date().toISOString()
      }
      
      if (notes !== undefined) {
        updates.notes = notes
      }
      
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error updating interview status:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in updateInterviewStatus:', error)
      return null
    }
  }
  
  /**
   * Reschedule interview
   */
  static async rescheduleInterview(
    id: string,
    newScheduledAt: string,
    newDuration?: number,
    notes?: string
  ): Promise<Interview | null> {
    try {
      const updates: InterviewUpdate = {
        scheduled_date: new Date(newScheduledAt).toISOString().split('T')[0],
        scheduled_time: new Date(newScheduledAt).toTimeString().split(' ')[0],
        status: 'scheduled',
        updated_at: new Date().toISOString()
      }
      
      if (newDuration !== undefined) {
        updates.duration = newDuration
      }
      
      if (notes !== undefined) {
        updates.notes = notes
      }
      
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error rescheduling interview:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in rescheduleInterview:', error)
      return null
    }
  }
  
  /**
   * Cancel interview
   */
  static async cancelInterview(id: string, reason?: string): Promise<Interview | null> {
    try {
      const updates: InterviewUpdate = {
        status: 'cancelled',
        updated_at: new Date().toISOString()
      }
      
      if (reason) {
        updates.notes = reason
      }
      
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        console.error('Error cancelling interview:', error)
        return null
      }
      
      return data
    } catch (error) {
      console.error('Error in cancelInterview:', error)
      return null
    }
  }
  
  /**
   * Delete interview
   */
  static async deleteInterview(id: string): Promise<boolean> {
    try {
      const { error } = await supabaseAdmin
        .from('interviews')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('Error deleting interview:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error in deleteInterview:', error)
      return false
    }
  }
  
  /**
   * Get interview statistics for employer
   */
  static async getInterviewStats(employerId: string): Promise<{ total: number; scheduled: number; completed: number; cancelled: number; no_show: number }> {
    try {
      // Get interviews through applications
      const { data: interviews, error } = await supabaseAdmin
        .from('interviews')
        .select(`
          status,
          application:applications!inner(
            employer_id
          )
        `)
        .eq('application.employer_id', employerId)
      
      if (error) {
        console.error('Error fetching interview stats:', error)
        return {
          total: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          no_show: 0
        }
      }
      
      const stats = {
        total: interviews.length,
        scheduled: interviews.filter(i => i.status === 'scheduled').length,
        completed: interviews.filter(i => i.status === 'completed').length,
        cancelled: interviews.filter(i => i.status === 'cancelled').length,
        no_show: interviews.filter(i => i.status === 'no_show').length
      }
      
      return stats
    } catch (error) {
      console.error('Error in getInterviewStats:', error)
      return {
        total: 0,
        scheduled: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
      }
    }
  }
  
  /**
   * Get today's interviews for interviewer
   */
  static async getTodaysInterviews(interviewerId: string): Promise<Interview[]> {
    try {
      const today = new Date()
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      
      const { data, error } = await supabaseAdmin
        .from('interviews')
        .select(`
          *,
          application:applications(
            id,
            job:jobs(id, title, company),
            applicant:users!applicant_id(id, name, email, phone)
          )
        `)
        .eq('employer_id', interviewerId)
        .gte('scheduled_date', startOfDay.toISOString().split('T')[0])
        .lte('scheduled_date', endOfDay.toISOString().split('T')[0])
        .order('scheduled_date', { ascending: true })
      
      if (error) {
        console.error('Error fetching today\'s interviews:', error)
        return []
      }
      
      return data || []
    } catch (error) {
      console.error('Error in getTodaysInterviews:', error)
      return []
    }
  }
  
  /**
   * Check for interview conflicts
   */
  static async checkInterviewConflicts(
    interviewerId: string,
    scheduledAt: string,
    durationMinutes: number,
    excludeInterviewId?: string
  ): Promise<boolean> {
    try {
      const startTime = new Date(scheduledAt)
      const endTime = new Date(startTime.getTime() + durationMinutes * 60000)
      
      let query = supabaseAdmin
        .from('interviews')
        .select('id')
        .eq('employer_id', interviewerId)
        .eq('status', 'scheduled')
        .gte('scheduled_date', startTime.toISOString().split('T')[0])
        .lte('scheduled_date', endTime.toISOString().split('T')[0])
      
      if (excludeInterviewId) {
        query = query.neq('id', excludeInterviewId)
      }
      
      const { data, error } = await query
      
      if (error) {
        console.error('Error checking interview conflicts:', error)
        return false
      }
      
      return (data && data.length > 0)
    } catch (error) {
      console.error('Error in checkInterviewConflicts:', error)
      return false
    }
  }
}
import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Server component client
export const createServerSupabaseClient = () => {
  return createServerComponentClient({ cookies })
}

// Client component client
export const createClientSupabaseClient = () => {
  return createClientComponentClient()
}

// Use supabaseAdmin for server-side file operations
export async function uploadCV(file: File, userId: string): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from('cvs')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading CV:', error);
      return null;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('cvs')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('Error in uploadCV:', error);
    return null;
  }
}

// Helper function to delete CV file
export async function deleteCV(filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('cvs')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting CV:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteCV:', error);
    return false;
  }
}

// Helper function to get CV download URL
export async function getCVDownloadUrl(filePath: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('cvs')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
       console.error('Error getting CV download URL:', error);
       return null;
     }
 
     return data.signedUrl;
   } catch (error) {
     console.error('Error getting CV download URL:', error);
     return null;
   }
 }

// Database types for TypeScript support
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          password: string
          email_verified: boolean
          role: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified: boolean
          whatsapp_verified_at?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          password: string
          email_verified?: boolean
          role: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          password?: string
          email_verified?: boolean
          role?: 'pelamar_kerja' | 'pencari_kandidat'
          company?: string
          description?: string
          website?: string
          location?: string
          phone?: string
          whatsapp_number?: string
          whatsapp_verified?: boolean
          whatsapp_verified_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          title: string
          company: string
          description: string
          location?: string
          salary?: string
          employer_id: string
          status: 'active' | 'inactive' | 'closed'
          applications_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          company: string
          description: string
          location?: string
          salary?: string
          employer_id: string
          status?: 'active' | 'inactive' | 'closed'
          applications_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          company?: string
          description?: string
          location?: string
          salary?: string
          employer_id?: string
          status?: 'active' | 'inactive' | 'closed'
          applications_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          job_id: string
          applicant_id: string
          employer_id: string
          status: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_id: string
          employer_id: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_id?: string
          employer_id?: string
          status?: 'pending' | 'reviewed' | 'accepted' | 'rejected'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          job_id: string
          employer_id: string
          applicant_id: string
          scheduled_date?: string
          scheduled_time?: string
          interview_type: 'phone' | 'video' | 'in_person'
          location?: string
          meeting_link?: string
          notes?: string
          duration?: number
          status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
          email_sent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          job_id: string
          employer_id: string
          applicant_id: string
          scheduled_date?: string
          scheduled_time?: string
          interview_type?: 'phone' | 'video' | 'in_person'
          location?: string
          meeting_link?: string
          notes?: string
          duration?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
          email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          job_id?: string
          employer_id?: string
          applicant_id?: string
          scheduled_date?: string
          scheduled_time?: string
          interview_type?: 'phone' | 'video' | 'in_person'
          location?: string
          meeting_link?: string
          notes?: string
          duration?: number
          status?: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show'
          email_sent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types
export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Job = Database['public']['Tables']['jobs']['Row']
export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export type Application = Database['public']['Tables']['applications']['Row']
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert']
export type ApplicationUpdate = Database['public']['Tables']['applications']['Update']

export type Interview = Database['public']['Tables']['interviews']['Row']
export type InterviewInsert = Database['public']['Tables']['interviews']['Insert']
export type InterviewUpdate = Database['public']['Tables']['interviews']['Update']
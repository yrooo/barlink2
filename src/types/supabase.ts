// Supabase Database Types
// This file contains the Database type definition for Supabase

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: 'pelamar_kerja' | 'pencari_kandidat';
          company?: string;
          image?: string;
          phone?: string;
          whatsappNumber?: string;
          whatsappVerified?: boolean;
          whatsappVerifiedAt?: string;
          description?: string;
          website?: string;
          location?: string;
          cvFileName?: string;
          cvUrl?: string;
          cvPath?: string;
          cvUploadedAt?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role: 'pelamar_kerja' | 'pencari_kandidat';
          company?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: 'pelamar_kerja' | 'pencari_kandidat';
          company?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          bio?: string;
          phone?: string;
          address?: string;
          website?: string;
          description?: string;
          location?: string;
          cv_url?: string;
          cv_path?: string;
          cv_file_name?: string;
          cv_uploaded_at?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string;
          phone?: string;
          address?: string;
          website?: string;
          description?: string;
          location?: string;
          cv_url?: string;
          cv_path?: string;
          cv_file_name?: string;
          cv_uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          phone?: string;
          address?: string;
          website?: string;
          description?: string;
          location?: string;
          cv_url?: string;
          cv_path?: string;
          cv_file_name?: string;
          cv_uploaded_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
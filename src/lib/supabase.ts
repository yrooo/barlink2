import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
    console.error('Error in getCVDownloadUrl:', error);
    return null;
  }
}
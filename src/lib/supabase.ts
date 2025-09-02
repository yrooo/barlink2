import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name for CVs
export const CV_BUCKET_NAME = 'cvs';

// Helper function to upload CV file
export async function uploadCV(file: File, userId: string): Promise<{ url: string; path: string } | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    const { error } = await supabase.storage
      .from(CV_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error uploading CV:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(CV_BUCKET_NAME)
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
      .from(CV_BUCKET_NAME)
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
      .from(CV_BUCKET_NAME)
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
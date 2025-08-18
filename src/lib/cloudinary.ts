// This file contains server-side only Cloudinary functions
// Client-safe functions are in cloudinary-client.ts

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper function to upload CV files
export const uploadCV = async (file: Buffer, fileName: string, userId: string) => {
  try {
    const result = await cloudinary.uploader.upload(
      `data:application/pdf;base64,${file.toString('base64')}`,
      {
        folder: 'barlink/cvs',
        public_id: `cv_${userId}_${Date.now()}`,
        resource_type: 'raw',
        format: 'pdf',
        original_filename: fileName,
        tags: ['cv', 'barlink', userId],
      }
    );
    return result;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload CV to Cloudinary');
  }
};

// Helper function to delete CV files
export const deleteCV = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw'
    });
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete CV from Cloudinary');
  }
};

// Helper function to get CV URL for download (server-side only)
export const getCVUrl = (publicId: string) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    flags: 'attachment',
    format: 'pdf'
  });
};

// Helper function to get viewable CV URL (server-side only)
export const getViewableCVUrl = (publicId: string) => {
  // Use Cloudinary's URL generation with proper transformations for untrusted accounts
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
    format: 'pdf',
    flags: 'immutable_cache'
  });
};
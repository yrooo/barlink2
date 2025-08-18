// Client-safe Cloudinary functions that can be used in browser components
import { getCldImageUrl } from 'next-cloudinary';

// Helper function to get CV preview URL using Next Cloudinary (for thumbnails)
// This is client-safe as it only uses next-cloudinary which works in the browser
export const getCVPreviewUrl = (publicId: string) => {
  try {
    // Generate a preview image of the first page of the PDF
    return getCldImageUrl({
      src: publicId,
      width: 400,
      height: 600,
      crop: 'fill',
      format: 'jpg',
      quality: 'auto'
    });
  } catch (error) {
    console.error('Error generating CV preview URL:', error);
    return null;
  }
};

// Helper function to get viewable CV URL (client-safe version)
export const getViewableCVUrl = (publicId: string) => {
  try {
    // Use next-cloudinary's URL generation for proper handling of untrusted accounts
    return getCldImageUrl({
      src: publicId,
      format: 'pdf',
      flags: 'immutable_cache',
      deliveryType: 'upload',
      resourceType: 'raw'
    });
  } catch (error) {
    console.error('Error generating viewable CV URL:', error);
    // Fallback to basic URL if next-cloudinary fails
    return `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload/${publicId}.pdf`;
  }
};
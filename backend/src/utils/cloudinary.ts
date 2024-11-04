import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';
import { logger } from './logger';

// Configure cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

/**
 * Uploads a file to Cloudinary
 * @param filePath - Path to the file to upload
 * @returns Promise<UploadApiResponse>
 */
export const uploadToCloudinary = async (filePath: string): Promise<UploadApiResponse> => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'profile-pictures',
      transformation: [
        { width: 500, height: 500, crop: 'fill' },
        { quality: 'auto' },
      ],
    });
    return result;
  } catch (error) {
    logger.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Removes a file from Cloudinary
 * @param publicId - Public ID of the file to remove
 */
export const removeFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    logger.error('Error removing from Cloudinary:', error);
    throw new Error('Failed to remove file');
  }
}; 
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload a single image to Cloudinary
 */
export async function uploadImageToCloudinary(
  file: File | Buffer,
  folder: string = 'civic-pulse-issues'
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      // Optimize for civic issue photos
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max dimensions
        { quality: 'auto' }, // Auto quality optimization
        { fetch_format: 'auto' }, // Auto format (WebP, etc.)
      ],
      // Add metadata
      context: {
        alt: 'Civic issue photo',
        caption: 'Uploaded by citizen via Civic Pulse app',
      },
      // Resource type
      resource_type: 'auto' as const,
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Failed to upload image: ${error.message}`));
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error('Upload failed: No result returned'));
        }
      }
    );

    // Handle different input types
    if (file instanceof File) {
      // Convert File to buffer
      file.arrayBuffer().then(arrayBuffer => {
        const buffer = Buffer.from(arrayBuffer);
        uploadStream.end(buffer);
      }).catch(reject);
    } else if (Buffer.isBuffer(file)) {
      uploadStream.end(file);
    } else {
      reject(new Error('Invalid file type. Expected File or Buffer.'));
    }
  });
}

/**
 * Upload multiple images to Cloudinary
 */
export async function uploadMultipleImagesToCloudinary(
  files: (File | Buffer)[],
  folder: string = 'civic-pulse-issues'
): Promise<CloudinaryUploadResult[]> {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file, folder));
  return Promise.all(uploadPromises);
}

/**
 * Delete an image from Cloudinary
 */
export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        reject(new Error(`Failed to delete image: ${error.message}`));
      } else {
        console.log('Cloudinary delete result:', result);
        resolve();
      }
    });
  });
}

/**
 * Get optimized image URL with transformations
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string | number;
    format?: string;
  } = {}
): string {
  const { width = 800, height = 600, quality = 'auto', format = 'auto' } = options;

  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'auto',
    quality,
    fetch_format: format,
    secure: true,
  });
}

/**
 * Generate thumbnail URL
 */
export function getThumbnailUrl(publicId: string, size: number = 150): string {
  return cloudinary.url(publicId, {
    width: size,
    height: size,
    crop: 'thumb',
    gravity: 'face', // Focus on faces if present
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  });
}

/**
 * Validate Cloudinary configuration
 */
export function validateCloudinaryConfig(): boolean {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.warn('Cloudinary configuration incomplete. Missing:', missing);
    return false;
  }

  return true;
}

/**
 * Get upload preset for different use cases
 */
export function getUploadPreset(useCase: 'issue-photo' | 'profile-photo' | 'general'): object {
  const presets = {
    'issue-photo': {
      folder: 'civic-pulse/issues',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
      max_file_size: 10 * 1024 * 1024, // 10MB
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
      ],
    },
    'profile-photo': {
      folder: 'civic-pulse/profiles',
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
      max_file_size: 5 * 1024 * 1024, // 5MB
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good' },
      ],
    },
    'general': {
      folder: 'civic-pulse/general',
      allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'pdf'],
      max_file_size: 25 * 1024 * 1024, // 25MB
    },
  };

  return presets[useCase] || presets.general;
}

export default cloudinary;

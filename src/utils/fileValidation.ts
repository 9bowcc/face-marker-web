/**
 * File validation utilities for image and video uploads
 */

import { SUPPORTED_IMAGE_TYPES, SUPPORTED_VIDEO_TYPES } from '../constants';

// File size limits in bytes
export const MAX_IMAGE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB

// Supported file types (as mutable arrays for use in file validation)
export const VALID_IMAGE_TYPES = [...SUPPORTED_IMAGE_TYPES] as string[];
export const VALID_VIDEO_TYPES = [...SUPPORTED_VIDEO_TYPES] as string[];

export type FileCategory = 'image' | 'video' | 'unknown';

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
  category?: FileCategory;
}

/**
 * Get the category of a file (image, video, or unknown)
 */
export const getFileTypeCategory = (file: File): FileCategory => {
  if (VALID_IMAGE_TYPES.includes(file.type)) {
    return 'image';
  }
  if (VALID_VIDEO_TYPES.includes(file.type)) {
    return 'video';
  }
  return 'unknown';
};

/**
 * Validate if the file type is supported
 */
export const validateFileType = (file: File): FileValidationResult => {
  const category = getFileTypeCategory(file);

  if (category === 'unknown') {
    return {
      isValid: false,
      error: `Unsupported file type: ${file.type}. Please upload a JPEG, PNG, WebP image or MP4, WebM, MOV video.`,
      category,
    };
  }

  return {
    isValid: true,
    category,
  };
};

/**
 * Validate if the file size is within limits
 */
export const validateFileSize = (file: File): FileValidationResult => {
  const category = getFileTypeCategory(file);
  const maxSize = category === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size (${formatFileSize(file.size)}) exceeds the maximum allowed size of ${formatFileSize(maxSize)} for ${category}s.`,
      category,
    };
  }

  return {
    isValid: true,
    category,
  };
};

/**
 * Validate both file type and size
 */
export const validateFile = (file: File): FileValidationResult => {
  // First check file type
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Then check file size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return {
    isValid: true,
    category: typeValidation.category,
  };
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// lib/utils/image-upload.ts

/**
 * Handles image uploads for forms, including validation and preparation for Cloudinary
 */
export interface ImageUploadOptions {
    maxImages?: number;
    allowedTypes?: string[];
  }
  
  export interface ImageUploadResult {
    isValid: boolean;
    errorMessage?: string;
    formData?: FormData;
    files: File[];
  }
  
  /**
   * Processes image files for upload, with validation
   */
  export function handleImageUpload(
    files: File[] | FileList, 
    existingImages: string[] = [],
    options: ImageUploadOptions = {}
  ): ImageUploadResult {
    const { maxImages = 5 } = options;
    
    // Convert FileList to array if needed
    const fileArray = Array.from(files);
    
    // Validate total images (new + existing)
    if (fileArray.length + existingImages.length > maxImages) {
      return {
        isValid: false,
        errorMessage: `Maximum ${maxImages} images allowed`,
        files: []
      };
    }
    
    // Validate file types if needed
    // Add more validation as needed
    
    return {
      isValid: true,
      files: fileArray
    };
  }
  
  /**
   * Prepares images for submission to an API, can be used with Cloudinary or any storage service
   */
  export function prepareImagesForSubmission(
    formData: FormData,
    files: File[],
    existingImages: string[] = []
  ): FormData {
    // Add new image files to form data
    files.forEach((file) => {
      formData.append("images", file);
    });
    
    // Add existing image URLs if needed
    if (existingImages.length > 0) {
      formData.append("existingImages", JSON.stringify(existingImages));
    }
    
    return formData;
  }
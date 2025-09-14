import api from './api';

// 上传服务 - 用于上传文件到Cloudflare R2
export interface UploadResponse {
  success: boolean;
  url?: string;
  error?: string;
}

const upload = (formData: FormData): Promise<UploadResponse> => {
  return api.post('/upload', formData);
};

export class UploadService {
  /**
   * 上传文件到Cloudflare R2
   * @param file 要上传的文件
   * @returns Promise<UploadResponse>
   */
  static async uploadFile(file: File): Promise<UploadResponse> {
    try {
      // Validate file type
      if (!this.isValidFileType(file)) {
        return {
          success: false,
          error:
            'Unsupported file type. Only JPG, JPEG, PNG formats are supported',
        };
      }

      // Validate file size (2MB)
      if (file.size > 2 * 1024 * 1024) {
        return {
          success: false,
          error: 'File size cannot exceed 2MB',
        };
      }

      // Generate unique file name
      const fileName = this.generateFileName(file);

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);

      // Send upload request
      const result = await upload(formData);

      if (result.success) {
        // Return custom domain URL
        return {
          success: true,
          url: result.url,
        };
      } else {
        return {
          success: false,
          error: result.error || 'Upload failed',
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Validate file type
   */
  private static isValidFileType(file: File): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(file.type);
  }

  /**
   * Generate unique file name
   */
  private static generateFileName(file: File): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `spd-image-${timestamp}-${random}.${extension}`;
  }
}

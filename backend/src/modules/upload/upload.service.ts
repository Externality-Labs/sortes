import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export interface UploadResult {
  url: string;
  fileName: string;
}

@Injectable()
export class UploadService {
  private readonly s3Client: S3Client;
  private readonly bucketName = 'sortes';
  private readonly customDomain = process.env.CLOUDFLARE_R2_CUSTOM_DOMAIN;

  constructor() {
    this.s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      },
    });
  }

  async uploadToR2(file: Express.Multer.File, fileName: string): Promise<UploadResult> {
    // Validate file type
    if (!this.isValidFileType(file.mimetype)) {
      throw new BadRequestException('Unsupported file type, only JPG, JPEG, PNG formats are allowed');
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new BadRequestException('File size cannot exceed 2MB');
    }

    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await this.s3Client.send(command);

      return {
        url: `${this.customDomain}/${fileName}`,
        fileName,
      };
    } catch (error) {
      console.error('Failed to upload to R2:', error);
      throw new BadRequestException('File upload failed');
    }
  }

  private isValidFileType(mimetype: string): boolean {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    return allowedTypes.includes(mimetype);
  }
}

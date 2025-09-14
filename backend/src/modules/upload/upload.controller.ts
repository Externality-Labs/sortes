import { Controller, Post, UseInterceptors, UploadedFile, Body, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Public } from '../../common/guards/jwt.auth.guard';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Public()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('fileName') fileName: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      const result = await this.uploadService.uploadToR2(file, fileName);
      return {
        success: true,
        url: result.url,
        fileName: result.fileName,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

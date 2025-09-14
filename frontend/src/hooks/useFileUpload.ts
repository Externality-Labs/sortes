import { useState, useCallback } from 'react';
import { UploadService, UploadResponse } from '../services/upload';

export interface UploadState {
  isUploading: boolean;
  uploadedUrl: string | null;
  error: string | null;
  previewUrl: string | null;
  showCropper: boolean;
  originalFile: File | null;
  imageInfo: {
    width: number;
    height: number;
    needsCropping: boolean;
  } | null;
}

export const useFileUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadedUrl: null,
    error: null,
    previewUrl: null,
    showCropper: false,
    originalFile: null,
    imageInfo: null,
  });

  // Helper function to get image dimensions
  const getImageDimensions = useCallback(
    (file: File): Promise<{ width: number; height: number }> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.width, height: img.height });
        };
        img.src = URL.createObjectURL(file);
      });
    },
    []
  );

  // Helper function to determine if cropping is needed
  const shouldCropImage = useCallback(
    (width: number, height: number): boolean => {
      const IDEAL_SIZE = 650;

      // Perfect size - no cropping needed
      if (width === IDEAL_SIZE && height === IDEAL_SIZE) {
        return false;
      }

      // Always show cropper for non-ideal sizes to let user adjust
      return true;
    },
    []
  );

  const selectFile = useCallback(
    async (file: File) => {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      try {
        // Get image dimensions
        const { width, height } = await getImageDimensions(file);
        const needsCropping = shouldCropImage(width, height);

        setUploadState((prev) => ({
          ...prev,
          previewUrl,
          originalFile: file,
          showCropper: needsCropping,
          imageInfo: {
            width,
            height,
            needsCropping,
          },
          error: null,
        }));

        // If no cropping needed, auto-upload the original file
        if (!needsCropping) {
          // Upload directly without cropping
          setUploadState((prev) => ({
            ...prev,
            isUploading: true,
            showCropper: false,
            error: null,
          }));

          try {
            // Upload the original file
            const result: UploadResponse = await UploadService.uploadFile(file);

            if (result.success && result.url) {
              setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                uploadedUrl: result.url!,
                error: null,
              }));
            } else {
              setUploadState((prev) => ({
                ...prev,
                isUploading: false,
                error: result.error || 'Upload failed',
              }));
            }
          } catch (uploadError) {
            setUploadState((prev) => ({
              ...prev,
              isUploading: false,
              error:
                uploadError instanceof Error
                  ? uploadError.message
                  : 'Upload failed',
            }));
          }
        }
      } catch (error) {
        setUploadState((prev) => ({
          ...prev,
          previewUrl,
          originalFile: file,
          showCropper: true, // Show cropper as fallback
          imageInfo: null,
          error: 'Failed to analyze image dimensions',
        }));
      }
    },
    [getImageDimensions, shouldCropImage]
  );

  const uploadCroppedFile = useCallback(async (croppedBlob: Blob) => {
    setUploadState((prev) => ({
      ...prev,
      isUploading: true,
      showCropper: false,
      error: null,
    }));

    try {
      // Convert blob to file
      const croppedFile = new File([croppedBlob], 'cropped-image.jpg', {
        type: 'image/jpeg',
      });

      // Upload cropped file
      const result: UploadResponse =
        await UploadService.uploadFile(croppedFile);

      if (result.success && result.url) {
        // Create preview URL for cropped image
        const croppedPreviewUrl = URL.createObjectURL(croppedBlob);
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          uploadedUrl: result.url!,
          previewUrl: croppedPreviewUrl,
          error: null,
        }));
      } else {
        setUploadState((prev) => ({
          ...prev,
          isUploading: false,
          error: result.error || 'Upload failed',
        }));
      }
    } catch (error) {
      setUploadState((prev) => ({
        ...prev,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      }));
    }
  }, []);

  const cancelCrop = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      showCropper: false,
      previewUrl: null,
      originalFile: null,
    }));
  }, []);

  const resetUpload = useCallback(() => {
    setUploadState({
      isUploading: false,
      uploadedUrl: null,
      error: null,
      previewUrl: null,
      showCropper: false,
      originalFile: null,
      imageInfo: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    uploadState,
    selectFile,
    uploadCroppedFile,
    cancelCrop,
    resetUpload,
    clearError,
  };
};

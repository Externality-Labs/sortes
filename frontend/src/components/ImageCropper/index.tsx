import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  Crop,
  PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  src: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
  onCancel: () => void;
  isVisible: boolean;
  imageInfo?: {
    width: number;
    height: number;
    needsCropping: boolean;
  } | null;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  src,
  onCropComplete,
  onCancel,
  isVisible,
  imageInfo,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      const originalWidth = imageInfo?.width || width;
      const originalHeight = imageInfo?.height || height;
      const IDEAL_SIZE = 650;

      let crop: Crop;

      if (originalWidth > IDEAL_SIZE || originalHeight > IDEAL_SIZE) {
        // Large image: auto-scale and crop center area to fill preview frame
        const cropSize = Math.min(width, height);
        const cropPercentage = (cropSize / Math.max(width, height)) * 100;

        crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: cropPercentage,
            },
            1, // 1:1 aspect ratio
            width,
            height
          ),
          width,
          height
        );
      } else if (originalWidth < IDEAL_SIZE && originalHeight < IDEAL_SIZE) {
        // Small image: center display with original ratio, no stretching/padding
        const smallerDimension = Math.min(width, height);
        const cropPercentage =
          (smallerDimension / Math.max(width, height)) * 90; // 90% to leave some margin

        crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: cropPercentage,
            },
            1, // 1:1 aspect ratio
            width,
            height
          ),
          width,
          height
        );
      } else {
        // Non-square image: auto-scale to fill preview frame, preserve aspect ratio
        const minDimension = Math.min(width, height);
        const cropPercentage = (minDimension / Math.max(width, height)) * 100;

        crop = centerCrop(
          makeAspectCrop(
            {
              unit: '%',
              width: cropPercentage,
            },
            1, // 1:1 aspect ratio
            width,
            height
          ),
          width,
          height
        );
      }

      setCrop(crop);
    },
    [imageInfo]
  );

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Always output 650x650 regardless of input size
      const OUTPUT_SIZE = 650;
      canvas.width = OUTPUT_SIZE;
      canvas.height = OUTPUT_SIZE;

      // Draw the cropped image and scale to 650x650
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE
      );

      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            }
          },
          'image/jpeg',
          0.95
        );
      });
    },
    []
  );

  const handleCropConfirm = useCallback(async () => {
    if (!completedCrop || !imgRef.current) {
      return;
    }

    setIsProcessing(true);
    try {
      const croppedImageBlob = await getCroppedImg(
        imgRef.current,
        completedCrop
      );
      onCropComplete(croppedImageBlob);
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [completedCrop, getCroppedImg, onCropComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-neutral-800">Crop Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          {imageInfo ? (
            <div>
              <div>
                Original size: {imageInfo.width} × {imageInfo.height} px
              </div>
              <div className="mt-1">
                {imageInfo.width === 650 && imageInfo.height === 650
                  ? '✓ Perfect size - will be used as-is'
                  : imageInfo.width > 650 || imageInfo.height > 650
                    ? '📐 Large image - crop to select the best area'
                    : imageInfo.width < 650 && imageInfo.height < 650
                      ? '🔍 Small image - will be centered and scaled up'
                      : '📏 Non-square image - crop to make it square'}
              </div>
              <div className="mt-1 text-xs">Final output: 650 × 650 px</div>
            </div>
          ) : (
            'Please adjust the crop area to ensure a 1:1 aspect ratio (square)'
          )}
        </div>

        <div className="mb-6 flex justify-center">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={1} // 1:1 aspect ratio
            minWidth={100}
            minHeight={100}
            className="max-h-[60vh] max-w-full"
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={src}
              onLoad={onImageLoad}
              className="max-h-[60vh] max-w-full"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCropConfirm}
            disabled={!completedCrop || isProcessing}
            className={`rounded-lg px-4 py-2 text-white ${
              !completedCrop || isProcessing
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Confirm Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;

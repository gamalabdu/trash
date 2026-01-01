'use client';

import React, { useState } from 'react';
import './image-crop-modal.scss';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { ImageCrop, ImageCropContent, ImageCropApply, ImageCropReset } from './shadcn-io/image-crop/index';
import { CropIcon } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, cropData?: { x: number; y: number; width: number; height: number }) => void;
}

// Aspect ratio options for cropping
const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4/3 },
  { label: '3:2', value: 3/2 },
  { label: '16:9', value: 16/9 },
  { label: '2:1', value: 2 },
];

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [cropData, setCropData] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<number>(1); // Default to 1:1

  const handleCrop = async (croppedImageUrl: string) => {
    console.log('Image crop modal - crop completed with URL:', croppedImageUrl);
    console.log('Crop data:', cropData);
    setIsProcessing(true);
    try {
      onCropComplete(croppedImageUrl, cropData || undefined);
      onClose();
    } catch (error) {
      console.error('Error processing cropped image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCropComplete = (pixelCrop: any, percentCrop: any) => {
    console.log('Crop completed:', pixelCrop, percentCrop);
    // Store the percent crop data (0-1 range)
    setCropData({
      x: percentCrop.x / 100,
      y: percentCrop.y / 100,
      width: percentCrop.width / 100,
      height: percentCrop.height / 100
    });
  };

  if (!imageFile) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="image-crop-modal max-w-5xl max-h-[95vh] overflow-hidden p-0">
        <DialogHeader className="modal-header px-6 py-4 bg-gray-50 dark:bg-gray-800 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            <CropIcon className="h-5 w-5 text-red-500" />
            Crop Image
          </DialogTitle>
        </DialogHeader>
        
        <ImageCrop
          key={`crop-${selectedAspectRatio}`} // Force re-render when aspect ratio changes
          file={imageFile}
          maxImageSize={5 * 1024 * 1024} // 5MB max
          onCrop={handleCrop}
          aspect={selectedAspectRatio}
          className="max-h-[500px]"
          onComplete={handleCropComplete}
        >
          <div className="flex flex-col h-full">
            {/* Instructions */}
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Crop Your Image
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag the corners to crop your image to the desired size and composition
                </p>
              </div>
            </div>

            {/* Aspect Ratio Selection */}
            <div className="px-6 py-4 border-b bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                  Choose Aspect Ratio
                </h4>
                <div className="aspect-ratio-buttons flex flex-wrap justify-center gap-2">
                  {ASPECT_RATIOS.map((ratio) => (
                    <Button
                      key={ratio.label}
                      variant={selectedAspectRatio === ratio.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedAspectRatio(ratio.value)}
                      className={`text-xs ${
                        selectedAspectRatio === ratio.value 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {ratio.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Crop Area */}
            <div className="crop-area flex-1 overflow-auto p-6">
              <div className="flex justify-center items-center min-h-[400px]">
                <ImageCropContent className="max-h-[500px] max-w-full" />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="modal-footer px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t">
              <div className="action-buttons flex items-center justify-between">
                <ImageCropReset>
                  <Button variant="outline" size="sm" className="text-gray-600 dark:text-gray-400">
                    Reset Crop
                  </Button>
                </ImageCropReset>
                
                <div className="flex items-center gap-3">
                  <Button 
                    variant="outline" 
                    onClick={onClose} 
                    disabled={isProcessing}
                    size="sm"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </Button>
                  <ImageCropApply>
                    <Button 
                      disabled={isProcessing}
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      {isProcessing ? 'Processing...' : 'Apply Crop'}
                    </Button>
                  </ImageCropApply>
                </div>
              </div>
            </div>
          </div>
        </ImageCrop>
      </DialogContent>
    </Dialog>
  );
};

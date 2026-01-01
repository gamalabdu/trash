'use client';

import React, { useState, useRef, useEffect } from 'react';
import './image-crop-modal.scss';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { CropIcon } from 'lucide-react';

interface HeroImagePositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageFile: File | null;
  onCropComplete: (croppedImageUrl: string, cropData?: { x: number; y: number; width: number; height: number }) => void;
}

export const HeroImagePositionModal: React.FC<HeroImagePositionModalProps> = ({
  isOpen,
  onClose,
  imageFile,
  onCropComplete,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 }); // Default center position
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImageSrc(e.target?.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    e.preventDefault();
    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    // Calculate the movement
    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;
    
    // Convert pixel movement to percentage of the container
    const deltaXPercent = deltaX / rect.width;
    const deltaYPercent = deltaY / rect.height;
    
    // Update position (clamp between 0 and 1)
    const newX = Math.max(0, Math.min(1, position.x + deltaXPercent));
    const newY = Math.max(0, Math.min(1, position.y + deltaYPercent));
    
    console.log('Position update:', { newX, newY, deltaX, deltaY, deltaXPercent, deltaYPercent });
    setPosition({ x: newX, y: newY });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleApply = () => {
    setIsProcessing(true);
    try {
      // Pass the position directly as focus point
      const cropData = {
        x: position.x,
        y: position.y,
        width: 1, // Full width
        height: 1 // Full height
      };
      
      console.log('Applying position:', { position, cropData });
      onCropComplete('', cropData);
      onClose();
    } catch (error) {
      console.error('Error applying position:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setPosition({ x: 0.5, y: 0.5 });
  };

  if (!imageFile || !imageSrc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-100">
            <CropIcon className="h-5 w-5 text-red-500" />
            Position Hero Image
          </DialogTitle>
          <p className="text-sm text-gray-400 mt-2">
            Click and drag the image to position it within the 16:9 container. The image will not be cropped.
          </p>
        </DialogHeader>
        
        {/* Image Container */}
        <div 
          ref={containerRef}
          className="flex justify-center items-center mb-6"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="relative aspect-[16/9] w-full max-w-3xl overflow-hidden rounded-lg border-2 border-gray-600">
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Hero image positioning"
              className="w-full h-full object-cover cursor-move"
              style={{
                objectPosition: `${position.x * 100}% ${position.y * 100}%`,
                transform: 'scale(1.2)' // Slightly larger to allow positioning
              }}
              onMouseDown={handleMouseDown}
            />
            
            {/* Position indicator */}
            <div 
              className="absolute w-4 h-4 border-2 border-red-500 bg-red-500/20 rounded-full pointer-events-none"
              style={{
                left: `${position.x * 100}%`,
                top: `${position.y * 100}%`,
                transform: 'translate(-50%, -50%)'
              }}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleReset}
            className="text-gray-400 border-gray-600 hover:bg-gray-700"
          >
            Reset Position
          </Button>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isProcessing}
              size="sm"
              className="text-gray-400 border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleApply}
              disabled={isProcessing}
              size="sm"
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isProcessing ? 'Processing...' : 'Apply Position'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

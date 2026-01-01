'use client';

import React, { useState } from 'react';
import './image-node.scss';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Button } from '../../../../../button';
import { CropIcon, DownloadIcon, GripVerticalIcon } from 'lucide-react';
import { ImageCropModal } from '../../../../../image-crop-modal';

export const ImageNode: React.FC<NodeViewProps> = ({ node, selected, updateAttributes, editor }) => {
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSizeLocked, setIsSizeLocked] = useState(false);
  const [lockedImageRef, setLockedImageRef] = useState<HTMLImageElement | null>(null);

  const { src, alt, title, width, height } = node.attrs;

  // Function to find nearby images and check for size matching
  const findNearbyImages = (currentImg: HTMLImageElement) => {
    const editorElement = editor?.view.dom;
    if (!editorElement) return [];

    const allImages = editorElement.querySelectorAll('img.image-resizable');
    console.log('Found', allImages.length, 'images with image-resizable class'); // Debug log
    
    const nearbyImages: HTMLImageElement[] = [];

    allImages.forEach((img) => {
      if (img === currentImg) return;

      const imgRect = img.getBoundingClientRect();
      const currentRect = currentImg.getBoundingClientRect();

      // Check if images are close to each other (within 700px)
      const distance = Math.sqrt(
        Math.pow(imgRect.left - currentRect.left, 2) + 
        Math.pow(imgRect.top - currentRect.top, 2)
      );

      console.log('Distance to image:', distance); // Debug log

      if (distance < 700) {
        nearbyImages.push(img as HTMLImageElement);
      }
    });

    console.log('Found', nearbyImages.length, 'nearby images'); // Debug log
    return nearbyImages;
  };

  // Function to check if current image size matches any nearby image
  const checkSizeMatch = (currentImg: HTMLImageElement, targetWidth: number, targetHeight: number, tolerance: number = 5) => {
    const nearbyImages = findNearbyImages(currentImg);
    
    for (const nearbyImg of nearbyImages) {
      const nearbyRect = nearbyImg.getBoundingClientRect();
      const widthDiff = Math.abs(nearbyRect.width - targetWidth);
      const heightDiff = Math.abs(nearbyRect.height - targetHeight);
      
      if (widthDiff <= tolerance && heightDiff <= tolerance) {
        return { matched: true, image: nearbyImg };
      }
    }
    
    return { matched: false, image: null };
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Don't prevent default - let the browser handle the drag
    e.stopPropagation();
    setIsDragging(true);
    
    // Store the current node position for reference
    const pos = editor?.view.posAtDOM(e.currentTarget, 0);
    console.log('Image drag start, pos:', pos); // Debug log
    
    if (pos !== null) {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'image',
        pos: pos,
        node: node.toJSON()
      }));
    }
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleCropClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      // Fetch the image and convert to File
      const response = await fetch(src);
      const blob = await response.blob();
      const file = new File([blob], 'image.png', { type: blob.type });
      setOriginalImageFile(file);
      setIsCropModalOpen(true);
    } catch (error) {
      console.error('Error loading image for cropping:', error);
    }
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    // Update the image source with the cropped version
    updateAttributes({ src: croppedImageUrl });
    setIsCropModalOpen(false);
    setOriginalImageFile(null);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Resize started for direction:', direction); // Debug log
    
    const img = e.currentTarget.closest('.image-controls-container')?.querySelector('img') as HTMLImageElement;
    if (!img) {
      console.log('No image found for resize'); // Debug log
      return;
    }

    console.log('Image found, starting resize'); // Debug log

    // Wait for image to load to get accurate dimensions
    const getImageDimensions = () => {
      const rect = img.getBoundingClientRect();
      // Use current width/height attributes if available, otherwise use displayed dimensions
      const currentWidth = width ? parseFloat(width.replace('px', '')) : rect.width;
      const currentHeight = height ? parseFloat(height.replace('px', '')) : rect.height;
      const naturalWidth = img.naturalWidth || rect.width;
      const naturalHeight = img.naturalHeight || rect.height;
      const aspectRatio = naturalWidth / naturalHeight;
      
      return {
        x: e.clientX,
        y: e.clientY,
        width: currentWidth,
        height: currentHeight,
        aspectRatio: aspectRatio
      };
    };

    const startData = getImageDimensions();

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startData.x;
      const deltaY = moveEvent.clientY - startData.y;
      
      let newWidth = startData.width;
      let newHeight = startData.height;

      // Calculate new dimensions based on direction
      if (direction.includes('e')) newWidth += deltaX;
      if (direction.includes('w')) newWidth -= deltaX;
      if (direction.includes('s')) newHeight += deltaY;
      if (direction.includes('n')) newHeight -= deltaY;

      // Maintain aspect ratio
      if (direction.includes('e') || direction.includes('w')) {
        // If resizing horizontally, adjust height to maintain aspect ratio
        newHeight = newWidth / startData.aspectRatio;
      } else if (direction.includes('s') || direction.includes('n')) {
        // If resizing vertically, adjust width to maintain aspect ratio
        newWidth = newHeight * startData.aspectRatio;
      } else if (direction.includes('nw') || direction.includes('ne') || direction.includes('sw') || direction.includes('se')) {
        // For corner resizing, use the larger change to maintain aspect ratio
        const widthChange = Math.abs(deltaX);
        const heightChange = Math.abs(deltaY);
        
        if (widthChange > heightChange) {
          // Width change is larger, adjust height
          newHeight = newWidth / startData.aspectRatio;
        } else {
          // Height change is larger, adjust width
          newWidth = newHeight * startData.aspectRatio;
        }
      }

      // Apply minimum and maximum constraints
      newWidth = Math.max(50, Math.min(1200, newWidth));
      newHeight = Math.max(50, Math.min(1200, newHeight));

      // Check for size matching with nearby images
      const sizeMatch = checkSizeMatch(img, newWidth, newHeight, 20);
      
      if (sizeMatch.matched && sizeMatch.image) {
        console.log('Size match found! Snapping to:', sizeMatch.image); // Debug log
        // Snap to the exact size of the matched image
        const matchedRect = sizeMatch.image.getBoundingClientRect();
        newWidth = matchedRect.width;
        newHeight = matchedRect.height;
        
        // Update state for visual feedback
        setIsSizeLocked(true);
        setLockedImageRef(sizeMatch.image);
        
        // Add visual feedback to the matched image
        sizeMatch.image.style.outline = '2px solid #10b981';
        sizeMatch.image.style.outlineOffset = '2px';
      } else {
        // Clear size lock state
        setIsSizeLocked(false);
        setLockedImageRef(null);
        
        // Remove visual feedback from all nearby images
        const nearbyImages = findNearbyImages(img);
        nearbyImages.forEach(nearbyImg => {
          nearbyImg.style.outline = '';
          nearbyImg.style.outlineOffset = '';
        });
      }

      // Update image attributes instead of direct DOM manipulation
      updateAttributes({
        width: `${newWidth}px`,
        height: `${newHeight}px`,
      });
    };

    const handleMouseUp = () => {
      // Clean up visual feedback
      setIsSizeLocked(false);
      setLockedImageRef(null);
      
      // Remove visual feedback from all nearby images
      const nearbyImages = findNearbyImages(img);
      nearbyImages.forEach(nearbyImg => {
        nearbyImg.style.outline = '';
        nearbyImg.style.outlineOffset = '';
      });
      
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <NodeViewWrapper
        className={`image-node ${selected ? 'selected' : ''}`}
        contentEditable={false}
      >
        <div 
          className="image-controls-container"
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
                <img
                key={`image-${src.slice(-20)}`}
                src={src}
                alt={alt}
                title={title}
                width={width}
                height={height}
                className={`rounded-lg image-resizable ${isSizeLocked ? 'size-locked' : ''}`}
                style={{ 
                  maxWidth: width ? 'none' : '100%', // Remove max-width constraint if width is set
                  maxHeight: height ? 'none' : 'none', // Remove max-height constraint if height is set
                  display: 'inline-block' // Changed to inline-block for side-by-side layout
                }}
              />
          
          {/* Image controls overlay */}
          {selected && (
            <>
              <div className="image-controls">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleCropClick}
                  className="h-8 w-8 p-0"
                  title="Crop image"
                >
                  <CropIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={handleDownload}
                  className="h-8 w-8 p-0"
                  title="Download image"
                >
                  <DownloadIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Resize handles */}
              <div className="image-resize-handles">
                <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
                <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
                <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
                <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
                <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
                <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
                <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
                <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
              </div>
            </>
          )}
        </div>
      </NodeViewWrapper>

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false);
          setOriginalImageFile(null);
        }}
        imageFile={originalImageFile}
        onCropComplete={handleCropComplete}
      />
    </>
  );
};

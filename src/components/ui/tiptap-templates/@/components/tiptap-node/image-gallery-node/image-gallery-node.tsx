import React, { useState } from 'react'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react'
import { Button } from '../../tiptap-ui-primitive/button/button'
import { ImageGalleryNodeProps } from './image-gallery-node-types'
import { CropIcon, DownloadIcon, GripVerticalIcon } from 'lucide-react'
import { ImageCropModal } from '../../../../../image-crop-modal'

export function ImageGalleryNode(props: ImageGalleryNodeProps) {
  const { node, updateAttributes, deleteNode, editor } = props
  const attrs = node.attrs as { images: string[]; layout: 'horizontal' | 'vertical' | 'grid' }
  const [images, setImages] = useState<string[]>(attrs.images || [])
  const [layout, setLayout] = useState<'horizontal' | 'vertical' | 'grid'>(attrs.layout || 'horizontal')
  const [isCropModalOpen, setIsCropModalOpen] = useState(false)
  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null)
  const [croppingImageIndex, setCroppingImageIndex] = useState<number | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isSizeLocked, setIsSizeLocked] = useState<boolean[]>([])
  const [lockedImageRefs, setLockedImageRefs] = useState<(HTMLImageElement | null)[]>([])

  // Function to find nearby images and check for size matching
  const findNearbyImages = (currentImg: HTMLImageElement) => {
    const editorElement = editor?.view.dom
    if (!editorElement) return []

    const allImages = editorElement.querySelectorAll('img')
    const nearbyImages: HTMLImageElement[] = []

    allImages.forEach((img) => {
      if (img === currentImg) return

      const imgRect = img.getBoundingClientRect()
      const currentRect = currentImg.getBoundingClientRect()

      // Check if images are close to each other (within 700px)
      const distance = Math.sqrt(
        Math.pow(imgRect.left - currentRect.left, 2) + 
        Math.pow(imgRect.top - currentRect.top, 2)
      )

      if (distance < 700) {
        nearbyImages.push(img as HTMLImageElement)
      }
    })

    return nearbyImages
  }

  // Function to check if current image size matches any nearby image
  const checkSizeMatch = (currentImg: HTMLImageElement, targetWidth: number, targetHeight: number, tolerance: number = 5) => {
    const nearbyImages = findNearbyImages(currentImg)
    
    for (const nearbyImg of nearbyImages) {
      const nearbyRect = nearbyImg.getBoundingClientRect()
      const widthDiff = Math.abs(nearbyRect.width - targetWidth)
      const heightDiff = Math.abs(nearbyRect.height - targetHeight)
      
      if (widthDiff <= tolerance && heightDiff <= tolerance) {
        return { matched: true, image: nearbyImg }
      }
    }
    
    return { matched: false, image: null }
  }

  const handleDragStart = (e: React.DragEvent) => {
    // Don't prevent default - let the browser handle the drag
    e.stopPropagation()
    setIsDragging(true)
    
    // Store the current node position for reference
    const pos = editor?.view.posAtDOM(e.currentTarget, 0)
    console.log('Gallery drag start, pos:', pos) // Debug log
    console.log('Gallery node:', node.toJSON()) // Debug log
    
    if (pos !== null) {
      const dragData = {
        type: 'imageGallery',
        pos: pos,
        node: node.toJSON()
      }
      console.log('Setting drag data:', dragData) // Debug log
      e.dataTransfer.setData('text/plain', JSON.stringify(dragData))
    }
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    // Remove visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleAddImage = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        const newImages: string[] = []
        Array.from(files).forEach(file => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            newImages.push(result)
            if (newImages.length === files.length) {
              const updatedImages = [...images, ...newImages]
              setImages(updatedImages)
              updateAttributes({ images: updatedImages })
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    
    input.click()
  }

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    updateAttributes({ images: updatedImages })
  }

  const handleLayoutChange = (newLayout: 'horizontal' | 'vertical' | 'grid') => {
    setLayout(newLayout)
    updateAttributes({ layout: newLayout })
  }

  const handleCropClick = async (e: React.MouseEvent, imageSrc: string, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    try {
      // Convert data URL to File
      const response = await fetch(imageSrc)
      const blob = await response.blob()
      const file = new File([blob], `gallery-image-${index}.png`, { type: blob.type })
      
      setOriginalImageFile(file)
      setCroppingImageIndex(index)
      setIsCropModalOpen(true)
    } catch (error) {
      console.error('Error preparing image for crop:', error)
    }
  }

  const handleDownload = (e: React.MouseEvent, imageSrc: string, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const link = document.createElement('a')
    link.href = imageSrc
    link.download = `gallery-image-${index + 1}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    if (croppingImageIndex !== null) {
      const updatedImages = [...images]
      updatedImages[croppingImageIndex] = croppedImageUrl
      
      // Update state immediately
      setImages(updatedImages)
      updateAttributes({ images: updatedImages })
      
      // Force a complete re-render to ensure proper display
      setTimeout(() => {
        setImages([...updatedImages])
        updateAttributes({ images: [...updatedImages] })
      }, 50)
    }
    setIsCropModalOpen(false)
    setOriginalImageFile(null)
    setCroppingImageIndex(null)
  }

  const handleImageClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedImageIndex(selectedImageIndex === index ? null : index)
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string, imageIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const img = e.currentTarget.closest('.gallery-image-container')?.querySelector('img') as HTMLImageElement
    if (!img) return

    // Wait for image to load to get accurate dimensions
    const getImageDimensions = () => {
      const rect = img.getBoundingClientRect()
      // Use natural dimensions if available, otherwise use displayed dimensions
      const naturalWidth = img.naturalWidth || rect.width
      const naturalHeight = img.naturalHeight || rect.height
      const aspectRatio = naturalWidth / naturalHeight
      
      return {
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
        aspectRatio: aspectRatio
      }
    }

    const startData = getImageDimensions()

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startData.x
      const deltaY = moveEvent.clientY - startData.y
      
      let newWidth = startData.width
      let newHeight = startData.height

      // Calculate new dimensions based on direction
      if (direction.includes('e')) newWidth += deltaX
      if (direction.includes('w')) newWidth -= deltaX
      if (direction.includes('s')) newHeight += deltaY
      if (direction.includes('n')) newHeight -= deltaY

      // Maintain aspect ratio
      if (direction.includes('e') || direction.includes('w')) {
        // If resizing horizontally, adjust height to maintain aspect ratio
        newHeight = newWidth / startData.aspectRatio
      } else if (direction.includes('s') || direction.includes('n')) {
        // If resizing vertically, adjust width to maintain aspect ratio
        newWidth = newHeight * startData.aspectRatio
      } else if (direction.includes('nw') || direction.includes('ne') || direction.includes('sw') || direction.includes('se')) {
        // For corner resizing, use the larger change to maintain aspect ratio
        const widthChange = Math.abs(deltaX)
        const heightChange = Math.abs(deltaY)
        
        if (widthChange > heightChange) {
          // Width change is larger, adjust height
          newHeight = newWidth / startData.aspectRatio
        } else {
          // Height change is larger, adjust width
          newWidth = newHeight * startData.aspectRatio
        }
      }

      // Apply minimum constraints
      newWidth = Math.max(50, newWidth)
      newHeight = Math.max(50, newHeight)

      // Check for size matching with nearby images
      const sizeMatch = checkSizeMatch(img, newWidth, newHeight, 20)
      
      if (sizeMatch.matched && sizeMatch.image) {
        // Snap to the exact size of the matched image
        const matchedRect = sizeMatch.image.getBoundingClientRect()
        newWidth = matchedRect.width
        newHeight = matchedRect.height
        
        // Update state for visual feedback
        const newIsSizeLocked = [...isSizeLocked]
        const newLockedImageRefs = [...lockedImageRefs]
        newIsSizeLocked[imageIndex] = true
        newLockedImageRefs[imageIndex] = sizeMatch.image
        setIsSizeLocked(newIsSizeLocked)
        setLockedImageRefs(newLockedImageRefs)
        
        // Add visual feedback to the matched image
        sizeMatch.image.style.outline = '2px solid #10b981'
        sizeMatch.image.style.outlineOffset = '2px'
      } else {
        // Clear size lock state for this image
        const newIsSizeLocked = [...isSizeLocked]
        const newLockedImageRefs = [...lockedImageRefs]
        newIsSizeLocked[imageIndex] = false
        newLockedImageRefs[imageIndex] = null
        setIsSizeLocked(newIsSizeLocked)
        setLockedImageRefs(newLockedImageRefs)
        
        // Remove visual feedback from all nearby images
        const nearbyImages = findNearbyImages(img)
        nearbyImages.forEach(nearbyImg => {
          nearbyImg.style.outline = ''
          nearbyImg.style.outlineOffset = ''
        })
      }

      // Update image style
      img.style.width = `${newWidth}px`
      img.style.height = `${newHeight}px`
    }

    const handleMouseUp = () => {
      // Clean up visual feedback
      const newIsSizeLocked = [...isSizeLocked]
      const newLockedImageRefs = [...lockedImageRefs]
      newIsSizeLocked[imageIndex] = false
      newLockedImageRefs[imageIndex] = null
      setIsSizeLocked(newIsSizeLocked)
      setLockedImageRefs(newLockedImageRefs)
      
      // Remove visual feedback from all nearby images
      const nearbyImages = findNearbyImages(img)
      nearbyImages.forEach(nearbyImg => {
        nearbyImg.style.outline = ''
        nearbyImg.style.outlineOffset = ''
      })
      
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const getGalleryClass = () => {
    switch (layout) {
      case 'vertical':
        return 'image-gallery-vertical'
      case 'grid':
        return 'image-gallery-grid'
      default:
        return 'image-gallery-horizontal'
    }
  }

  return (
    <NodeViewWrapper 
      className="image-gallery-wrapper" 
      contentEditable={false}
    >
      <div 
        className={`image-gallery ${getGalleryClass()}`}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="image-gallery-controls">
          <div className="layout-controls">
            <Button
              type="button"
              data-style={layout === 'horizontal' ? 'primary' : 'ghost'}
              onClick={() => handleLayoutChange('horizontal')}
              className="layout-button"
            >
              Horizontal
            </Button>
            <Button
              type="button"
              data-style={layout === 'vertical' ? 'primary' : 'ghost'}
              onClick={() => handleLayoutChange('vertical')}
              className="layout-button"
            >
              Vertical
            </Button>
            <Button
              type="button"
              data-style={layout === 'grid' ? 'primary' : 'ghost'}
              onClick={() => handleLayoutChange('grid')}
              className="layout-button"
            >
              Grid
            </Button>
          </div>
          <div className="action-controls">
            <Button
              type="button"
              data-style="ghost"
              onClick={handleAddImage}
              className="add-image-button"
            >
              Add Images
            </Button>
            <Button
              type="button"
              data-style="ghost"
              onClick={deleteNode}
              className="delete-gallery-button"
            >
              Delete Gallery
            </Button>
          </div>
        </div>
        
        <div className="image-gallery-content">
          {images.map((imageSrc, index) => (
            <div key={index} className="image-gallery-item">
              <div 
                className={`gallery-image-container ${selectedImageIndex === index ? 'selected' : ''}`}
                onClick={(e) => handleImageClick(e, index)}
              >
                <img
                  key={`gallery-image-${index}-${imageSrc.slice(-10)}`}
                  src={imageSrc}
                  alt={`Gallery image ${index + 1}`}
                  className={`gallery-image ${isSizeLocked[index] ? 'size-locked' : ''}`}
                  onLoad={() => {
                    // Force re-render to ensure proper display
                    setImages([...images])
                  }}
                />
                
                {/* Image controls overlay */}
                <div className="gallery-image-controls">
                  <Button
                    type="button"
                    data-style="ghost"
                    onClick={(e) => handleCropClick(e, imageSrc, index)}
                    className="gallery-control-button"
                    title="Crop image"
                  >
                    <CropIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    data-style="ghost"
                    onClick={(e) => handleDownload(e, imageSrc, index)}
                    className="gallery-control-button"
                    title="Download image"
                  >
                    <DownloadIcon className="h-4 w-4" />
                  </Button>
                </div>

                {/* Resize handles - only show when image is selected */}
                {selectedImageIndex === index && (
                  <div className="gallery-resize-handles">
                    <div className="resize-handle resize-handle-nw" onMouseDown={(e) => handleResizeStart(e, 'nw', index)}></div>
                    <div className="resize-handle resize-handle-ne" onMouseDown={(e) => handleResizeStart(e, 'ne', index)}></div>
                    <div className="resize-handle resize-handle-sw" onMouseDown={(e) => handleResizeStart(e, 'sw', index)}></div>
                    <div className="resize-handle resize-handle-se" onMouseDown={(e) => handleResizeStart(e, 'se', index)}></div>
                    <div className="resize-handle resize-handle-n" onMouseDown={(e) => handleResizeStart(e, 'n', index)}></div>
                    <div className="resize-handle resize-handle-s" onMouseDown={(e) => handleResizeStart(e, 's', index)}></div>
                    <div className="resize-handle resize-handle-e" onMouseDown={(e) => handleResizeStart(e, 'e', index)}></div>
                    <div className="resize-handle resize-handle-w" onMouseDown={(e) => handleResizeStart(e, 'w', index)}></div>
                  </div>
                )}
              </div>
              
              <button
                className="remove-image-button"
                onClick={() => handleRemoveImage(index)}
                aria-label="Remove image"
              >
                ×
              </button>
            </div>
          ))}
          
          {images.length === 0 && (
            <div className="empty-gallery">
              <p>No images in gallery</p>
              <Button
                type="button"
                data-style="primary"
                onClick={handleAddImage}
              >
                Add Images
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        onClose={() => {
          setIsCropModalOpen(false)
          setOriginalImageFile(null)
          setCroppingImageIndex(null)
        }}
        imageFile={originalImageFile}
        onCropComplete={handleCropComplete}
      />
    </NodeViewWrapper>
  )
}

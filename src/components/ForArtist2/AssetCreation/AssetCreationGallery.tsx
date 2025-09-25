
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles.css';

interface Props {
  media: {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  }[];
}

const AssetCreationGallery: React.FC<Props> = ({ media }) => {
  const [selectedMedia, setSelectedMedia] = useState<null | {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  }>(null);
  const galleryRef = useRef<HTMLElement>(null);

  // Ensure all videos are properly loaded
  useEffect(() => {
    const videos = document.querySelectorAll('.gallery-video');
    videos.forEach((video: any) => {
      video.load(); // Force reload
      console.log('Video element loaded:', video.src);
    });
  }, [media]);

  const handleMediaClick = (item: { title: string; subtitle: string; src: string; type: "photo" | "video" }) => {
    setSelectedMedia(item);
  };

  const closeModal = () => {
    setSelectedMedia(null);
  };

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.target === e.currentTarget) {
      closeModal(); // Close the modal if the background (outside content) is clicked
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, item: { title: string; subtitle: string; src: string; type: "photo" | "video" }) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleMediaClick(item);
    }
  };

  const handleModalKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  const handleVideoMouseEnter = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const container = video.closest('.gallery-item') as HTMLElement;
    
    // Add visual effects
    if (container) {
      container.classList.add('video-playing');
    }
    
    // Reset video and play
    video.currentTime = 0;
    const playPromise = video.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Video started playing successfully
          console.log("Video playing");
        })
        .catch((error) => {
          console.error("Play was prevented:", error);
          // Remove visual effects if play failed
          if (container) {
            container.classList.remove('video-playing');
          }
        });
    }
  };

  const handleVideoMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    const container = video.closest('.gallery-item') as HTMLElement;
    
    // Remove visual effects
    if (container) {
      container.classList.remove('video-playing');
    }
    
    // Pause and reset video
    video.pause();
    video.currentTime = 0;
  };

  const handleVideoLoad = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    video.style.opacity = '1';
    console.log("Video loaded:", video.src);
  };

  const handleVideoCanPlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.log("Video can play:", video.src);
  };

  const handleContainerMouseEnter = (e: React.MouseEvent<HTMLDivElement>, item: any) => {
    if (item.type === 'video') {
      const container = e.currentTarget;
      const video = container.querySelector('video') as HTMLVideoElement;
      
      console.log('Container hover - Video found:', !!video, 'Item:', item.title);
      
      if (video) {
        // Add visual effects immediately
        container.classList.add('video-playing');
        
        // Ensure video is ready
        if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          video.currentTime = 0;
          
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ Video playing successfully:", item.title);
              })
              .catch((error) => {
                console.error("❌ Play prevented:", error.message, item.title);
                // Keep visual effects even if play fails (browser restriction)
              });
          }
        } else {
          console.log("📺 Video not ready, waiting...", item.title);
          // Video not ready, wait for it to load
          video.addEventListener('canplay', () => {
            if (container.classList.contains('video-playing')) {
              video.currentTime = 0;
              video.play().catch(console.error);
            }
          }, { once: true });
        }
      }
    }
  };

  const handleContainerMouseLeave = (e: React.MouseEvent<HTMLDivElement>, item: any) => {
    if (item.type === 'video') {
      const container = e.currentTarget;
      const video = container.querySelector('video') as HTMLVideoElement;
      if (video) {
        container.classList.remove('video-playing');
        video.pause();
        video.currentTime = 0;
      }
    }
  };

  // Mobile touch handlers
  const handleContainerTouchStart = (e: React.TouchEvent<HTMLDivElement>, item: any) => {
    if (item.type === 'video') {
      const container = e.currentTarget;
      const video = container.querySelector('video') as HTMLVideoElement;
      
      if (video) {
        // Add visual effects immediately
        container.classList.add('video-playing');
        
        // Ensure video is ready
        if (video.readyState >= 2) {
          video.currentTime = 0;
          
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log("✅ Mobile video playing successfully:", item.title);
              })
              .catch((error) => {
                console.warn("❌ Mobile play prevented:", error.message, item.title);
                // Keep visual effects even if play fails (browser restriction)
              });
          }
        }
      }
    }
  };

  const handleContainerTouchEnd = (e: React.TouchEvent<HTMLDivElement>, item: any) => {
    if (item.type === 'video') {
      const container = e.currentTarget;
      const video = container.querySelector('video') as HTMLVideoElement;
      if (video) {
        // Keep the video playing for a brief moment on mobile
        setTimeout(() => {
          container.classList.remove('video-playing');
          video.pause();
          video.currentTime = 0;
        }, 2000);
      }
    }
  };

  return (
    <>
      <section className='asset-gallery' ref={galleryRef}>
        {media.map((item, index) => (
          <motion.div 
            key={index} 
            className='gallery-item' 
            onClick={() => handleMediaClick(item)}
            onKeyDown={(e) => handleKeyPress(e, item)}
            onMouseEnter={(e) => handleContainerMouseEnter(e, item)}
            onMouseLeave={(e) => handleContainerMouseLeave(e, item)}
            onTouchStart={(e) => handleContainerTouchStart(e, item)}
            onTouchEnd={(e) => handleContainerTouchEnd(e, item)}
            tabIndex={0}
            role="button"
            aria-label={`View ${item.title} - ${item.subtitle}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            layout
          >
            <div className="media-wrapper">
              {item.type === "photo" ? (
                <img 
                  src={item.src} 
                  alt={item.title} 
                  className="gallery-image"
                  loading="lazy"
                />
              ) : (
                <video
                  src={item.src}
                  className="gallery-video"
                  muted
                  onLoadedData={handleVideoLoad}
                  onCanPlay={handleVideoCanPlay}
                  loop
                  playsInline
                  preload="auto"
                  style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                  disablePictureInPicture
                  {...({ 'webkit-playsinline': 'true' } as any)}
                  {...({ 'x-webkit-airplay': 'deny' } as any)}
                />
              )}
              <div className="overlay">
                <div className="overlay-content">
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-subtitle">{item.subtitle}</p>
                  <div className="view-button">
                    <span>{item.type === 'video' ? 'Play & View' : 'View Full Size'}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {item.type === 'video' ? (
                        <path d="M8 5v14l11-7z"/>
                      ) : (
                        <path d="M7 17L17 7M17 7H7M17 7V17"/>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      <AnimatePresence>
        {selectedMedia && (
          <motion.div 
            className="modal" 
            onClick={handleBackgroundClick}
            onKeyDown={handleModalKeyPress}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            >
              <button className="close-button" onClick={closeModal} aria-label="Close modal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
              
              <div className="modal-media">
                {selectedMedia.type === "photo" ? (
                  <img 
                    src={selectedMedia.src} 
                    alt={selectedMedia.title}
                    className="modal-image"
                  />
                ) : (
                  <video 
                    src={selectedMedia.src} 
                    controls={true} 
                    loop 
                    autoPlay 
                    muted 
                    playsInline
                    className="modal-video"
                  />
                )}
              </div>
              
              <div className="modal-info">
                <h3 className="modal-title">{selectedMedia.title}</h3>
                <p className="modal-subtitle">{selectedMedia.subtitle}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AssetCreationGallery;

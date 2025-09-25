import React, { useState, useRef, useEffect } from 'react';

interface VideoPlayerProps {
  src: string;
  style?: React.CSSProperties;
  className?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  onLoadStart?: () => void;
  onLoadedData?: () => void;
  onError?: (error: string) => void;
  noBorder?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  style,
  className = '',
  autoPlay = true,
  loop = true,
  muted = true,
  playsInline = true,
  preload = 'auto',
  onLoadStart,
  onLoadedData,
  onError,
  noBorder = false,
}) => {
  const [showPlaceholder, setShowPlaceholder] = useState(true); // Show placeholder initially
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Reset states when src changes
    setShowPlaceholder(true);
    setHasError(false);

    const handleError = (e: Event) => {
      console.error('Video error event fired:', e);
      setShowPlaceholder(false);
      setHasError(true);
      onError?.('Failed to load video');
    };

    const handleLoadedData = () => {
      console.log('Video loaded data event fired');
      setShowPlaceholder(false); // Hide placeholder once video data is loaded
      onLoadedData?.();
    };

    const handleLoadStart = () => {
      console.log('Video load start event fired');
      setShowPlaceholder(true); // Show placeholder when loading starts
      onLoadStart?.();
    };

    const handleCanPlay = () => {
      console.log('Video can play event fired');
      setShowPlaceholder(false); // Hide placeholder when video can play
    };

    const handlePlaying = () => {
      console.log('Video playing event fired');
      setShowPlaceholder(false); // Hide placeholder when video starts playing
    };

    const handleTimeUpdate = () => {
      console.log('Video time update event fired');
      setShowPlaceholder(false); // Hide placeholder when video is actually playing
      // Remove this listener after first time update since we only need it once
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };

    // Add event listeners for clean loading state
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('error', handleError);

    // Failsafe timeout to hide placeholder if events don't fire
    const timeoutId = setTimeout(() => {
      console.log('Failsafe timeout - hiding placeholder');
      setShowPlaceholder(false);
    }, 3000); // Hide after 3 seconds max

    // Cleanup event listeners and timeout
    return () => {
      clearTimeout(timeoutId);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('error', handleError);
    };
  }, [src, onLoadStart, onLoadedData, onError]);

  const handleRetry = () => {
    setHasError(false);
    setShowPlaceholder(true);
    const video = videoRef.current;
    if (video) {
      video.load();
    }
  };

  return (
    <div 
      className={`${noBorder ? 'relative w-full h-full' : 'relative w-full aspect-video bg-transparent rounded-lg overflow-hidden'} ${className}`} 
      style={style}
    >
      {/* Loading placeholder - shows while video is loading */}
      {showPlaceholder && !hasError && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex flex-col items-center justify-center z-10 text-white">
          <div className="w-8 h-8 border-2 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-3"></div>
          <p className="text-sm font-medium">Loading video...</p>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-10 text-white">
          <div className="text-center">
            <p className="mb-4 text-red-400 text-sm">Failed to load video</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded transition-colors text-sm" 
              onClick={handleRetry}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        playsInline={playsInline}
        preload={preload}
        className="absolute inset-0 w-full h-full object-cover border-none outline-none bg-transparent"
        {...({ 'webkit-playsinline': 'true' } as any)}
        {...({ 'x-webkit-airplay': 'deny' } as any)}
        disablePictureInPicture
      />
    </div>
  );
};

export default VideoPlayer;
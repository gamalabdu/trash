/**
 * Mobile video utilities for Safari and iOS compatibility
 */

let userHasInteracted = false;

// Track user interaction for autoplay permissions
const trackUserInteraction = () => {
  if (!userHasInteracted) {
    userHasInteracted = true;
    console.log('User interaction detected - videos can now autoplay');
  }
};

// Add event listeners to track first user interaction
if (typeof window !== 'undefined') {
  ['touchstart', 'touchend', 'mousedown', 'keydown'].forEach(event => {
    document.addEventListener(event, trackUserInteraction, { once: true, passive: true });
  });
}

/**
 * Check if user has interacted with the page (needed for iOS autoplay)
 */
export const hasUserInteracted = (): boolean => userHasInteracted;

/**
 * Safe video play function that handles promise rejections gracefully
 */
export const safeVideoPlay = async (video: HTMLVideoElement): Promise<boolean> => {
  try {
    await video.play();
    return true;
  } catch (error) {
    console.warn('Video autoplay prevented:', error);
    return false;
  }
};

/**
 * Configure video element with mobile-friendly attributes
 */
export const configureVideoForMobile = (video: HTMLVideoElement): void => {
  // Set webkit-specific attributes for iOS
  video.setAttribute('webkit-playsinline', 'true');
  video.setAttribute('x-webkit-airplay', 'deny');
  video.playsInline = true;
  video.disablePictureInPicture = true;
  
  // Ensure video is muted for autoplay
  video.muted = true;
  
  // Preload metadata for faster start
  video.preload = 'metadata';
};

/**
 * Check if device is likely iOS/Safari
 */
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Check if browser is Safari
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

/**
 * Enhanced touch event handler for video elements
 */
export const handleVideoTouch = (
  video: HTMLVideoElement,
  action: 'start' | 'end',
  options?: { delay?: number }
): void => {
  if (action === 'start') {
    video.currentTime = 0;
    safeVideoPlay(video);
  } else if (action === 'end') {
    const delay = options?.delay || 2000;
    setTimeout(() => {
      video.pause();
      video.currentTime = 0;
    }, delay);
  }
};

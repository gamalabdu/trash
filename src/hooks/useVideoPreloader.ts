import { useEffect, useState } from 'react';

interface VideoPreloadResult {
  isLoaded: boolean;
  error: string | null;
  preloadedUrls: Set<string>;
}

export const useVideoPreloader = (videoUrls: string[]): VideoPreloadResult => {
  const [preloadedUrls, setPreloadedUrls] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (videoUrls.length === 0) return;

    const preloadVideos = async () => {
      const loadPromises = videoUrls.map((url) => {
        return new Promise<string>((resolve, reject) => {
          // Skip if already preloaded
          if (preloadedUrls.has(url)) {
            resolve(url);
            return;
          }

          const video = document.createElement('video');
          video.preload = 'metadata';
          video.muted = true; // Needed for autoplay policies
          
          const handleCanPlay = () => {
            cleanup();
            setPreloadedUrls(prev => {
              const newSet = new Set(prev);
              newSet.add(url);
              return newSet;
            });
            resolve(url);
          };

          const handleError = () => {
            cleanup();
            reject(new Error(`Failed to preload video: ${url}`));
          };

          const handleLoadedMetadata = () => {
            // Video metadata is loaded, enough for smooth playback start
            cleanup();
            setPreloadedUrls(prev => {
              const newSet = new Set(prev);
              newSet.add(url);
              return newSet;
            });
            resolve(url);
          };

          const cleanup = () => {
            video.removeEventListener('canplay', handleCanPlay);
            video.removeEventListener('error', handleError);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
          };

          video.addEventListener('canplay', handleCanPlay);
          video.addEventListener('error', handleError);
          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          
          // Start preloading
          video.src = url;
          video.load();

          // Cleanup after timeout to prevent memory leaks
          setTimeout(() => {
            cleanup();
            if (!preloadedUrls.has(url)) {
              reject(new Error(`Video preload timeout: ${url}`));
            }
          }, 10000); // 10 second timeout
        });
      });

      try {
        await Promise.allSettled(loadPromises);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to preload videos');
      }
    };

    preloadVideos();
  }, [videoUrls, preloadedUrls]);

  const isLoaded = videoUrls.length > 0 && videoUrls.every(url => preloadedUrls.has(url));

  return {
    isLoaded,
    error,
    preloadedUrls,
  };
};

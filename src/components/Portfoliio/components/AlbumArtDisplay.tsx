import React, { useState, memo, useCallback } from 'react';
import { SongEntry } from '../types';

interface AlbumArtDisplayProps {
  song: SongEntry;
  isPlaying: boolean;
  isLoading: boolean;
}

const AlbumArtDisplay: React.FC<AlbumArtDisplayProps> = memo(({
  song,
  isPlaying,
  isLoading,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoaded(true);
  }, []);

  return (
    <div className="album-art-container">
      <div className={`album-art-wrapper ${isPlaying ? 'playing' : ''}`}>
        <img
          className={`album-art ${imageLoaded ? 'loaded' : ''}`}
          src={song.image}
          alt={`${song.title} by ${song.artist}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {/* Glow effect for playing state */}
        <div className={`glow-effect ${isPlaying ? 'active' : ''}`}></div>
      </div>
      
      <div className="track-metadata">
        <h2 className="track-title">{song.title}</h2>
        <h3 className="track-artist">{song.artist}</h3>
      </div>
    </div>
  );
});

AlbumArtDisplay.displayName = 'AlbumArtDisplay';

export default AlbumArtDisplay;

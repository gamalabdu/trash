import React, { memo, useCallback } from 'react';
import { SongEntry } from '../types';
import { FaMusic, FaPlay } from 'react-icons/fa';

interface PlaylistViewProps {
  songs: SongEntry[];
  currentSongIndex: number;
  onSongSelect: (index: number) => void;
  isPlaying: boolean;
}

const PlaylistView: React.FC<PlaylistViewProps> = memo(({
  songs,
  currentSongIndex,
  onSongSelect,
  isPlaying,
}) => {
  const handleTrackClick = useCallback((index: number) => {
    onSongSelect(index);
  }, [onSongSelect]);

  const handlePlayButtonClick = useCallback((e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    onSongSelect(index);
  }, [onSongSelect]);

  return (
    <div className="playlist-container" role="region" aria-label="Playlist">
      <div className="playlist-header">
        <FaMusic className="playlist-icon" aria-hidden="true" />
        <h3 className="playlist-title" id="playlist-title">Playlist</h3>
        <span className="playlist-count">{songs.length} tracks</span>
      </div>
      
      <div 
        className="playlist-tracks"
        role="list"
        aria-labelledby="playlist-title"
        aria-description={`Playlist with ${songs.length} tracks. Use arrow keys to navigate, Enter or Space to select.`}
      >
        {songs.map((song, index) => (
          <div
            key={song.id}
            className={`track-item ${index === currentSongIndex ? 'track-item-active' : ''}`}
            onClick={() => handleTrackClick(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleTrackClick(index);
              }
            }}
            tabIndex={0}
            role="listitem"
            aria-label={`${index === currentSongIndex && isPlaying ? 'Currently playing: ' : ''}${song.title} by ${song.artist}`}
            aria-current={index === currentSongIndex ? 'true' : 'false'}
          >
            <div className="track-number" aria-hidden="true">
              {index === currentSongIndex && isPlaying ? (
                <div className="audio-equalizer">
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                  <span className="eq-bar"></span>
                </div>
              ) : (
                <span className="track-index">{String(index + 1).padStart(2, '0')}</span>
              )}
            </div>
            
            <div className="track-info">
              <div className="track-title">{song.title}</div>
              <div className="track-artist">{song.artist}</div>
            </div>
            
            <button 
              className="track-play-btn"
              onClick={(e) => handlePlayButtonClick(e, index)}
              aria-label={`Play ${song.title} by ${song.artist}`}
            >
              <FaPlay />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
});

PlaylistView.displayName = 'PlaylistView';

export default PlaylistView;

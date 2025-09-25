import React, { memo, useEffect, useCallback } from 'react';
import './styles.css';
import WavesurferPlayer from '@wavesurfer/react';
import PasswordPage from './PasswordPage/PasswordPage';
import AlbumArtDisplay from './components/AlbumArtDisplay';
import AudioControls from './components/AudioControls';
import PlaylistView from './components/PlaylistView';
import { usePortfolioData } from './hooks/usePortfolioData';
import { useAudioPlayer } from './hooks/useAudioPlayer';

const Portfolio: React.FC = memo(() => {
  const {
    songs,
    loading,
    error,
    authenticated,
    password,
    authenticateUser,
    setPassword,
  } = usePortfolioData();

  const {
    wavesurfer,
    playerState,
    onReady,
    playPause,
    nextSong,
    previousSong,
    setVolume,
    toggleMute,
    selectSong,
    formatTime,
    updatePlayerState,
  } = useAudioPlayer({
    songs,
    onSongChange: (index) => {
      updatePlayerState({ currentSongIndex: index });
    },
  });

  // Keyboard navigation - moved before early returns
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
    
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        playPause();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        previousSong();
        break;
      case 'ArrowRight':
        e.preventDefault();
        nextSong();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (playerState.currentSongIndex > 0) {
          selectSong(playerState.currentSongIndex - 1);
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (playerState.currentSongIndex < songs.length - 1) {
          selectSong(playerState.currentSongIndex + 1);
        }
        break;
    }
  }, [playPause, previousSong, nextSong, selectSong, playerState.currentSongIndex, songs.length]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle loading state
  if (loading) {
    return (
      <div className="portfolio-container">
        <div className="loading-message">
          <div className="loading-spinner"></div>
          Loading your music...
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="portfolio-container">
        <div className="error-message">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Handle empty state
  if (songs.length === 0) {
    return (
      <div className="portfolio-container">
        <div className="loading-message">
          No songs available at the moment.
        </div>
      </div>
    );
  }

  // Show password page if not authenticated (currently commented out in original)
  if (!authenticated && false) { // Keep original logic but disable for now
    return (
      <div className="portfolio-container">
        <PasswordPage
          password={password}
          setPassword={setPassword}
          authenticateUser={authenticateUser}
        />
      </div>
    );
  }

  const currentSong = songs[playerState.currentSongIndex];

  return (
    <div className="portfolio-container" role="main" aria-label="Music Portfolio">
      <div 
        className="music-player-container" 
        role="region" 
        aria-label="Music Player"
        tabIndex={0}
      >
        {/* Left Panel - Album Art and Controls */}
        <div className="player-half">
          <AlbumArtDisplay
            song={currentSong}
            isPlaying={playerState.isPlaying}
            isLoading={playerState.isLoading}
          />

          {/* Enhanced Waveform Visualizer */}
          <div className="waveform-container">
            <div className="waveform-content">
              <WavesurferPlayer
                key={`${currentSong.id}-${playerState.currentSongIndex}`}
                height={50}
                width={280}
                waveColor="rgba(255, 255, 255, 0.3)"
                progressColor="#f93b3b"
                cursorColor="#f93b3b"
                url={currentSong.music}
                onReady={(ws) => {
                  console.log('WaveSurfer ready for song:', currentSong.title);
                  onReady(ws);
                }}
                normalize={true}
                onPlay={() => updatePlayerState({ isPlaying: true })}
                onPause={() => updatePlayerState({ isPlaying: false })}
                barWidth={2}
                barGap={1}
                barRadius={2}
              />
            </div>
            
            {playerState.isLoading && (
              <div className="waveform-loading" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
                <div className="waveform-skeleton">
                  {Array.from({ length: 15 }, (_, i) => (
                    <div key={i} className="skeleton-bar"></div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <AudioControls
            playerState={playerState}
            onPlayPause={playPause}
            onNext={nextSong}
            onPrevious={previousSong}
            onVolumeChange={setVolume}
            onToggleMute={toggleMute}
            formatTime={formatTime}
          />
        </div>

        {/* Right Panel - Playlist */}
        <div className="song-list-half">
          <PlaylistView
            songs={songs}
            currentSongIndex={playerState.currentSongIndex}
            onSongSelect={selectSong}
            isPlaying={playerState.isPlaying}
          />
        </div>
      </div>

      {/* Screen Reader Live Region for Announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        role="status"
      >
        {playerState.isPlaying 
          ? `Now playing: ${currentSong.title} by ${currentSong.artist}`
          : `Paused: ${currentSong.title} by ${currentSong.artist}`
        }
      </div>

      {/* Keyboard shortcuts help (hidden visually but available to screen readers) */}
      <div className="sr-only">
        <h2>Keyboard Shortcuts</h2>
        <ul>
          <li>Space: Play/Pause</li>
          <li>Left Arrow: Previous track</li>
          <li>Right Arrow: Next track</li>
          <li>Up Arrow: Previous song in playlist</li>
          <li>Down Arrow: Next song in playlist</li>
        </ul>
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;
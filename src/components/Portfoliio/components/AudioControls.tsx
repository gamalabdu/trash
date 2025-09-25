import React, { memo, useCallback } from 'react';
import { 
  FaPlay, 
  FaPause, 
  FaForward, 
  FaBackward, 
  FaVolumeUp, 
  FaVolumeMute,
  FaVolumeDown 
} from 'react-icons/fa';
import { AudioPlayerState } from '../types';

interface AudioControlsProps {
  playerState: AudioPlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  formatTime: (time: number) => string;
}

const AudioControls: React.FC<AudioControlsProps> = memo(({
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  onToggleMute,
  formatTime,
}) => {
  const { isPlaying, currentTime, duration, volume, isMuted } = playerState;

  const getVolumeIcon = () => {
    if (isMuted || volume === 0) return FaVolumeMute;
    if (volume < 0.5) return FaVolumeDown;
    return FaVolumeUp;
  };

  const VolumeIcon = getVolumeIcon();

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  }, [onVolumeChange]);

  return (
    <div className="audio-controls">
      {/* Main Controls */}
      <div className="main-controls">
        <button
          className="control-btn control-btn-secondary"
          onClick={onPrevious}
          aria-label="Previous track"
        >
          <FaBackward />
        </button>

        <button
          className="control-btn control-btn-primary"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button
          className="control-btn control-btn-secondary"
          onClick={onNext}
          aria-label="Next track"
        >
          <FaForward />
        </button>
      </div>

      {/* Time Display */}
      <div className="time-display">
        <span className="time-current">{formatTime(currentTime)}</span>
        <span className="time-separator">/</span>
        <span className="time-total">{formatTime(duration)}</span>
      </div>

      {/* Volume Control */}
      <div className="volume-control">
        <button
          className="volume-btn"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          <VolumeIcon />
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-slider"
          aria-label="Volume"
        />
      </div>
    </div>
  );
});

AudioControls.displayName = 'AudioControls';

export default AudioControls;

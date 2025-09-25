import { useState, useCallback, useEffect } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { AudioPlayerState, SongEntry } from '../types';

interface UseAudioPlayerProps {
  songs: SongEntry[];
  onSongChange?: (index: number) => void;
}

export const useAudioPlayer = ({ songs, onSongChange }: UseAudioPlayerProps) => {
  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    currentSongIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    isLoading: false,
  });

  const updatePlayerState = useCallback((updates: Partial<AudioPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  }, []);

  const onReady = useCallback((ws: WaveSurfer) => {
    console.log('onReady called, setting loading to false');
    setWavesurfer(ws);
    
    // Set loading to false when ready
    updatePlayerState({ 
      isPlaying: false,
      isLoading: false,
      duration: ws.getDuration()
    });

    // Set up event listeners
    ws.on('finish', () => {
      const currentIndex = playerState.currentSongIndex;
      const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
      updatePlayerState({
        currentSongIndex: nextIndex,
        isPlaying: false,
        isLoading: true
      });
      onSongChange?.(nextIndex);
    });

    ws.on('timeupdate', (currentTime: number) => {
      updatePlayerState({ currentTime });
    });
  }, [songs.length, onSongChange, updatePlayerState, playerState.currentSongIndex]);

  const playPause = useCallback(() => {
    if (wavesurfer) {
      wavesurfer.playPause();
      updatePlayerState({ isPlaying: !playerState.isPlaying });
    }
  }, [wavesurfer, playerState.isPlaying, updatePlayerState]);

  const nextSong = useCallback(() => {
    const nextIndex = playerState.currentSongIndex === songs.length - 1 ? 0 : playerState.currentSongIndex + 1;
    updatePlayerState({ 
      currentSongIndex: nextIndex,
      isLoading: true 
    });
    onSongChange?.(nextIndex);
  }, [playerState.currentSongIndex, songs.length, onSongChange, updatePlayerState]);

  const previousSong = useCallback(() => {
    const prevIndex = playerState.currentSongIndex === 0 ? songs.length - 1 : playerState.currentSongIndex - 1;
    updatePlayerState({ 
      currentSongIndex: prevIndex,
      isLoading: true 
    });
    onSongChange?.(prevIndex);
  }, [playerState.currentSongIndex, songs.length, onSongChange, updatePlayerState]);

  const seekTo = useCallback((time: number) => {
    if (wavesurfer) {
      wavesurfer.seekTo(time);
      updatePlayerState({ currentTime: time * wavesurfer.getDuration() });
    }
  }, [wavesurfer, updatePlayerState]);

  const setVolume = useCallback((volume: number) => {
    if (wavesurfer) {
      wavesurfer.setVolume(volume);
      updatePlayerState({ volume, isMuted: volume === 0 });
    }
  }, [wavesurfer, updatePlayerState]);

  const toggleMute = useCallback(() => {
    if (wavesurfer) {
      const newVolume = playerState.isMuted ? playerState.volume : 0;
      wavesurfer.setVolume(newVolume);
      updatePlayerState({ isMuted: !playerState.isMuted });
    }
  }, [wavesurfer, playerState.isMuted, playerState.volume, updatePlayerState]);

  const selectSong = useCallback((index: number) => {
    updatePlayerState({ 
      currentSongIndex: index,
      isPlaying: true,
      isLoading: true 
    });
    onSongChange?.(index);
  }, [onSongChange, updatePlayerState]);

  const formatTime = useCallback((time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    wavesurfer,
    playerState,
    onReady,
    playPause,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleMute,
    selectSong,
    formatTime,
    updatePlayerState,
  };
};

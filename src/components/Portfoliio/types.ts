export interface SongEntry {
  title: string;
  artist: string;
  image: string;
  music: string;
  id: number;
  duration?: number;
}

export interface AudioPlayerState {
  currentSongIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
}

export interface PortfolioState {
  songs: SongEntry[];
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  password: string;
}

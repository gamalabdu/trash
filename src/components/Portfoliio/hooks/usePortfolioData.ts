import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@sanity/client';
import { SongEntry, PortfolioState } from '../types';

const sanityClient = createClient({
  projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
  dataset: process.env.REACT_APP_SANITY_DATASET,
  useCdn: true,
  apiVersion: '2024-01-14',
  token: process.env.REACT_APP_SANITY_TOKEN,
  ignoreBrowserTokenWarning: true
});

export const usePortfolioData = () => {
  const [state, setState] = useState<PortfolioState>({
    songs: [],
    loading: true,
    error: null,
    authenticated: false,
    password: '',
  });

  const updateState = useCallback((updates: Partial<PortfolioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const fetchSongs = useCallback(async () => {
    try {
      updateState({ loading: true, error: null });
      
      const musicData = await sanityClient.fetch(`
        *[_type == "song"]{
          title,
          id,
          artist,
          coverArt{
            asset->{
              url
            }
          },
          music{
            asset->{
              url
            }
          }
        }
      `);

      if (musicData) {
        const musicEntries: SongEntry[] = musicData
          .map((song: any) => ({
            title: song.title,
            artist: song.artist,
            image: song.coverArt.asset.url,
            music: song.music.asset.url,
            id: song.id
          }))
          .sort((a: SongEntry, b: SongEntry) => a.id - b.id);

        updateState({ 
          songs: musicEntries, 
          loading: false 
        });
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      updateState({ 
        error: 'Failed to load songs. Please try again later.',
        loading: false 
      });
    }
  }, [updateState]);

  const authenticateUser = useCallback(() => {
    if (state.password === 'Welcome2024') {
      updateState({ authenticated: true });
    } else {
      updateState({ error: 'Invalid password' });
    }
  }, [state.password, updateState]);

  const setPassword = useCallback((password: string) => {
    updateState({ password, error: null });
  }, [updateState]);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  return {
    ...state,
    authenticateUser,
    setPassword,
    refetchSongs: fetchSongs,
  };
};

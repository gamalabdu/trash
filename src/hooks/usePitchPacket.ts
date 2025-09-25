import { useState, useEffect } from 'react';
import { sanityClient } from '../utils/sanityClient';

interface PitchPacketData {
  title: string;
  pdfFile: {
    asset: {
      url: string;
    };
  };
}

interface UsePitchPacketReturn {
  data: PitchPacketData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePitchPacket = (): UsePitchPacketReturn => {
  const [data, setData] = useState<PitchPacketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPitchPacket = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await sanityClient.fetch(`
        *[_type == "pitchPacket" && _id == "76f3bf6b-e9f2-4cb6-98f1-d8fc548542a9"][0]{
          title,
          pdfFile{
            asset->{
              url
            }
          }
        }
      `);
      
      if (!result) {
        throw new Error('Pitch packet not found');
      }
      
      setData(result);
    } catch (err) {
      console.error('Error fetching pitch packet:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pitch packet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitchPacket();
  }, []);

  const refetch = () => {
    fetchPitchPacket();
  };

  return {
    data,
    loading,
    error,
    refetch
  };
};

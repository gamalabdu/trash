import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@sanity/client';
import { IWork } from '../models/IWork';

interface WorksContextType {
  works: IWork[];
  loading: boolean;
  error: string | null;
  getWorkBySlug: (slug: string) => IWork | undefined;
  refreshWorks: () => Promise<void>;
}

const WorksContext = createContext<WorksContextType | undefined>(undefined);

interface WorksProviderProps {
  children: ReactNode;
}

// Helper function to generate URL-friendly slugs
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const WorksProvider: React.FC<WorksProviderProps> = ({ children }) => {
  const [works, setWorks] = useState<IWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true,
    apiVersion: '2024-01-14',
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });

  const fetchWorks = async () => {
    try {
      setLoading(true);
      setError(null);

      const worksData = await sanityClient.fetch(`
        *[_type == "work"]{
          _id,
          name,
          statement,
          image{
            asset->{
              url
            }
          },
          type,
          videos[]{
            asset->{
              url
            }
          },
          images[]{
            asset-> {
              url
            }
          },
          canvas[]{
            asset-> {
              url
            }
          },
          assets[]{
            asset->{
              url
            }
          },
          iphone,
          artworks[]{
            asset-> {
              url
            }
          }
        }
      `);

      if (worksData) {
        const workEntries: IWork[] = worksData.map((work: any) => ({
          id: work._id,
          slug: generateSlug(work.name),
          name: work.name,
          image: work.image,
          type: work.type,
          statement: work.statement,
          videos: work.videos || [],
          images: work.images || [],
          canvas: work.canvas || [],
          assets: work.assets || [],
          iphone: work.iphone || false,
          artworks: work.artworks || [],
        }));

        setWorks(workEntries);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch works');
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWorkBySlug = (slug: string): IWork | undefined => {
    return works.find(work => work.slug === slug);
  };

  const refreshWorks = async () => {
    await fetchWorks();
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  const value: WorksContextType = {
    works,
    loading,
    error,
    getWorkBySlug,
    refreshWorks,
  };

  return (
    <WorksContext.Provider value={value}>
      {children}
    </WorksContext.Provider>
  );
};

export const useWorks = (): WorksContextType => {
  const context = useContext(WorksContext);
  if (context === undefined) {
    throw new Error('useWorks must be used within a WorksProvider');
  }
  return context;
};

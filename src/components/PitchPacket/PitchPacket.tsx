import React, { useEffect, useState } from 'react';
import { createClient } from '@sanity/client';

interface PitchPacketData {
  title: string;
  pdfFile: {
    asset: {
      url: string;
    };
  };
}

const PitchPacket = () => {
  const [pitchPacket, setPitchPacket] = useState<PitchPacketData | null>(null);

  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true,
    apiVersion: '2024-01-14',
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });

  useEffect(() => {
    const fetchPitchPacket = async () => {
      try {
        const data = await sanityClient.fetch(`
          *[_type == "pitchPacket" && _id == "76f3bf6b-e9f2-4cb6-98f1-d8fc548542a9"][0]{
            title,
            pdfFile{
              asset->{
                url
              }
            }
          }
        `);
        setPitchPacket(data);
      } catch (error) {
        console.error('Error fetching pitch packet:', error);
      }
    };

    fetchPitchPacket();
  }, []);

  const handleDownload = () => {
    if (pitchPacket?.pdfFile.asset.url) {
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = pitchPacket.pdfFile.asset.url;
      link.download = `${pitchPacket.title}.pdf`; // Set the download filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className='h-full w-full flex items-center justify-center overflow-x-hidden'>
      {pitchPacket ? (
        <div className='w-full h-full flex flex-col items-center p-4 overflow-x-hidden'>
          <h1 className='text-2xl font-bold mb-4'>{pitchPacket.title}</h1>
          <div className='w-full h-[80vh] overflow-x-hidden'>
            <iframe
              src={`${pitchPacket.pdfFile.asset.url}#toolbar=0&view=FitH`}
              className='w-full h-full'
              title={pitchPacket.title}
              style={{ maxWidth: '100%' }}
            />
          </div>
          <button
            onClick={handleDownload}
            className='mt-4 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-200'
          >
            Download PDF
          </button>
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default PitchPacket;
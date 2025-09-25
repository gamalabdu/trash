
import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./styles.css";
import TextScramble from "@twistezo/react-text-scramble";
import AssetCreationGallery from "./AssetCreationGallery";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";

const AssetCreation = () => {

  const title = "Asset Creation"

  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true,
    apiVersion: "2024-01-14",
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });

  type Media = {
    title: string;
    subtitle: string;
    src: string;
    type: "photo" | "video";
  };

  const shuffleArray = (array: Media[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getPhotos = async () => {

    const assetPhotosData = await sanityClient.fetch(`
      *[_type == "assetCreationPhotos"]{
        title,
        subtitle,
        assetImage{
          asset->{
            url
          }
        },
      }
    `);  

    const photoEntries: Media[] = assetPhotosData.map((photo: any) => ({
      title: photo.title,
      subtitle: photo.subtitle,
      src: photo.assetImage.asset.url,
      type: "photo",
    }));

    return photoEntries;
  };

  const getVideos = async () => {

    const assetVideoData = await sanityClient.fetch(`
      *[_type == "assetCreationVideos"]{
        title,
        subtitle,
        assetVideo{
          asset->{
            url
          }
        },
      }
    `);
  
    const videoEntries: Media[] = assetVideoData
      .filter((video: any) => video.assetVideo && video.assetVideo.asset && video.assetVideo.asset.url)
      .map((video: any) => ({
        title: video.title,
        subtitle: video.subtitle,
        src: video.assetVideo.asset.url,
        type: "video",
      }));
  
    return videoEntries;
  };
  

  useEffect(() => {
    
    window.scrollTo(0, 0)
    
    document.title = `TRASH - ${title}`; // Update the document title

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const photos = await getPhotos();
        const videos = await getVideos();
        const combinedMedia = shuffleArray([...photos, ...videos]);
        setMedia(combinedMedia);
      } catch (err) {
        setError('Failed to load media content. Please try again later.');
        console.error('Error fetching media:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fadeOut = {
    hidden: {
      opacity: 0,
      y: 200,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
    exit: {
      opacity: 0,
      y: -200,
      transition: {
        ease: "easeInOut",
        duration: 1.6,
      },
    },
  };




  return (
    <motion.div
      className="asset-creation-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <div className="asset-creation-header">
        <motion.div 
          className="header-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1 className="main-title">Asset Creation</h1>
          <div className="subtitle">
            Let us help you make&nbsp;
            <TextScramble
              className="text-scramble"
              texts={["visuals", "cover art", "content"]}
              letterSpeed={20}
              nextLetterSpeed={50}
              pauseTime={1500}
            />
            &nbsp;for your digital identity.
          </div>
          <div className="description">
            Professional visual assets that elevate your brand and captivate your audience.
          </div>
        </motion.div>
      </div>

      <motion.section 
        className="gallery-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        {loading && (
          <div className="loading-container">
            <LoadingSpinner />
            <p className="loading-text">Loading your creative portfolio...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <p className="error-text">{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <AssetCreationGallery media={media} />
        )}
      </motion.section>
    </motion.div>
  );
};

export default AssetCreation;










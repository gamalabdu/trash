
import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import TextScramble from "@twistezo/react-text-scramble";
import DigitalGallery from "./DigitalGallery";
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";



const Digital = () => {


  const title = "Digital"

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
      *[_type == "digitalPagePhotos"]{
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
      *[_type == "digitalPageVideos"]{
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
        console.error('Error fetching media:', err);
        setError('Failed to load digital content. Please try again later.');
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




  if (loading) {
    return (
      <motion.div
        className="digital-container"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={fadeOut}
      >
        <LoadingSpinner />
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="digital-container"
        initial="hidden"
        animate="show"
        exit="exit"
        variants={fadeOut}
      >
        <div className="error-message">
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="digital-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      {/* Hero Section */}
      <div className="digital-hero">
        <div className="digital-hero-content">
          <h1 className="digital-title">
            Digital
          </h1>
          <div className="digital-subtitle">
            Let us help with &nbsp;
            <TextScramble
              className="text-scramble"
              texts={["press", "editorials", "write ups", "playlisting"]}
              letterSpeed={20}
              nextLetterSpeed={50}
              pauseTime={1500}
            />
            &nbsp;.
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="digital-services">
        <div className="services-grid">
          <motion.div 
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3>Press Coverage</h3>
            <p>Get featured in top music publications and digital platforms. We craft compelling stories that capture your artistic vision.</p>
          </motion.div>
          
          <motion.div 
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Editorial Placements</h3>
            <p>Strategic placement in influential music blogs, magazines, and online publications to amplify your reach.</p>
          </motion.div>

          <motion.div 
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3>Websites & Digital Experiences</h3>
            <p>
              We design and build custom websites and immersive digital experiences that showcase your artistry and connect you with your audience. From sleek portfolios to interactive campaigns, we bring your vision to life online.
            </p>
          </motion.div>
          
          <motion.div 
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3>Playlist Curation</h3>
            <p>Premium playlist placements across streaming platforms to maximize your music's discovery and engagement.</p>
          </motion.div>

          <motion.div 
            className="service-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <a
              href="/press"
              className="service-card-link"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer"
              }}
              aria-label="See our press and digital work"
            >
              <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
                See Our Press & Digital Highlights
                <span style={{ fontSize: "1.2em" }} aria-hidden="true">→</span>
              </h3>
              <p>
                Explore our press features, digital campaigns, and artist success stories.
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "0.5em",
                  color: "#f93b3b",
                  fontWeight: 600,
                  fontSize: "0.98em"
                }}
              >
                Click to visit our Press Page
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="digital-gallery-section">
        <motion.div 
          className="gallery-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <h2>Our Work</h2>
          <p>Explore our portfolio of successful digital campaigns and press coverage.</p>
        </motion.div>
        
        <DigitalGallery media={media} />
      </section>

    </motion.div>
  );
};

export default Digital;










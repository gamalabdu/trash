
import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "./styles.css";
import TextScramble from "@twistezo/react-text-scramble";
import OutreachGallery from "./OutreachGallery";


const Outreach = () => {


  const title = "Outreach"


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

  const getPhotos = async () => {

    const assetPhotosData = await sanityClient.fetch(`
      *[_type == "outreachAssets"]{
        title,
        subtitle,
        assetImage{
          asset->{
            url
          }
        },
      }
    `);  

const photoEntries: Media[] = assetPhotosData
  .filter((photo: any) => photo.assetImage?.asset?.url) // filter out bad/null data
  .map((photo: any) => ({
    title: photo.title,
    subtitle: photo.subtitle,
    src: photo.assetImage.asset.url,
    type: "photo",
  }));


    return photoEntries;
  };


  

  useEffect(() => {
    
    window.scrollTo(0, 0)
    
    document.title = `TRASH - ${title}`; // Update the document title

    const fetchData = async () => {
      const photos = await getPhotos();
      const combinedMedia = shuffleArray([...photos]);
      setMedia(combinedMedia);
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
      className="branding-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <div className="music-creation-top">
        <div className="step1-text">
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

      <section>

        <OutreachGallery media={media} />

      </section>

    </motion.div>
  );
};

export default Outreach;










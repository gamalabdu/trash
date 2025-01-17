import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../../ForArtist/styles.css";
import forArtistPic from "../../../assets/pictures/forartisthome.png";

const ForArtistHomePage = () => {
  type IChoice = {
    name: string;
    video: string;
    thumbnail: string;
  };

  const title = "For Artists";

  const [loadedData, setLoadedData] = useState<IChoice[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [isLoaded, setIsLoaded] = useState(false);

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);







  // const getUrlName = (itemName: string) => {

  //   console.log(itemName)

  //   let urlName;

  //   if (itemName === "Music Creation") {
  //     urlName = "music_creation";
  //   } else if (itemName === "Branding") {
  //     urlName = "branding";
  //   } else if (itemName === "Asset Creation") {
  //     urlName = "asset_creation";
  //   } else if (itemName === "Outreach") {
  //     urlName = "outreach";
  //   } else if (itemName === "Digital") {
  //     urlName = "digital";
  //   } else if (itemName === "Artist Development") {
  //     urlName = "artist_development";
  //   }

  //   return urlName;
  // };




  const getUrlName = (itemName: string) => {

    let urlName;
  
    // Standardize the comparison by trimming and converting to lowercase
    const cleanedItemName = itemName.trim().toLowerCase();
  
    if (cleanedItemName === "music creation") {
      urlName = "music_creation";
    } else if (cleanedItemName === "branding") {
      urlName = "branding";
    } else if (cleanedItemName === "asset creation") {
      urlName = "asset_creation";
    } else if (cleanedItemName === "outreach") {
      urlName = "outreach";
    } else if (cleanedItemName === "digital") {
      urlName = "digital";
    } else if (cleanedItemName === "artist development") {
      urlName = "artist_development";
    } else {
      console.warn(`No matching URL for item name: '${cleanedItemName}'`);
      urlName = ""; // Or a default value if needed
    }
  
    return urlName;
  };
  






  const sanityClient = createClient({
    projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
    dataset: process.env.REACT_APP_SANITY_DATASET,
    useCdn: true, // set to `false` to bypass the edge cache
    apiVersion: "2024-01-14", // use current date (YYYY-MM-DD) to target the latest API version
    token: process.env.REACT_APP_SANITY_TOKEN,
    ignoreBrowserTokenWarning: true,
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    document.title = `TRASH - ${title}`; // Update the document title

    const fetchData = async () => {
      const worksData = await sanityClient
        .fetch(
          `
                      *[_type == "forartist"]{
                        name,
                        forArtistThumbnail{
                            asset->{
                                url
                            }
                        },
              forArtistVideo{
                asset-> {
                  url
                }
              }
            }
                    `
        )
        .then((data) => {
          let myChoiceData = data;

          let choiceEntries: IChoice[] = myChoiceData.map((choice: any) => ({
            name: choice.name,
            video: choice.forArtistVideo.asset.url,
            thumbnail: choice.forArtistThumbnail.asset.url,
          }));

          choiceEntries.sort((a, b) => {
            if (a.name === "Music Creation") return -1;
            if (b.name === "Music Creation") return 1;
            if (a.name === "Asset Creation") return -1;
            if (b.name === "Asset Creation") return 1;
            return 0;
          });

          setLoadedData(choiceEntries);
        });

      setIsLoading(false);
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

  const videoRefs = useRef<Array<HTMLVideoElement | null>>(
    loadedData.map(() => null)
  );

  const onHover = (idx: number) => {
    setHoveredIndex(idx);
  };

  const onLeave = () => {
    setHoveredIndex(null);
  };

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (video && video.paused && isLoaded) {
        if (index === hoveredIndex) {
          setTimeout(() => video.play(), 500);
        } else {
          video.pause();
          video.currentTime = 0; // Reset the video to the beginning
        }
      }
    });
  }, [hoveredIndex]);

  return (
    <motion.div
      className="for-artist-container"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <section style={{ display: "flex" }} className="top-container2">
        <div className="artist-text"> TRASH FOR ARTIST </div>
        <img className="trippie2" src={forArtistPic} alt="trippie" />
      </section>

      {isLoading ? (
        <motion.div
          className="loading"
          initial={{ opacity: 0 }} // Initial state: transparent
          animate={{ opacity: 1 }} // Animation state: fully visible
          exit={{ opacity: 0 }} // Exit state: transparent
          transition={{ duration: 0.5 }} // Transition for fade in/out
        >
          <motion.div className="loading-icon">
            <div className="simple-spinner">
              <span></span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <div className="works">
          {loadedData.map((item, idx) => {

            const isHovered = hoveredIndex === idx;

            let urlName = getUrlName(item.name);

            return (
              <div
                className="video-container-2"
                aria-disabled={isLoaded}
                onMouseEnter={() => onHover(idx)}
                onMouseLeave={onLeave}
                key={idx}
              >
                <Link key={idx} to={`/for-artists/${urlName}`} state={{ item }}>
                  <video
                    ref={(video) => (videoRefs.current[idx] = video)}
                    className={`box-video ${isHovered ? "visible" : ""}`}
                    src={item.video}
                    loop={true}
                    preload="auto"
                    muted
                    onLoadedData={() => setIsLoaded(true)}
                  />

                  <img
                    className="box-thumbnail"
                    src={item.thumbnail}
                    alt={item.name}
                  />

                  <div className="text-overlay">{item.name}</div>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default ForArtistHomePage;

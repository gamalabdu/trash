import { createClient } from "@sanity/client";
import { motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import forArtistPic from "../../../assets/pictures/forartisthome.png";

const ForArtists = () => {
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

          let choiceEntries: IChoice[] = myChoiceData.map((choice: any) => {
            const baseImageUrl = choice.forArtistThumbnail.asset.url;
            const imageSeparator = baseImageUrl.includes('?') ? '&' : '?';
            const transformedImageUrl = baseImageUrl + imageSeparator + 'w=1920&h=1080&fit=crop&crop=center';
                
            return {
              name: choice.name,
              video: choice.forArtistVideo.asset.url,
              thumbnail: transformedImageUrl,
            };
          });

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
      className="bg-[#1b1c1e] text-[#F0EEF0] w-full min-h-[100dvh] overflow-visible"
      initial="hidden"
      animate="show"
      exit="exit"
      variants={fadeOut}
    >
      <section className="relative h-[30vh] min-h-[250px] max-h-[350px] overflow-hidden flex items-center justify-center w-full m-0 p-0 xl:h-[25vh] xl:min-h-[200px] xl:max-h-[300px] lg:h-[28vh] lg:min-h-[220px] lg:max-h-[320px] md:h-[30vh] md:min-h-[240px] md:max-h-[350px] sm:h-[30vh] sm:min-h-[200px] sm:max-h-[300px] max-[480px]:h-[25vh] max-[480px]:min-h-[180px] max-[480px]:max-h-[250px]">
        <div className="absolute top-0 left-0 right-0 bottom-0 w-full h-full m-0 p-0">
          <img className="absolute top-0 left-0 w-full h-full object-cover object-center grayscale brightness-[0.4] transition-[0.4s_cubic-bezier(0.25,0.46,0.45,0.94)] m-0 p-0" src={forArtistPic} alt="For Artists - Creative Professional Services" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-[2] w-full max-w-[1000px] px-8">
            <h1 className="font-[400] text-white mb-4 tracking-[0.05em] leading-[0.9] xl:mb-3 max-[480px]:mb-4" style={{fontFamily: 'var(--font-primary)', fontSize: 'clamp(3rem, 8vw, 6rem)'}}>TRASH FOR ARTIST</h1>
            <p className="font-[300] text-white/80 tracking-[0.2em] uppercase opacity-90 xl:text-[clamp(1rem,2vw,1.3rem)] max-[480px]:text-[clamp(0.9rem,4vw,1.2rem)]" style={{fontFamily: 'var(--font-secondary)', fontSize: 'clamp(1rem, 2.5vw, 1.5rem)'}}>Creative Professional Services</p>
          </div>
        </div>
      </section>

      {isLoading ? (
        <motion.div
          className="min-h-[50vh] text-white flex flex-col items-center justify-center bg-[#1b1c1e] py-16"
          initial={{ opacity: 0 }} // Initial state: transparent
          animate={{ opacity: 1 }} // Animation state: fully visible
          exit={{ opacity: 0 }} // Exit state: transparent
          transition={{ duration: 0.5 }} // Transition for fade in/out
        >
          <motion.div>
            <div className="w-[60px] h-[60px] relative flex justify-center items-center">
              <span className="block w-[40px] h-[40px] border-[3px] border-transparent rounded-full border-r-[#f93b3b] animate-spin"></span>
            </div>
          </motion.div>
        </motion.div>
      ) : (
        <section className="pb-12 bg-[#1b1c1e] w-full min-h-auto overflow-visible xl:pb-16 lg:pb-4 md:pb-4 sm:pb-4 max-[480px]:pb-16">
          <div className="max-w-full h-auto m-0 p-0 overflow-visible">
            <div className="grid grid-cols-2 w-full h-auto gap-0 rounded-none min-h-fit max-[767px]:grid-cols-1">
              {loadedData.map((item, idx) => {

                const isHovered = hoveredIndex === idx;
                const isBrandingDisabled = item.name.toLowerCase().trim() === "branding";

                let urlName = getUrlName(item.name);

                return (
                  <article
                    className={`relative bg-black w-full aspect-video overflow-hidden rounded-none group ${isBrandingDisabled ? 'cursor-not-allowed' : ''}`}
                    aria-disabled={isLoaded}
                    onMouseEnter={() => onHover(idx)}
                    onMouseLeave={onLeave}
                    key={idx}
                  >
                    {isBrandingDisabled ? (
                      <div 
                        className="block text-inherit no-underline w-full h-full cursor-not-allowed"
                        aria-label={`${item.name} services - Coming Soon`}
                        onClick={(e) => e.preventDefault()}
                      >
                        <div className="relative w-full h-full overflow-hidden bg-black rounded-none min-h-0">
                          <video
                            ref={(video) => (videoRefs.current[idx] = video)}
                            className={`absolute top-0 left-0 w-full h-full object-cover object-center transition-all duration-[600ms] cubic-bezier(0.25,0.46,0.45,0.94) grayscale-[20%] brightness-90 transform scale-105 rounded-none ${isHovered ? "opacity-100 scale-100" : "opacity-0"}`}
                            src={item.video}
                            loop={true}
                            preload="auto"
                            muted
                            onLoadedData={() => setIsLoaded(true)}
                          />

                          <img
                            className="w-full h-full object-cover object-center transition-all duration-[600ms] cubic-bezier(0.25,0.46,0.45,0.94) grayscale-[80%] brightness-[0.7] transform scale-100 rounded-none block group-hover:opacity-0 group-hover:scale-110 group-hover:grayscale group-hover:brightness-[0.3]"
                            src={item.thumbnail}
                            alt={`${item.name} service preview`}
                          />

                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-black/20 to-black/70 flex flex-col items-center justify-center text-center p-12 transition-all duration-[400ms] ease-in-out box-border z-[2] group-hover:bg-gradient-to-br group-hover:from-black/30 group-hover:via-black/10 group-hover:to-black/40 group-focus-visible:bg-gradient-to-br group-focus-visible:from-[#f93b3b]/30 group-focus-visible:via-[#f93b3b]/10 group-focus-visible:to-[#f93b3b]/40 md:p-8 max-[767px]:p-6 max-[480px]:p-4">
                            <h3 className="font-[400] text-[#7a7a7a] m-0 mb-6 tracking-[0.02em] transition-all duration-[400ms] ease-in-out leading-[0.9] flex-[0_0_auto] group-hover:transform group-hover:-translate-y-[15px] md:text-[clamp(2rem,2vw,2rem)] md:mb-4 max-[767px]:text-[clamp(1.8rem,4vw,2rem)] max-[767px]:mb-4 max-[480px]:text-[clamp(1.5rem,4vw,2rem)]" style={{fontFamily: 'var(--font-primary)', fontSize: 'clamp(2.5rem, 2vw, 2rem)'}}>{item.name}</h3>
                            <div className="opacity-0 transform translate-y-[30px] transition-all duration-[400ms] cubic-bezier(0.25,0.46,0.45,0.94) pointer-events-none flex-[0_0_auto] group-hover:opacity-100 group-hover:transform group-hover:translate-y-0 max-[767px]:opacity-100 max-[767px]:transform max-[767px]:translate-y-0">
                              <span className="font-[600] text-white uppercase tracking-[0.2em] py-4 px-8 border-2 border-white rounded-none bg-transparent backdrop-blur-[10px] transition-all duration-300 ease-in-out inline-block group-hover:bg-white/10 group-hover:border-white/80 group-hover:transform group-hover:-translate-y-[2px] max-[767px]:text-[0.9rem] max-[767px]:py-[0.8rem] max-[767px]:px-6 max-[767px]:tracking-[0.1em] max-[767px]:rounded-none" style={{fontFamily: 'var(--font-secondary)', fontSize: '1rem'}}>Coming Soon</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link 
                        to={`/for-artists/${urlName}`} 
                        state={{ item }}
                        className="block text-inherit no-underline w-full h-full focus-visible:outline-4 focus-visible:outline-[#f93b3b] focus-visible:outline-offset-[-4px]"
                        aria-label={`Learn more about ${item.name} services`}
                      >
                        <div className="relative w-full h-full overflow-hidden bg-black rounded-none min-h-0">
                          <video
                            ref={(video) => (videoRefs.current[idx] = video)}
                            className={`absolute top-0 left-0 w-full h-full object-cover object-center transition-all duration-[600ms] cubic-bezier(0.25,0.46,0.45,0.94) grayscale-[20%] brightness-90 transform scale-105 rounded-none ${isHovered ? "opacity-100 scale-100" : "opacity-0"}`}
                            src={item.video}
                            loop={true}
                            preload="auto"
                            muted
                            onLoadedData={() => setIsLoaded(true)}
                          />

                          <img
                            className="w-full h-full object-cover object-center transition-all duration-[600ms] cubic-bezier(0.25,0.46,0.45,0.94) grayscale-[80%] brightness-[0.7] transform scale-100 rounded-none block group-hover:opacity-0 group-hover:scale-110 group-hover:grayscale group-hover:brightness-[0.3]"
                            src={item.thumbnail}
                            alt={`${item.name} service preview`}
                          />

                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black/60 via-black/20 to-black/70 flex flex-col items-center justify-center text-center p-12 transition-all duration-[400ms] ease-in-out box-border z-[2] group-hover:bg-gradient-to-br group-hover:from-black/30 group-hover:via-black/10 group-hover:to-black/40 group-focus-visible:bg-gradient-to-br group-focus-visible:from-[#f93b3b]/30 group-focus-visible:via-[#f93b3b]/10 group-focus-visible:to-[#f93b3b]/40 md:p-8 max-[767px]:p-6 max-[480px]:p-4">
                            <h3 className="font-[400] text-[#7a7a7a] m-0 mb-6 tracking-[0.02em] transition-all duration-[400ms] ease-in-out leading-[0.9] flex-[0_0_auto] group-hover:transform group-hover:-translate-y-[15px] md:text-[clamp(2rem,2vw,2rem)] md:mb-4 max-[767px]:text-[clamp(1.8rem,4vw,2rem)] max-[767px]:mb-4 max-[480px]:text-[clamp(1.5rem,4vw,2rem)]" style={{fontFamily: 'var(--font-primary)', fontSize: 'clamp(2.5rem, 2vw, 2rem)'}}>{item.name}</h3>
                            <div className="opacity-0 transform translate-y-[30px] transition-all duration-[400ms] cubic-bezier(0.25,0.46,0.45,0.94) pointer-events-none flex-[0_0_auto] group-hover:opacity-100 group-hover:transform group-hover:translate-y-0 max-[767px]:opacity-100 max-[767px]:transform max-[767px]:translate-y-0">
                              <span className="font-[600] text-white uppercase tracking-[0.2em] py-4 px-8 border-2 border-white rounded-none bg-transparent backdrop-blur-[10px] transition-all duration-300 ease-in-out inline-block group-hover:bg-white/10 group-hover:border-white/80 group-hover:transform group-hover:-translate-y-[2px] max-[767px]:text-[0.9rem] max-[767px]:py-[0.8rem] max-[767px]:px-6 max-[767px]:tracking-[0.1em] max-[767px]:rounded-none" style={{fontFamily: 'var(--font-secondary)', fontSize: '1rem'}}>Explore</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
};

export default ForArtists;

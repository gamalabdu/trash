import { createClient } from '@sanity/client'
import { motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const ForArtistHomePage = () => {


    type IChoice = {
        name: string,
        video: string,
        thumbnail: string
      }
    
    
    
      const title = 'For Artist2';
    
    
      const [loadedData, setLoadedData] = useState< IChoice[]> ([])
    
      const [isLoading, setIsLoading] = useState(true)
    
      const [isLoaded, setIsLoaded] = useState(false)
    
      const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
    
    
    
    
      type ScrambleText = string;
      type ScrambleTexts = ScrambleText[];
    
      type TextScrambleProps = {
        texts: ScrambleTexts;
        className?: string;
        letterSpeed?: number; // [ms]
        nextLetterSpeed?: number; // [ms]
        paused?: boolean;
        pauseTime?: number; // [ms]
      };
    
      const scrambleTexts: ScrambleTexts = ['produce', 'mix', 'master', 'write'];
    
      useEffect(() => {
        window.scrollTo(0, 0);
      }, []);
    
    
    
      const sanityClient = createClient({
            projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
            dataset: process.env.REACT_APP_SANITY_DATASET,
            useCdn: true, // set to `false` to bypass the edge cache
            apiVersion: '2024-01-14', // use current date (YYYY-MM-DD) to target the latest API version
            token: process.env.REACT_APP_SANITY_TOKEN,
            ignoreBrowserTokenWarning: true
          })
    
    
        useEffect(() => {
    
            window.scrollTo(0, 0)
    
            document.title = `TRASH - ${title}`; // Update the document title
    
            const fetchData = async () => {
    
    
                const worksData = await sanityClient.fetch(`
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
                    `)
            .then( (data) => {
    
              let myChoiceData = data
    
              let choiceEntries: IChoice[] = myChoiceData.map((choice: any) => ({
    
                name: choice.name,
                video: choice.forArtistVideo.asset.url,
                thumbnail: choice.forArtistThumbnail.asset.url
      
              }))
      
              setLoadedData(choiceEntries);
    
            })
    
    
    
                setIsLoading(false);
    
            }
    
            fetchData()
    
        }, [])
    
    
    
    
    
      const fadeOut = {
        hidden: {
          opacity: 0,
          y: 200,
        },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            ease: 'easeInOut',
            duration: 1.6,
          },
        },
        exit: {
          opacity: 0,
          y: -200,
          transition: {
            ease: 'easeInOut',
            duration: 1.6,
          },
        },
      };
    
      const videoRefs = useRef<Array<HTMLVideoElement | null>>(
        loadedData.map(() => null)
    )
    
    
    
    const onHover = (idx: number) => {
        setHoveredIndex(idx)
    }
    
    const onLeave = () => {
        setHoveredIndex(null)
    }
    
    
    useEffect(() => {
    
        videoRefs.current.forEach((video, index) => {
    
            if (video && video.paused && isLoaded) {
    
                if (index === hoveredIndex) {
    
                    setTimeout(() => video.play(), 500)
    
                } else {
    
                    video.pause()
                    video.currentTime = 0 // Reset the video to the beginning
    
                }
    
            }
    
        })
    
    }, [hoveredIndex])






  return (



    <motion.div
    className='for-artist-container'
    initial='hidden'
    animate='show'
    exit='exit'
    variants={fadeOut}
  >


    <section style={{ display: 'flex' }} className='top-container2'>

      <div className='artist-text'> TRASH FOR ARTIST </div>
      <img
        className='trippie2'
        src={'https://newenglandsounds.com/wp-content/uploads/2022/09/sabrina15-scaled.jpg'}
        alt='trippie'
      />
    </section>



{
              isLoading ? (
                  <motion.div
                      className='loading'
                      initial={{ opacity: 0 }} // Initial state: transparent
                      animate={{ opacity: 1 }} // Animation state: fully visible
                      exit={{ opacity: 0 }} // Exit state: transparent
                      transition={{ duration: 0.5 }} // Transition for fade in/out
                  >
                      <motion.div className='loading-icon'>
                          <div className='simple-spinner'>
                              <span></span>
                          </div>
                      </motion.div>
                  </motion.div>
              ) : (
                  <div className='works'>
                      {
                      
                      loadedData.map((item, idx) => {

                          const isHovered = hoveredIndex === idx

                          return (

                            <div
                                  className='video-container-2'
                                  aria-disabled={isLoaded}
                                  onMouseEnter={() => onHover(idx)}
                                  onMouseLeave={onLeave}
                                  key={idx}>

                                  <Link key={idx} to={`/for-artists/music_creation`} state={{ item }}>

                                      <video
                                          ref={(video) => (videoRefs.current[idx] = video)}
                                          className={`box-video ${isHovered ? 'visible' : ''}`}
                                          src={item.video}
                                          loop={true}
                                          preload='auto'
                                          muted
                                          onLoadedData={() => setIsLoaded(true)}
                                      />

                                      <img
                                          className='box-thumbnail'
                                          src={item.thumbnail}
                                          alt={item.name}
                                      />

                  <div
                    className='text-overlay'>
                    {item.name}
                  </div>
                 
                                  </Link>
                </div>

                          )
                      })}
                  </div>
              )}
    


  </motion.div>
  
  )
}

export default ForArtistHomePage
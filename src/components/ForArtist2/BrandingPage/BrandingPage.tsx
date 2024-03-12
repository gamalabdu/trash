import { createClient } from '@sanity/client';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react'
import './styles.css'
import TextScramble from '@twistezo/react-text-scramble';

const BrandingPage = () => {


    const scrambleTexts = ["Brand", "Market", "Position"];

    const sanityClient = createClient({
        projectId: process.env.REACT_APP_SANITY_PROJECT_ID,
        dataset: process.env.REACT_APP_SANITY_DATASET,
        useCdn: true, // set to `false` to bypass the edge cache
        apiVersion: "2024-01-14", // use current date (YYYY-MM-DD) to target the latest API version
        token: process.env.REACT_APP_SANITY_TOKEN,
        ignoreBrowserTokenWarning: true,
      });
    
      type Video = {
        title: string,
        video: string
      }


      const [ videos , setVideos ] = useState<Video[]>([])


    const getBrandingVideos = async () => {

        await sanityClient.fetch(`
        *[_type == "brandingPage"]{
        title,
        videos[]{
            asset->{
              url
            }
        },
        link
      }
      `)
      .then((videoData) => {
    
        let videoDataTemp = videoData;
  
          let videoEntries: Video[] = videoDataTemp.map((video: any) => ({
            title: video.title,
            video: video.videos.map((v: any) => v.asset.url)
          }));
    
          setVideos(videoEntries);
    
      })
    
      }


      useEffect(() => {

        getBrandingVideos()
        
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
          Let us help you &nbsp;
          <TextScramble
            className="text-scramble"
            texts={scrambleTexts}
            letterSpeed={20}
            nextLetterSpeed={50}
            pauseTime={1500}
          />
          &nbsp; your company.
        </div>
      </div>


        <div className='branding-videos-container'>

            {
                videos.map((video, idx) => {
                    return ( 
                    <div key={idx} className='branding-video-container'>
                        <video width="500"  src={ video.video } draggable={false} controls={true} autoPlay={true} loop={true} />
                    </div>
                )
                })
            }


        </div>
    


    
  </motion.div>
  )
}

export default BrandingPage
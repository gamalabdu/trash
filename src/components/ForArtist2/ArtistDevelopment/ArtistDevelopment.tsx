import { motion } from 'framer-motion';
import React from 'react'

const ArtistDevelopment = () => {





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
    className="music-creation-container"
    initial="hidden"
    animate="show"
    exit="exit"
    variants={fadeOut}
  > 
  
  </motion.div>


  )

}

export default ArtistDevelopment
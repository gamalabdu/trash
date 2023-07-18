import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './styles.css'
import GalleryItem from './GalleryItem/GalleryItem'
import { Link } from 'react-router-dom'



interface IGalleryProps {
    categories: string[] 
    data: {
        image: string
        type: string[]
        name: string
        videos: string[]
        images? : string[]
        iphone: boolean
        assets? : string[]
        canvas?: string[]
    }[]
}

const Gallery = (props : IGalleryProps) => {


  const { categories, data } = props

  const [galleryData, setGalleryData ] = useState(data)

  useEffect(() => {
    setGalleryData(data);
  }, [data]);

  return (
    <motion.div
    layout
    className='gallery-container'>
        <AnimatePresence>
        {
          galleryData.map((item, i) => (

            <Link key={i} to='/innerworks' state={{ item }} >
              <GalleryItem item={item} />
            </Link>

        ))}
        </AnimatePresence>
    </motion.div>
  )
}

export default Gallery
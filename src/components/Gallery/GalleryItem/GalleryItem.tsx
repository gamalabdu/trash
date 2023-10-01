import React from 'react'
import { motion } from 'framer-motion'
import './styles.css'


interface IGalleryItemProps {
	item: {
		image: string
		type: string[]
		name: string
    videos: string[]
    images: string[]
    iphone: boolean
    assets: string[]
    canvas: string[]
    artworks: string[]
	}
}

const GalleryItem = (props : IGalleryItemProps) => {

    const { item } = props


  return (
    <motion.div
    initial={{opacity: 0}}
    animate={{ opacity: 1}}
    exit={{ opacity: 0 }}
    className='image-container'
    >
        <img id='artistImg' className='gallery-image' src={item.image} alt='pic' loading='lazy' />
        <div className='gallery-item-title'>
          <span id='type' style={{ color:"#535353"}}>{ item.type.map(type => type ).join('/') }</span>
          <br/>
          <span>
            {item.name}
          </span>
        </div>
    </motion.div>
  )
}

export default GalleryItem
import React from 'react'
import { motion } from 'framer-motion'
import './styles.css'
import { IWork } from '../../../models/IWork'


interface IGalleryItemProps {
	item: IWork
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
        <img id='artistImg' className='gallery-image' src={item.image.asset.url} alt='pic' loading='lazy' />
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
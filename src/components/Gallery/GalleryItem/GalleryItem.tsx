import React from 'react'
import { motion } from 'framer-motion'
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
    className='relative p-5 flex flex-col items-center'
    >
        <img id='artistImg' className='mb-4 w-[50vmin] h-[27vh] m-[5px] object-cover scale-100 transition-all duration-300 ease-in-out cursor-pointer opacity-90 hover:scale-105 hover:opacity-100 max-[800px]:w-[80vw] max-[800px]:max-w-[400px] max-[800px]:h-auto max-[800px]:aspect-video max-[800px]:mx-auto max-[800px]:my-[5px] max-[375px]:max-w-[300px]' src={item.image.asset.url} alt='pic' loading='lazy' />
        <div className='text-[1.5vh] text-black p-[5px] text-center max-[800px]:text-[2.5vw]'>
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
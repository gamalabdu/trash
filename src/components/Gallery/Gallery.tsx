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
		images: string[]
		iphone: boolean
		assets: string[]
		canvas: string[]
	}[]
}

const Gallery = (props: IGalleryProps) => {
	
	const { data } = props

	return (
		<div className='gallery-container'>
			<AnimatePresence>
				{data.map((item, i) => (
					<Link key={i} to='/innerworks' state={{ item }}>
						<motion.div layout>
							<GalleryItem item={item} />
						</motion.div>
					</Link>
				))}
			</AnimatePresence>
		</div>
	)
}

export default Gallery


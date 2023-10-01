import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
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
		artworks: string[]
	}[]
}



const Gallery = (props: IGalleryProps) => {
	
	const { data } = props

	return (
		<AnimatePresence>
			<LayoutGroup>
			<motion.div
				className='gallery-container'
				key={'gallery-container'}
				// initial={{ opacity: 0 }}
				// animate={{ opacity: 1 }}
				// exit={{ opacity: 0 }}
			    // layout
				>
				{
				data.map((item, i) => (
					<Link key={i} to='/innerworks' state={{ item }}>
						<motion.div
							key={i}
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							layout
							>
							<GalleryItem item={item} />
						</motion.div>
					</Link>
				))}
			</motion.div>
			</LayoutGroup>
		</AnimatePresence>
	)
}

export default Gallery


import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import './styles.css'
import GalleryItem from './GalleryItem/GalleryItem'
import { Link } from 'react-router-dom'
import { IWork } from '../../models/IWork'

interface IGalleryProps {
	categories: string[]
	data: IWork[]
}



const Gallery = (props: IGalleryProps) => {
	
	const { data } = props

	// console.log(data)

	return (
		<AnimatePresence>
			<LayoutGroup>
			<motion.div
				className='gallery-container'
				key={'gallery-container'}
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


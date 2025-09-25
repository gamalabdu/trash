import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
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
				className='flex flex-wrap justify-center gap-x-4 gap-y-10 p-[5%] w-full max-[800px]:flex-col max-[800px]:text-center'
				key={'gallery-container'}
				>
				{
				data.map((item, i) => (
					<Link key={i} to={`/works/${item.slug}`}>
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


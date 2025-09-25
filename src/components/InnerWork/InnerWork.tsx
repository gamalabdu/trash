import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import IPhone from '../IPhone/IPhone'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import { motion } from 'framer-motion'
import { IWork } from '../../models/IWork'
import { useWorks } from '../../context/WorksContext'
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'
import VideoPlayer from '../VideoPlayer/VideoPlayer'
import { useVideoPreloader } from '../../hooks/useVideoPreloader'

const InnerWork = () => {
	const { slug } = useParams<{ slug: string }>()
	const navigate = useNavigate()
	const { getWorkBySlug, loading } = useWorks()
	const [selectedWork, setSelectedWork] = useState<IWork | undefined>()

	const fadeOut = {
		hidden: {
          	opacity: 0,
	        y: 200,
		},
		show : {
      		opacity: 1,
			y: 0,
			transition: {
				ease : 'easeInOut',
				duration: 1.6,
			}
		},
		exit : {
            opacity: 0,
			y: -200,
			transition : {
				ease : 'easeInOut',
				duration: 1.6,
			}
		}
	}

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	useEffect(() => {
		if (slug) {
			const work = getWorkBySlug(slug)
			setSelectedWork(work)
			
			// Update document title
			if (work) {
				document.title = `TRASH - ${work.name}`
			}
		}
	}, [slug, getWorkBySlug])

	// Preload videos for better performance
	const videoUrls = selectedWork 
		? [
			...(selectedWork.videos?.map(v => v.asset.url) || []),
			...(selectedWork.canvas?.map(c => c.asset.url) || [])
		  ].filter(Boolean)
		: [];
	
	const { isLoaded: videosPreloaded, error: preloadError } = useVideoPreloader(videoUrls);

	// Log preload status for debugging
	useEffect(() => {
		if (videosPreloaded && videoUrls.length > 0) {
			console.log(`✅ All ${videoUrls.length} videos preloaded successfully`);
		}
		if (preloadError) {
			console.warn('⚠️ Video preload error:', preloadError);
		}
	}, [videosPreloaded, preloadError, videoUrls.length]);

	const backToWork = () => {
		navigate('/works')
	}

	// Show loading spinner while context is loading
	if (loading) {
		return (
			<motion.div 
				className='min-h-screen bg-stone-100 flex flex-col justify-center items-center'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}>
				<LoadingSpinner />
			</motion.div>
		)
	}

	// Show error if work not found
	if (!loading && (!slug || !selectedWork)) {
		return (
			<motion.div 
				className='min-h-screen bg-stone-100 flex flex-col justify-center items-center'
				initial='hidden'
				animate='show'
				exit='exit'
				variants={fadeOut}>
				<div className='text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4'>
					<h2 className='text-2xl font-bold text-gray-900 mb-4'>Work not found</h2>
					<p className='text-gray-600 mb-6'>The work you're looking for doesn't exist or has been removed.</p>
					<button 
						onClick={backToWork}
						className='bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium'
					>
						Back to Works
					</button>
				</div>
			</motion.div>
		)
	}

	return (
		<motion.div 
			className='min-h-screen bg-stone-100'
			initial='hidden'
			animate='show'
			exit='exit'
			variants={fadeOut}
		>
			{/* Header with Back Button */}
			<div className="w-full px-6 pt-8 pb-4">
				<button
					onClick={backToWork}
					className="text-black text-lg md:text-xl lg:text-2xl font-medium hover:text-gray-600 transition-colors cursor-pointer ml-auto block"
				>
					← Back
				</button>
			</div>

			{/* Main Content Container */}
			<div className="max-w-7xl mx-auto px-6 pb-12">
				
				{/* Project Title */}
				<div className="text-center mb-12">
					<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-8">
						{selectedWork!.name}
					</h1>
				</div>

				{/* Hero Image/Assets Section */}
				<div className="mb-16">
					{selectedWork!.assets ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{selectedWork!.assets.map((asset, idx) => (
								<div key={idx} className="rounded-lg overflow-hidden shadow-lg">
									<img 
										className="w-full h-64 md:h-80 object-cover hover:scale-105 transition-transform duration-300" 
										src={asset.asset.url} 
										alt={`Asset ${idx + 1}`} 
										loading='lazy' 
									/>
								</div>
							))}
						</div>
					) : (
						<div className="rounded-lg overflow-hidden shadow-lg mb-8">
							<img
								className="w-full h-64 md:h-96 object-cover"
								loading="lazy"
								alt={selectedWork!.name}
								src={selectedWork!.image.asset.url}
							/>
						</div>
					)}
				</div>

				{/* Project Statement */}
				{selectedWork!.statement && (
					<div className="max-w-4xl mx-auto text-center mb-16">
						<p className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
							{selectedWork!.statement}
						</p>
					</div>
				)}

				{/* Videos Section */}
				{selectedWork!.videos && selectedWork!.videos.length > 0 && (
					<div className="mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">Videos</h2>
						<div className="space-y-8">
							{selectedWork!.videos.map((video, idx) => (
								<div key={idx} className="max-w-5xl mx-auto">
									<VideoPlayer
										src={video.asset.url ?? ""}
										className="w-full rounded-lg shadow-lg overflow-hidden"
										preload="auto"
										autoPlay={true}
										loop={true}
										muted={true}
										playsInline={true}
										noBorder={false}
										onLoadStart={() => console.log(`Video ${idx + 1} started loading`)}
										onLoadedData={() => console.log(`Video ${idx + 1} loaded successfully`)}
										onError={(error) => console.error(`Video ${idx + 1} error:`, error)}
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Image Gallery Section */}
				{selectedWork!.images && (
					<div className="mb-16">
						{selectedWork!.iphone ? (
							<div className="max-w-2xl mx-auto">
								<IPhone images={selectedWork!.images} />
							</div>
						) : (
							<div className="max-w-4xl mx-auto">
								<h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">Gallery</h2>
								<div className="bg-white rounded-lg shadow-lg overflow-hidden">
									<Swiper
										modules={[Navigation]}
										spaceBetween={0}
										slidesPerView={1}
										navigation={true}
										className="aspect-video [&_.swiper-button-next]:text-black [&_.swiper-button-prev]:text-black"
									>
										{selectedWork!.images.map((photo, idx) => (
											<SwiperSlide key={idx}>
												<img 
													className="w-full h-full object-cover" 
													src={photo.asset.url ?? ""} 
													alt={`Gallery image ${idx + 1}`} 
												/>
											</SwiperSlide>
										))}
									</Swiper>
								</div>
							</div>
						)}
					</div>
				)}

				{/* Artworks Section */}
				{selectedWork!.artworks && (
					<div className="mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">Artworks</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
							{selectedWork!.artworks.map((artwork, key) => (
								<div key={key} className="rounded-lg overflow-hidden shadow-lg">
									<img 
										className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" 
										loading='lazy' 
										src={artwork.asset.url} 
										alt={`Artwork ${key + 1}`}
									/>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Canvas Section */}
				{selectedWork!.canvas && (
					<div className="mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-black text-center mb-8">Canvas</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
							{selectedWork!.canvas.map((canva, idx) => (
								<div key={idx} className="aspect-[9/16] rounded-lg overflow-hidden shadow-lg">
									<VideoPlayer
										src={canva.asset.url ?? ""}
										className="w-full h-full"
										preload="auto"
										autoPlay={true}
										loop={true}
										muted={true}
										playsInline={true}
										noBorder={true}
										onLoadStart={() => console.log(`Canvas video ${idx + 1} started loading`)}
										onLoadedData={() => console.log(`Canvas video ${idx + 1} loaded successfully`)}
										onError={(error) => console.error(`Canvas video ${idx + 1} error:`, error)}
									/>
								</div>
							))}
						</div>
					</div>
				)}

			</div>
		</motion.div>
	)
}

export default InnerWork
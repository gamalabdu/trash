import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import IPhone from '../IPhone/IPhone'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import './styles.css'
import {motion} from 'framer-motion'

const InnerWork = () => {
	
	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const location = useLocation()
	const state = location.state

	const navigate = useNavigate()

	const backToWork = () => {
		navigate('/works')
	}

	const videos = [...state.item.videos]

	const images = [...state.item.images]

	const artworks = [...state.item.artworks]

	const iphone = state.item.iphone

	let assets: string[] = []

	let canvas: string[] = []

	if (state.item.assets) {
		assets = [...state.item.assets]
	}

	if (state.item.canvas) {
		canvas = [...state.item.canvas]
	}




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






	return (
		<motion.div className='inner-work-container'
		initial='hidden'
		animate='show'
		exit='exit'
		variants={fadeOut}
		>
			<div
				style={{
					width: '100%',
					color: 'black',
					textAlign: 'right',
					fontSize: '3vw',
					marginTop: '24px',
					marginLeft: '-30px',
					cursor: 'pointer',
				}}
				onClick={() => backToWork()}>
				{' '}
				Back{' '}
			</div>
			<div className='inner-work-main'>
				<div style={{ color: 'black', fontSize: '5vw' }}>
					{' '}
					{state.item.name}{' '}
				</div>
				{assets.length > 0 ? (
					<div className='assets'>
						{assets.map((asset, idx) => {
							return <img key={idx} className='asset' src={asset} alt='asset' loading='lazy' />
						})}
					</div>
				) : (
					<img
						style={{ width: '100%', height: '400px', objectFit: 'cover' }}
						alt='alt-idk'
						src={state.item.image}
					/>
				)}
				<div style={{ color: 'black', textAlign: 'center', padding: '5%' }}>
					{' '}
					{state.item.statement}{' '}
				</div>

				<div
					style={{
						height: '100%',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
					}}>
					{videos &&
						videos.map((video, idx) => {
							return (
								<video
									key={idx}
									style={{ width: '90%', padding: '2%' }}
									src={video}
									loop
									autoPlay
									muted
									playsInline
								/>
							)
						})}
				</div>
				{iphone ? (
					<IPhone images={images} />
				) : !iphone && images.length > 0 ? (
					<div>
						<div className='inner-work-gallery'>
							<Swiper
								modules={[Navigation]}
								spaceBetween={100}
								slidesPerView={1}
								navigation={true}
								className='mySwiper'>
								{images.map((photo, idx) => {
									return (
										<SwiperSlide key={idx}>
											<img className='phone-image' src={photo} alt='idk' />
										</SwiperSlide>
									)
								})}
							</Swiper>
						</div>
					</div>
				) : null}
			</div>



			{
				artworks.length > 0 ? 

				<>

				<div style={{ color: 'black', fontSize:"5vw"}}> ArtWorks </div>
			
				<div className='artworks-container'>
				{
						artworks.map( (artwork, key) => {
							return (
								
									<img key={key} className='artwork' loading='lazy' src={artwork} />
							
							)
						})
			    }
				</div>

				</>

				: 
				
				null
			}
			

			{canvas.length > 0 ? (
				<>
					<div style={{ color: 'black', fontSize:"5vw"}}> Canvas </div>

					<div
						style={{
							padding: '2%',
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							alignContent: 'center',
							textAlign: 'center',
						}}>
						<div>
							{canvas.map((canva, idx) => {
								return (
									<video
										key={idx}
										style={{
											width: '30%',
											height: '50%',
											borderRadius: '20px',
											margin: '0 5px',
										}}
										src={canva}
										muted
										loop
										autoPlay
										playsInline
									/>
								)
							})}
						</div>
					</div>
				</>
			) : null}
		</motion.div>
	)
}

export default InnerWork
